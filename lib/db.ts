import { supabase } from './supabase';
import type { User, Session, Participant, SessionWithParticipants, ParticipantWithDetails, UserDebtSummary } from './db-types';
import type { DateRange } from './dateFilters';

// ============ USER OPERATIONS ============

export async function getActiveUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createUser(name: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserActive(userId: string, isActive: boolean): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

// Upload user avatar to Supabase Storage and update user record
export async function uploadUserAvatar(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // Update user record with new avatar URL
  await updateUserAvatar(userId, publicUrl);

  return publicUrl;
}

// Update user avatar URL
export async function updateUserAvatar(
  userId: string,
  avatarUrl: string | null
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete user avatar from storage and update user record
export async function deleteUserAvatar(userId: string): Promise<void> {
  // Get user to find current avatar path
  const user = await getUserById(userId);
  if (!user?.avatar_url) return;

  // Extract path from URL
  const url = new URL(user.avatar_url);
  const pathMatch = url.pathname.match(/\/avatars\/(.+)$/);
  if (pathMatch) {
    const filePath = pathMatch[1];

    // Delete from storage
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) throw error;
  }

  // Update user record to remove avatar URL
  await updateUserAvatar(userId, null);
}

// ============ SESSION OPERATIONS ============

export async function getSessions(): Promise<SessionWithParticipants[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      participants (
        *,
        user:users (*)
      )
    `)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data as SessionWithParticipants[]) || [];
}

export async function createSession(
  date: string,
  totalAmount: number,
  participantIds: string[],
  note?: string,
  includeCreatorInCalculation?: boolean
): Promise<Session> {
  // Calculate amount per person with n+1 if include creator
  const divisor = includeCreatorInCalculation ? participantIds.length + 1 : participantIds.length;
  const amountPerPerson = totalAmount / divisor;

  // Create the session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      date,
      total_amount: totalAmount,
      note: note || null,
      include_creator_in_calculation: includeCreatorInCalculation || false,
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Create participant records
  const participants = participantIds.map(userId => ({
    session_id: session.id,
    user_id: userId,
    amount_per_person: amountPerPerson,
    is_paid: false,
  }));

  const { error: participantsError } = await supabase
    .from('participants')
    .insert(participants);

  if (participantsError) throw participantsError;

  return session;
}

export async function getSessionById(sessionId: string): Promise<SessionWithParticipants | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      participants (
        *,
        user:users (*)
      )
    `)
    .eq('id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as SessionWithParticipants;
}

export async function updateSessionTotal(
  sessionId: string,
  totalAmount: number
): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .update({ total_amount: totalAmount })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionNote(
  sessionId: string,
  note: string | null
): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .update({ note })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionIncludeCreator(
  sessionId: string,
  includeCreatorInCalculation: boolean
): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .update({ include_creator_in_calculation: includeCreatorInCalculation })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}

// ============ PARTICIPANT OPERATIONS ============

export async function updateParticipantPaid(
  participantId: string,
  isPaid: boolean
): Promise<Participant> {
  const { data, error } = await supabase
    .from('participants')
    .update({ is_paid: isPaid })
    .eq('id', participantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addParticipantToSession(
  sessionId: string,
  userId: string,
  amountPerPerson: number
): Promise<Participant> {
  const { data, error } = await supabase
    .from('participants')
    .insert({
      session_id: sessionId,
      user_id: userId,
      amount_per_person: amountPerPerson,
      is_paid: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeParticipant(participantId: string): Promise<void> {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', participantId);

  if (error) throw error;
}

export async function updateParticipantAmount(
  participantId: string,
  amountPerPerson: number
): Promise<Participant> {
  const { data, error } = await supabase
    .from('participants')
    .update({ amount_per_person: amountPerPerson })
    .eq('id', participantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUnpaidParticipantsByUser(userId: string): Promise<(Participant & { session: Session })[]> {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      session:sessions (*)
    `)
    .eq('user_id', userId)
    .eq('is_paid', false);

  if (error) throw error;
  return (data as unknown as (Participant & { session: Session })[]) || [];
}

// Get ALL unpaid participants with session and user details
export async function getUnpaidParticipants(): Promise<ParticipantWithDetails[]> {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      session:sessions (*),
      user:users (*)
    `)
    .eq('is_paid', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ParticipantWithDetails[]) || [];
}

// Get all unpaid participants grouped by user with totals
export async function getDebtSummary(): Promise<UserDebtSummary[]> {
  const unpaidParticipants = await getUnpaidParticipants();

  // Group by user
  const userMap = new Map<string, UserDebtSummary>();

  for (const participant of unpaidParticipants) {
    const existing = userMap.get(participant.user_id);

    if (existing) {
      existing.total_unpaid += participant.amount_per_person;
      existing.unpaid_participants.push(participant);
    } else {
      userMap.set(participant.user_id, {
        user: participant.user,
        total_unpaid: participant.amount_per_person,
        unpaid_participants: [participant],
      });
    }
  }

  // Convert to array and sort by total amount (descending)
  return Array.from(userMap.values()).sort((a, b) => b.total_unpaid - a.total_unpaid);
}

// Get unpaid participants with date filtering
async function getUnpaidParticipantsInDateRange(
  dateRange: DateRange | null
): Promise<ParticipantWithDetails[]> {
  // If no date range, get all unpaid participants
  if (!dateRange) {
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        session:sessions (*),
        user:users (*)
      `)
      .eq('is_paid', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as ParticipantWithDetails[]) || [];
  }

  // Use YYYY-MM-DD format to avoid timezone conversion issues
  const startDate = dateRange.start.toISOString().split('T')[0];
  const endDate = dateRange.end.toISOString().split('T')[0];

  // First, get session IDs within the date range
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id')
    .gte('date', startDate)
    .lte('date', endDate);

  if (sessionsError) throw sessionsError;

  const sessionIds = sessions?.map(s => s.id) || [];
  if (sessionIds.length === 0) {
    return []; // No sessions in this date range
  }

  // Then, get unpaid participants for those sessions
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      session:sessions (*),
      user:users (*)
    `)
    .eq('is_paid', false)
    .in('session_id', sessionIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ParticipantWithDetails[]) || [];
}

// Get debt summary for a specific time period
export async function getDebtSummaryByPeriod(
  dateRange: DateRange | null
): Promise<UserDebtSummary[]> {
  const unpaidParticipants = await getUnpaidParticipantsInDateRange(dateRange);

  // Group by user
  const userMap = new Map<string, UserDebtSummary>();

  for (const participant of unpaidParticipants) {
    const existing = userMap.get(participant.user_id);

    if (existing) {
      existing.total_unpaid += participant.amount_per_person;
      existing.unpaid_participants.push(participant);
    } else {
      userMap.set(participant.user_id, {
        user: participant.user,
        total_unpaid: participant.amount_per_person,
        unpaid_participants: [participant],
      });
    }
  }

  // Convert to array and sort by total amount (descending)
  return Array.from(userMap.values()).sort((a, b) => b.total_unpaid - a.total_unpaid);
}

// ============ ADMIN DASHBOARD STATISTICS ============

export interface DashboardStats {
  total_sessions_this_month: number;
  total_amount_this_month: number;
  total_unpaid_current_period: number;
  active_users_count: number;
}

export async function getDashboardStats(dateRange: DateRange | null): Promise<DashboardStats> {
  // Get active users count
  const activeUsers = await getActiveUsers();

  // Get all sessions for monthly stats
  const allSessions = await getSessions();

  // Calculate monthly stats (current month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const sessionsThisMonth = allSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= monthStart && sessionDate <= monthEnd;
  });

  const totalAmountThisMonth = sessionsThisMonth.reduce((sum, session) => {
    // Calculate from participants: sum of amount_per_person
    return sum + session.participants.reduce((pSum, p) => pSum + p.amount_per_person, 0);
  }, 0);

  // Get unpaid total for current period
  const unpaidParticipants = await getUnpaidParticipantsInDateRange(dateRange);
  const totalUnpaidCurrentPeriod = unpaidParticipants.reduce(
    (sum, p) => sum + p.amount_per_person,
    0
  );

  return {
    total_sessions_this_month: sessionsThisMonth.length,
    total_amount_this_month: totalAmountThisMonth,
    total_unpaid_current_period: totalUnpaidCurrentPeriod,
    active_users_count: activeUsers.length,
  };
}

// Get top debtors limited to a specific count
export async function getTopDebtors(
  dateRange: DateRange | null,
  limit: number = 10
): Promise<UserDebtSummary[]> {
  const debtSummary = await getDebtSummaryByPeriod(dateRange);
  return debtSummary.slice(0, limit);
}

// Get recent sessions limited to a specific count
export async function getRecentSessions(limit: number = 5): Promise<SessionWithParticipants[]> {
  const allSessions = await getSessions();
  return allSessions.slice(0, limit);
}
