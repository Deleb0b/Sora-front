import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '../services/http';
import { getErrorMessage } from '../utils/errors';

/**
 * Lleva los errores del servidor al formulario:
 * - Errores por campo (ApiError.fieldErrors, p. ej. "teléfono repetido") → setError en ese campo.
 * - Cualquier otro error (red, 5xx, límite de contactos) → `root.server`, que se pinta
 *   arriba del botón de enviar.
 * Así hay una sola forma de mostrar errores: la de React Hook Form.
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, fields: readonly Path<T>[]) {
  if (error instanceof ApiError && error.fieldErrors) {
    let handled = false;
    for (const [field, message] of Object.entries(error.fieldErrors)) {
      if ((fields as readonly string[]).includes(field)) {
        setError(field as Path<T>, { type: 'server', message });
        handled = true;
      }
    }
    if (handled) return;
  }
  setError('root.server', { type: 'server', message: getErrorMessage(error) });
}
