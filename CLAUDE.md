# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Badminton Debt Tracker** - a web application for managing badminton sessions and tracking financial debt. The app tracks who participated in sessions, how much each person owes, and generates time-based reports (weekly, monthly, all-time) showing unpaid amounts per user.

## Commands

**Package Manager**: Use `yarn` for all operations (not npm/pnpm).

```bash
yarn dev          # Start development server (http://localhost:5173)
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16.1.6 with App Router (React Server Components by default)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Database**: Supabase (PostgreSQL backend)
- **Icons**: HugeIcons (primary), Lucide React (secondary)

### Project Structure
```
my-badminton-app/
├── app/                    # Next.js App Router (file-based routing)
│   ├── layout.tsx         # Root layout with font configuration
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles (Tailwind v4 @theme config)
├── components/
│   └── ui/                # Shadcn UI components (button, card, checkbox, dialog, input, table)
├── lib/
│   ├── supabase.ts        # Supabase SSR client configuration
│   └── utils.ts           # Utility functions (cn for className merging)
└── PLAN.md                # Project roadmap and feature specifications
```

### Database Schema

Three tables with stable structure defined in PLAN.md:

- **users**: id, name, is_active
- **sessions**: id, date (crucial for time-based filtering), total_amount, note
- **participants**: id, session_id, user_id, amount_per_person, is_paid

### Key Implementation Notes

1. **Date Handling**: Use `date-fns` for date range calculations (install with `yarn add date-fns`). Functions like `startOfWeek`, `startOfMonth` are used for filtering sessions by time period.

2. **Supabase Queries**: Use joins or PostgreSQL Views to efficiently pull `participants.amount_per_person` along with `sessions.date`. For unpaid calculations, filter where `is_paid = false`.

3. **Shadcn/ui Configuration**: Components are configured with "base-maia" theme, neutral color scheme, and HugeIcons. Use existing components from `components/ui/` when building new features.

4. **Environment Variables**: Create `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **TypeScript Path Aliases**: `@/*` maps to project root (configured in tsconfig.json)

### Planned Features

Refer to PLAN.md for full roadmap. Key features include:

- User & Session Management
- Debt Calculation Logic (core)
- Time-based Statistics (Weekly/Monthly/All-Time views)
- Admin Dashboard with "Top Debtors" list
- Detailed breakdown per user (click to see unpaid sessions)

### Component Patterns

- Use Shadcn UI components from `components/ui/` for consistent styling
- The `cn()` utility from `lib/utils.ts` combines Tailwind classes
- Server Components are default; add `'use client'` directive when using React hooks
