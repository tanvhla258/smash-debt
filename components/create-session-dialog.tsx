'use client';

import { useState, useEffect } from 'react';
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
import { getActiveUsers, createSession } from '@/lib/db';
import type { User } from '@/lib/db-types';
import { useToast } from '@/components/toast';
import { Calendar as CalendarIcon, Users, Coins, FileText } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export interface CreateSessionDialogProps {
  trigger?: React.ReactElement;
  defaultNote?: string;
  defaultParticipants?: 'all' | string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSessionDialog({
  trigger,
  defaultNote = '',
  defaultParticipants,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: CreateSessionDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Use controlled or uncontrolled open state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalAmount: '',
    note: defaultNote,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Update form data when defaultNote changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, note: defaultNote }));
  }, [defaultNote]);

  // Set default participants when users are loaded and dialog opens
  useEffect(() => {
    if (users.length > 0 && isOpen) {
      if (defaultParticipants === 'all') {
        setSelectedUserIds(users.map(u => u.id));
      } else if (Array.isArray(defaultParticipants)) {
        setSelectedUserIds(defaultParticipants);
      } else {
        setSelectedUserIds([]);
      }
    }
  }, [users, isOpen, defaultParticipants]);

  async function loadUsers() {
    try {
      const data = await getActiveUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      addToast('Please login to create sessions', 'error');
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
        note: defaultNote,
      });
      setSelectedUserIds([]);
      setOpen(false);
      onSuccess?.();
      addToast(`Session created with ${selectedUserIds.length} participant${selectedUserIds.length > 1 ? 's' : ''}`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      addToast('Failed to create session', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleUser(userId: string) {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }

  const amountPerPerson = formData.totalAmount && selectedUserIds.length > 0
    ? parseFloat(formData.totalAmount) / selectedUserIds.length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger render={trigger} />
      )}
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
                <CalendarIcon className="w-4 h-4" />
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
                  users.map((userItem) => (
                    <div key={userItem.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${userItem.id}`}
                        checked={selectedUserIds.includes(userItem.id)}
                        onCheckedChange={() => toggleUser(userItem.id)}
                      />
                      <Label
                        htmlFor={`user-${userItem.id}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {userItem.name}
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

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
  );
}
