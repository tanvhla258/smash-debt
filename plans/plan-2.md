# Plan 2: Debt Calculation System

## Overview
Build the core debt tracking logic to identify unpaid amounts and manage payment status for participants.

## Prerequisites
- Plan 1 complete (database, users, sessions exist)
- Install `date-fns` for date handling: `yarn add date-fns`

## Core Concepts

### Debt Definition
A participant has "debt" when:
- `is_paid = false` in the participants table
- The participant is linked to a valid session

### Data Access Pattern
Need to join `participants` with `sessions` to get:
- Participant info (user, amount, payment status)
- Session info (date for filtering, total amount)

## Implementation Tasks

### 2.1 Database Query Utilities
- [ ] Create `lib/queries.ts` for Supabase query helpers
- [ ] Write function: `getUnpaidParticipants()`
  - Join participants with sessions
  - Filter where `is_paid = false`
  - Return user name, session date, amount owed
- [ ] Write function: `getUnpaidByUser(userId)`
  - Get all unpaid records for a specific user
  - Include session dates and amounts

### 2.2 Payment Management
- [ ] Add "Mark as Paid" button to participant records
- [ ] Create optimistic update for payment status changes
- [ ] Add "Mark as Unpaid" ability (for corrections)

### 2.3 Debt Summary Page
- [ ] Create `/debt` page
- [ ] Display all unpaid participants grouped by user
- [ ] Show each user's total unpaid amount
- [ ] For each user, list:
  - Session date
  - Amount owed
  - Payment status toggle
- [ ] Sort users by total amount owed (descending)

### 2.4 Supabase Query Examples

#### Get all unpaid with session dates
```typescript
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
```

#### Update payment status
```typescript
const { error } = await supabase
  .from('participants')
  .update({ is_paid: true })
  .eq('id', participantId)
```

### 2.5 UI Components
- [ ] Use Shadcn Card for debt summary cards
- [ ] Use Shadcn Table for participant lists
- [ ] Use Shadcn Checkbox or Button for payment toggle
- [ ] Add visual indicators for unpaid vs paid

## Acceptance Criteria
- Can view all unpaid debt grouped by user
- Can mark individual participants as paid/unpaid
- Payment status persists in database
- Debt totals calculate correctly
- Each user's debt can be expanded to see session details
