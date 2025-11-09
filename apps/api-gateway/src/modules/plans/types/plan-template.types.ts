/**
 * Plan Template Types
 *
 * Defines interfaces for plan templates feature (PRO/PREMIUM)
 * Allows users to save and reuse plan structures
 */

/**
 * Template task definition
 */
export interface TemplateTask {
  title: string;
  notes?: string | null;
  durationMinutes: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  goalTitle?: string | null; // For display, not linked to actual goal
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

/**
 * Plan template metadata
 */
export interface PlanTemplate {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: TemplateCategory;
  tasks: TemplateTask[];
  estimatedTotalHours: number;
  tasksPerDay: Record<number, number>; // day -> task count
  isPublic: boolean;
  isDefault: boolean; // User's default template
  usageCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Template categories for organization
 */
export enum TemplateCategory {
  PRODUCTIVITY = 'productivity',
  FITNESS = 'fitness',
  LEARNING = 'learning',
  BUSINESS = 'business',
  PERSONAL = 'personal',
  CREATIVE = 'creative',
  BALANCED = 'balanced',
  CUSTOM = 'custom',
}

/**
 * Create template DTO
 */
export interface CreateTemplateDto {
  name: string;
  description?: string;
  category: TemplateCategory;
  tasks: TemplateTask[];
  isPublic?: boolean;
  isDefault?: boolean;
  tags?: string[];
}

/**
 * Update template DTO
 */
export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  tasks?: TemplateTask[];
  isPublic?: boolean;
  isDefault?: boolean;
  tags?: string[];
}

/**
 * Generate plan from template DTO
 */
export interface GenerateFromTemplateDto {
  templateId: string;
  weekStartDate: string; // ISO date string
  goalMappings?: Record<string, string>; // goalTitle -> goalId mapping
  adjustments?: {
    scaleDuration?: number; // 0.5 = half time, 2.0 = double time
    shiftDays?: number; // +1 = shift all tasks 1 day forward
    filterDays?: number[]; // Only include specific days
  };
}

/**
 * Query templates DTO
 */
export interface QueryTemplatesDto {
  page?: number;
  limit?: number;
  category?: TemplateCategory;
  isPublic?: boolean;
  search?: string; // Search in name, description, tags
  sortBy?: 'name' | 'createdAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Template statistics
 */
export interface TemplateStats {
  totalTemplates: number;
  publicTemplates: number;
  privateTemplates: number;
  totalUsage: number;
  categoryCounts: Record<TemplateCategory, number>;
  averageTasksPerTemplate: number;
  mostUsedTemplate: {
    id: string;
    name: string;
    usageCount: number;
  } | null;
}
