import { Alert, Button, RouteIcon } from '@sora-app/ui';
import { EmptyState, QueryState } from '../../components/feedback';
import { PageHeader } from '../../components/layout';
import { getErrorMessage } from '../../utils/errors';
import { useAlertHistory } from '../alerts/hooks/useAlertHistory';
import { AlertHistoryList } from './components/AlertHistoryList';

/** Historial de alertas con paginación por cursor (useInfiniteQuery). */
export function HistoryPage() {
  const historyQuery = useAlertHistory();
  const { hasNextPage, isFetchingNextPage, fetchNextPage, isFetchNextPageError, error } = historyQuery;

  return (
    <>
      <PageHeader title="Historial" description="Alertas que has enviado." />

      <QueryState
        query={historyQuery}
        loadingLabel="Cargando tu historial"
        errorTitle="No pudimos cargar tu historial"
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon={<RouteIcon size={40} />}
            title="Aún no has enviado alertas"
            description="Cuando uses el botón SOS, aquí verás cada alerta y a quién se avisó."
          />
        }
      >
        {({ items, total }) => (
          <>
            <AlertHistoryList
              alerts={items}
              total={total}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
            {/* Si falla una página siguiente, las anteriores siguen visibles y se puede reintentar. */}
            {isFetchNextPageError && (
              <Alert
                type="error"
                title="No se pudieron cargar más alertas"
                message={getErrorMessage(error)}
                action={
                  <Button size="small" variant="secondary" onClick={() => fetchNextPage()}>
                    Reintentar
                  </Button>
                }
              />
            )}
          </>
        )}
      </QueryState>
    </>
  );
}
