'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  renderDay: (date: Date) => React.ReactNode;
}

export function Calendar({ currentMonth, onMonthChange, renderDay }: CalendarProps) {
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
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
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
  );
}
