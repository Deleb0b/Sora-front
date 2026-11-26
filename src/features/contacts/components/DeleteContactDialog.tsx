import { Button, Modal, Text } from '@sora-app/ui';
import type { Contact } from '../../../types';

interface DeleteContactDialogProps {
  /** Contacto a eliminar; `null` cierra el diálogo. */
  contact: Contact | null;
  onCancel: () => void;
  onConfirm: (contact: Contact) => void;
}

/**
 * Confirmación accesible de una acción destructiva (Modal de la biblioteca:
 * role="dialog", aria-modal, foco atrapado y cierre con Esc).
 * Sin botón X: así el foco inicial cae en "Cancelar", la opción segura.
 */
export function DeleteContactDialog({ contact, onCancel, onConfirm }: DeleteContactDialogProps) {
  return (
    <Modal
      open={contact !== null}
      onClose={onCancel}
      size="small"
      showCloseButton={false}
      title={contact ? `¿Eliminar a ${contact.name}?` : ''}
      description="Ya no recibirá tus alertas de emergencia."
      footer={
        <>
          <Button variant="tonal" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => contact && onConfirm(contact)}>
            Sí, eliminar
          </Button>
        </>
      }
    >
      {contact?.isPrimary && (
        <Text variant="note" color="secondary">
          Es tu contacto principal: el siguiente de la lista ocupará su lugar.
        </Text>
      )}
    </Modal>
  );
}
