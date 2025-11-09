// AI Learning & Pattern Recognition Types

/**
 * User pattern insights learned from historical behavior
 * Stored per user to personalize AI scheduling
 */
export interface UserPatternInsights {
  userId: string;

  // Time-of-day patterns
  bestCompletionHours: number[];         // Hours (0-23) with highest completion rates
  worstCompletionHours: number[];        // Hours with lowest completion rates
  preferredWorkHours: { start: number; end: number }; // Learned from actual behavior

  // Day-of-week patterns
  mostProductiveDays: number[];          // Days (0-6) with best performance
  leastProductiveDays: number[];         // Days with worst performance

  // Goal-specific patterns
  goalCompletionPatterns: Array<{
    goalId: string;
    goalTitle: string;
    bestTimes: string[];                 // "09:00", "14:00", etc.
    bestDays: number[];                  // 0-6
    averageCompletionRate: number;       // 0-100
    preferredDuration: number;           // Minutes
  }>;

  // Session length patterns
  optimalSessionLength: number;          // Minutes
  completionRateByDuration: Array<{
    durationRange: string;               // "30-60", "60-90", etc.
    completionRate: number;
  }>;

  // Consistency metrics
  streakDays: number;                    // Current streak
  longestStreak: number;
  averageTasksPerDay: number;

  // Scheduling preferences (learned)
  prefersBufferTime: boolean;            // Likes gaps between tasks
  prefersTaskClustering: boolean;        // Likes batching similar tasks
  morningPersonScore: number;            // -100 to 100
  eveningPersonScore: number;            // -100 to 100

  // Metadata
  totalTasksAnalyzed: number;
  dataQuality: 'low' | 'medium' | 'high'; // Based on sample size
  lastUpdated: Date;
  confidenceScore: number;               // 0-100
}

/**
 * Task completion event for pattern analysis
 */
export interface TaskCompletionEvent {
  taskId: string;
  userId: string;
  goalId: string | null;
  goalTitle: string | null;

  // Scheduled vs actual
  scheduledDate: Date;
  scheduledStartTime: string;            // HH:mm
  scheduledDuration: number;             // Minutes

  // Actual completion
  completedAt: Date;
  wasOnTime: boolean;                    // Completed within scheduled window
  wasEarly: boolean;                     // Completed before scheduled time
  wasLate: boolean;                      // Completed after scheduled time
  delayMinutes: number | null;           // If late

  // Context
  dayOfWeek: number;                     // 0-6
  hourOfDay: number;                     // 0-23
  wasAIGenerated: boolean;
  aiModel: string | null;

  // Metadata
  createdAt: Date;
}

/**
 * Pattern recognition results
 */
export interface PatternAnalysisResult {
  insights: UserPatternInsights;
  recommendations: string[];
  confidence: number;
  sampleSize: number;
}
