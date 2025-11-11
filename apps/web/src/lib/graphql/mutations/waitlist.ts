import { gql } from '@apollo/client';

/**
 * Join waitlist mutation
 *
 * Adds a user to the waitlist with their email, name, and use case.
 * Returns success status, message, position in queue, and email.
 */
export const JOIN_WAITLIST = gql`
  mutation JoinWaitlist($input: JoinWaitlistInput!) {
    joinWaitlist(input: $input) {
      success
      message
      position
      email
    }
  }
`;

/**
 * TypeScript types for waitlist mutation
 */
export interface JoinWaitlistInput {
  email: string;
  name?: string;
  useCase?: 'PERSONAL' | 'TEAM' | 'BUSINESS' | 'OTHER';
  referralSource?: string;
}

export interface JoinWaitlistResult {
  success: boolean;
  message: string;
  position: number | null;
  email: string;
}

export interface JoinWaitlistVariables {
  input: JoinWaitlistInput;
}

export interface JoinWaitlistData {
  joinWaitlist: JoinWaitlistResult;
}
