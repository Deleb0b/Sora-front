import { Badge } from '@sora-app/ui';
import { memo } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../app/routes';
import { APP_NAME } from '../../config/env';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { SoraLogo } from '../brand/SoraLogo';

/**
 * Encabezado global. Lleva el logotipo horizontal en la esquina superior izquierda, como en la
 * interfaz del Manual de Identidad (la palabra «sora» nunca se reescribe como texto).
 * El <h1> lo pone cada vista; aquí la marca es un enlace a Inicio.
 */
export const AppHeader = memo(function AppHeader() {
  const online = useOnlineStatus();

  return (
    <header className="app-header">
      <Link to={ROUTES.home} className="app-header__brand" aria-label={`${APP_NAME}, ir a Inicio`}>
        <SoraLogo width={112} />
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
