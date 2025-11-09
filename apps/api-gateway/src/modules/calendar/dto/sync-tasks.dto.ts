import { IsArray, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ConflictResolution {
  SKIP = 'skip',
  ADJUST = 'adjust',
  OVERWRITE = 'overwrite',
}

export class SyncTasksDto {
  @ApiProperty({
    example: ['task-id-1', 'task-id-2'],
    description: 'Array of task IDs to sync to calendar',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taskIds?: string[];

  @ApiProperty({
    example: 'plan-id',
    description: 'Sync all tasks from a specific plan',
    required: false,
  })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty({
    example: 'skip',
    description: 'How to handle conflicts: skip, adjust, or overwrite',
    enum: ConflictResolution,
    default: ConflictResolution.SKIP,
  })
  @IsOptional()
  @IsEnum(ConflictResolution)
  conflictResolution?: ConflictResolution = ConflictResolution.SKIP;
}
