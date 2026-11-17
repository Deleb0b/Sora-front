import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, type ReactNode } from 'react';
import { LiveAnnouncerProvider } from '../a11y';
import { ToastProvider } from '../components/feedback';
import { queryClient } from '../lib/query';

/** Las DevTools solo se cargan en desarrollo (no entran al bundle de producción). */
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : () => null;

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LiveAnnouncerProvider>
        <ToastProvider>{children}</ToastProvider>
      </LiveAnnouncerProvider>
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
      </Suspense>
    </QueryClientProvider>
  );
}
