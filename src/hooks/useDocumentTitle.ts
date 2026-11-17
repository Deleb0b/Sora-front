import { useEffect } from 'react';
import { APP_NAME } from '../config/env';

/** Actualiza el <title> de la pestaña; lo leen los lectores de pantalla al cambiar de vista. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`;
  }, [title]);
}
