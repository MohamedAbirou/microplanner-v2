import { IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnergyPattern } from '@microplanner/database';

export class UpdatePreferencesDto {
  @ApiProperty({ example: '07:00', description: 'Wake up time in HH:MM format' })
  @IsOptional()
  @IsString()
  wakeTime?: string;

  @ApiProperty({ example: '23:00', description: 'Sleep time in HH:MM format' })
  @IsOptional()
  @IsString()
  sleepTime?: string;

  @ApiProperty({ example: '09:00', description: 'Work start time in HH:MM format' })
  @IsOptional()
  @IsString()
  workStartTime?: string;

  @ApiProperty({ example: '17:00', description: 'Work end time in HH:MM format' })
  @IsOptional()
  @IsString()
  workEndTime?: string;

  @ApiProperty({
    example: ['09:00-11:00', '14:00-16:00'],
    description: 'Peak productivity times',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productivityPeaks?: string[];

  @ApiProperty({
    example: 'MORNING_PERSON',
    enum: EnergyPattern,
    description: 'Energy pattern preference',
  })
  @IsOptional()
  @IsEnum(EnergyPattern)
  energyPattern?: EnergyPattern;

  @ApiProperty({
    example: [{ day: 'monday', start: '12:00', end: '13:00' }],
    description: 'Blocked times for scheduling',
  })
  @IsOptional()
  @IsObject()
  blockedTimes?: any;
}
