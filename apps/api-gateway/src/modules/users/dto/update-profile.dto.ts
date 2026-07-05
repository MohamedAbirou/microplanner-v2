import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'https://avatar.url/image.jpg', description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: 'America/New_York', description: 'User timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: 'en', description: 'Preferred language' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  language?: string;
}
