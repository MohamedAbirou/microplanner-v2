import { IsOptional, IsDateString, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';
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

  @ApiProperty({ required: false, example: 'goal-uuid', description: 'Filter by goal ID' })
  @IsOptional()
  @IsString()
  goalId?: string;

  @ApiProperty({ required: false, example: 'plan-uuid', description: 'Filter by plan ID' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty({ required: false, example: true, description: 'Filter by completion status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ required: false, example: true, description: 'Filter by AI generated status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  aiGenerated?: boolean;

  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
