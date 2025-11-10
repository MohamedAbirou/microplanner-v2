# @microplanner/ui

Shared UI component library for MicroPlanner, built with Radix UI primitives and following the design system.

## Components

- **Avatar** - User avatar with fallback
- **Badge** - Status and category badges
- **Button** - Primary, secondary, outline, ghost variants with loading states
- **Card** - Content containers with header, content, and footer
- **Checkbox** - Form checkboxes
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Context menus and dropdown menus
- **Input** - Form inputs with error states
- **Label** - Form labels
- **Progress** - Progress bars
- **Select** - Select dropdowns
- **Separator** - Visual separators
- **Skeleton** - Loading skeletons
- **Switch** - Toggle switches
- **Tabs** - Tab navigation
- **Textarea** - Multi-line text inputs
- **Toast** - Notifications
- **Tooltip** - Contextual hints

## Usage

```tsx
import { Button, Card, Input } from '@microplanner/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Design System

All components follow the MicroPlanner design system with:
- Consistent color palette (primary, accent, success, warning, error)
- Unified border radius (sm: 4px, md: 8px, lg: 12px, xl: 16px)
- Standard transitions (150ms, 250ms, 350ms)
- Dark mode by default with light mode support

## Development

```bash
# Type check
npm run type-check

# Lint
npm run lint
```
