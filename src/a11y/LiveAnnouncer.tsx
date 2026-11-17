import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/**
 * Regiones aria-live globales y siempre montadas (un lector de pantalla solo anuncia
 * cambios dentro de una región que ya existía en el DOM).
 *
 * - polite  → role="status": cambios de página, "se cargaron 10 alertas más", guardados.
 * - assertive → role="alert": errores críticos.
 *
 * Para avisos visibles usa `useToast` (components/feedback); este hook es para
 * anuncios que solo necesita el lector de pantalla.
 */

type Politeness = 'polite' | 'assertive';
type Announce = (message: string, politeness?: Politeness) => void;

const AnnouncerContext = createContext<Announce | null>(null);

export function LiveAnnouncerProvider({ children }: { children: ReactNode }) {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  // useRef: el timer no debe provocar renders y debe sobrevivir entre llamadas.
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const announce = useCallback<Announce>((message, politeness = 'polite') => {
    const set = politeness === 'assertive' ? setAssertive : setPolite;
    // Vaciar y volver a escribir hace que se repita un mensaje idéntico.
    set('');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => set(message), 60);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnounce(): Announce {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) throw new Error('useAnnounce debe usarse dentro de <LiveAnnouncerProvider>.');
  return ctx;
}

/** Helper memorizado para componentes que solo leen el contexto. */
export function useAnnouncer() {
  const announce = useAnnounce();
  return useMemo(
    () => ({
      polite: (msg: string) => announce(msg, 'polite'),
      assertive: (msg: string) => announce(msg, 'assertive'),
    }),
    [announce],
  );
}
