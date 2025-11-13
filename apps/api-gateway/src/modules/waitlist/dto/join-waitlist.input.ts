import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';

@InputType()
export class JoinWaitlistInput {
  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['PERSONAL', 'TEAM', 'BUSINESS', 'OTHER'])
  useCase?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referralSource?: string;
}
