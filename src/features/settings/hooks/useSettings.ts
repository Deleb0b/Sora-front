import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../components/feedback';
import { mutationKeys, queryKeys } from '../../../lib/query';
import { settingsService } from '../../../services';
import type { Settings } from '../../../types';

const SETTINGS_KEY = queryKeys.settings.detail();

/** Ajustes de la alerta. */
export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: ({ signal }) => settingsService.get(signal),
  });
}

/**
 * Guarda los ajustes con actualización optimista: Inicio (que lee holdDuration y el mensaje)
 * ve el cambio al instante. Si falla, se restaura el snapshot y el formulario muestra el error.
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationKey: mutationKeys.settings.update,
    mutationFn: (settings: Settings) => settingsService.update(settings),

    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.all });
      const previous = queryClient.getQueryData<Settings>(SETTINGS_KEY);
      queryClient.setQueryData(SETTINGS_KEY, settings);
      return { previous };
    },

    onError: (_error, _settings, context) => {
      if (context?.previous) queryClient.setQueryData(SETTINGS_KEY, context.previous);
    },

    onSuccess: (saved) => {
      queryClient.setQueryData(SETTINGS_KEY, saved);
      toast.success('Ajustes guardados', 'Tu alerta usará la nueva configuración.');
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
