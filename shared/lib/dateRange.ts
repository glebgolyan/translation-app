// shared/lib/dateRange.ts
// Pure date math, no Chakra/hooks — deliberately kept out of any 'use client'
// file so Server Components (e.g. app/dashboard/page.tsx) can call it too.
//
// All calendar dates here are Kyiv dates, computed the same way on the
// server (UTC on Vercel) and in the browser. Building a local-midnight Date
// and calling toISOString() — what this file used to do — shifts it into
// UTC, so in Kyiv the 1st of the month came out as the last day of the
// previous one, and the server and browser asked for different ranges.
import { APP_TIME_ZONE } from './format';

export type DateRange = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'year';

// Today's Kyiv calendar date, as a UTC-midnight Date so that further
// arithmetic and toISOString() stay on the calendar with no time zone.
function todayInAppTimeZone(): Date {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .split('-')
    .map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

const calendarDate = (y: number, monthIndex: number, d: number) =>
  new Date(Date.UTC(y, monthIndex, d)).toISOString().slice(0, 10);

// "YYYY-MM" of the current Kyiv month, shifted by `offset` months.
export function monthKey(offset = 0): string {
  const today = todayInAppTimeZone();
  return calendarDate(today.getUTCFullYear(), today.getUTCMonth() + offset, 1).slice(0, 7);
}

export function getDateRange(range: DateRange): {
  dateFrom?: string;
  dateTo?: string;
  endDate?: string;
} {
  if (range === 'all') return {};

  const today = todayInAppTimeZone();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const d = today.getUTCDate();

  if (range === 'tomorrow') {
    return { endDate: calendarDate(y, m, d + 2) };
  }

  if (range === 'today') {
    return { endDate: calendarDate(y, m, d) };
  }

  if (range === 'week') {
    const day = today.getUTCDay();
    const toMonday = day === 0 ? -6 : 1 - day;
    return { dateFrom: calendarDate(y, m, d + toMonday), dateTo: '' };
  }

  if (range === 'month') {
    return { dateFrom: calendarDate(y, m, 1), dateTo: '' };
  }

  if (range === 'year') {
    return { dateFrom: calendarDate(y, 0, 1), dateTo: '' };
  }

  return {};
}

// The previous month's range, but only up through the same day-of-month as
// today — not the full previous month. getDateRange('month') (the "current"
// side of the comparison) is 1st-of-this-month-through-now, i.e. partial
// for all but the last day of the month; comparing that against a *whole*
// previous month overstates the previous period and makes the % change look
// worse than it is for most of the month. dateTo is one day past the
// matching day-of-month: the backend applies it as `lte` against midnight,
// so passing the next day (not the matching day itself) is what includes
// that day in full instead of cutting it off at midnight.
export function getPreviousMonthRange(): { dateFrom: string; dateTo: string } {
  const today = todayInAppTimeZone();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const d = today.getUTCDate();

  // Clamp to the previous month's last day for dates that don't exist there
  // (comparing e.g. Mar 31 against Feb).
  const daysInPrevMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const sameDayLastMonth = Math.min(d, daysInPrevMonth);

  return {
    dateFrom: calendarDate(y, m - 1, 1),
    dateTo: calendarDate(y, m - 1, sameDayLastMonth + 1),
  };
}

// Rounds to the nearest whole percent; treats "0 last month, some this
// month" as a full 100% increase rather than dividing by zero, and "0 both
// months" as no change.
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
