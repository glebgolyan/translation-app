// shared/lib/serverAuth.ts
// Single place session resolution happens for Server Component pages/layouts
// — replaces N independent client-side useAuth() calls (one /auth/me each)
// with one server-side call per request, deduped via React's cache() so a
// layout + its page both calling getServerUser() only hit the backend once.
import { cache } from 'react';
import { User } from '@/entities/user/model/types';
import { createServerApiClient } from '@/shared/api/serverClient';

export const getServerUser = cache(async (): Promise<User | null> => {
  try {
    const { data } = await createServerApiClient().get<User>('/auth/me');
    return data;
  } catch {
    return null;
  }
});
