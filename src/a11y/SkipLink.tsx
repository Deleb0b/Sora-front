export const MAIN_CONTENT_ID = 'contenido';

/** Enlace para saltar la navegación. Oculto hasta recibir foco con Tab. */
export function SkipLink() {
  return (
    <a className="skip-link" href={`#${MAIN_CONTENT_ID}`}>
      Saltar al contenido
    </a>
  );
}
