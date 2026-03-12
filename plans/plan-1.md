# Plan 1: Database Setup & User/Session Management

## Overview
Set up the database schema in Supabase and build the foundational features for managing users and badminton sessions.

## Tech Stack
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Shadcn UI
- **Package Manager**: yarn

## Database Schema

### Table: `users`
```sql
id: uuid (primary key, default uuid_generate_v4())
name: text (not null)
is_active: boolean (default true)
created_at: timestamp (default now())
```

### Table: `sessions`
```sql
id: uuid (primary key, default uuid_generate_v4())
date: date (not null) -- crucial for time-based filtering
total_amount: decimal (not null)
note: text (nullable)
created_at: timestamp (default now())
```

### Table: `participants`
```sql
id: uuid (primary key, default uuid_generate_v4())
session_id: uuid (foreign key -> sessions.id)
user_id: uuid (foreign key -> users.id)
amount_per_person: decimal (not null)
is_paid: boolean (default false)
created_at: timestamp (default now())
```

## Implementation Tasks

### 1.1 Supabase Setup
- [ ] Create Supabase project
- [ ] Run SQL migration to create the three tables
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure environment variables in `.env.local`

### 1.2 User Management
- [ ] Create `/users` page to list all active users
- [ ] Add "Add User" button with dialog form
- [ ] Implement user creation (name, is_active)
- [ ] Add ability to mark users as inactive
- [ ] List users in a table using Shadcn Table component

### 1.3 Session Management
- [ ] Create `/sessions` page to list all sessions
- [ ] Build "Add Session" form with:
  - Date picker
  - Total amount input
  - Multi-select for participants
  - Optional note field
- [ ] Calculate `amount_per_person` automatically (total / participant count)
- [ ] Display sessions in a table with:
  - Date
  - Total amount
  - Participant count
  - Note (if present)

### 1.4 Participant Management
- [ ] When creating a session, automatically create participant records
- [ ] Create participant records linking users to sessions
- [ ] Set default `is_paid = false` for new participants

### 1.5 Navigation
- [ ] Add navigation between Users and Sessions pages
- [ ] Consider adding a simple nav bar or sidebar

## Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Acceptance Criteria
- Can create, view, and deactivate users
- Can create sessions with multiple participants
- Sessions automatically calculate per-person amounts
- All data persists in Supabase database
