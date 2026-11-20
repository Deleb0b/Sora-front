import { motion, useReducedMotion } from 'motion/react';
import { Outlet, useLocation } from 'react-router';
import { MAIN_CONTENT_ID, RouteFocus, SkipLink } from '../../a11y';
import { AppHeader } from './AppHeader';
import { AppNav } from './AppNav';

/** Estructura de landmarks: header · main · nav. Cada vista aporta su único <h1>. */
export function AppLayout() {
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <>
      <SkipLink />
      <AppHeader />
      <main id={MAIN_CONTENT_ID} className="app-main" tabIndex={-1}>
        {/* Transición de entrada entre vistas. Sin animación de salida: la vista nueva aparece
            de inmediato (no bloquea la navegación ni la carga de datos), solo con un fundido corto. */}
        <motion.div
          key={pathname}
          className="page-transition"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
      <AppNav />
      <RouteFocus />
    </>
  );
}
