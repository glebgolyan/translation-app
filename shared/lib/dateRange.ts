// shared/lib/dateRange.ts
// Pure date math, no Chakra/hooks — deliberately kept out of any 'use client'
// file so Server Components (e.g. app/dashboard/page.tsx) can call it too.
export type DateRange = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'year';

export function getDateRange(range: DateRange): {
  dateFrom?: string;
  dateTo?: string;
  endDate?: string;
} {
  if (range === 'all') return {};

  const now = new Date();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 2);
  tomorrow.setHours(0, 0, 0, 0);

  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  if (range === 'tomorrow') {
    return {
      endDate: tomorrow.toISOString().split('T')[0],
    };
  }

  if (range === 'today') {
    return {
      endDate: now.toISOString().split('T')[0],
    };
  }

  if (range === 'week') {
    return { dateFrom: monday.toISOString().split('T')[0], dateTo: '' };
  }

  if (range === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dateFrom: firstDay.toISOString().split('T')[0], dateTo: '' };
  }

  if (range === 'year') {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    return { dateFrom: firstDay.toISOString().split('T')[0], dateTo: '' };
  }

  return {};
}

// Bounded range for the full previous calendar month (unlike getDateRange's
// 'month', which is open-ended from the 1st of *this* month to now) — used
// for month-over-month comparisons. dateTo is the 1st of the current month,
// not the last day of the previous one: the backend applies it as `lte`
// against midnight, so using the next month's start correctly includes the
// previous month's last day in full instead of cutting it off at midnight.
export function getPreviousMonthRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    dateFrom: firstDayOfPrevMonth.toISOString().split('T')[0],
    dateTo: firstDayOfThisMonth.toISOString().split('T')[0],
  };
}

// Rounds to the nearest whole percent; treats "0 last month, some this
// month" as a full 100% increase rather than dividing by zero, and "0 both
// months" as no change.
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
