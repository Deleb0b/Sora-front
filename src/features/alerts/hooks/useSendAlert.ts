import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useAnnounce } from '../../../a11y';
import { useToast } from '../../../components/feedback';
import { mutationKeys, queryKeys } from '../../../lib/query';
import { alertsService } from '../../../services';
import type { AlertPage, SendAlertInput, SosAlert } from '../../../types';
import { getErrorMessage } from '../../../utils/errors';
import { ALERT_HISTORY_KEY } from './useAlertHistory';

type HistoryData = InfiniteData<AlertPage, string | null>;

export interface SendAlertVariables {
  message: string;
  shareLocation: boolean;
  /** Número de contactos que recibirán la alerta (para el registro optimista). */
  contactsCount: number;
}

/** Ubicación actual con límite de tiempo; si no hay permiso o tarda, se envía sin ella. */
function getLocation(timeout = 5000): Promise<SendAlertInput['location']> {
  if (!('geolocation' in navigator)) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout, maximumAge: 60_000 },
    );
  });
}

/**
 * Envía la alerta SOS.
 * Mutación optimista sobre una consulta infinita: la alerta se agrega al inicio de la
 * primera página del historial antes de que responda el servidor.
 */
export function useSendAlert() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const announce = useAnnounce();

  const mutation = useMutation({
    mutationKey: mutationKeys.alerts.send,
    mutationFn: async ({ message, shareLocation }: SendAlertVariables) => {
      const location = shareLocation ? await getLocation() : null;
      return alertsService.send({ message, location });
    },

    onMutate: async ({ message, contactsCount }) => {
      announce('Enviando tu alerta…', 'assertive');
      await queryClient.cancelQueries({ queryKey: queryKeys.alerts.all });
      const previous = queryClient.getQueryData<HistoryData>(ALERT_HISTORY_KEY);

      const optimistic: SosAlert = {
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'enviada',
        message,
        location: null,
        contactsNotified: contactsCount,
      };

      // Solo si el historial ya está en caché; si no, se cargará completo al abrirlo.
      if (previous) {
        queryClient.setQueryData<HistoryData>(ALERT_HISTORY_KEY, {
          ...previous,
          pages: previous.pages.map((page, i) =>
            i === 0 ? { ...page, items: [optimistic, ...page.items], total: page.total + 1 } : page,
          ),
        });
      }
      return { previous, tempId: optimistic.id };
    },

    onError: (error, variables, context) => {
      if (context?.previous) queryClient.setQueryData(ALERT_HISTORY_KEY, context.previous);
      toast.error('No se pudo enviar tu alerta', `${getErrorMessage(error)} Si estás en peligro, llama al 911.`, {
        label: 'Reintentar',
        onClick: () => mutation.mutate(variables),
      });
    },

    onSuccess: (sent, _variables, context) => {
      queryClient.setQueryData<HistoryData>(ALERT_HISTORY_KEY, (data) =>
        data && {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((a) => (a.id === context?.tempId ? sent : a)),
          })),
        },
      );
      const people = sent.contactsNotified === 1 ? '1 contacto' : `${sent.contactsNotified} contactos`;
      toast.success('Alerta enviada', `Avisamos a ${people}${sent.location ? ' con tu ubicación' : ''}.`);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });

  return mutation;
}
