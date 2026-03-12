# Plan 4: Admin Dashboard & Final Features

## Overview
Build an admin dashboard with widgets for quick insights and polish the application with final UX improvements.

## Prerequisites
- Plans 1-3 complete
- All core features working

## Implementation Tasks

### 4.1 Admin Dashboard Page
- [ ] Create `/admin` or dashboard home page
- [ ] Add navigation to reach all sections:
  - Users
  - Sessions
  - Debt Summary
  - Admin Dashboard

### 4.2 Dashboard Widgets

#### Top Debtors Widget (Monthly)
- [ ] Calculate total unpaid per user for current month
- [ ] Display top 5-10 debtors
- [ ] Show:
  - User name
  - Total unpaid amount
  - Number of unpaid sessions
- [ ] Use Shadcn Card component
- [ ] Add red/amber color coding for high debt

#### Quick Stats Widget
- [ ] Total sessions this month
- [ ] Total amount tracked this month
- [ ] Total unpaid amount (current period)
- [ ] Number of active users
- [ ] Use grid layout for stat cards

#### Recent Sessions Widget
- [ ] Show last 5 sessions
- [ ] Display date, total, participant count
- [ ] Link to full sessions list

### 4.3 UX Improvements

#### Session Creation Flow
- [ ] Improve participant selection (multi-select with search)
- [ ] Show calculated per-person amount before submitting
- [ ] Add confirmation after session creation
- [ ] Validate form before submission

#### Navigation
- [ ] Create persistent navigation (sidebar or top nav)
- [ ] Add active state for current page
- [ ] Include icons for each section
- [ ] Responsive design for mobile

#### Visual Polish
- [ ] Add loading states for async operations
- [ ] Add error handling with user-friendly messages
- [ ] Add empty states for lists
- [ ] Consistent spacing and typography

### 4.4 Additional Features

#### Export/Reports (Optional)
- [ ] Export debt summary as CSV
- [ ] Print-friendly view for debt reports
- [ ] Date range selector for custom periods

#### Notifications (Optional)
- [ ] Toast notifications for actions (paid, created, deleted)
- [ ] Use Shadcn Toast component

#### Settings/Configuration (Optional)
- [ ] Default cost per session
- [ ] Currency configuration
- [ ] Default participant list

### 4.5 Dashboard Layout Example

```tsx
// Dashboard page structure
<div className="dashboard-grid">
  {/* Quick Stats Row */}
  <div className="stats-row">
    <StatsCard title="This Month" value="$X" />
    <StatsCard title="Unpaid" value="$Y" />
    <StatsCard title="Sessions" value="N" />
    <StatsCard title="Users" value="M" />
  </div>

  {/* Main Content */}
  <div className="main-content">
    <TopDebtorsWidget />
    <RecentSessionsWidget />
  </div>
</div>
```

### 4.6 Performance
- [ ] Add loading skeletons
- [ ] Implement optimistic updates where possible
- [ ] Cache frequently accessed data
- [ ] Consider Supabase indexes for common queries

### 4.7 Deployment
- [ ] Test production build: `yarn build`
- [ ] Set up Vercel deployment
- [ ] Configure environment variables in Vercel
- [ ] Set up custom domain (if desired)

## Acceptance Criteria
- Dashboard displays with all widgets
- Top debtors shows correct monthly data
- Navigation works between all pages
- Responsive design works on mobile
- Application deployed and accessible
- All core features functional in production
