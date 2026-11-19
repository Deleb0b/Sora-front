import { Modal, Text } from '@sora-app/ui';

interface AddContactDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Diálogo para agregar un contacto.
 *
 * PARTE 3 (Rodrigo): aquí va <ContactForm />, conectado a `useCreateContact`:
 *   const create = useCreateContact();
 *   onSubmit = async (input) => { await create.mutateAsync(input); onClose(); }
 * El contacto aparece en la lista en cuanto se envía (optimista); el diálogo se cierra
 * cuando el servidor confirma. Si responde con errores por campo (ApiError.fieldErrors),
 * el formulario los muestra con setError y el contacto optimista se revierte solo.
 */
export function AddContactDialog({ open, onClose }: AddContactDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nuevo contacto" description="Recibirá tu alerta cuando pidas ayuda.">
      <Text color="secondary">El formulario se agrega en la parte 3.</Text>
    </Modal>
  );
}
