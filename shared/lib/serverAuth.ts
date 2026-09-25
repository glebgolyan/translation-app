// shared/lib/serverAuth.ts
// Single place session resolution happens for Server Component pages/layouts
// — replaces N independent client-side useAuth() calls (one /auth/me each)
// with one server-side call per request, deduped via React's cache() so a
// layout + its page both calling getServerUser() only hit the backend once.
import { cache } from 'react';
import axios from 'axios';
import { User } from '@/entities/user/model/types';
import { createServerApiClient } from '@/shared/api/serverClient';

async function fetchUser(): Promise<User> {
  const { data } = await createServerApiClient().get<User>('/auth/me');
  return data;
}

export const getServerUser = cache(async (): Promise<User | null> => {
  try {
    return await fetchUser();
  } catch (err) {
    // A real 401 means the session genuinely isn't valid — no reason to retry.
    if (axios.isAxiosError(err) && err.response?.status === 401) return null;

    // Anything else (network blip, timeout, a cold connection between this
    // server and the backend) is transient, not "logged out" — treating it
    // the same as a real 401 bounced users to /login for a connectivity
    // hiccup that resolves itself a moment later (manually reloading the
    // same protected route right after would work fine). One quick retry
    // before giving up instead.
    try {
      return await fetchUser();
    } catch {
      return null;
    }
  }
});
