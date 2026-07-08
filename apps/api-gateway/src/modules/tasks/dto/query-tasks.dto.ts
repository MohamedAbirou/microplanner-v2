import { IsOptional, IsDateString, IsString, IsInt, Min, Max, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryTasksDto {
  @ApiProperty({ required: false, example: '2025-01-13', description: 'Filter by specific date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false, example: '2025-01-13', description: 'Filter by week start date (Monday)' })
  @IsOptional()
  @IsDateString()
  weekStart?: string;

  @ApiProperty({ required: false, example: '2025-01-13T00:00:00.000Z', description: 'Filter by start date (date range filter)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2025-01-13T23:59:59.999Z', description: 'Filter by end date (date range filter)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, example: 'goal-uuid', description: 'Filter by goal ID' })
  @IsOptional()
  @IsString()
  goalId?: string;

  @ApiProperty({ required: false, example: 'plan-uuid', description: 'Filter by plan ID' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty({ required: false, example: 'project-uuid', description: 'Filter by project ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ required: false, example: 1, description: 'Filter by priority (1=High, 2=Medium, 3=Low)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsInt()
  @Min(1)
  @Max(3)
  priority?: number;

  @ApiProperty({ required: false, example: ['work', 'urgent'], description: 'Filter by tags', type: [String] })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'string') {
      return value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    }
    if (Array.isArray(value)) return value;
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false, example: 'workout', description: 'Search tasks by title or notes' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: true, description: 'Filter by completion status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ required: false, example: true, description: 'Filter by AI generated status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  aiGenerated?: boolean;

  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 1;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 1 : parsed;
  })
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 50, minimum: 1, maximum: 500 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 50;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 50 : parsed;
  })
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;
}
