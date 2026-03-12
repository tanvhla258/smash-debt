# Plan 3: Time-based Statistics & Reporting

## Overview
Add time-based filtering to view debt summaries for specific periods: This Week, This Month, and All Time.

## Prerequisites
- Plan 2 complete (debt calculation working)
- `date-fns` installed (`yarn add date-fns`)

## Date Handling Utilities

### Install date-fns
```bash
yarn add date-fns
```

### Key Functions from date-fns
- `startOfWeek(date)` - Get Monday of current week
- `endOfWeek(date)` - Get Sunday of current week
- `startOfMonth(date)` - Get first day of current month
- `endOfMonth(date)` - Get last day of current month

## Implementation Tasks

### 3.1 Date Filter Utilities
- [ ] Create `lib/dateFilters.ts` with helper functions:
  - `getCurrentWeekRange()` - Returns { start, end } for current week
  - `getCurrentMonthRange()` - Returns { start, end } for current month
  - `isDateInRange(date, start, end)` - Check if date falls in range

### 3.2 Enhanced Debt Queries
- [ ] Update `getUnpaidParticipants()` to accept date range parameter
- [ ] Create variants:
  - `getUnpaidThisWeek()`
  - `getUnpaidThisMonth()`
  - `getAllUnpaid()`

### 3.3 Debt Summary Page Enhancements
- [ ] Add time period selector (dropdown or tabs):
  - "This Week" (default)
  - "This Month"
  - "All Time"
- [ ] Update totals based on selected period
- [ ] Show current period range (e.g., "Mar 10 - Mar 16, 2026")
- [ ] Maintain state for selected period

### 3.4 Supabase Query with Date Filtering

#### Filter by date range
```typescript
const getUnpaidInDateRange = async (startDate: Date, endDate: Date) => {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      id,
      amount_per_person,
      is_paid,
      user_id,
      users (name),
      sessions (date, total_amount, note)
    `)
    .eq('is_paid', false)
    .gte('sessions.date', startDate.toISOString())
    .lte('sessions.date', endDate.toISOString())

  return data
}
```

### 3.5 UI Components
- [ ] Use Shadcn Dropdown or Tabs for period selection
- [ ] Add visual period indicator (badge showing date range)
- [ ] Animate transitions between periods
- [ ] Show empty state when no debt in selected period

### 3.6 User Detail View
- [ ] Allow clicking on a user to see detailed breakdown
- [ ] Create `/debt/[userId]` page or use dialog
- [ ] Show:
  - User name and total debt
  - List of unpaid sessions with dates
  - Mark as paid actions
  - Filter by same time periods as main view

## Example Date Filter Logic

```typescript
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export type TimePeriod = 'week' | 'month' | 'all'

export function getDateRange(period: TimePeriod) {
  const now = new Date()

  switch (period) {
    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 })      // Sunday
      }
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      }
    case 'all':
      return null // No filtering
  }
}
```

## Acceptance Criteria
- Can switch between Week/Month/All-Time views
- Totals update correctly for each period
- Date ranges display clearly
- User detail view respects selected time period
- Performance remains good with date filtering
