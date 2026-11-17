import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { MAIN_CONTENT_ID } from './SkipLink';
import { useAnnounce } from './LiveAnnouncer';

/**
 * En una SPA el lector de pantalla no se entera de que cambió la página.
 * Al navegar: mueve el foco al <h1> de la nueva vista y anuncia su título.
 * No actúa en la primera carga para no robar el foco inicial.
 */
export function RouteFocus() {
  const { pathname } = useLocation();
  const announce = useAnnounce();
  // Ruta anterior: si no cambió (primera carga o doble efecto de StrictMode) no se mueve el foco.
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    // Esperar a que la nueva vista se pinte.
    const id = requestAnimationFrame(() => {
      const main = document.getElementById(MAIN_CONTENT_ID);
      const heading = main?.querySelector<HTMLElement>('h1');
      const target = heading ?? main;
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: false });
      announce(`Página: ${heading?.textContent ?? document.title}`);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, announce]);

  return null;
}
