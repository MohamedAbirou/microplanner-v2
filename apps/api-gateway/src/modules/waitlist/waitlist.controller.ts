import { WaitlistStatus } from '@microplanner/database';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { JoinWaitlistInput } from './dto/join-waitlist.input';
import { WaitlistService } from './waitlist.service';

/**
 * REST API for the waitlist. This is the contract the GraphQL gateway's
 * WaitlistAPI datasource calls (see apps/graphql-gateway/src/datasources/rest-api.ts).
 * Join + stats are public; entry management requires an authenticated user.
 */
@ApiTags('waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Join the waitlist' })
  async join(@Body() input: JoinWaitlistInput) {
    return this.waitlistService.joinWaitlist(input);
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Get waitlist stats' })
  async stats() {
    return this.waitlistService.getWaitlistStats();
  }

  @Get('entries')
  @ApiOperation({ summary: 'List waitlist entries' })
  async entries(
    @Query('status') status?: WaitlistStatus,
    @Query('take') take?: number,
    @Query('skip') skip?: number
  ) {
    return this.waitlistService.getEntries({ status, take, skip });
  }

  @Get('entry/:email')
  @ApiOperation({ summary: 'Get waitlist entry by email' })
  async entry(@Param('email') email: string) {
    return this.waitlistService.getEntry(email);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update waitlist entry status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: WaitlistStatus
  ) {
    return this.waitlistService.updateStatus(id, status);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Send invitation to waitlist entry' })
  async invite(@Param('id') id: string) {
    return this.waitlistService.sendInvitation(id);
  }
}
