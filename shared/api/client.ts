// shared/api/client.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          // POST /auth/refresh returns { user, tokens: { accessToken, refreshToken } } —
          // this used to read `data.accessToken` (always undefined), so the
          // access-token cookie never actually got refreshed and the
          // refresh token itself was never rotated, defeating the point of
          // a 30-day refresh window: any 401 on an already-expired access
          // token just fell straight through to the catch block below and
          // logged the user out, no matter how recently they'd been active.
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const cookieOpts = {
            secure: window.location.protocol === 'https:',
            sameSite: 'strict' as const,
          };
          Cookies.set('accessToken', data.tokens.accessToken, { ...cookieOpts, expires: 7 });
          Cookies.set('refreshToken', data.tokens.refreshToken, { ...cookieOpts, expires: 30 });
          original.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
          return apiClient(original);
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/login';
        }
      } else {
        Cookies.remove('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
