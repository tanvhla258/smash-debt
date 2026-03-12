'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Coins, X } from 'lucide-react';
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
  const [showDebts, setShowDebts] = useState(false);
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

  // Weekday labels for 7-column layout (desktop)
  const weekDaysFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Weekday labels for 5-column layout (tablet - Mon-Fri + weekend notes)
  const weekDays5 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  // Weekday labels for 4-column layout (small tablet)
  const weekDays4 = ['Mon', 'Tue', 'Wed', 'Thu+'];
  // Weekday labels for 3-column layout (mobile)
  const weekDays3 = ['Mon/Wed/Fri', 'Tue/Thu', 'Sat/Sun'];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Calendar Section */}
      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {format(monthStart, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="text-xs h-8"
            >
              Today
            </Button>
            {/* Mobile Debts Toggle Button */}
            {userDebts.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDebts(!showDebts)}
                className="lg:hidden h-8 w-8 relative"
                aria-label="Toggle debts"
              >
                <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                {totalUnpaid > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {userDebts.filter(d => d.totalUnpaid > 0).length}
                  </span>
                )}
              </Button>
            )}
            {/* Total Unpaid Display - hidden on mobile */}
            {totalUnpaid > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {formatCurrency(totalUnpaid)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="h-8 w-8"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="h-8 w-8"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Week Day Headers - Responsive column layout */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          {/* Mobile 3-column headers */}
          <div className="col-span-3 sm:hidden px-2 py-2 text-xs font-medium text-center text-zinc-600 dark:text-zinc-400">
            {weekDays3.map((day, i) => (
              <span key={i} className="mx-1">{day}</span>
            ))}
          </div>
          {/* Tablet 4-column headers */}
          <div className="hidden sm:block md:hidden col-span-4 px-2 py-2 text-xs font-medium text-center text-zinc-600 dark:text-zinc-400">
            {weekDays4.map((day, i) => (
              <span key={i} className="mx-1">{day}</span>
            ))}
          </div>
          {/* Medium tablet 5-column headers */}
          <div className="hidden md:block lg:hidden col-span-5 px-2 py-2 text-xs font-medium text-center text-zinc-600 dark:text-zinc-400">
            {weekDays5.map((day, i) => (
              <span key={i} className="mx-1">{day}</span>
            ))}
          </div>
          {/* Desktop 7-column headers */}
          {weekDaysFull.map((day) => (
            <div
              key={day}
              className="hidden lg:block px-2 py-2 text-xs font-medium text-center text-zinc-600 dark:text-zinc-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid - Responsive column layout */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 auto-rows-fr">
          {daysInMonth.map((date) => {
            const dayIsToday = isToday(date);
            const dayOfWeek = date.getDay();
            return (
              <div
                key={date.toISOString()}
                className={`
                  min-h-[160px] sm:min-h-[180px] md:min-h-[180px] lg:min-h-[200px] border-r border-b border-zinc-200 dark:border-zinc-800 p-2
                  ${dayIsToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-zinc-900'}
                  hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors
                `}
              >
                <div className="flex items-start justify-between mb-1 sm:mb-2">
                  <div className="flex items-center gap-1">
                    <span
                      className={`
                        text-sm font-medium
                        ${dayIsToday
                          ? 'bg-blue-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs'
                          : 'text-zinc-700 dark:text-zinc-300'
                        }
                      `}
                    >
                      {format(date, 'd')}
                    </span>
                    {/* Show day of week on smaller screens */}
                    <span className="lg:hidden text-[10px] text-zinc-500 dark:text-zinc-400">
                      {weekDaysFull[dayOfWeek]}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[120px] sm:max-h-[140px] md:max-h-[140px] lg:max-h-[160px]">
                  {renderDay(date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Debts Sidebar - Desktop */}
      {userDebts.length > 0 && (
        <>
          <div className="hidden lg:block w-80 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
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

          {/* Mobile Debts Bottom Sheet */}
          {showDebts && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200"
              onClick={() => setShowDebts(false)}
            >
              <div
                className="absolute bottom-0 left-0 right-0 max-h-[75vh] bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    User Debts
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDebts(false)}
                    className="h-8 w-8"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Debt List */}
                <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(75vh-80px)]">
                  {userDebts.map((debt) => (
                    <div
                      key={debt.userId}
                      className="flex items-center justify-between px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
