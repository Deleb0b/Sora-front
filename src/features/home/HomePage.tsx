import { EmptyState } from '../../components/feedback';
import { PageHeader } from '../../components/layout';

/**
 * Inicio — PARTE 4 (Alonso).
 * Pendiente:
 * - SOSButton de @sora-app/ui conectado a `useSendAlert` (useMutation → alertsService.send).
 * - Leer los ajustes (holdDuration, alertMessage, shareLocation) con useQuery + `select`.
 * - Resumen de la red: contacto principal y número de contactos (useQuery + `select`).
 * - Feedback con useToast y anuncio aria-live al enviar la alerta.
 */
export function HomePage() {
  return (
    <>
      <PageHeader title="Inicio" description="Mantén presionado el botón para pedir ayuda." />
      <EmptyState title="Próximamente" description="Aquí irá el botón SOS." />
    </>
  );
}
