/**
 * Query keys centralizadas (patrón "query key factory").
 * Todas son arreglos serializables e incluyen cada parámetro que cambia la consulta,
 * así una invalidación de `queryKeys.contacts.all` alcanza a todas las listas de contactos.
 */
export const queryKeys = {
  contacts: {
    all: ['contacts'] as const,
    list: () => [...queryKeys.contacts.all, 'list'] as const,
  },
  alerts: {
    all: ['alerts'] as const,
    history: (params: { limit: number }) => [...queryKeys.alerts.all, 'history', params] as const,
  },
  settings: {
    all: ['settings'] as const,
    detail: () => [...queryKeys.settings.all, 'detail'] as const,
  },
} as const;

/** Claves de mutación (sirven para useMutationState / useIsMutating). */
export const mutationKeys = {
  contacts: {
    create: ['contacts', 'create'] as const,
    update: ['contacts', 'update'] as const,
    remove: ['contacts', 'remove'] as const,
  },
  alerts: {
    send: ['alerts', 'send'] as const,
  },
  settings: {
    update: ['settings', 'update'] as const,
  },
} as const;
