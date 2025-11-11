# @microplanner/utils

Shared utility functions and constants for MicroPlanner.

## Modules

### Array utilities (`array.ts`)
- `chunk` - Split array into chunks
- `unique` - Remove duplicates
- `groupBy` - Group items by key
- `sortBy` - Sort array of objects
- `shuffle` - Randomize array
- `partition` - Split array by predicate
- And more...

### Async utilities (`async.ts`)
- `debounce` - Delay function execution
- `throttle` - Limit function execution rate
- `retry` - Retry with exponential backoff
- `timeout` - Add timeout to promises
- `sleep` - Delay execution
- And more...

### Date utilities (`date.ts`)
- `formatDate` - Format dates
- `formatRelativeDate` - "Today", "Tomorrow", etc.
- `formatTime` - Format time strings
- `calculateDuration` - Calculate time difference
- `getWeekStart` / `getWeekEnd` - Get week boundaries
- And more...

### String utilities (`string.ts`)
- `truncate` - Truncate long strings
- `getInitials` - Extract initials from name
- `slugify` - Convert to URL-friendly slug
- `parseName` - Parse full name
- `isEmail` / `isURL` - Validation helpers
- And more...

### Number utilities (`number.ts`)
- `formatNumber` - Format with commas
- `formatCurrency` - Format as currency
- `formatPercentage` - Format as percentage
- `clamp` - Limit value between min/max
- `average` / `median` - Statistical functions
- And more...

### Validation (`validation.ts`)
- Zod schemas for forms
- `goalSchema` - Validate goal input
- `taskSchema` - Validate task input
- `projectSchema` - Validate project input
- `validate` - Helper function to validate data
- And more...

### Constants (`constants.ts`)
- Time constants
- Subscription tiers and limits
- Error/success messages
- Storage keys
- And more...

## Usage

```typescript
import {
  formatDate,
  debounce,
  unique,
  goalSchema,
  SUBSCRIPTION_TIERS,
} from '@microplanner/utils';

// Format date
const formatted = formatDate(new Date()); // "January 15, 2025"

// Debounce function
const debouncedSearch = debounce((query: string) => {
  console.log('Searching:', query);
}, 300);

// Remove duplicates
const uniqueItems = unique([1, 2, 2, 3]); // [1, 2, 3]

// Validate data
const result = goalSchema.safeParse(data);
if (result.success) {
  // Data is valid
}

// Check tier
if (user.tier === SUBSCRIPTION_TIERS.PRO) {
  // Pro features
}
```

## Development

```bash
# Type check
npm run type-check

# Lint
npm run lint
```
