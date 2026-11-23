import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const THEME_COLOR = '#C23B47';
const BACKGROUND_COLOR = '#FFF3EC';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      /**
       * 'prompt': cuando hay una versión nueva, el service worker espera y la app le pregunta
       * a la usuaria si quiere actualizar (ver src/pwa/PwaUpdater.tsx). No se recarga sola
       * para no interrumpir, por ejemplo, el envío de una alerta.
       */
      registerType: 'prompt',
      // El registro lo hace la app con useRegisterSW (virtual:pwa-register/react).
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Sora · Alerta de emergencia',
        short_name: 'Sora',
        description: 'Envía una alerta de emergencia a tu red de confianza con un solo gesto.',
        lang: 'es-MX',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        categories: ['lifestyle', 'utilities'],
        icons: [
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Botón SOS', short_name: 'SOS', url: '/', icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Mi red', url: '/red', icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        /**
         * Estrategia de caché:
         * - App shell (HTML, JS, CSS, íconos): precaché. Funciona sin conexión desde la 1.ª visita.
         * - Navegación: cualquier ruta (/red, /historial…) responde con index.html precacheado.
         * - Fuentes de Google: CSS con StaleWhileRevalidate y archivos de fuente con CacheFirst (1 año).
         * - Datos de la API: NO se cachean en el service worker (contactos y alertas son datos
         *   personales). Su caché vive solo en memoria, en TanStack Query.
         */
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // En desarrollo no hay service worker: evita servir versiones viejas mientras se programa.
      devOptions: { enabled: false },
    }),
  ],
});
