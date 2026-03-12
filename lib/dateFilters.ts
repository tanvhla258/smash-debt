import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export type TimePeriod = 'week' | 'month' | 'all';

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Get the date range for a given time period
 * @param period - The time period to get the range for
 * @returns DateRange object or null for 'all' (no filtering)
 */
export function getDateRange(period: TimePeriod): DateRange | null {
  const now = new Date();

  switch (period) {
    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(now, { weekStartsOn: 1 }),      // Sunday
      };
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case 'all':
      return null; // No filtering
  }
}

/**
 * Format a date range for display
 * @param range - The date range to format
 * @returns Formatted string like "Mar 10 - Mar 16, 2026"
 */
export function formatDateRange(range: DateRange): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  const start = range.start.toLocaleDateString('en-US', options);
  const end = range.end.toLocaleDateString('en-US', options);

  // If same year, show it once at the end
  const startYear = range.start.getFullYear();
  const endYear = range.end.getFullYear();

  if (startYear === endYear) {
    const startOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    const startShort = range.start.toLocaleDateString('en-US', startOptions);
    return `${startShort} - ${end}`;
  }

  return `${start} - ${end}`;
}

/**
 * Get a human-readable label for a time period
 * @param period - The time period
 * @param dateRange - Optional date range to include in the label
 * @returns Label like "This Week" or "This Week (Mar 10 - Mar 16, 2026)"
 */
export function getPeriodLabel(period: TimePeriod, includeDateRange = false): string {
  const baseLabels = {
    week: 'This Week',
    month: 'This Month',
    all: 'All Time',
  };

  if (!includeDateRange || period === 'all') {
    return baseLabels[period];
  }

  const range = getDateRange(period);
  if (range) {
    return `${baseLabels[period]} (${formatDateRange(range)})`;
  }

  return baseLabels[period];
}
