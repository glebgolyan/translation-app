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
