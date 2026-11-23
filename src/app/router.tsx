import { Spinner } from '@sora-app/ui';
import { createBrowserRouter } from 'react-router';
import { AppLayout } from '../components/layout';
import { ROUTES } from './routes';

/**
 * Cada vista se carga bajo demanda (code splitting por ruta): el primer render solo
 * descarga el layout y la vista visitada. El service worker precachea todos los
 * fragmentos, así que sin conexión también están disponibles.
 */
function PageFallback() {
  return (
    <div className="query-state">
      <Spinner size={32} label="Cargando vista" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    HydrateFallback: PageFallback,
    children: [
      { path: ROUTES.home, lazy: () => import('../features/home/HomePage').then((m) => ({ Component: m.HomePage })) },
      {
        path: ROUTES.history,
        lazy: () => import('../features/history/HistoryPage').then((m) => ({ Component: m.HistoryPage })),
      },
      {
        path: ROUTES.contacts,
        lazy: () => import('../features/contacts/ContactsPage').then((m) => ({ Component: m.ContactsPage })),
      },
      {
        path: ROUTES.settings,
        lazy: () => import('../features/settings/SettingsPage').then((m) => ({ Component: m.SettingsPage })),
      },
      {
        path: '*',
        lazy: () => import('../features/not-found/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
      },
    ],
  },
]);
