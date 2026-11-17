import { Badge, Text } from '@sora-app/ui';
import { memo } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../app/routes';
import { APP_NAME } from '../../config/env';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/** Encabezado global. El <h1> lo pone cada vista; aquí la marca es un enlace a Inicio. */
export const AppHeader = memo(function AppHeader() {
  const online = useOnlineStatus();

  return (
    <header className="app-header">
      <Link to={ROUTES.home} className="app-header__brand" aria-label={`${APP_NAME}, ir a Inicio`}>
        <Text as="span" variant="h3">
          {APP_NAME}
        </Text>
      </Link>
      {!online && (
        // role="status": se anuncia cuando se pierde la conexión.
        <span role="status">
          <Badge variant="warning" dot>
            Sin conexión
          </Badge>
        </span>
      )}
    </header>
  );
});
