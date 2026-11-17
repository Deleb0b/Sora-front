import { LIMITS } from '../config/env';
import { alertPageSchema, alertSchema } from '../schemas/alert.schema';
import type { AlertPage, SendAlertInput, SosAlert } from '../types';
import { http } from './http';

export interface HistoryParams {
  cursor?: string | null;
  limit?: number;
}

/** Capa de servicios de alertas SOS. */
export const alertsService = {
  /** Historial paginado por cursor (para useInfiniteQuery). */
  history: ({ cursor, limit = LIMITS.historyPageSize }: HistoryParams = {}, signal?: AbortSignal) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    return http.get<AlertPage>(`/alerts?${params}`, { signal, schema: alertPageSchema });
  },

  send: (input: SendAlertInput) => http.post<SosAlert>('/alerts', input, { schema: alertSchema }),
};
