import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query';
import { contactsService } from '../../../services';
import type { Contact } from '../../../types';

/**
 * Orden de la red: principal primero y después por antigüedad.
 * Se aplica en `select` (y no en el servidor) porque las actualizaciones optimistas
 * insertan o cambian contactos en la caché y la lista debe verse ordenada al instante.
 * Al ser una función fuera del componente, su referencia es estable y TanStack Query
 * solo la vuelve a ejecutar cuando cambian los datos.
 */
export const sortContacts = (contacts: Contact[]) =>
  [...contacts].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.createdAt.localeCompare(b.createdAt),
  );

export interface ContactsSummary {
  total: number;
  available: number;
  primary: Contact | null;
}

const toSummary = (contacts: Contact[]): ContactsSummary => ({
  total: contacts.length,
  available: contacts.filter((c) => c.available).length,
  primary: contacts.find((c) => c.isPrimary) ?? null,
});

/** Opciones compartidas: misma key y misma función de consulta para todas las variantes. */
const contactsQuery = {
  queryKey: queryKeys.contacts.list(),
  queryFn: ({ signal }: { signal: AbortSignal }) => contactsService.list(signal),
};

/** Lista ordenada de contactos de emergencia. */
export function useContacts() {
  return useQuery({ ...contactsQuery, select: sortContacts });
}

/**
 * Solo el resumen (total, disponibles y principal). Reutiliza la misma caché;
 * el componente que lo usa (p. ej. Inicio) solo se vuelve a renderizar si cambia el resumen.
 */
export function useContactsSummary() {
  return useQuery({ ...contactsQuery, select: toSummary });
}
