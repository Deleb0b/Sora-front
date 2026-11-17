/**
 * Mueve el foco al primer campo marcado como inválido dentro de un contenedor.
 * Útil para componentes de la biblioteca que no exponen `ref` (p. ej. Select),
 * donde `shouldFocusError` de React Hook Form no puede enfocar por sí solo.
 */
export function focusFirstInvalid(container: HTMLElement | null) {
  const el = container?.querySelector<HTMLElement>('[aria-invalid="true"]');
  el?.focus();
  return Boolean(el);
}
