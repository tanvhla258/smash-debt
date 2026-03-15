// Database types matching the Supabase schema

export interface User {
  id: string;
  name: string;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  date: string; // ISO date string
  total_amount: number;
  note: string | null;
  include_creator_in_calculation: boolean;
  created_at: string;
}

export interface Participant {
  id: string;
  session_id: string;
  user_id: string;
  amount_per_person: number;
  is_paid: boolean;
  created_at: string;
}

// Join types for queries
export interface SessionWithParticipants extends Session {
  participants: (Participant & {
    user: User;
  })[];
}

export interface UserWithDebt extends User {
  total_unpaid: number;
  unpaid_count: number;
}

// Participant with full session and user details for debt tracking
export interface ParticipantWithDetails extends Participant {
  session: Session;
  user: User;
}

// Aggregated debt info per user
export interface UserDebtSummary {
  user: User;
  total_unpaid: number;
  unpaid_participants: ParticipantWithDetails[];
}

// Dashboard statistics
export interface DashboardStats {
  total_sessions_this_month: number;
  total_amount_this_month: number;
  total_unpaid_current_period: number;
  active_users_count: number;
}
