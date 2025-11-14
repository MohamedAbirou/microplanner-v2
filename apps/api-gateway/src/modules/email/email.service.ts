import { Task, User, WeeklyPlan } from '@microplanner/database';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Resend } from 'resend';

/**
 * Email Service
 *
 * Production-ready email service using Resend for transactional emails.
 * Supports:
 * - Task reminders (1 day before, 1 hour before)
 * - Weekly summary emails
 * - Plan ready notifications
 * - Beautiful HTML templates
 * - Template caching for performance
 * - Comprehensive error handling
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly appUrl: string;
  private readonly templateCache: Map<string, string> = new Map();
  private readonly isEnabled: boolean;

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'MicroPlanner <noreply@microplanner.ai>';
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3001';

    if (!resendApiKey) {
      this.logger.warn('RESEND_API_KEY not configured. Email service disabled.');
      this.isEnabled = false;
      this.resend = null as any;
    } else {
      this.resend = new Resend(resendApiKey);
      this.isEnabled = true;
      this.logger.log('✓ Email service initialized with Resend');
    }
  }

  /**
   * Send task reminder email
   *
   * @param task - Task to remind about
   * @param user - User to send reminder to
   * @param reminderType - '1_day_before' or '1_hour_before'
   */
  async sendTaskReminder(
    task: Task,
    user: User,
    reminderType: '1_day_before' | '1_hour_before',
  ): Promise<void> {
    if (!this.isEnabled) {
      this.logger.debug('Email service disabled, skipping task reminder');
      return;
    }

    try {
      const template = await this.loadTemplate('task-reminder.html');

      // Calculate reminder time text
      const reminderTime = reminderType === '1_day_before'
        ? 'Reminder: Tomorrow'
        : 'Reminder: In 1 Hour';

      const reminderTypeText = reminderType === '1_day_before'
        ? '📅 Tomorrow'
        : '⏰ In 1 Hour';

      // Format date and time
      const scheduledDate = new Date(task.scheduledDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Calculate duration text
      const hours = Math.floor(task.durationMinutes / 60);
      const minutes = task.durationMinutes % 60;
      let duration = '';
      if (hours > 0) duration += `${hours} hour${hours > 1 ? 's' : ''}`;
      if (minutes > 0) duration += ` ${minutes} min`;

      // Render template
      const html = this.renderTemplate(template, {
        reminderTime,
        reminderType: reminderTypeText,
        taskTitle: task.title,
        scheduledDate,
        startTime: task.startTime,
        endTime: task.endTime,
        duration: duration.trim(),
        goalTitle: task.goalId ? 'Goal' : undefined, // Will be enhanced with actual goal data
        notes: task.notes,
        taskId: task.id,
        appUrl: this.appUrl,
        isOneDayBefore: reminderType === '1_day_before',
      });

      // Send email
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: user.email,
        subject: `⏰ Reminder: ${task.title} ${reminderType === '1_day_before' ? 'tomorrow' : 'in 1 hour'}`,
        html,
      });

      // Check for errors in response
      if (response.error) {
        this.logger.error(`Failed to send task reminder: ${JSON.stringify(response.error)}`);
        return;
      }

      this.logger.log(`Task reminder sent: ${task.id} to ${user.email} (${reminderType}) - Email ID: ${response.data?.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send task reminder: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      // Don't throw - email failures shouldn't break the app
    }
  }

  /**
   * Send weekly summary email
   *
   * @param user - User to send summary to
   * @param summary - Weekly summary data
   */
  async sendWeeklySummary(
    user: User,
    summary: WeeklySummaryData,
  ): Promise<void> {
    if (!this.isEnabled) {
      this.logger.debug('Email service disabled, skipping weekly summary');
      return;
    }

    try {
      const template = await this.loadTemplate('weekly-summary.html');

      // Format week range
      const weekRange = `${summary.weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${summary.weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

      // Determine productivity level
      const productivity = summary.productivity;
      const isHighProductivity = productivity === 'high';
      const isMediumProductivity = productivity === 'medium';
      const isLowProductivity = productivity === 'low';

      // Render template
      const html = this.renderTemplate(template, {
        userName: user.name || 'there',
        weekRange,
        goalsCreated: summary.goalsCreated,
        plansGenerated: summary.plansGenerated,
        tasksCompleted: summary.tasksCompleted,
        totalTasks: summary.totalTasks || summary.tasksCompleted,
        completionRate: Math.round(summary.completionRate),
        productivity,
        isHighProductivity,
        isMediumProductivity,
        isLowProductivity,
        hasTopGoals: summary.topGoals && summary.topGoals.length > 0,
        topGoals: summary.topGoals || [],
        recommendation: summary.recommendation,
        appUrl: this.appUrl,
      });

      // Send email
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: user.email,
        subject: `📊 Your Weekly Summary: ${Math.round(summary.completionRate)}% completion rate`,
        html,
      });

      // Check for errors in response
      if (response.error) {
        this.logger.error(`Failed to send weekly summary: ${JSON.stringify(response.error)}`);
        return;
      }

      this.logger.log(`Weekly summary sent to ${user.email} - Email ID: ${response.data?.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send weekly summary: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
    }
  }

  /**
   * Send plan ready notification
   *
   * @param user - User to notify
   * @param plan - Generated weekly plan
   */
  async sendPlanReady(user: User, plan: WeeklyPlan): Promise<void> {
    if (!this.isEnabled) {
      this.logger.debug('Email service disabled, skipping plan ready notification');
      return;
    }

    try {
      const template = await this.loadTemplate('plan-ready.html');

      // Format week range
      const weekRange = `${new Date(plan.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(plan.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

      // Determine quality level
      const qualityScore = plan.qualityScore || 0;
      const isHighQuality = qualityScore >= 80;
      const isMediumQuality = qualityScore >= 60 && qualityScore < 80;
      const isLowQuality = qualityScore < 60;

      // Count goals (from planJson)
      const planData = plan.planJson as any;
      const goalIds = new Set((planData.tasks || []).map((t: any) => t.goalId).filter(Boolean));
      const goalsCount = goalIds.size;

      // Render template
      const html = this.renderTemplate(template, {
        userName: user.name || 'there',
        weekRange,
        totalTasks: plan.totalTasks,
        goalsCount,
        aiModel: this.formatAIModel(plan.aiModel || 'rule-based'),
        qualityScore,
        isHighQuality,
        isMediumQuality,
        isLowQuality,
        hasAIReasoning: !!plan.reasoning,
        planId: plan.id,
        appUrl: this.appUrl,
      });

      // Send email
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: user.email,
        subject: `✨ Your Weekly Plan is Ready (Quality Score: ${qualityScore}/100)`,
        html,
      });

      // Check for errors in response
      if (response.error) {
        this.logger.error(`Failed to send plan ready notification: ${JSON.stringify(response.error)}`);
        return;
      }

      this.logger.log(`Plan ready notification sent: ${plan.id} to ${user.email} - Email ID: ${response.data?.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send plan ready notification: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
    }
  }

  /**
   * Load email template from file (with caching)
   */
  private async loadTemplate(templateName: string): Promise<string> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    // Load from file
    const templatePath = path.join(__dirname, 'templates', templateName);
    try {
      const template = await fs.readFile(templatePath, 'utf-8');

      // Cache for future use
      this.templateCache.set(templateName, template);

      return template;
    } catch (error) {
      this.logger.error(`Failed to load email template: ${templateName}`);
      throw new Error(`Email template not found: ${templateName}`);
    }
  }

  /**
   * Simple template rendering (replaces {{variable}} with values)
   * Supports:
   * - {{variable}} - Simple substitution
   * - {{#if condition}}...{{/if}} - Conditional blocks
   * - {{#each array}}...{{/each}} - Iteration (basic)
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    let result = template;

    // Handle {{#if condition}}...{{/if}}
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      return data[condition] ? content : '';
    });

    // Handle {{#each array}}...{{/each}} (basic implementation)
    result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, itemTemplate) => {
      const array = data[arrayName];
      if (!Array.isArray(array)) return '';

      return array.map(item => {
        let itemHtml = itemTemplate;
        // Replace {{property}} with item.property
        Object.keys(item).forEach(key => {
          itemHtml = itemHtml.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(item[key] || ''));
        });
        return itemHtml;
      }).join('');
    });

    // Handle simple {{variable}} substitutions
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'string' || typeof value === 'number') {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      }
    });

    // Clean up any remaining template tags (for undefined variables)
    result = result.replace(/\{\{.*?\}\}/g, '');

    return result;
  }

  /**
   * Format AI model name for display
   */
  private formatAIModel(model: string): string {
    const modelMap: Record<string, string> = {
      'rule-based': 'Rule-Based Scheduler',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4o': 'GPT-4o',
      'claude-sonnet-3.5': 'Claude Sonnet 3.5',
      'claude-sonnet-4-20250514': 'Claude Sonnet 4',
    };

    return modelMap[model] || model;
  }

  /**
   * Send waitlist welcome email
   *
   * @param email - Email address of the new waitlist member
   * @param name - Name of the new waitlist member
   * @param position - Position on the waitlist
   */
  async sendWaitlistWelcome(
    email: string,
    name: string,
    position: number,
  ): Promise<void> {
    if (!this.isEnabled) {
      this.logger.debug('Email service disabled, skipping waitlist welcome');
      return;
    }

    try {
      const template = await this.loadTemplate('waitlist-welcome.html');

      // Render template
      const html = this.renderTemplate(template, {
        userName: name || 'there',
        email,
        position,
        appUrl: this.appUrl,
      });

      // Send email
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: '🎉 Welcome to MicroPlanner Waitlist - You\'re #' + position + '!',
        html,
      });

      // Check for errors in response
      if (response.error) {
        this.logger.error(`Failed to send waitlist welcome email: ${JSON.stringify(response.error)}`);
        return;
      }

      this.logger.log(`Waitlist welcome email sent to ${email} (position: ${position}) - Email ID: ${response.data?.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send waitlist welcome email: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      // Don't throw - email failures shouldn't break the waitlist signup
    }
  }

  /**
   * Check if email service is enabled
   */
  isEmailEnabled(): boolean {
    return this.isEnabled;
  }
}

/**
 * Weekly summary data for email
 */
export interface WeeklySummaryData {
  weekStartDate: Date;
  weekEndDate: Date;
  goalsCreated: number;
  plansGenerated: number;
  tasksCompleted: number;
  totalTasks?: number;
  completionRate: number;
  productivity: 'high' | 'medium' | 'low';
  topGoals?: Array<{
    title: string;
    emoji: string;
    completionRate: number;
    completions: number;
  }>;
  recommendation: string;
}
