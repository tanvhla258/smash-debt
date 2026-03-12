Updated Project Plan: Badminton Debt Tracker (with Financial Stats)
Goal: A web app to manage badminton sessions, track costs, and generate reports on unpaid amounts per user by week and month.

1. Tech Stack
Framework: Next.js 14+ (App Router, TypeScript)

Database/Backend: Supabase (PostgreSQL)

Styling: Tailwind CSS + Shadcn UI

Package Manager: yarn

Deployment: Vercel

2. Database Schema (Stable)
Table users: id, name, is_active.

Table sessions: id, date (important for time-based filtering), total_amount, note.

Table participants: id, session_id, user_id, amount_per_person, is_paid.

3. Implementation Roadmap
Step 1: User & Session Management (As previously planned).

Step 2: Debt Calculation Logic (Core)

Create a utility function to fetch unpaid records.

Filter Logic: Filter participants joined with sessions where is_paid = false.

Step 3: Time-based Statistics (New)

Feature: "User Debt Summary" view.

Weekly View: Calculate total unpaid amount where sessions.date is within the current week (Monday to Sunday).

Monthly View: Calculate total unpaid amount where sessions.date is within the current calendar month.

UI: Add a toggle or dropdown to switch between "This Week", "This Month", and "All Time".

Step 4: Admin Dashboard Widget

Display a list of "Top Debtors" with their total unpaid balance for the current month.

4. Instructions for AI Agent
Use yarn for all installations.

Use date-fns (install via yarn add date-fns) to handle date range calculations (e.g., startOfWeek, startOfMonth).

Write a Supabase query using .join or a PostgreSQL View to easily pull amount_per_person along with the session.date.

Ensure the "Debt Summary" page allows clicking on a user to see a breakdown of which specific days they haven't paid for.