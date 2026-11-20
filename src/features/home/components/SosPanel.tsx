import { Button, SOSButton, Spinner, Text } from '@sora-app/ui';
import { useCallback, useEffect, useRef } from 'react';
import { useSendAlert } from '../../alerts/hooks/useSendAlert';
import type { AlertConfig } from '../hooks/useAlertConfig';

interface SosPanelProps {
  config: AlertConfig;
  contactsCount: number;
}

/**
 * Botón SOS conectado a `useSendAlert`.
 *
 * El SOSButton de la biblioteca captura `onTrigger` al empezar a presionar y lo llama al
 * terminar la cuenta (3 s después). Para que en ese momento use los datos más recientes
 * (por si se refrescaron los ajustes o la red mientras se mantenía presionado), se guardan
 * en un ref: es un valor mutable que no debe provocar renders. Así `handleTrigger` es estable.
 */
export function SosPanel({ config, contactsCount }: SosPanelProps) {
  const { mutate, reset, isPending, isSuccess, isError } = useSendAlert();

  const latest = useRef({ config, contactsCount });
  useEffect(() => {
    latest.current = { config, contactsCount };
  }, [config, contactsCount]);

  const handleTrigger = useCallback(() => {
    const { config: c, contactsCount: n } = latest.current;
    mutate({ message: c.message, shareLocation: c.shareLocation, contactsCount: n });
  }, [mutate]);

  const seconds = Math.round(config.holdDuration / 1000);
  const noContacts = contactsCount === 0;

  return (
    <section className="sos-panel" aria-labelledby="sos-title" aria-busy={isPending || undefined}>
      <h2 id="sos-title" className="sr-only">
        Botón de emergencia
      </h2>

      <SOSButton
        onTrigger={handleTrigger}
        holdDuration={config.holdDuration}
        // Controlado por la mutación: si falla, el botón vuelve a su estado inicial para reintentar.
        sent={isPending || isSuccess}
        disabled={noContacts}
        hint={`Mantén ${seconds} s`}
        size={220}
      />

      {/* Estado textual (no solo visual) de la alerta. */}
      <div className="sos-panel__status">
        {isPending && (
          <p className="sos-panel__line">
            <Spinner size={16} label="Enviando alerta" /> Enviando tu alerta…
          </p>
        )}
        {isSuccess && (
          <>
            <Text color="success" variant="bodyBold">
              Tu red ya fue avisada.
            </Text>
            <Button variant="secondary" size="small" className="touch-target" onClick={reset}>
              Ya estoy bien
            </Button>
          </>
        )}
        {isError && <Text color="error">No se envió. Puedes volver a intentarlo.</Text>}
        {!isPending && !isSuccess && !isError && (
          <Text color="secondary" variant="note">
            {noContacts
              ? 'Agrega al menos un contacto en Mi red para poder enviar alertas.'
              : `Mantén presionado ${seconds} segundos con el dedo, el ratón o las teclas Espacio o Enter.`}
          </Text>
        )}
      </div>
    </section>
  );
}
