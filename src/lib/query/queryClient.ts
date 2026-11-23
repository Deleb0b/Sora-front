import { onlineManager, QueryClient } from '@tanstack/react-query';
import { ApiError } from '../../services/http';

const MAX_RETRIES = 2;

/**
 * Reintenta solo errores transitorios (red o 5xx). Un 4xx no cambiará al reintentar.
 */
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.isClientError) return false;
  return failureCount < MAX_RETRIES;
}

/**
 * Configuración por defecto:
 * - staleTime 30 s: los datos de la red de contactos cambian poco; evita peticiones repetidas
 *   al navegar entre pestañas.
 * - refetchOnWindowFocus false: en una app de emergencia no queremos que la lista "salte" o
 *   muestre spinners al volver a la pestaña; los datos se refrescan al invalidar tras mutaciones.
 * - refetchOnReconnect true: al recuperar la conexión se sincroniza con el servidor.
 * - Las mutaciones no se reintentan solas: la usuaria decide reintentar (botón en el aviso de error).
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * TanStack Query asume que hay conexión hasta recibir un evento 'offline'. Si la PWA se abre ya
 * sin internet, le decimos el estado real para que pause las consultas (y la vista muestre
 * "Sin conexión") en lugar de reintentar peticiones que no pueden salir.
 */
if (typeof navigator !== 'undefined') onlineManager.setOnline(navigator.onLine);

export const queryClient = createQueryClient();
