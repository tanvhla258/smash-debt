'use client';

import { ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency, cn } from '@/lib/utils';

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper function to generate a consistent color from name
function getNameColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export interface UserDebt {
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalUnpaid: number;
  unpaidCount: number;
}

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  renderDay: (date: Date) => React.ReactNode;
  totalUnpaid?: number;
  userDebts?: UserDebt[];
}

export function Calendar({ currentMonth, onMonthChange, renderDay, totalUnpaid = 0, userDebts = [] }: CalendarProps) {
  const monthStart: Date = startOfMonth(currentMonth);
  const monthEnd: Date = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    onMonthChange(previousMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onMonthChange(nextMonth);
  };

  const goToToday = () => {
    onMonthChange(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Calendar Section */}
      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {format(monthStart, 'MMMM yyyy')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="text-xs"
            >
              Today
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {/* Total Unpaid Display */}
            {totalUnpaid > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {formatCurrency(totalUnpaid)}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400">unpaid</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Week Day Headers */}
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-xs font-medium text-center text-zinc-600 dark:text-zinc-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid - Month */}
        <div className="grid grid-cols-7">
          {daysInMonth.map((date) => {
            const dayIsToday = isToday(date);
            return (
              <div
                key={date.toISOString()}
                className={`
                  min-h-[200px] border-r border-zinc-200 dark:border-zinc-800 p-2
                  ${dayIsToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-zinc-900'}
                  hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`
                      text-sm font-medium
                      ${dayIsToday
                        ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center'
                        : 'text-zinc-700 dark:text-zinc-300'
                      }
                    `}
                  >
                    {format(date, 'd')}
                  </span>
                </div>
                <div className="space-y-1 overflow-y-auto">
                  {renderDay(date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Debts Sidebar - Right Side */}
      {userDebts.length > 0 && (
        <div className="w-full lg:w-80 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              User Debts
            </h3>
          </div>
          <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {userDebts.map((debt) => (
              <div
                key={debt.userId}
                className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={debt.avatarUrl} alt={debt.userName} />
                    <AvatarFallback className={getNameColor(debt.userName)}>
                      {getInitials(debt.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {debt.userName}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {debt.unpaidCount} session{debt.unpaidCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(debt.totalUnpaid)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
