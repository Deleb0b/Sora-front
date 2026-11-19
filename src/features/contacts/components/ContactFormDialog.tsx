import { Modal } from '@sora-app/ui';
import { useCallback } from 'react';
import type { Contact, ContactInput } from '../../../types';
import { useCreateContact, useUpdateContact } from '../hooks/useContactMutations';
import { ContactForm } from './ContactForm';

interface ContactFormDialogProps {
  open: boolean;
  /** Si se pasa, el diálogo edita este contacto; si no, crea uno nuevo. */
  contact?: Contact | null;
  onClose: () => void;
}

/**
 * Diálogo para crear o editar un contacto.
 *
 * Flujo optimista: al enviar, el cambio aparece de inmediato en la lista (detrás del Modal);
 * el diálogo se cierra cuando el servidor confirma. Si el servidor responde con error,
 * la caché se revierte (onError del hook) y el formulario muestra el motivo con setError.
 */
export function ContactFormDialog({ open, contact, onClose }: ContactFormDialogProps) {
  const isEdit = Boolean(contact);
  // Se desestructuran `mutateAsync` y `reset` porque son estables entre renders
  // (el objeto completo de useMutation cambia en cada render y rompería los useCallback).
  const { mutateAsync: createAsync, reset: resetCreate, isPending: creating } = useCreateContact();
  const { mutateAsync: updateAsync, reset: resetUpdate, isPending: updating } = useUpdateContact({ notifyOnError: false });
  const isPending = isEdit ? updating : creating;

  const handleClose = useCallback(() => {
    // Limpia el estado de error de la mutación para que el siguiente intento empiece de cero.
    resetCreate();
    resetUpdate();
    onClose();
  }, [resetCreate, resetUpdate, onClose]);

  const handleSubmit = useCallback(
    async (input: ContactInput) => {
      if (contact) await updateAsync({ contact, patch: input });
      else await createAsync(input);
      handleClose();
    },
    [contact, createAsync, updateAsync, handleClose],
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      // Mientras se guarda no se cierra con Esc ni con el fondo, para no perder la respuesta.
      closeOnEsc={!isPending}
      closeOnOverlayClick={!isPending}
      // Sin X: el foco inicial cae directo en el primer campo (Nombre). "Cancelar" y Esc cierran.
      showCloseButton={false}
      title={isEdit ? `Editar a ${contact?.name}` : 'Nuevo contacto'}
      description={isEdit ? undefined : 'Recibirá tu alerta cuando pidas ayuda.'}
    >
      {open && (
        <ContactForm
          // key: al cambiar de contacto, el formulario se monta de nuevo con sus valores.
          key={contact?.id ?? 'nuevo'}
          defaultValues={contact ?? undefined}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isPending={isPending}
          submitLabel={isEdit ? 'Guardar cambios' : 'Agregar contacto'}
        />
      )}
    </Modal>
  );
}
