import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SkipTaskDto {
  @ApiProperty({
    example: 'Felt too tired today',
    description: 'Optional reason for skipping the task',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
