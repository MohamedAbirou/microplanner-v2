import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class JoinWaitlistResult {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field()
  email: string;
}

@ObjectType()
export class WaitlistStats {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  approved: number;

  @Field(() => Int)
  invited: number;

  @Field(() => Int)
  converted: number;

  @Field(() => Int, { nullable: true })
  averageWaitDays?: number;
}
