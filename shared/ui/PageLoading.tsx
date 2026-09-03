'use client';
// Shown by Next.js's App Router loading.tsx convention while a dynamic
// route's Server Component (auth check + data prefetch) is still running —
// without it, navigating to a route with no loading.tsx boundary leaves the
// previous screen frozen with zero feedback until the whole server round
// trip finishes. Same visual as the old client-side auth-loading spinner
// dashboard/layout.tsx used to show before it became a Server Component.
import { Center, Spinner } from '@chakra-ui/react';

export function PageLoading() {
  return (
    <Center h='100vh'>
      <Spinner
        size='xl'
        color='brand.500'
        thickness='3px'
      />
    </Center>
  );
}
