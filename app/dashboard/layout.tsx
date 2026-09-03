import { Suspense } from 'react';
import { LayoutContent } from './components/LayoutContent';
import { SidebarServer } from './components/SidebarServer';
import { SidebarSkeleton } from './components/SidebarSkeleton';

// Deliberately NOT an async component / no top-level await here: an async
// layout blocks the entire response stream (including the page below it,
// and its own loading.tsx Suspense boundary) until the layout's own await
// resolves — since nothing about the layout's JSX, Suspense boundaries
// included, is knowable to React until the async function returns. Moving
// the session lookup into SidebarServer + a local Suspense boundary lets
// the page content start streaming immediately instead of waiting on it.
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutContent
      sidebar={
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarServer />
        </Suspense>
      }
    >
      {children}
    </LayoutContent>
  );
}
