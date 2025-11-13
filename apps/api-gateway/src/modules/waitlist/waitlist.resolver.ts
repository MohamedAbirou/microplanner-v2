import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { WaitlistService } from './waitlist.service';
import { JoinWaitlistInput } from './dto/join-waitlist.input';
import { JoinWaitlistResult, WaitlistStats } from './dto/waitlist.types';
import { Public } from '../auth/decorators/public.decorator';

@Resolver()
export class WaitlistResolver {
  constructor(private waitlistService: WaitlistService) {}

  @Public() // Allow unauthenticated access to join waitlist
  @Mutation(() => JoinWaitlistResult)
  async joinWaitlist(
    @Args('input') input: JoinWaitlistInput,
  ): Promise<JoinWaitlistResult> {
    return this.waitlistService.joinWaitlist(input);
  }

  @Public() // Allow public access to view stats
  @Query(() => WaitlistStats)
  async waitlistStats(): Promise<WaitlistStats> {
    return this.waitlistService.getWaitlistStats();
  }
}
