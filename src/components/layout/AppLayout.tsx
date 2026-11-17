import { Outlet } from 'react-router';
import { MAIN_CONTENT_ID, RouteFocus, SkipLink } from '../../a11y';
import { AppHeader } from './AppHeader';
import { AppNav } from './AppNav';

/** Estructura de landmarks: header · main · nav. Cada vista aporta su único <h1>. */
export function AppLayout() {
  return (
    <>
      <SkipLink />
      <AppHeader />
      <main id={MAIN_CONTENT_ID} className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
      <AppNav />
      <RouteFocus />
    </>
  );
}
