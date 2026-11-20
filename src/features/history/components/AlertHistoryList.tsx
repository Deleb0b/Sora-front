import { Button, Text } from '@sora-app/ui';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { useAnnounce } from '../../../a11y';
import type { SosAlert } from '../../../types';
import { AlertItem } from './AlertItem';

interface AlertHistoryListProps {
  alerts: SosAlert[];
  total: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}

const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' });

interface MonthGroup {
  key: string;
  label: string;
  items: { alert: SosAlert; index: number }[];
}

/**
 * Agrupa las alertas por mes. Se memoriza con useMemo porque recorre toda la lista
 * (crece con cada página) y los grupos se vuelven a calcular solo cuando cambian las alertas,
 * no cuando cambia el estado de "cargando más".
 */
function groupByMonth(alerts: SosAlert[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  alerts.forEach((alert, index) => {
    const date = new Date(alert.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    let group = groups.get(key);
    if (!group) {
      const label = monthFormatter.format(date);
      group = { key, label: label.charAt(0).toUpperCase() + label.slice(1), items: [] };
      groups.set(key, group);
    }
    group.items.push({ alert, index });
  });
  return [...groups.values()];
}

/** Historial por meses con paginación "Cargar más" accesible. */
export function AlertHistoryList({ alerts, total, hasNextPage, isFetchingNextPage, fetchNextPage }: AlertHistoryListProps) {
  const announce = useAnnounce();
  const progressId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  // Cantidad antes de pedir otra página: no debe provocar renders, solo recordarse.
  const countBeforeFetch = useRef<number | null>(null);

  const groups = useMemo(() => groupByMonth(alerts), [alerts]);

  const handleLoadMore = useCallback(() => {
    countBeforeFetch.current = alerts.length;
    fetchNextPage();
  }, [alerts.length, fetchNextPage]);

  // Al llegar la nueva página: anunciarla y llevar el foco a la primera alerta nueva,
  // para que quien navega con teclado o lector siga leyendo desde ahí.
  useEffect(() => {
    const before = countBeforeFetch.current;
    if (before === null || alerts.length <= before) return;
    countBeforeFetch.current = null;
    const added = alerts.length - before;
    announce(`Se cargaron ${added} alertas más. Mostrando ${alerts.length} de ${total}.`);
    listRef.current?.querySelector<HTMLElement>(`[data-index="${before}"]`)?.focus();
  }, [alerts.length, total, announce]);

  return (
    <div ref={listRef} className="history">
      {groups.map((group) => {
        const headingId = `mes-${group.key}`;
        return (
          <section key={group.key} aria-labelledby={headingId} className="history__month">
            <Text variant="h3" as="h2" id={headingId} className="section-title">
              {group.label}
            </Text>
            <ol className="stack-list">
              {group.items.map(({ alert, index }) => (
                <AlertItem key={alert.id} alert={alert} index={index} />
              ))}
            </ol>
          </section>
        );
      })}

      <div className="history__footer">
        <p id={progressId} className="hint">
          Mostrando {alerts.length} de {total} alertas.
        </p>
        {hasNextPage ? (
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            loading={isFetchingNextPage}
            aria-describedby={progressId}
          >
            {isFetchingNextPage ? 'Cargando…' : 'Cargar más alertas'}
          </Button>
        ) : (
          <Text variant="note" color="secondary">
            Ya viste todas tus alertas.
          </Text>
        )}
      </div>
    </div>
  );
}
