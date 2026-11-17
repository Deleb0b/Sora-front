/**
 * Tipos de dominio. Se infieren de los esquemas de Zod para no duplicar interfaces.
 */
export type { Contact, ContactInput, ContactFormValues, ContactPatch, Relation } from '../schemas/contact.schema';
export type { SosAlert, AlertPage, AlertStatus, SendAlertInput } from '../schemas/alert.schema';
export type { Settings, SettingsFormValues } from '../schemas/settings.schema';

/** Errores de validación del servidor por campo (se pasan a `setError` de React Hook Form). */
export type FieldErrors = Record<string, string>;

/** Cuerpo de error que devuelve la API. */
export interface ApiErrorBody {
  message: string;
  fieldErrors?: FieldErrors;
}
