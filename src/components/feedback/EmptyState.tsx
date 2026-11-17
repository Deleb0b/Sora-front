import { Card, Text } from '@sora-app/ui';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Ícono decorativo (se oculta a lectores de pantalla). */
  icon?: ReactNode;
  /** Acción principal, p. ej. un Button "Agregar contacto". */
  action?: ReactNode;
  /** Nivel del título para respetar la jerarquía de la vista. */
  headingLevel?: 'h2' | 'h3';
}

/** Estado vacío compuesto con Card y Text de la biblioteca. */
export function EmptyState({ title, description, icon, action, headingLevel = 'h2' }: EmptyStateProps) {
  return (
    <Card variant="filled" padding="large" className="empty-state">
      {icon && (
        <span className="empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <Text variant="h3" as={headingLevel}>
        {title}
      </Text>
      {description && <Text color="secondary">{description}</Text>}
      {action && <div className="empty-state__action">{action}</div>}
    </Card>
  );
}
