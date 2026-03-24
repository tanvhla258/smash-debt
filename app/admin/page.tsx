'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, type UserDebt } from '@/components/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateSessionDialog } from '@/components/create-session-dialog';
import { BadmintonSessionCreate } from '@/components/badminton-session-create';
import { BreakfastSessionCreate } from '@/components/breakfast-session-create';
import { getSessions, getActiveUsers, updateParticipantPaid } from '@/lib/db';
import type { SessionWithParticipants, User } from '@/lib/db-types';
import { useToast } from '@/components/toast';
import { CheckCircle, Circle, Users, ExternalLink, Lock, Plus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

// Helper to get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Helper to generate a consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function AdminPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<SessionWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoading(true);
      setError(null);
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentToggle(
    participantId: string,
    currentStatus: boolean,
    userName: string
  ) {
    if (!isAuthenticated) {
      addToast('Please login to edit payment status', 'error');
      return;
    }

    try {
      await updateParticipantPaid(participantId, !currentStatus);
      await loadSessions();
      addToast(
        !currentStatus ? `${userName} marked as paid` : `${userName} marked as unpaid`,
        !currentStatus ? 'success' : 'info'
      );
    } catch (err) {
      addToast('Failed to update payment status', 'error');
    }
  }

  // Group sessions by date
  const sessionsByDate = new Map<string, SessionWithParticipants[]>();
  sessions.forEach((session) => {
    const dateKey = format(new Date(session.date), 'yyyy-MM-dd');
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, []);
    }
    sessionsByDate.get(dateKey)!.push(session);
  });

  // Calculate total unpaid for current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const totalUnpaidThisMonth = sessions
    .filter((s) => {
      const sessionDate = new Date(s.date);
      return sessionDate >= monthStart && sessionDate <= monthEnd;
    })
    .flatMap((s) => s.participants)
    .filter((p) => !p.is_paid)
    .reduce((sum, p) => sum + p.amount_per_person, 0);

  // Calculate user debts for current month
  const userDebtsMap = new Map<string, { userName: string; avatarUrl: string; totalUnpaid: number; unpaidCount: number }>();
  sessions
    .filter((s) => {
      const sessionDate = new Date(s.date);
      return sessionDate >= monthStart && sessionDate <= monthEnd;
    })
    .flatMap((s) => s.participants)
    .filter((p) => !p.is_paid)
    .forEach((p) => {
      const userId = p.user_id;
      if (!userDebtsMap.has(userId)) {
        userDebtsMap.set(userId, {
          userName: p.user.name,
          avatarUrl: p.user.avatar_url || '',
          totalUnpaid: 0,
          unpaidCount: 0,
        });
      }
      const debt = userDebtsMap.get(userId)!;
      debt.totalUnpaid += p.amount_per_person;
      debt.unpaidCount += 1;
    });

  const userDebts = Array.from(userDebtsMap.values())
    .map(debt => ({
      userId: debt.userName, // Using userName as userId since we need to derive it
      userName: debt.userName,
      avatarUrl: debt.avatarUrl,
      totalUnpaid: debt.totalUnpaid,
      unpaidCount: debt.unpaidCount,
    }))
    .sort((a, b) => b.totalUnpaid - a.totalUnpaid);

  function renderDaySessions(date: Date) {
    const dateKey = format(date, 'yyyy-MM-dd');
    const daySessions = sessionsByDate.get(dateKey) || [];

    if (daySessions.length === 0) {
      return null;
    }

    return daySessions.map((session) => {
      const amountPerPerson = session.participants.length > 0
        ? session.participants[0].amount_per_person
        : 0;

      return (
        <div
          key={session.id}
          className="text-xs bg-blue-100 dark:bg-blue-900/30 rounded p-1.5 border border-blue-200 dark:border-blue-800 relative group"
        >
          {/* Header with note and external link */}
          <div className="flex items-start justify-between mb-1">
            <div className="font-medium text-blue-900 dark:text-blue-100 truncate flex-1">
              {session.note || 'Session'}
            </div>
            <Link
              href={`/sessions`}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
              title="View sessions"
            >
              <ExternalLink className="h-3 w-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" />
            </Link>
          </div>

          {/* Amount per person */}
          <div className="text-blue-700 dark:text-blue-300 mb-1.5 font-semibold">
            {formatCurrency(amountPerPerson)} / person
          </div>

          {/* Participants list */}
          <div className="space-y-1">
            {session.participants.map((participant) => (
              <div
                key={participant.id}
                className={cn(
                  'flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors',
                  isAuthenticated
                    ? 'hover:bg-blue-200/50 dark:hover:bg-blue-800/50 cursor-pointer'
                    : 'opacity-75 cursor-not-allowed'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePaymentToggle(
                    participant.id,
                    participant.is_paid,
                    participant.user.name
                  );
                }}
                title={isAuthenticated ? 'Click to toggle payment' : 'Login to edit'}
              >
                {/* Checkbox - only show for authenticated users */}
                {isAuthenticated && (
                  <Checkbox
                    checked={participant.is_paid}
                    readOnly
                    className="h-3 w-3 pointer-events-none flex-shrink-0"
                  />
                )}

                {/* Avatar with image or initials */}
                {participant.user.avatar_url ? (
                  <img
                    src={participant.user.avatar_url}
                    alt={participant.user.name}
                    className="flex-shrink-0 w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      'flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium text-white',
                      getAvatarColor(participant.user.name)
                    )}
                  >
                    {getInitials(participant.user.name)}
                  </div>
                )}

                {/* Name */}
                <span
                  className={cn(
                    'truncate flex-1',
                    participant.is_paid
                      ? 'text-green-700 dark:text-green-400 line-through'
                      : 'text-zinc-700 dark:text-zinc-300'
                  )}
                >
                  {participant.user.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center py-12">
            <div className="text-zinc-500 dark:text-zinc-400">Loading calendar...</div>
          </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Session Calendar
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              View and manage sessions. Click on participant names to toggle payment status.
            </p>
          </div>
          {user && (
            <div className="flex gap-2">
              <BadmintonSessionCreate onSuccess={loadSessions} />
              <BreakfastSessionCreate onSuccess={loadSessions} />
              <CreateSessionDialog
                trigger={<Button variant="outline" className="gap-2"><Plus className="w-4 h-4" />Custom</Button>}
                onSuccess={loadSessions}
              />
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded" />
            <span className="text-zinc-600 dark:text-zinc-400">Session</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-zinc-600 dark:text-zinc-400">Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-400">Unpaid</span>
          </div>
          <div className="ml-auto text-zinc-500 dark:text-zinc-400 text-xs flex items-center gap-2">
            {isAuthenticated ? (
              <>Click participant to toggle payment</>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Read-only mode - Login to edit
              </>
            )}
          </div>
        </div>

        <Calendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          renderDay={renderDaySessions}
          totalUnpaid={totalUnpaidThisMonth}
          userDebts={userDebts}
        />

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              <Users className="h-4 w-4" />
              Total Sessions
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {sessions.length}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              <Circle className="h-4 w-4 text-amber-600" />
              Unpaid This Month
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(
                sessions
                  .filter((s) => {
                    const sessionDate = new Date(s.date);
                    const monthStart = startOfMonth(currentMonth);
                    const monthEnd = endOfMonth(currentMonth);
                    return sessionDate >= monthStart && sessionDate <= monthEnd;
                  })
                  .flatMap((s) => s.participants)
                  .filter((p) => !p.is_paid)
                  .reduce((sum, p) => sum + p.amount_per_person, 0)
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Collected This Month
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                sessions
                  .filter((s) => {
                    const sessionDate = new Date(s.date);
                    const monthStart = startOfMonth(currentMonth);
                    const monthEnd = endOfMonth(currentMonth);
                    return sessionDate >= monthStart && sessionDate <= monthEnd;
                  })
                  .flatMap((s) => s.participants)
                  .filter((p) => p.is_paid)
                  .reduce((sum, p) => sum + p.amount_per_person, 0)
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
