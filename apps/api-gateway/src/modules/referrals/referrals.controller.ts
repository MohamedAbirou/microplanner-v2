import type { User } from '@microplanner/database';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReferralsService } from './referrals.service';

class RedeemReferralDto {
  @IsString()
  code!: string;
}

@ApiTags('referrals')
@ApiBearerAuth()
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current user referral code + stats' })
  @ApiResponse({ status: 200, description: 'Referral stats retrieved' })
  async getMine(@CurrentUser() user: User) {
    return this.referralsService.getStats(user.id);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem a referral code as the current user' })
  @ApiResponse({ status: 201, description: 'Referral redeemed (or ignored)' })
  async redeem(@CurrentUser() user: User, @Body() dto: RedeemReferralDto) {
    const redeemed = await this.referralsService.redeem(user.id, dto.code);
    return { redeemed };
  }
}
