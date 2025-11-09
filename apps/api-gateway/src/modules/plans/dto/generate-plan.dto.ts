import { IsOptional, IsArray, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePlanDto {
  @ApiProperty({
    example: '2025-01-13',
    description: 'Week start date (Monday, YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  weekStartDate?: string;

  @ApiProperty({
    example: ['goal-id-1', 'goal-id-2'],
    description: 'Specific goal IDs to include (optional, uses all active goals if not provided)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goalIds?: string[];
}
