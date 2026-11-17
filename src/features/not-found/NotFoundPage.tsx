import { Button } from '@sora-app/ui';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../app/routes';
import { EmptyState } from '../../components/feedback';
import { PageHeader } from '../../components/layout';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="Página no encontrada" />
      <EmptyState
        title="Esta página no existe"
        description="Puede que el enlace esté mal escrito."
        action={<Button onClick={() => navigate(ROUTES.home)}>Volver a Inicio</Button>}
      />
    </>
  );
}
