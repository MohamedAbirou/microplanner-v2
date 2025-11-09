import { IsArray, IsEnum, IsString, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum BulkOperationType {
  COMPLETE = 'complete',
  SKIP = 'skip',
  DELETE = 'delete',
  RESCHEDULE = 'reschedule',
}

class RescheduleData {
  @IsString()
  scheduledDate!: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}

export class BulkOperationDto {
  @ApiProperty({
    example: ['task-id-1', 'task-id-2'],
    description: 'Array of task IDs to perform operation on',
  })
  @IsArray()
  @IsString({ each: true })
  taskIds!: string[];

  @ApiProperty({
    example: 'complete',
    description: 'Type of bulk operation',
    enum: BulkOperationType,
  })
  @IsEnum(BulkOperationType)
  operation!: BulkOperationType;

  @ApiProperty({
    example: { scheduledDate: '2025-01-14', startTime: '10:00', endTime: '11:00' },
    description: 'Optional data for operations (e.g., new date for reschedule)',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RescheduleData)
  data?: RescheduleData;
}
