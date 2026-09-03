// shared/api/serverClient.ts
// Server-side counterpart to shared/api/client.ts's apiClient. That client
// reads the access token via js-cookie (document.cookie), which only exists
// in the browser — Server Components/layouts need next/headers' cookies()
// instead. No refresh-on-401 interceptor here: a Server Component render is
// a one-shot request, so an expired token just resolves to an unauthenticated
// client and the caller (getServerUser) treats that as "not logged in" —
// the normal client-side login flow takes over from there and sets fresh
// cookies for subsequent requests.
import axios, { AxiosInstance } from 'axios';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function createServerApiClient(): AxiosInstance {
  const token = cookies().get('accessToken')?.value;
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
