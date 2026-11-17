import { EmptyState } from '../../components/feedback';
import { PageHeader } from '../../components/layout';

/**
 * Mi red — PARTE 2 (Valdemar).
 * Pendiente:
 * - useContacts (useQuery + queryKeys.contacts.list()) y estados con <QueryState>.
 * - Mutaciones optimistas: crear, marcar como principal y eliminar
 *   (cancelQueries → snapshot → setQueryData → rollback en onError → invalidate en onSettled).
 * - Lista <ul>/<li> con ContactCard (React.memo) y botones de ícono con aria-label.
 * - Confirmación accesible antes de eliminar (Modal de la biblioteca).
 */
export function ContactsPage() {
  return (
    <>
      <PageHeader title="Mi red" description="Personas que recibirán tu alerta." />
      <EmptyState title="Próximamente" description="Aquí irán tus contactos de emergencia." />
    </>
  );
}
