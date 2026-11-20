import { useCallback, useRef } from 'react';
import { focusFirstInvalid } from '../a11y';

/**
 * Foco al primer campo con error al enviar un formulario inválido.
 *
 * `shouldFocusError` de React Hook Form solo enfoca campos con `ref`; el `Select` de la
 * biblioteca no expone `ref` (se conecta con Controller). Por eso desactivamos esa opción
 * y buscamos en el DOM, en orden visual, el primer elemento con aria-invalid="true".
 *
 * Devuelve el ref para el <form> y el handler para `handleSubmit(onValid, onInvalid)`.
 */
export function useFocusFirstError<T extends HTMLElement = HTMLFormElement>() {
  const formRef = useRef<T>(null);

  const onInvalid = useCallback(() => {
    // Esperar a que React pinte aria-invalid en los campos.
    requestAnimationFrame(() => focusFirstInvalid(formRef.current));
  }, []);

  return { formRef, onInvalid, focusFirstError: onInvalid };
}
