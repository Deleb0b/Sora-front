import { QueryState } from '../../components/feedback';
import { PageHeader } from '../../components/layout';
import { useLatestAlert } from '../alerts/hooks/useAlertHistory';
import { useContactsSummary } from '../contacts/hooks/useContacts';
import { NetworkSummary } from './components/NetworkSummary';
import { SosPanel } from './components/SosPanel';
import { useAlertConfig } from './hooks/useAlertConfig';

/**
 * Inicio: botón SOS y resumen de la red.
 * Lee tres cachés con `select` (ajustes → config, contactos → resumen, historial → última
 * alerta), así cada parte recibe solo lo que necesita y comparte caché con las otras vistas.
 */
export function HomePage() {
  const configQuery = useAlertConfig();
  const summaryQuery = useContactsSummary();
  const { data: latestAlert } = useLatestAlert();

  return (
    <>
      <PageHeader title="Inicio" description="Mantén presionado el botón para pedir ayuda." />

      <QueryState query={configQuery} loadingLabel="Preparando tu botón de emergencia" errorTitle="No pudimos cargar tus ajustes">
        {(config) => (
          <QueryState query={summaryQuery} loadingLabel="Cargando tu red" errorTitle="No pudimos cargar tu red">
            {(summary) => (
              <>
                <SosPanel config={config} contactsCount={summary.total} />
                <NetworkSummary summary={summary} config={config} latestAlert={latestAlert} />
              </>
            )}
          </QueryState>
        )}
      </QueryState>
    </>
  );
}
