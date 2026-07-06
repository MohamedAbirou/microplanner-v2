import { FocusArea, UserContext } from '@/graphql/onboarding.graphql';

/** Human-readable labels keyed by onboarding enum values (SCREAMING_SNAKE_CASE). */
export const CONTEXT_LABELS: Record<UserContext, string> = {
  [UserContext.EMPLOYED_FULLTIME]: 'Employed Full-Time',
  [UserContext.EMPLOYED_PARTTIME]: 'Employed Part-Time',
  [UserContext.STUDENT]: 'Student',
  [UserContext.FREELANCER]: 'Freelancer',
  [UserContext.BETWEEN_OPPORTUNITIES]: 'Between Opportunities',
  [UserContext.RETIRED]: 'Retired',
  [UserContext.PARENT_CAREGIVER]: 'Parent/Caregiver',
  [UserContext.OTHER]: 'Other',
};

export const FOCUS_AREA_LABELS: Record<FocusArea, string> = {
  [FocusArea.CAREER]: 'Career',
  [FocusArea.LEARNING]: 'Learning',
  [FocusArea.HEALTH]: 'Health & Fitness',
  [FocusArea.CREATIVE]: 'Creative Projects',
  [FocusArea.BUSINESS]: 'Business',
  [FocusArea.JOB_SEARCH]: 'Job Search',
  [FocusArea.FAMILY]: 'Family & Relationships',
  [FocusArea.HOME]: 'Home & Organization',
  [FocusArea.WRITING]: 'Writing',
  [FocusArea.HOBBIES]: 'Hobbies & Fun',
};

export function formatContextLabel(context?: UserContext | string): string {
  if (!context) return 'Not set';
  return CONTEXT_LABELS[context as UserContext] ?? context;
}

export function formatFocusAreaLabel(area: FocusArea | string): string {
  return FOCUS_AREA_LABELS[area as FocusArea] ?? area;
}
