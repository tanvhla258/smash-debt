'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  getSessionById,
  getActiveUsers,
  updateParticipantPaid,
  addParticipantToSession,
  removeParticipant,
  updateSessionTotal,
  updateSessionNote,
  updateParticipantAmount,
} from '@/lib/db';
import type { SessionWithParticipants, User } from '@/lib/db-types';
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
import { Navigation } from '@/components/navigation';
import { useToast } from '@/components/toast';
import { ArrowLeft, CheckCircle, Circle, UserPlus, Trash2, Edit2, Save, X, DollarSign, FileText } from 'lucide-react';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { addToast } = useToast();

  const [session, setSession] = useState<SessionWithParticipants | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit states
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editTotal, setEditTotal] = useState('');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    loadData();
  }, [sessionId]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [sessionData, usersData] = await Promise.all([
        getSessionById(sessionId),
        getActiveUsers(),
      ]);
      setSession(sessionData);
      setUsers(usersData);
      if (sessionData) {
        setEditTotal(sessionData.total_amount.toString());
        setEditNote(sessionData.note || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentToggle(participantId: string, currentStatus: boolean, userName: string) {
    try {
      setIsUpdating(true);
      await updateParticipantPaid(participantId, !currentStatus);
      await loadData();
      addToast(
        !currentStatus ? `${userName} marked as paid` : `${userName} marked as unpaid`,
        !currentStatus ? 'success' : 'info'
      );
    } catch (err) {
      addToast('Failed to update payment status', 'error');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleAddUser(userId: string) {
    if (!session) return;

    // Calculate new amount per person
    const newParticipantCount = session.participants.length + 1;
    const newAmountPerPerson = session.total_amount / newParticipantCount;

    try {
      setIsUpdating(true);
      // Add the new participant
      await addParticipantToSession(sessionId, userId, newAmountPerPerson);

      // Update all existing participants to new amount
      for (const participant of session.participants) {
        await updateParticipantAmount(participant.id, newAmountPerPerson);
      }

      await loadData();
      setIsAddUserDialogOpen(false);
      addToast('Participant added successfully', 'success');
    } catch (err) {
      addToast('Failed to add participant', 'error');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemoveParticipant(participantId: string, userName: string) {
    if (!session) return;

    // Calculate new amount per person
    const newParticipantCount = session.participants.length - 1;
    const newAmountPerPerson = newParticipantCount > 0 ? session.total_amount / newParticipantCount : 0;

    try {
      setIsUpdating(true);
      await removeParticipant(participantId);

      // Update remaining participants to new amount
      if (newAmountPerPerson > 0) {
        for (const participant of session.participants) {
          if (participant.id !== participantId) {
            await updateParticipantAmount(participant.id, newAmountPerPerson);
          }
        }
      }

      await loadData();
      addToast(`${userName} removed from session`, 'info');
    } catch (err) {
      addToast('Failed to remove participant', 'error');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleUpdateTotal() {
    if (!session) return;

    const newTotal = parseFloat(editTotal);
    if (isNaN(newTotal) || newTotal <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      const newAmountPerPerson = newTotal / session.participants.length;

      // Update session total
      await updateSessionTotal(sessionId, newTotal);

      // Update all participant amounts
      for (const participant of session.participants) {
        await updateParticipantAmount(participant.id, newAmountPerPerson);
      }

      await loadData();
      setIsEditingTotal(false);
      addToast('Total amount updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update total amount', 'error');
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleUpdateNote() {
    if (!session) return;

    try {
      setIsUpdating(true);
      await updateSessionNote(sessionId, editNote || null);
      await loadData();
      setIsEditingNote(false);
      addToast('Note updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update note', 'error');
    } finally {
      setIsUpdating(false);
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  function formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
  }

  // Get users not in current session
  const availableUsers = users.filter(
    (user) => !session?.participants.some((p) => p.user_id === user.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            Loading session...
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md">
            <p className="font-semibold">Error</p>
            <p>{error || 'Session not found'}</p>
          </div>
          <Button onClick={() => router.back()} className="mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const amountPerPerson = session.participants.length > 0
    ? session.participants[0].amount_per_person
    : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sessions
          </Button>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatDate(session.date)}
          </h1>
        </div>

        {/* Session Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>Session Details</CardTitle>
                <CardDescription>View and edit session information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Total Amount */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                <Label className="text-sm font-medium">Total Amount</Label>
              </div>
              {isEditingTotal ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editTotal}
                    onChange={(e) => setEditTotal(e.target.value)}
                    className="w-32"
                    disabled={isUpdating}
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateTotal}
                    disabled={isUpdating}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingTotal(false);
                      setEditTotal(session.total_amount.toString());
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(session.total_amount)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingTotal(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Amount per person */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">Amount per person</span>
                <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(amountPerPerson)}
                </span>
              </div>
            </div>

            {/* Note */}
            <div className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                <div className="flex-1">
                  <Label className="text-sm font-medium">Note</Label>
                  {isEditingNote ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        className="flex-1"
                        disabled={isUpdating}
                      />
                      <Button
                        size="sm"
                        onClick={handleUpdateNote}
                        disabled={isUpdating}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsEditingNote(false);
                          setEditNote(session.note || '');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-zinc-700 dark:text-zinc-300">
                        {session.note || <span className="italic text-zinc-500">No note</span>}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingNote(true)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Participants count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
              </span>
              <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogTrigger>
                  <Button size="sm" variant="outline" className="gap-2" disabled={isUpdating}>
                    <UserPlus className="w-4 h-4" />
                    Add Participant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Participant</DialogTitle>
                    <DialogDescription>
                      Select a user to add to this session. The amount per person will be recalculated.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 max-h-64 overflow-y-auto">
                    {availableUsers.length === 0 ? (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                        All active users are already in this session.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {availableUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                          >
                            <span className="font-medium">{user.name}</span>
                            <Button
                              size="sm"
                              onClick={() => handleAddUser(user.id)}
                              disabled={isUpdating}
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Participants Card */}
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>
              Click on the checkbox to toggle payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session.participants.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                No participants yet. Add someone to get started!
              </div>
            ) : (
              <div className="space-y-2">
                {session.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      participant.is_paid
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={participant.is_paid}
                        onCheckedChange={() =>
                          handlePaymentToggle(
                            participant.id,
                            participant.is_paid,
                            participant.user.name
                          )
                        }
                        disabled={isUpdating}
                      />
                      <div>
                        <p
                          className={`font-medium ${
                            participant.is_paid
                              ? 'text-green-900 dark:text-green-100 line-through'
                              : 'text-zinc-900 dark:text-zinc-50'
                          }`}
                        >
                          {participant.user.name}
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {formatCurrency(participant.amount_per_person)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.is_paid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-400" />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleRemoveParticipant(participant.id, participant.user.name)
                        }
                        disabled={isUpdating}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
