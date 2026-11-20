import { infiniteQueryOptions, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { LIMITS } from '../../../config/env';
import { queryKeys } from '../../../lib/query';
import { alertsService } from '../../../services';
import type { AlertPage, SosAlert } from '../../../types';

const PARAMS = { limit: LIMITS.historyPageSize };

export const ALERT_HISTORY_KEY = queryKeys.alerts.history(PARAMS);

/**
 * Historial de alertas paginado por cursor.
 * La key incluye el tamaño de página: si cambiara, sería otra caché distinta.
 */
export const alertHistoryOptions = infiniteQueryOptions({
  queryKey: ALERT_HISTORY_KEY,
  queryFn: ({ pageParam, signal }) => alertsService.history({ cursor: pageParam, limit: PARAMS.limit }, signal),
  initialPageParam: null as string | null,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

export interface AlertHistory {
  items: SosAlert[];
  total: number;
}

/**
 * `select` aplana las páginas en una sola lista. Es una función estable (fuera del hook),
 * así TanStack Query solo la vuelve a ejecutar cuando llegan páginas nuevas.
 */
const flattenPages = (data: InfiniteData<AlertPage, string | null>): AlertHistory => ({
  items: data.pages.flatMap((page) => page.items),
  total: data.pages[0]?.total ?? 0,
});

export function useAlertHistory() {
  return useInfiniteQuery({ ...alertHistoryOptions, select: flattenPages });
}

/** Última alerta enviada (solo lee la primera página de la caché). */
const selectLatest = (data: InfiniteData<AlertPage, string | null>) => data.pages[0]?.items[0] ?? null;

export function useLatestAlert() {
  return useInfiniteQuery({ ...alertHistoryOptions, select: selectLatest });
}
