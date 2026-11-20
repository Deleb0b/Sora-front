import { Badge, Card, type BadgeVariant } from '@sora-app/ui';
import { memo } from 'react';
import { alertStatusLabels } from '../../../schemas/alert.schema';
import type { AlertStatus, SosAlert } from '../../../types';
import { formatDateTime } from '../../../utils/format';

const STATUS_VARIANT: Record<AlertStatus, BadgeVariant> = {
  enviada: 'warning',
  resuelta: 'success',
  cancelada: 'neutral',
};

const mapsUrl = ({ lat, lng }: { lat: number; lng: number }) => `https://www.google.com/maps?q=${lat},${lng}`;

interface AlertItemProps {
  alert: SosAlert;
  /** Posición en la lista completa; sirve para mover el foco a la primera alerta nueva. */
  index: number;
}

/**
 * Una alerta del historial. React.memo: al cargar otra página, las alertas ya pintadas
 * conservan su referencia (structural sharing) y no se vuelven a renderizar.
 */
export const AlertItem = memo(function AlertItem({ alert, index }: AlertItemProps) {
  const pending = alert.id.startsWith('temp-');
  const people = alert.contactsNotified === 1 ? '1 contacto' : `${alert.contactsNotified} contactos`;

  return (
    // tabIndex -1: el elemento puede recibir foco por código (tras "Cargar más") sin entrar al orden de Tab.
    <li className="alert-item" data-index={index} tabIndex={-1} aria-busy={pending || undefined}>
      <Card variant="elevated" padding="medium">
        <article className="alert-item__body" aria-label={`Alerta del ${formatDateTime(alert.createdAt)}`}>
          <div className="alert-item__header">
            <time dateTime={alert.createdAt} className="alert-item__date">
              {formatDateTime(alert.createdAt)}
            </time>
            <Badge variant={STATUS_VARIANT[alert.status]} dot>
              {pending ? 'Enviando…' : alertStatusLabels[alert.status]}
            </Badge>
          </div>
          <p className="alert-item__message">“{alert.message}”</p>
          <p className="alert-item__meta">
            Se avisó a {people}.{' '}
            {alert.location ? (
              <a href={mapsUrl(alert.location)} target="_blank" rel="noreferrer">
                Ver ubicación en el mapa<span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            ) : (
              'Sin ubicación.'
            )}
          </p>
        </article>
      </Card>
    </li>
  );
});
