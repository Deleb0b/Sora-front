import { Text } from '@sora-app/ui';
import { useCallback, useId, useRef, useState } from 'react';
import { LIMITS } from '../../../config/env';
import type { Contact } from '../../../types';
import { useDeleteContact, usePendingContactIds, useUpdateContact } from '../hooks/useContactMutations';
import { ContactItem } from './ContactItem';
import { DeleteContactDialog } from './DeleteContactDialog';

interface ContactListProps {
  contacts: Contact[];
}

/** Lista semántica (<ul>/<li>) de la red con sus acciones. */
export function ContactList({ contacts }: ContactListProps) {
  const headingId = useId();
  // useRef al título: tras eliminar, el botón que abrió el modal desaparece del DOM,
  // así que el foco se lleva aquí para que no se pierda en <body>.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [toDelete, setToDelete] = useState<Contact | null>(null);

  const pendingIds = usePendingContactIds();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  // `mutate` es estable entre renders, así que estos handlers también lo son
  // y no rompen el React.memo de cada ContactItem.
  const { mutate: update } = updateContact;
  const { mutate: remove } = deleteContact;

  const handleMakePrimary = useCallback((contact: Contact) => update({ contact, patch: { isPrimary: true } }), [update]);

  const handleRequestDelete = useCallback((contact: Contact) => setToDelete(contact), []);

  const handleCancelDelete = useCallback(() => setToDelete(null), []);

  const handleConfirmDelete = useCallback(
    (contact: Contact) => {
      setToDelete(null);
      remove(contact);
      // Esperar a que el Modal devuelva el foco (al botón ya eliminado) y corregirlo.
      requestAnimationFrame(() => headingRef.current?.focus());
    },
    [remove],
  );

  return (
    <section aria-labelledby={headingId}>
      <Text variant="h3" as="h2" id={headingId} ref={headingRef} tabIndex={-1} className="section-title">
        Tus contactos{' '}
        <span className="section-title__count">
          ({contacts.length} de {LIMITS.maxContacts})
        </span>
      </Text>

      <ul className="stack-list contact-list">
        {contacts.map((contact) => (
          <ContactItem
            key={contact.id}
            contact={contact}
            pending={pendingIds.has(contact.id)}
            onMakePrimary={handleMakePrimary}
            onRequestDelete={handleRequestDelete}
          />
        ))}
      </ul>

      <DeleteContactDialog contact={toDelete} onCancel={handleCancelDelete} onConfirm={handleConfirmDelete} />
    </section>
  );
}
