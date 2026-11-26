# Pruebas de accesibilidad

Responsable: Alonso. Este documento registra qué se probó, cómo y con qué resultado.
Las secciones marcadas con ☐ se completan al hacer las pruebas manuales.

## 1. Auditoría automática con axe-core

Herramienta: axe-core 4 (reglas WCAG 2.0/2.1/2.2 A y AA + buenas prácticas), Chrome, viewport 390 × 844.

| Vista / estado | Violaciones iniciales | Después de corregir (app + `@sora-app/ui` 1.0.1) |
|---|---|---|
| Inicio | 2 (contraste, nombre accesible del SOS) | 0 |
| Mi red | 2 (contraste, nombre accesible) | 0 |
| Mi red con el formulario abierto y errores | 2 | 0 |
| Historial | 0 | 0 |
| Ajustes | 0 | 0 |
| Página no encontrada | 1 (contraste) | 0 |
| Inicio con la alerta enviada (panel Ciruela, v1.0.2) | — | 0 |

Correcciones aplicadas:

- **Contraste del color de acción.** Texto blanco sobre `#E4555D` = 3.65:1 (AA pide 4.5:1). Primero se corrigió en la
  app sobrescribiendo variables; después se corrigió en la biblioteca (`@sora-app/ui` 1.0.1) usando "Coral texto"
  `#C23B47` del mismo Design System (5.24:1), y se quitó el parche de la app.
- **Nombre accesible del botón SOS** (WCAG 2.5.3): corregido en `@sora-app/ui` 1.0.1; ahora incluye el texto visible.
- **Badge "Se comparte" sobre la tarjeta lavanda** = 3.75:1. La tarjeta del resumen pasó a fondo blanco.
- **"Hacer principal"** tenía un `aria-label` distinto al texto visible (WCAG 2.5.3). Ahora el nombre accesible es
  el texto visible más un complemento oculto: "Hacer principal a Fer López".

☐ Repetir con la extensión **axe DevTools** en el navegador y anotar el resultado.

## 2. Lighthouse

Build de producción (`npm run build && npm run preview`), Lighthouse 13 en modo móvil, Chrome headless:

| Vista | Rendimiento | Accesibilidad | Buenas prácticas |
|---|---:|---:|---:|
| Inicio | 92 | 100 | 100 |
| Mi red | 91 | 100 | 100 |
| Historial | 89 | 100 | 100 |
| Ajustes | 95 | 100 | 100 |

El rendimiento incluye la latencia artificial de la API simulada (400–1100 ms).

☐ Repetir en Chrome → DevTools → Lighthouse y anotar los resultados.

## 3. Teclado

Verificado con pruebas automatizadas en el navegador (Playwright):

- [x] El primer `Tab` enfoca **"Saltar al contenido"**, que es visible al recibir foco.
- [x] Al cambiar de vista, el foco va al `<h1>` y se anuncia "Página: …".
- [x] Botón SOS: se activa manteniendo **Espacio** o **Enter**; si se suelta antes, se cancela.
- [x] Modal de confirmación: foco inicial en "Cancelar", **Esc** cierra y el foco regresa al botón que lo abrió.
- [x] Tras eliminar un contacto, el foco pasa al título de la lista (el botón ya no existe).
- [x] Formulario inválido: el foco va al primer campo con error, también si el error viene del servidor.
- [x] `Select`: se abre y elige con flechas y Enter.
- [x] "Cargar más alertas": el foco pasa a la primera alerta nueva y se anuncia cuántas se cargaron.
- [x] Interruptores de Ajustes: se activan con **Espacio**.

☐ Recorrer todos los flujos **solo con teclado** en un navegador real y anotar cualquier problema.

## 4. Lector de pantalla

☐ Probar con **NVDA + Firefox/Chrome** (Windows) o **VoiceOver + Safari** (macOS/iOS).

| Prueba | Esperado | Resultado |
|---|---|---|
| Navegar por landmarks | banner, main, navegación "Navegación principal", región "Notificaciones" | ☐ |
| Lista de encabezados | un `h1` por vista; `h2` por sección o mes | ☐ |
| Agregar contacto con error de teléfono repetido | se lee "Ya tienes un contacto con este número." | ☐ |
| Marcar contacto como principal | se lee "Contacto principal actualizado…" | ☐ |
| Eliminar con servidor caído (`soraMock.setFailureRate(1)`) | se lee el error y el botón "Reintentar" | ☐ |
| Enviar alerta SOS | "Enviando tu alerta…" y luego "Alerta enviada…" | ☐ |
| Cargar más alertas | "Se cargaron 10 alertas más. Mostrando 20 de 35." | ☐ |
| Sin conexión (DevTools → Offline) | se lee "Sin conexión" | ☐ |

## 5. Preferencias del usuario

- [x] **Reducir movimiento:** con `prefers-reduced-motion: reduce` no hay desplazamientos (verificado: `transform: none`
  durante el reordenamiento de contactos). Motion usa `MotionConfig reducedMotion="user"`.
- [x] **Áreas táctiles:** botones de acción de al menos 44 × 44 px (`.touch-target`; el botón pequeño de la biblioteca mide 36 px).
- ☐ **Zoom al 200 %** (Ctrl/Cmd + +): todo legible y operable, sin scroll horizontal.
- ☐ **Contraste alto** (`prefers-contrast: more`, en DevTools → Rendering): el foco se vuelve más grueso.
- ☐ **Tamaño de texto del sistema** aumentado en el celular.

## 6. Limitaciones conocidas

- **`Switch` de la biblioteca:** siempre es controlado, por lo que se integra con `Controller` en lugar de `register`.
- **`Input` de la biblioteca:** sobrescribe un `aria-describedby` externo; los textos de ayuda se pasan por `helperText`.
- La API es simulada en el navegador; los tiempos y errores de red son artificiales.
