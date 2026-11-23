import { Alert } from '@sora-app/ui';

/**
 * Aviso para vistas que no tienen datos guardados y no hay conexión.
 * Siempre ofrece la salida de emergencia: llamar al 911 no necesita internet.
 */
export function OfflineNotice() {
  return (
    <Alert
      type="warning"
      title="Sin conexión"
      message={
        <>
          Mostraremos esta información en cuanto vuelvas a tener internet. Si estás en peligro, llama al{' '}
          <a href="tel:911">911</a>.
        </>
      }
    />
  );
}
