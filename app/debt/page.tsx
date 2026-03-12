'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { UserDebtSummary } from '@/lib/db-types';
import { getDebtSummaryByPeriod, updateParticipantPaid } from '@/lib/db';
import { CheckCircle, Circle, DollarSign, Calendar } from 'lucide-react';
import { getDateRange, getPeriodLabel, formatDateRange, type TimePeriod } from '@/lib/dateFilters';
import { useToast } from '@/components/toast';

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

export default function DebtPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [debtSummary, setDebtSummary] = useState<UserDebtSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  useEffect(() => {
    loadDebtSummary();
  }, [selectedPeriod]);

  async function loadDebtSummary() {
    try {
      setLoading(true);
      setError(null);
      const dateRange = getDateRange(selectedPeriod);
      const data = await getDebtSummaryByPeriod(dateRange);
      setDebtSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load debt summary');
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentToggle(participantId: string, currentStatus: boolean) {
    try {
      await updateParticipantPaid(participantId, !currentStatus);
      await loadDebtSummary();
      addToast(
        !currentStatus ? 'Payment marked as paid' : 'Payment marked as unpaid',
        !currentStatus ? 'success' : 'info'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
      addToast('Failed to update payment status', 'error');
    }
  }

  function toggleUserExpanded(userId: string) {
    setExpandedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  const totalUnpaid = debtSummary.reduce((sum, user) => sum + user.total_unpaid, 0);
  const currentRange = getDateRange(selectedPeriod);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto py-8">
          <p className="text-center text-muted-foreground">Loading debt summary...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto py-8">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold">Debt Summary</h1>
              <p className="text-muted-foreground">Track unpaid amounts and manage payment status</p>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Period:
            </span>
            <div className="inline-flex rounded-lg border bg-background p-1">
              {TIME_PERIODS.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    selectedPeriod === period.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            {currentRange && (
              <span className="text-sm text-muted-foreground ml-2">
                {formatDateRange(currentRange)}
              </span>
            )}
          </div>
        </div>

        {/* Total Debt Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Unpaid Debt
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({getPeriodLabel(selectedPeriod)})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-destructive">
              ${totalUnpaid.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {debtSummary.length} {debtSummary.length === 1 ? 'user has' : 'users have'} unpaid debt
            </p>
          </CardContent>
        </Card>

        {debtSummary.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No unpaid debt{selectedPeriod !== 'all' ? ' for this period' : ''}! Everyone is paid up.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {debtSummary.map((userDebt) => {
              const isExpanded = expandedUsers.has(userDebt.user.id);
              return (
                <Card key={userDebt.user.id} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleUserExpanded(userDebt.user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{userDebt.user.name}</CardTitle>
                        <CardDescription>
                          {userDebt.unpaid_participants.length} unpaid session
                          {userDebt.unpaid_participants.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-destructive">
                          ${userDebt.total_unpaid.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isExpanded ? 'Click to collapse' : 'Click to expand'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Session Note</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDebt.unpaid_participants.map((participant) => (
                            <TableRow key={participant.id}>
                              <TableCell>
                                {format(new Date(participant.session.date), 'MMM dd, yyyy')}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {participant.session.note || '-'}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${participant.amount_per_person.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePaymentToggle(participant.id, participant.is_paid);
                                  }}
                                  className="hover:bg-green-500/10 hover:text-green-600"
                                >
                                  {participant.is_paid ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Circle className="h-5 w-5" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
