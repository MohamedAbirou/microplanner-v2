import { IsDefined, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'Web Push subscription object (endpoint + keys)' })
  @IsDefined()
  @IsObject()
  subscription!: Record<string, any>;
}

export class RemovePushTokenDto {
  @ApiProperty({ description: 'Endpoint URL of the subscription to remove' })
  @IsString()
  endpoint!: string;
}
