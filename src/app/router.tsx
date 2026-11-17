import { createBrowserRouter } from 'react-router';
import { AppLayout } from '../components/layout';
import { ContactsPage } from '../features/contacts/ContactsPage';
import { HistoryPage } from '../features/history/HistoryPage';
import { HomePage } from '../features/home/HomePage';
import { NotFoundPage } from '../features/not-found/NotFoundPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { ROUTES } from './routes';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.history, element: <HistoryPage /> },
      { path: ROUTES.contacts, element: <ContactsPage /> },
      { path: ROUTES.settings, element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
