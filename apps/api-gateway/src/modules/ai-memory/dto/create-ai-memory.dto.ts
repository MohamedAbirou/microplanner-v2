import { IsDefined, IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemoryType } from '@microplanner/database';

export class CreateAiMemoryDto {
  @ApiProperty({ enum: MemoryType, description: 'Type of learned/declared preference' })
  @IsEnum(MemoryType)
  memoryType!: MemoryType;

  @ApiProperty({ description: 'Flexible JSON content describing the preference' })
  @IsDefined()
  content!: Record<string, any>;

  @ApiProperty({ required: false, description: 'Confidence 0-1 (defaults to 1 for overrides)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;
}
