'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MyDebtWithCreditor, User } from '@/lib/db-types';
import { getMyDebts, createMyDebt, toggleMyDebtPaid, deleteMyDebt, getActiveUsers } from '@/lib/db';
import { CheckCircle, Circle, Trash2, Plus, HandCoins } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/components/toast';
import { useAuth } from '@/lib/auth-context';

export default function MyDebtPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [debts, setDebts] = useState<MyDebtWithCreditor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [creditorId, setCreditorId] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [debtsData, usersData] = await Promise.all([
        getMyDebts(),
        getActiveUsers(),
      ]);
      setDebts(debtsData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load debts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !creditorId) {
      addToast('Please fill in amount and creditor', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await createMyDebt(creditorId, parseFloat(amount), note || undefined);
      setAmount('');
      setCreditorId('');
      setNote('');
      await loadData();
      addToast('Debt added successfully', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to create debt', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePaid(id: string, currentStatus: boolean) {
    try {
      await toggleMyDebtPaid(id, !currentStatus);
      await loadData();
      addToast(
        !currentStatus ? 'Marked as paid' : 'Marked as unpaid',
        !currentStatus ? 'success' : 'info'
      );
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMyDebt(id);
      await loadData();
      addToast('Debt deleted', 'info');
    } catch (err) {
      addToast('Failed to delete debt', 'error');
    }
  }

  const totalUnpaid = debts
    .filter(d => !d.is_paid)
    .reduce((sum, d) => sum + d.amount, 0);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Loading my debts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Debts</h1>
        <p className="text-muted-foreground">
          Track debts I owe to other people
        </p>
      </div>

      {/* Total Unpaid Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Total Unpaid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-destructive">
            {formatCurrency(totalUnpaid)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {debts.filter(d => !d.is_paid).length} unpaid debt{debts.filter(d => !d.is_paid).length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Create Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Debt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Creditor</label>
                <select
                  value={creditorId}
                  onChange={e => setCreditorId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  required
                >
                  <option value="">Select person...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Note (optional)</label>
                <Input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="What is this for?"
                />
              </div>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Debt'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Debt List */}
      {debts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No debts recorded yet. Add one above to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {debts.map(debt => (
            <Card
              key={debt.id}
              className={cn(
                'transition-colors',
                debt.is_paid && 'opacity-60'
              )}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleTogglePaid(debt.id, debt.is_paid)}
                    className="flex-shrink-0"
                  >
                    {debt.is_paid ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-zinc-400" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {formatCurrency(debt.amount)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        to {debt.creditor?.name || 'Unknown'}
                      </span>
                    </div>
                    {debt.note && (
                      <p className="text-sm text-muted-foreground">{debt.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(debt.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(debt.id)}
                  className="text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
