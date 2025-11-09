import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AnalyticsEventType {
  USER_SIGNUP = 'user_signup',
  USER_ONBOARDING_COMPLETE = 'user_onboarding_complete',
  GOAL_CREATED = 'goal_created',
  PLAN_GENERATED = 'plan_generated',
  PLAN_ACCEPTED = 'plan_accepted',
  TASK_COMPLETED = 'task_completed',
  CALENDAR_CONNECTED = 'calendar_connected',
  SUBSCRIPTION_STARTED = 'subscription_started',
}

export class TrackEventDto {
  @ApiProperty({
    example: 'plan_generated',
    description: 'Event name',
    enum: AnalyticsEventType,
  })
  @IsEnum(AnalyticsEventType)
  event!: AnalyticsEventType;

  @ApiProperty({
    example: { planId: 'plan-123', goalCount: 3 },
    description: 'Event properties',
    required: false,
  })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @ApiProperty({
    example: 'ios',
    description: 'Platform (ios, android, web)',
    required: false,
  })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({
    example: '1.0.0',
    description: 'App version',
    required: false,
  })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiProperty({
    example: 'session-uuid',
    description: 'Session ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
