import { IsString, IsOptional, IsInt, IsArray, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({ example: 'Learn Spanish', description: 'Goal title' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @ApiProperty({ example: 'Practice Spanish for 30 minutes daily', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: '🇪🇸', required: false, default: '🎯' })
  @IsOptional()
  @IsString()
  emoji?: string;

  @ApiProperty({ example: '#3B82F6', required: false, default: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 5, description: 'Times per week (1-7)', minimum: 1, maximum: 7 })
  @IsInt()
  @Min(1)
  @Max(7)
  frequencyPerWeek!: number;

  @ApiProperty({ example: 30, description: 'Duration in minutes (15-480)', minimum: 15, maximum: 480 })
  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;

  @ApiProperty({ example: ['morning', 'evening'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTimes?: string[];

  @ApiProperty({ example: 5, description: 'Flexibility score (1-10)', minimum: 1, maximum: 10, required: false, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  flexibilityScore?: number;

  @ApiProperty({ example: 5, description: 'Priority (1-10)', minimum: 1, maximum: 10, required: false, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;
}
