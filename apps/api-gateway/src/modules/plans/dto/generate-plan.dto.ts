import {
  IsOptional,
  IsArray,
  IsString,
  IsDateString,
  IsBoolean,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PlanPreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  prioritizeMornings?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  avoidWeekends?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  bufferTime?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  focusBlockDuration?: number;
}

export class GeneratePlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: '2025-01-13',
    description: 'Week start date (Monday, YYYY-MM-DD or ISO datetime)',
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

  @ApiProperty({
    example: 'gpt-4o-mini',
    description: 'Preferred AI model (optional; tier limits still apply)',
    required: false,
  })
  @IsOptional()
  @IsString()
  aiModel?: string;

  @ApiProperty({ required: false, type: PlanPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlanPreferencesDto)
  preferences?: PlanPreferencesDto;
}
