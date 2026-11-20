import { Badge, Button, ContactCard } from '@sora-app/ui';
import { motion, useIsPresent } from 'motion/react';
import { memo } from 'react';
import { PencilIcon, StarIcon, TrashIcon } from '../../../components/icons';
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
  onEdit: (contact: Contact) => void;
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
export const ContactItem = memo(function ContactItem({ contact, pending, onMakePrimary, onRequestDelete, onEdit }: ContactItemProps) {
  const saving = pending || isOptimisticContact(contact);
  // Mientras se anima la salida el elemento sigue en el DOM: `inert` lo saca del orden de
  // tabulación y del árbol de accesibilidad para que nadie interactúe con un contacto ya eliminado.
  const isPresent = useIsPresent();
  const relation = `${relationLabels[contact.relation]} · ${formatPhone(contact.phone)}`;

  return (
    // aria-busy comunica a los lectores de pantalla que el contacto se está guardando.
    // motion.li: entra deslizándose, sale hacia la izquierda y `layout` anima el reordenamiento
    // (p. ej. al marcar a alguien como principal sube al inicio). Solo se animan transform y
    // opacity, así que el indicador de foco (outline) no se altera.
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: saving ? 0.7 : 1, y: 0 }}
      exit={{ opacity: 0, x: -32, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      className="contact-item"
      aria-busy={saving || undefined}
      inert={!isPresent || undefined}
    >
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
          >
            {/* El nombre accesible empieza con el texto visible (WCAG 2.5.3) y añade a quién aplica. */}
            Hacer principal<span className="sr-only"> a {contact.name}</span>
          </Button>
        )}

        {saving && (
          <span className="contact-item__status" role="status">
            Guardando…
          </span>
        )}

        {/* Botones de solo ícono: nombre accesible en aria-label; el SVG ya es aria-hidden. */}
        <Button
          variant="tonal"
          size="small"
          className="touch-target contact-item__edit"
          icon={<PencilIcon size={20} />}
          disabled={saving}
          onClick={() => onEdit(contact)}
          aria-label={`Editar a ${contact.name}`}
        />
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
    </motion.li>
  );
});
