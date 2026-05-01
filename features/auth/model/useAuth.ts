'use client';
// features/auth/model/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/entities/user/model/types';
import { authApi } from '../api/authApi';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(setUser)
      .catch(() => { Cookies.remove('accessToken'); Cookies.remove('refreshToken'); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, tokens } = await authApi.login({ email, password });
    Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
    Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; phone?: string }) => {
    const { user, tokens } = await authApi.register(data);
    Cookies.set('accessToken', tokens.accessToken, { expires: 1 });
    Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 });
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return { user, loading, login, register, logout };
}
