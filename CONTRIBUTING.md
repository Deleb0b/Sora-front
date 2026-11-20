# Cómo trabajamos en Sora-front

## Reparto

| Parte | Responsable | Rama | Qué incluye |
|---|---|---|---|
| 1. Base del proyecto | Demian | `feat/base` | Vite + TS, `@sora-app/ui`, estructura, QueryClient y query keys, servicios + API simulada, router, layout accesible, avisos (`useToast`, `useAnnounce`), `QueryState` |
| 2. Mi red (contactos) | Valdemar | `feat/contactos` | `useContacts` con `select`, mutaciones optimistas (crear, marcar principal, eliminar), lista con `ContactCard` + `React.memo`, confirmación accesible |
| 3. Formularios + animaciones | Rodrigo | `feat/formularios` | Formulario de contacto y de ajustes con RHF + Zod, `Controller` para `Select`, `setError`, foco al primer error; animaciones con Motion |
| 4. Inicio + historial | Alonso | `feat/historial` | `SOSButton` + `useSendAlert`, historial con `useInfiniteQuery`, `useRef` para foco/scroll; pruebas de accesibilidad (teclado, lector, axe, Lighthouse) |
| 5. PWA + README final | Demian | `feat/pwa` | `vite-plugin-pwa`, manifest, íconos, página offline, documentación de caché y actualización |

Las partes 2, 3 y 4 se pueden hacer en paralelo en cuanto la parte 1 esté en `main`.
El formulario de contacto (Rodrigo) se usa dentro de la vista Mi red (Valdemar): Rodrigo exporta
`ContactForm` con props `onSubmit`/`defaultValues` y Valdemar lo conecta a su mutación.

## Flujo de Git

```bash
git checkout main && git pull
git checkout -b feat/mi-parte
# ...trabajar, commits pequeños...
git push -u origin feat/mi-parte
```

Luego abre un Pull Request hacia `main`. **Otra persona del equipo lo revisa y lo aprueba** antes de hacer merge.

Commits en español con prefijo: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `chore:`.

## Dónde va cada cosa

```
src/
  app/            Punto de entrada: App, providers, router y rutas
  config/         Variables de entorno y límites de negocio
  lib/query/      QueryClient y query keys centralizadas
  services/       Capa de API (sin React). http.ts normaliza errores en ApiError
  mocks/          API simulada (latencia, errores, sin conexión)
  schemas/        Esquemas Zod: única fuente de verdad (formularios, servicios y mock)
  types/          Tipos inferidos de los esquemas
  a11y/           Enlace de salto, regiones aria-live, foco al cambiar de ruta
  components/     Componentes de la app que COMPONEN @sora-app/ui (layout, feedback)
  features/<x>/   Vista + hooks + componentes de cada sección
  hooks/          Hooks genéricos
  utils/          Funciones puras (formatos, errores)
  styles/         CSS global (usa los tokens --sora-*)
```

Dentro de cada feature: `XPage.tsx`, `hooks/` (useQuery/useMutation), `components/`.

## Reglas rápidas

- Componentes visuales **solo** desde `@sora-app/ui`; no copiar ni reimplementar.
- Datos del servidor **solo** en TanStack Query (nada de copiarlos a `useState`).
- Query keys **solo** desde `src/lib/query/queryKeys.ts`.
- Validación **solo** con los esquemas de `src/schemas`.
- Formularios: `register` para `Input`; `Controller` para `Select` (no expone `ref`) y para `Switch`/`Checkbox` (la biblioteca siempre les pasa `checked`, así que `register` no fija su valor). Helpers en `src/forms`.
- Botones de solo ícono: `aria-label` en el botón y `aria-hidden="true"` en el ícono.
- Avisos: `useToast()` para mensajes visibles, `useAnnounce()` para anuncios solo de lector de pantalla.

## Probar errores y rollbacks

En desarrollo, desde la consola del navegador:

```js
soraMock.setFailureRate(1)   // todas las peticiones fallan (503)
soraMock.clearFailureRate()  // vuelve a la tasa de .env
soraMock.reset()             // restablece los datos de demostración
```

Para probar sin conexión: DevTools → Network → Offline.
