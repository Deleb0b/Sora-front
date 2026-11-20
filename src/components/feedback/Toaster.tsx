import { Alert, Button, type AlertType } from '@sora-app/ui';
import { AnimatePresence, motion } from 'motion/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAnnounce } from '../../a11y';

/**
 * Avisos flotantes de éxito/error construidos con `Alert` de @sora-app/ui.
 *
 * Accesibilidad:
 * - Error → el `Alert` de la biblioteca usa role="alert" y se anuncia al aparecer.
 * - Éxito/info → se anuncia en la región global role="status" (aria-live="polite"),
 *   que siempre está montada; así el anuncio es confiable en todos los lectores.
 * - Los errores no desaparecen solos (la usuaria debe poder leerlos y reintentar).
 *
 * Rendimiento: las acciones (`notify`, `dismiss`) viven en un contexto separado y estable,
 * así los componentes que solo disparan avisos no se vuelven a renderizar cuando cambia la lista.
 */

export interface ToastOptions {
  type: AlertType;
  title: string;
  message?: string;
  /** Acción opcional, p. ej. "Reintentar". */
  action?: { label: string; onClick: () => void };
  /** ms antes de cerrarse. Por defecto 5 s para éxito/info; los errores no se cierran solos. */
  duration?: number | null;
}

interface Toast extends ToastOptions {
  id: number;
}

interface ToastActions {
  notify: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
  success: (title: string, message?: string) => number;
  error: (title: string, message?: string, action?: ToastOptions['action']) => number;
}

const ToastContext = createContext<ToastActions | null>(null);
const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const announce = useAnnounce();
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  // Medición del contenedor: los errores no se cierran solos, así que reservamos su alto al final
  // de la página (--toaster-space) para que nunca tapen botones ni el foco (WCAG 2.4.11).
  const regionRef = useRef<HTMLElement>(null);

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (options: ToastOptions) => {
      const id = ++nextId.current;
      const isError = options.type === 'error' || options.type === 'warning';
      setToasts((list) => [...list, { ...options, id }].slice(-MAX_TOASTS));

      if (!isError) {
        announce([options.title, options.message].filter(Boolean).join('. '));
      }

      const duration = options.duration === undefined ? (isError ? null : 5000) : options.duration;
      if (duration)
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      return id;
    },
    [announce, dismiss],
  );

  const actions = useMemo<ToastActions>(
    () => ({
      notify,
      dismiss,
      success: (title, message) => notify({ type: 'success', title, message }),
      error: (title, message, action) => notify({ type: 'error', title, message, action }),
    }),
    [notify, dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const el = regionRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const root = document.documentElement;
    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty('--toaster-space', `${Math.ceil(entry.contentRect.height)}px`);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--toaster-space');
    };
  }, []);

  return (
    <ToastContext.Provider value={actions}>
      {children}
      <section ref={regionRef} className="toaster" aria-label="Notificaciones">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const isError = t.type === 'error' || t.type === 'warning';
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              >
                <Alert
                  type={t.type}
                  title={t.title}
                  message={t.message}
                  // Éxito/info ya se anunció en la región global; evitamos el anuncio doble.
                  role={isError ? 'alert' : undefined}
                  onClose={() => dismiss(t.id)}
                  action={
                    t.action && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => {
                          dismiss(t.id);
                          t.action?.onClick();
                        }}
                      >
                        {t.action.label}
                      </Button>
                    )
                  }
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastActions {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  return ctx;
}
