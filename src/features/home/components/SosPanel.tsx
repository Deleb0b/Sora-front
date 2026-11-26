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
 *
 * Al enviarse la alerta, el panel cambia a la combinación «Nocturna» del Manual de Identidad
 * (fondo Ciruela, texto Durazno), con «Estoy a salvo» en Verde Refugio y «Llamar al 911».
 */
export function SosPanel({ config, contactsCount }: SosPanelProps) {
  const { mutate, reset, data, isPending, isPaused, isSuccess, isError } = useSendAlert();

  const latest = useRef({ config, contactsCount });
  // Al pulsar «Estoy a salvo» el botón desaparece: el foco vuelve al SOS para no perderse en <body>.
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    latest.current = { config, contactsCount };
  }, [config, contactsCount]);

  const handleTrigger = useCallback(() => {
    const { config: c, contactsCount: n } = latest.current;
    mutate({ message: c.message, shareLocation: c.shareLocation, contactsCount: n });
  }, [mutate]);

  const handleSafe = useCallback(() => {
    reset();
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('.sora-sos')?.focus());
  }, [reset]);

  const seconds = Math.round(config.holdDuration / 1000);
  const noContacts = contactsCount === 0;

  return (
    <section
      ref={panelRef}
      className="sos-panel"
      aria-labelledby="sos-title"
      aria-busy={isPending || undefined}
      data-sent={isSuccess || undefined}
    >
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
        {isPending && isPaused && (
          // TanStack Query pausa la mutación sin conexión y la reintenta sola al volver la red.
          <Text variant="bodyBold">
            Sin conexión: tu alerta se enviará en cuanto vuelva la señal. Si es urgente, llama al{' '}
            <a href="tel:911">911</a>.
          </Text>
        )}
        {isPending && !isPaused && (
          <p className="sos-panel__line">
            <Spinner size={16} label="Enviando alerta" /> Enviando tu alerta…
          </p>
        )}
        {isSuccess && (
          <>
            <p className="sos-panel__sent-title">Tu red ya fue avisada</p>
            <p className="sos-panel__sent-text">
              {data && describeSent(data.contactsNotified, Boolean(data.location))}
            </p>
            <div className="sos-panel__sent-actions">
              {/* Verde Refugio (paleta funcional): «Estoy a salvo». Solo cierra este aviso en la app. */}
              <Button variant="secondary" className="sos-panel__safe" onClick={handleSafe}>
                Estoy a salvo
              </Button>
              {/* Es navegación (abre el marcador), por eso es un enlace y no un botón. */}
              <a className="sos-panel__call" href="tel:911">
                Llamar al 911
              </a>
            </div>
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

function describeSent(contacts: number, withLocation: boolean) {
  const people = contacts === 1 ? '1 contacto' : `${contacts} contactos`;
  return withLocation ? `Avisamos a ${people} y compartimos tu ubicación.` : `Avisamos a ${people}.`;
}
