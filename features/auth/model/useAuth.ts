'use client';
// features/auth/model/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/entities/user/model/types';
import { authApi } from '../api/authApi';

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gate on EITHER token, not just accessToken: a page reload after the
    // access token has expired (but the refresh token is still valid) used
    // to skip straight to "logged out" here without ever attempting a
    // request — GET /auth/me was never called, so the response
    // interceptor's refresh flow (shared/api/client.ts) never got a chance
    // to run. Calling authApi.me() unconditionally when either cookie is
    // present lets a missing/expired access token 401 and trigger that
    // refresh, instead of forcing a re-login on every reload.
    const hasSession = Cookies.get('accessToken') || Cookies.get('refreshToken');
    if (!hasSession) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, tokens } = await authApi.login({ email, password });
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
    setUser(user);
    return user;
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; name: string; phone?: string }) => {
      const { user, tokens } = await authApi.register(data);
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
      setUser(user);
      return user;
    },
    []
  );

  const doLogout = useCallback(async () => {
    setUser(null);
    await logout();
  }, []);

  return { user, loading, login, register, logout: doLogout };
}
