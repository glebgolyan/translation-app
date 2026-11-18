import { useColorModeValue } from '@chakra-ui/react';

// Shared "card" look for the admin dashboard's three panels (StatCard,
// RecentOrders, MonthlyFinancialsTable) — soft shadow + near-invisible
// border instead of the app's usual flat 1px gray border, larger radius.
// Scoped to the dashboard route; the rest of the app keeps its existing
// sharper, border-first card style.
export function useDashboardCardStyle() {
  return {
    bg: useColorModeValue('white', '#1c1c1e'),
    borderRadius: '20px',
    border: '1px solid',
    borderColor: useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.06)'),
    boxShadow: useColorModeValue(
      '0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)',
      '0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -12px rgba(0,0,0,0.6)'
    ),
  };
}

export const DASHBOARD_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'DM Sans', sans-serif";
