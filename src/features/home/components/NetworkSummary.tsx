import { Badge, Card, Text } from '@sora-app/ui';
import { memo } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../../app/routes';
import type { SosAlert } from '../../../types';
import { formatDateTime, formatRelative } from '../../../utils/format';
import type { ContactsSummary } from '../../contacts/hooks/useContacts';
import type { AlertConfig } from '../hooks/useAlertConfig';

interface NetworkSummaryProps {
  summary: ContactsSummary;
  config: AlertConfig;
  latestAlert: SosAlert | null | undefined;
}

/**
 * Resumen de a quién y qué se enviará. React.memo: Inicio se vuelve a renderizar durante
 * el envío de la alerta (pending/success) y este resumen no necesita repintarse.
 */
export const NetworkSummary = memo(function NetworkSummary({ summary, config, latestAlert }: NetworkSummaryProps) {
  return (
    <Card variant="elevated" padding="medium" className="network-summary">
      <h2 className="network-summary__title">Así se enviará tu alerta</h2>
      <dl className="network-summary__list">
        <div>
          <dt>Contactos</dt>
          <dd>
            {summary.total === 0
              ? 'Ninguno todavía'
              : `${summary.total} ${summary.total === 1 ? 'persona' : 'personas'} (${summary.available} disponibles)`}
          </dd>
        </div>
        {summary.primary && (
          <div>
            <dt>Principal</dt>
            <dd>{summary.primary.name}</dd>
          </div>
        )}
        <div>
          <dt>Ubicación</dt>
          <dd>
            <Badge variant={config.shareLocation ? 'success' : 'neutral'}>
              {config.shareLocation ? 'Se comparte' : 'No se comparte'}
            </Badge>
          </dd>
        </div>
        {config.notifyAuthorities && (
          <div>
            <dt>Autoridades</dt>
            <dd>También se avisa al 911</dd>
          </div>
        )}
        {latestAlert && (
          <div>
            <dt>Última alerta</dt>
            <dd>
              <time dateTime={latestAlert.createdAt} title={formatDateTime(latestAlert.createdAt)}>
                {formatRelative(latestAlert.createdAt)}
              </time>
            </dd>
          </div>
        )}
      </dl>
      <p className="network-summary__links">
        <Link to={ROUTES.contacts}>Administrar mi red</Link>
        <Link to={ROUTES.settings}>Cambiar ajustes</Link>
      </p>
      <Text variant="note" color="secondary">
        Si estás en peligro inmediato, llama al <a href="tel:911">911</a>.
      </Text>
    </Card>
  );
});
