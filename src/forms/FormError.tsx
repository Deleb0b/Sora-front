import { Alert } from '@sora-app/ui';

/**
 * Error general del formulario (no ligado a un campo), con el `Alert` de la biblioteca.
 * El Alert de tipo error usa role="alert", así que se anuncia al aparecer.
 */
export function FormError({ message, title = 'No se pudo guardar' }: { message?: string; title?: string }) {
  if (!message) return null;
  return <Alert type="error" title={title} message={message} />;
}
