import { IsString, IsOptional, IsDateString, IsInt, Min, Max, MinLength, MaxLength, Matches, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class RecurrenceRuleDto {
  @ApiProperty({ enum: RecurrenceFrequency, example: 'WEEKLY' })
  @IsEnum(RecurrenceFrequency)
  frequency!: RecurrenceFrequency;

  @ApiProperty({ example: 1, description: 'Recurrence interval' })
  @IsInt()
  @Min(1)
  interval!: number;

  @ApiProperty({ example: [1, 3, 5], description: 'Days of week (0=Sunday, 6=Saturday)', required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  daysOfWeek?: number[];

  @ApiProperty({ example: 15, description: 'Day of month (1-31)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiProperty({ example: '2025-12-31', description: 'End date for recurrence', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 10, description: 'Number of occurrences', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  occurrences?: number;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Morning workout', description: 'Task title' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    example: 'Focus on cardio and stretching',
    description: 'Optional task notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    example: '2025-01-13',
    description: 'Scheduled date (YYYY-MM-DD)',
  })
  @IsDateString()
  scheduledDate!: string;

  @ApiProperty({
    example: '09:00',
    description: 'Start time (HH:MM format)',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:MM format' })
  startTime!: string;

  @ApiProperty({
    example: '10:00',
    description: 'End time (HH:MM format) - optional if durationMinutes is provided',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:MM format' })
  endTime?: string;

  @ApiProperty({
    example: 60,
    description: 'Duration in minutes',
  })
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @ApiProperty({
    example: 'goal-uuid',
    description: 'Optional goal ID to link this task to',
    required: false,
  })
  @IsOptional()
  @IsString()
  goalId?: string;

  @ApiProperty({
    example: 'project-uuid',
    description: 'Optional project ID to link this task to',
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({
    example: 1,
    description: 'Task priority (1=High, 2=Medium, 3=Low)',
    required: false,
    minimum: 1,
    maximum: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  priority?: number;

  @ApiProperty({
    example: ['work', 'urgent'],
    description: 'Optional tags for the task',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Recurrence rule for recurring tasks',
    required: false,
    type: RecurrenceRuleDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceRuleDto)
  recurrenceRule?: RecurrenceRuleDto;
}
