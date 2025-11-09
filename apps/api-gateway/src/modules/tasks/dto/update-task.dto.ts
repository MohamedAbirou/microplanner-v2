import { IsString, IsOptional, IsDateString, IsInt, Min, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiProperty({ example: 'Morning workout', description: 'Task title', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    example: 'Focus on cardio and stretching',
    description: 'Task notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    example: '2025-01-13',
    description: 'Scheduled date (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({
    example: '09:00',
    description: 'Start time (HH:MM format)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:MM format' })
  startTime?: string;

  @ApiProperty({
    example: '10:00',
    description: 'End time (HH:MM format)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:MM format' })
  endTime?: string;

  @ApiProperty({
    example: 60,
    description: 'Duration in minutes',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({
    example: 'goal-uuid',
    description: 'Goal ID to link this task to',
    required: false,
  })
  @IsOptional()
  @IsString()
  goalId?: string;
}
