import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '../components/feedback';

/** Cada cuánto se busca una versión nueva mientras la app está abierta. */
const UPDATE_INTERVAL = 60 * 60 * 1000;

/**
 * Registra el service worker y comunica su estado con los avisos de la app:
 * - "Lista para usarse sin conexión" la primera vez que se instala.
 * - "Hay una versión nueva" con el botón "Actualizar" (no se recarga sola).
 * No renderiza nada propio.
 */
export function PwaUpdater() {
  const toast = useToast();
  const interval = useRef<ReturnType<typeof setInterval>>(undefined);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      clearInterval(interval.current);
      interval.current = setInterval(() => {
        // Solo con conexión; si no, la petición del nuevo sw.js fallaría.
        if (navigator.onLine) void registration.update();
      }, UPDATE_INTERVAL);
    },
  });

  useEffect(() => () => clearInterval(interval.current), []);

  useEffect(() => {
    if (!offlineReady) return;
    toast.success('Sora ya funciona sin conexión', 'Puedes instalarla en tu pantalla de inicio.');
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady, toast]);

  useEffect(() => {
    if (!needRefresh) return;
    toast.notify({
      type: 'info',
      title: 'Hay una versión nueva de Sora',
      message: 'Actualiza para tener las últimas mejoras.',
      duration: null,
      action: { label: 'Actualizar', onClick: () => void updateServiceWorker(true) },
    });
    setNeedRefresh(false);
  }, [needRefresh, setNeedRefresh, toast, updateServiceWorker]);

  return null;
}
