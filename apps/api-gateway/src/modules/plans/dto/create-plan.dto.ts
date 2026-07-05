import { IsArray, IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: 'My focus week', description: 'Plan title' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ required: false, description: 'Plan description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: '2026-07-06', description: 'Week start date (Monday)' })
  @IsDateString()
  weekStartDate!: string;

  @ApiProperty({ required: false, type: [String], description: 'Goal IDs this plan focuses on' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goalIds?: string[];
}
