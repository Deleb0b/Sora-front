import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { lazy, Suspense, type ReactNode } from 'react';
import { LiveAnnouncerProvider } from '../a11y';
import { ToastProvider } from '../components/feedback';
import { queryClient } from '../lib/query';
import { PwaUpdater } from '../pwa/PwaUpdater';

/** Las DevTools solo se cargan en desarrollo (no entran al bundle de producción). */
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : () => null;

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user": si el sistema pide reducir movimiento, Motion desactiva las
          animaciones de posición y transformación en toda la app y conserva solo la opacidad. */}
      <MotionConfig reducedMotion="user">
        <LiveAnnouncerProvider>
          <ToastProvider>
            {children}
            <PwaUpdater />
          </ToastProvider>
        </LiveAnnouncerProvider>
      </MotionConfig>
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
      </Suspense>
    </QueryClientProvider>
  );
}
