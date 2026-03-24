'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveUsers, getSessions, createSession, deleteSession } from '@/lib/db';
import type { User, SessionWithParticipants } from '@/lib/db-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Calendar, Coins, Users, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/components/toast';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, cn } from '@/lib/utils';

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

export default function SessionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionWithParticipants[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<SessionWithParticipants | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalAmount: '',
    note: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [sessionsData, usersData] = await Promise.all([
        getSessions(),
        getActiveUsers(),
      ]);
      setSessions(sessionsData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      addToast('Please login to create sessions', 'error');
      router.push('/login');
      return;
    }

    if (selectedUserIds.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      setError('Please enter a valid total amount');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await createSession(
        formData.date,
        parseFloat(formData.totalAmount),
        selectedUserIds,
        formData.note || undefined
      );

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        totalAmount: '',
        note: '',
      });
      setSelectedUserIds([]);
      setIsDialogOpen(false);
      await loadData();
      addToast(`Session created with ${selectedUserIds.length} participant${selectedUserIds.length > 1 ? 's' : ''}`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      addToast('Failed to create session', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation(); // Prevent card click

    if (!user) {
      addToast('Please login to delete sessions', 'error');
      return;
    }

    // Find the session and open confirmation dialog
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSessionToDelete(session);
      setIsDeleteDialogOpen(true);
    }
  }

  async function confirmDelete() {
    if (!sessionToDelete) return;

    try {
      await deleteSession(sessionToDelete.id);
      addToast('Session deleted', 'success');
      setIsDeleteDialogOpen(false);
      setSessionToDelete(null);
      await loadData();
    } catch (err) {
      addToast('Failed to delete session', 'error');
    }
  }

  function toggleUser(userId: string) {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const amountPerPerson =
    selectedUserIds.length > 0 && formData.totalAmount
      ? parseFloat(formData.totalAmount) / selectedUserIds.length
      : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Sessions</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage badminton sessions and track participants
            {!user && ' (read-only mode - login to create)'}
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6">
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger>
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  New Session
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                  <DialogDescription>
                    Record a badminton session with participants and costs.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  {/* Date */}
                  <div>
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  {/* Total Amount */}
                  <div>
                    <Label htmlFor="totalAmount" className="flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      Total Amount
                    </Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                      placeholder="0.00"
                      className="mt-2"
                      required
                    />
                  </div>

                  {/* Participants */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Participants ({selectedUserIds.length})
                    </Label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                      {users.length === 0 ? (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-2">
                          No users available. Add users first.
                        </p>
                      ) : (
                        users.map((user) => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={selectedUserIds.includes(user.id)}
                              onCheckedChange={() => toggleUser(user.id)}
                            />
                            <Label
                              htmlFor={`user-${user.id}`}
                              className="flex-1 cursor-pointer font-normal"
                            >
                              {user.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Amount per person preview */}
                  {selectedUserIds.length > 0 && formData.totalAmount && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Amount per person: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(amountPerPerson)}</span>
                      </p>
                    </div>
                  )}

                  {/* Note (optional) */}
                  <div>
                    <Label htmlFor="note" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Note <span className="text-zinc-500 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="note"
                      type="text"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="e.g., Court booking at ABC Sports"
                      className="mt-2"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || selectedUserIds.length === 0 || !formData.totalAmount}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Session'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">No sessions yet</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Create your first badminton session to start tracking.
            </p>
            {user && (
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Create First Session
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                onClick={() => router.push(`/sessions/${session.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{formatDate(session.date)}</CardTitle>
                      {session.note && (
                        <CardDescription className="mt-1">{session.note}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(session.total_amount)}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Participants:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {session.participants.map((participant) => (
                        <span
                          key={participant.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${
                            participant.is_paid
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {/* Avatar with image or initials */}
                          {participant.user.avatar_url ? (
                            <img
                              src={participant.user.avatar_url}
                              alt={participant.user.name}
                              className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className={cn(
                                'w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium text-white flex-shrink-0',
                                getAvatarColor(participant.user.name)
                              )}
                            >
                              {getInitials(participant.user.name)}
                            </div>
                          )}
                          {participant.user.name}
                          <span className="text-xs opacity-70">
                            ({formatCurrency(participant.amount_per_person)})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
              {sessionToDelete && (
                <span className="block mt-2 font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(sessionToDelete.date)} - {formatCurrency(sessionToDelete.total_amount)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSessionToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
