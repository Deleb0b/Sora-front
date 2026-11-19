import { useMutation, useMutationState, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useToast } from '../../../components/feedback';
import { mutationKeys, queryKeys } from '../../../lib/query';
import { ApiError, contactsService } from '../../../services';
import type { Contact, ContactInput, ContactPatch } from '../../../types';
import { getErrorMessage } from '../../../utils/errors';

/**
 * Mutaciones optimistas de la red de contactos.
 *
 * Flujo común (patrón recomendado por TanStack Query):
 *  1. onMutate  → cancelQueries (evita que una respuesta vieja pise el cambio optimista),
 *                 guarda un snapshot de la caché y aplica el cambio con setQueryData.
 *  2. onError   → restaura el snapshot devuelto por onMutate y muestra el error con opción de reintentar.
 *  3. onSuccess → confirma con los datos reales del servidor y avisa (toast + aria-live).
 *  4. onSettled → invalida la lista para sincronizarse con el servidor, haya fallado o no.
 */

const LIST_KEY = queryKeys.contacts.list();
const TEMP_PREFIX = 'temp-';

/** Contexto que onMutate devuelve y que onError usa para revertir. */
interface Snapshot {
  previous: Contact[] | undefined;
}

/** true para contactos creados de forma optimista que aún no confirma el servidor. */
export const isOptimisticContact = (contact: Contact) => contact.id.startsWith(TEMP_PREFIX);

async function takeSnapshot(queryClient: QueryClient): Promise<Snapshot> {
  await queryClient.cancelQueries({ queryKey: queryKeys.contacts.all });
  return { previous: queryClient.getQueryData<Contact[]>(LIST_KEY) };
}

function restore(queryClient: QueryClient, snapshot: Snapshot | undefined) {
  if (snapshot?.previous) queryClient.setQueryData(LIST_KEY, snapshot.previous);
}

/**
 * Sin `await` a propósito: si se esperara el refetch, la mutación seguiría "pending" (y la tarjeta
 * con aria-busy) hasta que termine la recarga, incluso después de un error ya revertido.
 */
const invalidate = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
};

// ---------------------------------------------------------------------------
// Crear
// ---------------------------------------------------------------------------

export function useCreateContact() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationKey: mutationKeys.contacts.create,
    mutationFn: (input: ContactInput) => contactsService.create(input),

    onMutate: async (input): Promise<Snapshot & { tempId: string }> => {
      const snapshot = await takeSnapshot(queryClient);
      const tempId = `${TEMP_PREFIX}${Date.now()}`;
      const optimistic: Contact = {
        ...input,
        id: tempId,
        isPrimary: !snapshot.previous?.length,
        available: true,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Contact[]>(LIST_KEY, (old = []) => [...old, optimistic]);
      return { ...snapshot, tempId };
    },

    onError: (_error, _input, snapshot) => {
      restore(queryClient, snapshot);
      // Sin toast: la creación siempre nace del formulario, que muestra el error junto a los
      // campos (setError) o arriba del botón de guardar. Un toast quedaría detrás del Modal.
    },

    onSuccess: (created, _input, snapshot) => {
      // Sustituye el contacto temporal por el real (con su id definitivo).
      queryClient.setQueryData<Contact[]>(LIST_KEY, (old = []) =>
        old.map((c) => (c.id === snapshot?.tempId ? created : c)),
      );
      toast.success('Contacto agregado', `${created.name} ya forma parte de tu red.`);
    },

    onSettled: () => invalidate(queryClient),
  });
}

// ---------------------------------------------------------------------------
// Actualizar (editar datos o marcar como principal)
// ---------------------------------------------------------------------------

export interface UpdateContactVariables {
  contact: Contact;
  patch: ContactPatch;
}

interface UpdateOptions {
  /** false cuando la mutación nace de un formulario que ya muestra sus propios errores. */
  notifyOnError?: boolean;
}

export function useUpdateContact({ notifyOnError = true }: UpdateOptions = {}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationKey: mutationKeys.contacts.update,
    mutationFn: ({ contact, patch }: UpdateContactVariables) => contactsService.update(contact.id, patch),

    onMutate: async ({ contact, patch }) => {
      const snapshot = await takeSnapshot(queryClient);
      queryClient.setQueryData<Contact[]>(LIST_KEY, (old = []) =>
        old.map((c) => {
          if (c.id === contact.id) return { ...c, ...patch } as Contact;
          // Solo puede haber una persona principal.
          if (patch.isPrimary) return { ...c, isPrimary: false };
          return c;
        }),
      );
      return snapshot;
    },

    onError: (error, variables, snapshot) => {
      restore(queryClient, snapshot);
      if (!notifyOnError || (error instanceof ApiError && error.fieldErrors)) return;
      toast.error(`No se pudo actualizar a ${variables.contact.name}`, getErrorMessage(error), {
        label: 'Reintentar',
        onClick: () => mutation.mutate(variables),
      });
    },

    onSuccess: (updated, { patch }) => {
      queryClient.setQueryData<Contact[]>(LIST_KEY, (old = []) => old.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(
        patch.isPrimary ? 'Contacto principal actualizado' : 'Contacto actualizado',
        patch.isPrimary ? `${updated.name} recibirá tu alerta primero.` : undefined,
      );
    },

    onSettled: () => invalidate(queryClient),
  });

  return mutation;
}

// ---------------------------------------------------------------------------
// Eliminar
// ---------------------------------------------------------------------------

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationKey: mutationKeys.contacts.remove,
    mutationFn: (contact: Contact) => contactsService.remove(contact.id),

    onMutate: async (contact) => {
      const snapshot = await takeSnapshot(queryClient);
      queryClient.setQueryData<Contact[]>(LIST_KEY, (old = []) => {
        const rest = old.filter((c) => c.id !== contact.id);
        // Igual que el servidor: si se elimina la principal, la siguiente pasa a serlo.
        if (contact.isPrimary && rest.length && !rest.some((c) => c.isPrimary)) {
          return rest.map((c, i) => (i === 0 ? { ...c, isPrimary: true } : c));
        }
        return rest;
      });
      return snapshot;
    },

    onError: (error, contact, snapshot) => {
      restore(queryClient, snapshot);
      toast.error(`No se pudo eliminar a ${contact.name}`, `${getErrorMessage(error)} Volvió a tu lista.`, {
        label: 'Reintentar',
        onClick: () => mutation.mutate(contact),
      });
    },

    onSuccess: (_data, contact) => {
      toast.success('Contacto eliminado', `${contact.name} ya no recibirá tus alertas.`);
    },

    onSettled: () => invalidate(queryClient),
  });

  return mutation;
}

// ---------------------------------------------------------------------------
// Estado pending por contacto
// ---------------------------------------------------------------------------

/**
 * Ids de contactos con una mutación de actualización o eliminación en curso.
 * Se lee del MutationCache (useMutationState), así cada tarjeta sabe si está "guardando"
 * sin pasar banderas manuales entre componentes.
 */
export function usePendingContactIds(): ReadonlySet<string> {
  const updating = useMutationState({
    filters: { mutationKey: mutationKeys.contacts.update, status: 'pending' },
    select: (m) => (m.state.variables as UpdateContactVariables | undefined)?.contact.id,
  });
  const removing = useMutationState({
    filters: { mutationKey: mutationKeys.contacts.remove, status: 'pending' },
    select: (m) => (m.state.variables as Contact | undefined)?.id,
  });

  // Set memorizado: la referencia solo cambia cuando cambian los ids pendientes.
  return useMemo(
    () => new Set([...updating, ...removing].filter((id): id is string => Boolean(id))),
    [updating, removing],
  );
}
