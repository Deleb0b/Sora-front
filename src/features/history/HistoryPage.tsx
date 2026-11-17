import { EmptyState } from '../../components/feedback';
import { PageHeader } from '../../components/layout';

/**
 * Historial — PARTE 4 (Alonso).
 * Pendiente:
 * - useInfiniteQuery con queryKeys.alerts.history({ limit }) y alertsService.history.
 * - Lista semántica (<ol>/<li>) con <time dateTime>, botón "Cargar más" con aria-busy
 *   y anuncio "Se cargaron N alertas más" (useAnnounce).
 * - useRef para mover el foco al primer elemento nuevo tras cargar otra página.
 */
export function HistoryPage() {
  return (
    <>
      <PageHeader title="Historial" description="Alertas que has enviado." />
      <EmptyState title="Próximamente" description="Aquí irá el historial de alertas." />
    </>
  );
}
