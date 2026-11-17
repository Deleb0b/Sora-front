import { Text } from '@sora-app/ui';
import type { ReactNode } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Acción a la derecha del título (p. ej. botón "Agregar"). */
  action?: ReactNode;
}

/** Título de cada vista: el único <h1> de la página y el <title> del documento. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  useDocumentTitle(title);
  return (
    <div className="page-header">
      <div>
        <Text variant="h2" as="h1" tabIndex={-1}>
          {title}
        </Text>
        {description && <Text color="secondary">{description}</Text>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </div>
  );
}
