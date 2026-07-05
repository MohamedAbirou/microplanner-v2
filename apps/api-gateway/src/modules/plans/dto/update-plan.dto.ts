import { PlanStatus } from '@microplanner/database';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlanDto {
  @ApiProperty({ required: false, description: 'Plan title' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false, description: 'Plan description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ required: false, enum: PlanStatus, description: 'Plan status' })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;
}
