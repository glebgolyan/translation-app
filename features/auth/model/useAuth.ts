'use client';
// features/auth/model/useAuth.ts
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { User } from '@/entities/user/model/types';
import { authApi } from '../api/authApi';

// Single cache entry shared by every useAuth() call site, via the app's one
// QueryClient (shared/providers/QueryProvider.tsx). This replaces a
// bare useState/useEffect that used to fire its own independent GET
// /auth/me per mounted component (client-swr-dedup in
// vercel-react-best-practices: dedupe concurrent reads of the same
// resource through the cache you already have instead of each caller
// re-fetching). Mirrors the server-side equivalent, shared/lib/serverAuth.ts,
// which already dedupes with React's cache().
export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

// Standalone so components that already have `user` from elsewhere (e.g. a
// Server Component page passing down the result of getServerUser()) can log
// out without pulling in the rest of useAuth()'s client-side session-fetch
// machinery — calling useAuth() just for `logout` would still fire its own
// GET /auth/me on mount, defeating the point.
export async function logout() {
  try {
    await authApi.logout();
  } catch {}
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  window.location.href = '/login';
}

function setAuthCookies(tokens: { accessToken: string; refreshToken: string }) {
  Cookies.set('accessToken', tokens.accessToken, {
    expires: 7,
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
  });
  Cookies.set('refreshToken', tokens.refreshToken, {
    expires: 30,
    secure: window.location.protocol === 'https:',
    sameSite: 'strict',
  });
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Gate on EITHER token, not just accessToken: a page reload after the
  // access token has expired (but the refresh token is still valid) used
  // to skip straight to "logged out" here without ever attempting a
  // request — GET /auth/me was never called, so the response
  // interceptor's refresh flow (shared/api/client.ts) never got a chance
  // to run. Calling authApi.me() unconditionally when either cookie is
  // present lets a missing/expired access token 401 and trigger that
  // refresh, instead of forcing a re-login on every reload.
  // `typeof window` guard: this hook renders on the server during the
  // initial render of the client tree, where `document` (and so js-cookie)
  // isn't available.
  const hasSession =
    typeof window !== 'undefined' && !!(Cookies.get('accessToken') || Cookies.get('refreshToken'));

  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (err) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        throw err;
      }
    },
    enabled: hasSession,
    retry: false,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const { user, tokens } = await authApi.login({ email, password });
      setAuthCookies(tokens);
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
      return user;
    },
    [queryClient]
  );

  const register = useCallback(
    async (data: { email: string; password: string; name: string; phone?: string }) => {
      const { user, tokens } = await authApi.register(data);
      setAuthCookies(tokens);
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
      return user;
    },
    [queryClient]
  );

  const doLogout = useCallback(async () => {
    queryClient.setQueryData(AUTH_QUERY_KEY, null);
    await logout();
  }, [queryClient]);

  return { user: user ?? null, loading: hasSession && isLoading, login, register, logout: doLogout };
}
