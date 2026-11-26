# Sora · Frontend

Frontend de **Sora**, app de emergencia para mujeres: manteniendo presionado un botón SOS se envía una alerta,
con ubicación opcional, a una red de contactos de confianza.

La app consume el Design System del equipo publicado en npm como
[`@sora-app/ui`](https://www.npmjs.com/package/@sora-app/ui) ([repositorio](https://github.com/Deleb0b/sora-ui)).

**Stack:** React 19 · TypeScript · Vite · TanStack Query 5 · React Router · React Hook Form + Zod · Motion ·
vite-plugin-pwa (Workbox).

**Equipo:** Demian · Valdemar · Rodrigo · Alonso. Reparto y flujo de trabajo en [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Cómo ejecutarlo

```bash
npm install
npm run dev        # desarrollo en http://localhost:5173 (sin service worker)
npm run build      # typecheck + build de producción con service worker
npm run preview    # sirve el build en http://localhost:4173 (para probar la PWA)
```

No hace falta backend: si `VITE_API_URL` está vacía, la app usa una **API REST simulada en el navegador**
(`src/mocks`) con latencia, errores aleatorios (503), errores de validación (400/409/422), modo sin conexión y
cancelación con `AbortSignal`. Configuración en [`.env.example`](./.env.example).

Para probar errores y reversiones, en la consola del navegador (modo desarrollo):

```js
soraMock.setFailureRate(1)   // todas las peticiones fallan
soraMock.clearFailureRate()  // vuelve a la tasa configurada
soraMock.reset()             // restablece los datos de demostración
```

---

## Vistas

| Ruta | Vista | Qué hace |
|---|---|---|
| `/` | Inicio | Botón SOS (mantener presionado), resumen de a quién y qué se envía, última alerta |
| `/historial` | Historial | Alertas enviadas, agrupadas por mes, con paginación por cursor |
| `/red` | Mi red | Contactos de emergencia: agregar, editar, marcar como principal y eliminar |
| `/ajustes` | Ajustes | Mensaje de la alerta, compartir ubicación, avisar al 911, tiempo de pulsación |

---

## 1. Integración de la biblioteca `@sora-app/ui`

- Instalada desde npm como dependencia externa; no se copia ningún archivo fuente.
- Componentes usados: `Button`, `Input`, `Select`, `Switch`, `Modal`, `Card`, `Alert`, `Badge`, `Text`, `Spinner`,
  `Navbar`, `SOSButton`, `ContactCard`, `Avatar` (dentro de `ContactCard`) e íconos.
- Los componentes de la app **componen** los de la biblioteca: `ContactItem` envuelve `ContactCard`,
  `AppNav` conecta `Navbar` al router, `Toaster` y `QueryState` usan `Alert`, `Spinner` y `Card`.
- Colores, tipografía, espaciado y radios de la app salen de las variables `--sora-*` que inserta la biblioteca.
- Durante el proyecto se encontraron y corrigieron en la biblioteca dos problemas de accesibilidad (versión 1.0.1):
  contraste del color de acción y nombre accesible del `SOSButton`. Otros detalles de integración (por ejemplo,
  `Switch` siempre controlado) están en [CONTRIBUTING.md](./CONTRIBUTING.md).

### Identidad visual (Manual de Identidad Sora)

- **Logotipo horizontal** en la esquina superior izquierda del encabezado (`src/components/brand/SoraLogo.tsx`),
  construido con la retícula del manual: símbolo de 12x, separación de 3x y «sora» en Nunito ExtraBold a 9.4x;
  ancho mínimo de 100 px.
- **Ícono de la app** = símbolo C del manual (`public/icons`).
- **Color con significado:** Coral Sora solo en el botón SOS; Coral Texto en las acciones principales de formularios y
  en confirmar una eliminación; Violeta Voz en acciones secundarias («Agregar contacto», «Hacer principal»,
  interruptores); Lavanda en «Cancelar»; Malva y Coral en avatares; Verde Refugio en «Estoy a salvo».
- **Alerta enviada:** el panel cambia a la combinación Nocturna (fondo Ciruela, texto Durazno) con «Estoy a salvo» y
  «Llamar al 911», como en la maqueta del manual.

## 2. Estado del servidor con TanStack Query

- `QueryClientProvider` en la raíz (`src/app/providers.tsx`) y DevTools solo en desarrollo (no entran al build).
- `QueryClient` en `src/lib/query/queryClient.ts`: `staleTime` 30 s, reintentos solo para errores de red/5xx,
  `refetchOnWindowFocus: false` (en una app de emergencia la interfaz no debe "saltar" al volver a la pestaña),
  `refetchOnReconnect: true` y estado inicial de conexión real (`onlineManager`).
- Query keys centralizadas y serializables en `src/lib/query/queryKeys.ts` (patrón *key factory*).
- Lecturas con `useQuery`/`useInfiniteQuery`; escrituras con `useMutation`. Los datos del servidor no se copian a
  `useState` ni a contextos.
- `select` para derivar solo lo necesario: lista ordenada y resumen de contactos, configuración del botón SOS,
  páginas aplanadas del historial, última alerta.
- Las vistas pintan sus estados con `QueryState` a partir de `isPending`, `isError`, `isFetching`, `fetchStatus`,
  `error` y `refetch`, sin banderas manuales.

## 3. Paginación

`Historial` usa `useInfiniteQuery` con **cursor** (`src/features/alerts/hooks/useAlertHistory.ts`). El botón
"Cargar más alertas" muestra el progreso ("Mostrando 20 de 35"), anuncia la carga en una región `aria-live` y lleva
el foco a la primera alerta nueva. Si falla una página, las anteriores siguen visibles y se puede reintentar.

## 4. Mutaciones optimistas

| Flujo | Hook | Optimista |
|---|---|---|
| Crear contacto | `useCreateContact` | aparece en la lista antes de la respuesta |
| Editar / marcar principal | `useUpdateContact` | cambia y se reordena al instante |
| Eliminar contacto | `useDeleteContact` | desaparece al instante (con confirmación) |
| Enviar alerta SOS | `useSendAlert` | se agrega al historial (consulta infinita) |
| Guardar ajustes | `useUpdateSettings` | Inicio ve la nueva configuración al instante |

Todos siguen el mismo flujo: `cancelQueries` → snapshot → `setQueryData` en `onMutate`; restaurar el snapshot en
`onError`; datos reales en `onSuccess`; `invalidateQueries` en `onSettled`. Éxitos y errores se anuncian con
`role="status"` / `role="alert"`; los errores ofrecen **Reintentar**; el estado pending se comunica con `aria-busy`
y texto ("Guardando…", "Enviando tu alerta…"), leído del `MutationCache` con `useMutationState`.

## 5. Formularios (React Hook Form + Zod)

- Esquemas en `src/schemas`: **única fuente de verdad** compartida por formularios, servicios (validan respuestas)
  y API simulada (valida peticiones). Tipos con `z.infer`/`z.input`/`z.output`.
- `useForm` con `zodResolver`, `defaultValues` y `mode: 'onTouched'`. `register` para `Input`; `Controller` para
  `Select` y `Switch`.
- Errores del servidor → `setError` por campo o `root.server` (`src/forms/serverErrors.ts`); foco al primer error,
  incluso en componentes sin `ref` (`useFocusFirstError`).
- Campos bloqueados (`fieldset disabled`) y botón en `loading` mientras la mutación está pendiente; `reset` tras guardar.
- `useWatch` sobre un solo campo para el contador de caracteres, en un componente aparte.

## 6. Optimizaciones de rendimiento

| Técnica | Dónde | Por qué |
|---|---|---|
| `React.memo` | `ContactItem`, `AlertItem`, `NetworkSummary`, `AppNav`, `AppHeader` | elementos repetidos o que no cambian al cambiar su padre |
| `useCallback` | handlers de `ContactList`, `ContactFormDialog`, `AppNav`, `SosPanel` | se pasan a componentes memorizados o son dependencias de otros hooks |
| `useMemo` | agrupar alertas por mes; ids pendientes; acciones del Toaster | cálculos sobre listas que crecen; referencias estables de contexto |
| `useRef` | foco tras eliminar y tras "Cargar más", timers de avisos, medición del Toaster (`ResizeObserver`), configuración más reciente del SOS, ruta anterior | DOM y valores mutables que no deben provocar renders |
| `select` | contactos, ajustes, historial | cada componente se suscribe solo a lo que usa |
| Contextos separados | acciones de avisos estables vs. lista de avisos | quien dispara avisos no se vuelve a renderizar |
| Code splitting | vistas con `lazy` en el router | el primer render descarga solo el layout y la vista visitada |

## 7. Animaciones (Motion)

- Contactos: entrada, salida y reordenamiento con `layout` (`AnimatePresence`); al salir el elemento es `inert`.
- Vistas: fundido corto al navegar, sin animación de salida para no bloquear.
- Avisos: entrada y salida de los toasts.
- `MotionConfig reducedMotion="user"` respeta `prefers-reduced-motion`. Solo se animan `transform` y `opacity`,
  así que el indicador de foco no se altera.

## 8. Accesibilidad

Resumen; detalle, resultados y pruebas en [docs/ACCESIBILIDAD.md](./docs/ACCESIBILIDAD.md).

- Landmarks (`header`, `main`, `nav`), un `h1` por vista, enlace "Saltar al contenido", foco y anuncio al cambiar de vista.
- Regiones `aria-live` globales (`role="status"` y `role="alert"`) siempre montadas.
- Botones de solo ícono con `aria-label` e íconos con `aria-hidden`; nombres accesibles que incluyen el texto visible.
- Modales con foco atrapado, cierre con Esc y retorno del foco; confirmación antes de eliminar.
- Áreas táctiles de al menos 44 × 44 px; estados no dependen solo del color.
- **axe-core: 0 violaciones** en todas las vistas. **Lighthouse: 100** en accesibilidad y buenas prácticas.

## 9. PWA

**Instalación.** En Chrome/Edge (Android o escritorio) aparece "Instalar app" en la barra de direcciones o el menú;
en iOS, Safari → Compartir → "Agregar a inicio". Requiere HTTPS (o `localhost`).

**Manifest** (generado por `vite-plugin-pwa`, ver `vite.config.ts`): nombre, `short_name`, íconos 192/512 y
maskable, `start_url`, `display: standalone`, `theme_color`, `background_color`, idioma y accesos directos.

**Estrategia de caché** (Workbox, `generateSW`):

| Recurso | Estrategia |
|---|---|
| App shell: HTML, JS, CSS, íconos | Precaché (disponible sin conexión desde la primera visita) |
| Navegación a cualquier ruta | `navigateFallback` → `index.html` precacheado |
| CSS de Google Fonts | StaleWhileRevalidate |
| Archivos de fuentes | CacheFirst, 1 año, máx. 20 |
| Datos de la API (contactos, alertas, ajustes) | **No se cachean** en el service worker: son datos personales |

**Sin conexión.** La app abre y navega. Las vistas con datos ya cargados los siguen mostrando; las que no, muestran
"Sin conexión" con el enlace para llamar al 911. Una alerta SOS enviada sin conexión queda en espera (mutación
pausada de TanStack Query) y se envía sola al volver la red; la interfaz lo explica.

**Actualizaciones.** `registerType: 'prompt'`: al publicar una versión nueva, el service worker nuevo espera y la app
muestra "Hay una versión nueva de Sora" con el botón **Actualizar**; no se recarga sola para no interrumpir una
alerta. La app busca actualizaciones cada hora y `cleanupOutdatedCaches` borra precachés viejas. En el despliegue,
`sw.js` y el manifest se sirven sin caché HTTP (`vercel.json`) para que siempre se detecte la versión nueva.

**Despliegue.** Cualquier hosting estático con HTTPS. Para Vercel ya está `vercel.json` (reescrituras de la SPA y
cabeceras del service worker): importar el repositorio y desplegar con los valores por defecto de Vite.

## 10. Arquitectura

```
src/
  app/            Punto de entrada: App, providers, router (vistas lazy) y rutas
  config/         Variables de entorno y límites de negocio
  lib/query/      QueryClient y query keys centralizadas
  services/       Capa de API sin React; http.ts normaliza errores en ApiError
  mocks/          API REST simulada en el navegador
  schemas/        Esquemas Zod (formularios, servicios y mock)
  types/          Tipos inferidos de los esquemas
  forms/          Helpers de formularios: errores del servidor, foco al primer error
  a11y/           Enlace de salto, regiones aria-live, foco al cambiar de ruta
  pwa/            Registro y actualización del service worker
  components/     Componentes de la app que componen @sora-app/ui (layout, feedback, íconos)
  features/<x>/   Vista + hooks (useQuery/useMutation) + componentes de cada sección
  hooks/          Hooks genéricos (título del documento, estado de conexión)
  utils/          Funciones puras (formatos, errores)
  styles/         CSS global con los tokens --sora-*
```

## Limitaciones conocidas

- La API es simulada en el navegador (datos en `localStorage`); `VITE_API_URL` permite apuntar a una API real con
  los mismos endpoints.
- El envío real de SMS o llamadas a contactos y autoridades queda fuera del alcance del frontend.
- Ver también las limitaciones de accesibilidad en [docs/ACCESIBILIDAD.md](./docs/ACCESIBILIDAD.md).
