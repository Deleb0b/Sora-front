import { HomeIcon, Navbar, PeopleIcon, RouteIcon, SettingsIcon, type NavbarItem } from '@sora-app/ui';
import { memo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ROUTES } from '../../app/routes';

/**
 * Navegación inferior: compone `Navbar` de la biblioteca y la conecta al router.
 * Los items viven fuera del componente para que su referencia sea estable
 * (Navbar no vuelve a recibir un arreglo nuevo en cada render).
 */
const NAV_ITEMS: NavbarItem[] = [
  { value: ROUTES.home, label: 'Inicio', icon: <HomeIcon /> },
  { value: ROUTES.history, label: 'Historial', icon: <RouteIcon /> },
  { value: ROUTES.contacts, label: 'Mi red', icon: <PeopleIcon /> },
  { value: ROUTES.settings, label: 'Ajustes', icon: <SettingsIcon /> },
];

/** "/red/123" → "/red" para marcar la sección activa. */
const sectionOf = (pathname: string) => `/${pathname.split('/')[1] ?? ''}`;

export const AppNav = memo(function AppNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleChange = useCallback((path: string) => navigate(path), [navigate]);

  return <Navbar items={NAV_ITEMS} value={sectionOf(pathname)} onChange={handleChange} fixed />;
});
