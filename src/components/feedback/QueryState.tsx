import { Alert, Button, Spinner, Text } from '@sora-app/ui';
import type { ReactNode } from 'react';
import { getErrorMessage } from '../../utils/errors';
import { EmptyState } from './EmptyState';

/**
 * Pinta los cuatro estados de una vista a partir de lo que devuelve TanStack Query
 * (sin banderas manuales): cargando, error (con reintento), vacío y con datos.
 *
 * Uso:
 *   const query = useContacts();
 *   <QueryState query={query} isEmpty={(d) => d.length === 0} empty={<EmptyState … />}>
 *     {(contacts) => <ContactList contacts={contacts} />}
 *   </QueryState>
 */

interface QueryLike<T> {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface QueryStateProps<T> {
  query: QueryLike<T>;
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  loadingLabel?: string;
  errorTitle?: string;
}

export function QueryState<T>({
  query,
  children,
  isEmpty,
  empty,
  loadingLabel = 'Cargando',
  errorTitle = 'No pudimos cargar la información',
}: QueryStateProps<T>) {
  const { data, isPending, isError, isFetching, error, refetch } = query;

  if (isPending) {
    return (
      <div className="query-state" aria-busy="true">
        <Spinner size={32} label={loadingLabel} />
        <Text variant="note" color="secondary" aria-hidden="true">
          {loadingLabel}…
        </Text>
      </div>
    );
  }

  // Error sin datos previos: no hay nada que mostrar, solo el error y el reintento.
  if (isError && data === undefined) {
    return (
      <Alert
        type="error"
        title={errorTitle}
        message={getErrorMessage(error)}
        action={
          <Button size="small" variant="secondary" onClick={() => refetch()} loading={isFetching}>
            Reintentar
          </Button>
        }
      />
    );
  }

  if (data === undefined) return null;

  if (isEmpty?.(data)) {
    return <>{empty ?? <EmptyState title="Aún no hay nada aquí" />}</>;
  }

  return (
    // aria-busy mientras se refresca en segundo plano (los datos siguen visibles).
    <div className="query-state__content" aria-busy={isFetching || undefined}>
      {children(data)}
    </div>
  );
}
