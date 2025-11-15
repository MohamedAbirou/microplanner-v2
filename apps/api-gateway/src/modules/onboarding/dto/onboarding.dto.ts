import { InputType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsArray, IsString, IsOptional, Matches, IsInt, Min, Max } from 'class-validator';
import { EnergyPattern } from '@microplanner/database';

// User context (life situation)
export enum UserContext {
  EMPLOYED_FULLTIME = 'EMPLOYED_FULLTIME',
  EMPLOYED_PARTTIME = 'EMPLOYED_PARTTIME',
  STUDENT = 'STUDENT',
  FREELANCER = 'FREELANCER',
  BETWEEN_OPPORTUNITIES = 'BETWEEN_OPPORTUNITIES',
  RETIRED = 'RETIRED',
  PARENT_CAREGIVER = 'PARENT_CAREGIVER',
  OTHER = 'OTHER',
}

// Focus areas
export enum FocusArea {
  CAREER = 'CAREER',
  LEARNING = 'LEARNING',
  HEALTH = 'HEALTH',
  CREATIVE = 'CREATIVE',
  BUSINESS = 'BUSINESS',
  JOB_SEARCH = 'JOB_SEARCH',
  FAMILY = 'FAMILY',
  HOME = 'HOME',
  WRITING = 'WRITING',
  HOBBIES = 'HOBBIES',
}

// Register enums for GraphQL
registerEnumType(UserContext, { name: 'UserContext' });
registerEnumType(FocusArea, { name: 'FocusArea' });
registerEnumType(EnergyPattern, { name: 'EnergyPattern' });

/**
 * Sleep Recommendation Output
 */
@ObjectType()
export class ProductivityWindow {
  @Field()
  start: string;

  @Field()
  end: string;

  @Field()
  peak: string;
}

@ObjectType()
export class SleepRecommendationOutput {
  @Field()
  wakeTime: string;

  @Field()
  optimalSleepTime: string;

  @Field()
  totalSleepHours: number;

  @Field()
  cycles: number;

  @Field(() => EnergyPattern)
  energyPattern: EnergyPattern;

  @Field(() => ProductivityWindow)
  productivityWindow: ProductivityWindow;

  @Field()
  windDownTime: string;

  @Field()
  explanation: string;

  @Field(() => [String])
  benefits: string[];

  @Field(() => [String])
  tips: string[];
}

/**
 * Goal Suggestion Output
 */
@ObjectType()
export class GoalSuggestion {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => FocusArea)
  focusArea: FocusArea;

  @Field(() => UserContext)
  context: UserContext;
}

/**
 * Calculate Sleep Recommendation Input
 */
@InputType()
export class CalculateSleepInput {
  @Field()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Wake time must be in HH:MM format' })
  wakeTime: string;

  @Field()
  @IsString()
  timezone: string;
}

/**
 * Get Goal Suggestions Input
 */
@InputType()
export class GetGoalSuggestionsInput {
  @Field(() => UserContext)
  @IsEnum(UserContext)
  context: UserContext;

  @Field(() => [FocusArea])
  @IsArray()
  @IsEnum(FocusArea, { each: true })
  focusAreas: FocusArea[];
}

/**
 * Complete Onboarding Input
 */
@InputType()
export class CompleteOnboardingInput {
  @Field(() => UserContext)
  @IsEnum(UserContext)
  context: UserContext;

  @Field(() => [FocusArea])
  @IsArray()
  @IsEnum(FocusArea, { each: true })
  focusAreas: FocusArea[];

  @Field()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Wake time must be in HH:MM format' })
  wakeTime: string;

  @Field()
  @IsString()
  timezone: string;

  @Field()
  @IsString()
  firstGoalTitle: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstGoalDescription?: string;
}

/**
 * Update Onboarding Progress Input
 */
@InputType()
export class UpdateOnboardingProgressInput {
  @Field()
  @IsInt()
  @Min(1)
  @Max(5)
  step: number;

  @Field(() => UserContext, { nullable: true })
  @IsOptional()
  @IsEnum(UserContext)
  context?: UserContext;

  @Field(() => [FocusArea], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(FocusArea, { each: true })
  focusAreas?: FocusArea[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  wakeTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;
}

/**
 * Onboarding Result
 */
@ObjectType()
export class OnboardingResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
