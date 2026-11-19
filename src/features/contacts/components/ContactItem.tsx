import { Badge, Button, ContactCard } from '@sora-app/ui';
import { memo } from 'react';
import { StarIcon, TrashIcon } from '../../../components/icons';
import { relationLabels } from '../../../schemas/contact.schema';
import type { Contact } from '../../../types';
import { formatPhone } from '../../../utils/format';
import { isOptimisticContact } from '../hooks/useContactMutations';

interface ContactItemProps {
  contact: Contact;
  /** Hay una mutación en curso sobre este contacto. */
  pending: boolean;
  onMakePrimary: (contact: Contact) => void;
  onRequestDelete: (contact: Contact) => void;
}

const call = (phone: string) => window.location.assign(`tel:${phone}`);
const message = (phone: string) => window.location.assign(`sms:${phone}`);

/**
 * Un contacto de la red. Compone `ContactCard` de la biblioteca y le agrega
 * las acciones propias de la app (principal y eliminar).
 *
 * React.memo: al cambiar un contacto (p. ej. marcarlo como principal) la lista se vuelve
 * a renderizar, pero solo las tarjetas cuyas props cambiaron se repintan. Funciona porque
 * la lista pasa handlers estables (useCallback) y TanStack Query conserva la referencia
 * de los contactos que no cambiaron (structural sharing).
 */
export const ContactItem = memo(function ContactItem({ contact, pending, onMakePrimary, onRequestDelete }: ContactItemProps) {
  const saving = pending || isOptimisticContact(contact);
  const relation = `${relationLabels[contact.relation]} · ${formatPhone(contact.phone)}`;

  return (
    // aria-busy comunica a los lectores de pantalla que el contacto se está guardando.
    <li className="contact-item" aria-busy={saving || undefined} data-saving={saving || undefined}>
      <ContactCard
        name={contact.name}
        relation={relation}
        available={contact.available}
        avatarColor={contact.isPrimary ? 'coral' : 'malva'}
        variant={contact.isPrimary ? 'outlined' : 'elevated'}
        onCall={() => call(contact.phone)}
        onMessage={() => message(contact.phone)}
      />

      <div className="contact-item__actions">
        {contact.isPrimary ? (
          <Badge variant="info" dot>
            Contacto principal
          </Badge>
        ) : (
          <Button
            variant="secondary"
            size="small"
            className="touch-target"
            icon={<StarIcon size={18} />}
            loading={pending}
            disabled={isOptimisticContact(contact)}
            onClick={() => onMakePrimary(contact)}
            aria-label={`Hacer a ${contact.name} tu contacto principal`}
          >
            Hacer principal
          </Button>
        )}

        {saving && (
          <span className="contact-item__status" role="status">
            Guardando…
          </span>
        )}

        {/* Botón de solo ícono: nombre accesible en aria-label; el SVG ya es aria-hidden. */}
        <Button
          variant="tonal"
          size="small"
          className="touch-target contact-item__delete"
          icon={<TrashIcon size={20} />}
          disabled={saving}
          onClick={() => onRequestDelete(contact)}
          aria-label={`Eliminar a ${contact.name} de tu red`}
        />
      </div>
    </li>
  );
});
