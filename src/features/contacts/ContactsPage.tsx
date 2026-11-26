import { Button, PeopleIcon } from '@sora-app/ui';
import { useCallback, useId, useState } from 'react';
import { PlusIcon } from '../../components/icons';
import { EmptyState, QueryState } from '../../components/feedback';
import { PageHeader } from '../../components/layout';
import { LIMITS } from '../../config/env';
import { ContactFormDialog } from './components/ContactFormDialog';
import { ContactList } from './components/ContactList';
import { useContacts } from './hooks/useContacts';

/** Mi red: contactos de emergencia que recibirán la alerta. */
export function ContactsPage() {
  const contactsQuery = useContacts();
  const [adding, setAdding] = useState(false);
  const limitHintId = useId();

  const total = contactsQuery.data?.length ?? 0;
  const atLimit = total >= LIMITS.maxContacts;

  const openAdd = useCallback(() => setAdding(true), []);
  const closeAdd = useCallback(() => setAdding(false), []);

  const addButton = (
    // Violeta Voz: el manual reserva el coral para la acción más importante (el SOS) y pone
    // acciones de la red como «Invitar a mi red» en el color de acción secundaria.
    <Button
      variant="secondary"
      icon={<PlusIcon size={20} />}
      onClick={openAdd}
      disabled={contactsQuery.isPending || atLimit}
      aria-describedby={atLimit ? limitHintId : undefined}
    >
      Agregar contacto
    </Button>
  );

  return (
    <>
      <PageHeader title="Mi red" description="Personas que recibirán tu alerta." action={addButton} />

      {atLimit && (
        <p id={limitHintId} className="hint">
          Llegaste al máximo de {LIMITS.maxContacts} contactos. Elimina uno para agregar otro.
        </p>
      )}

      <QueryState
        query={contactsQuery}
        loadingLabel="Cargando tu red"
        errorTitle="No pudimos cargar tu red"
        isEmpty={(contacts) => contacts.length === 0}
        empty={
          <EmptyState
            icon={<PeopleIcon size={40} />}
            title="Tu red está vacía"
            description="Agrega al menos una persona de confianza para que reciba tu alerta."
            action={
              <Button variant="secondary" onClick={openAdd}>
                Agregar mi primer contacto
              </Button>
            }
          />
        }
      >
        {(contacts) => <ContactList contacts={contacts} />}
      </QueryState>

      <ContactFormDialog open={adding} onClose={closeAdd} />
    </>
  );
}
