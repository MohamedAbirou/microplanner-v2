import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionTier } from '@microplanner/database';

export class CreateCheckoutDto {
  @ApiProperty({
    example: 'STARTER',
    description: 'Subscription tier to purchase',
    enum: SubscriptionTier,
  })
  @IsEnum(SubscriptionTier)
  tier!: SubscriptionTier;

  @ApiProperty({
    example: 'http://localhost:3000/dashboard',
    description: 'URL to redirect to after successful checkout',
    required: false,
  })
  @IsOptional()
  successUrl?: string;

  @ApiProperty({
    example: 'http://localhost:3000/billing',
    description: 'URL to redirect to after cancelled checkout',
    required: false,
  })
  @IsOptional()
  cancelUrl?: string;
}
