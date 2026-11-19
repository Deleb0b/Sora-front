import { Card } from '@sora-app/ui';
import { QueryState } from '../../components/feedback';
import { PageHeader } from '../../components/layout';
import { SettingsForm } from './components/SettingsForm';
import { useSettings, useUpdateSettings } from './hooks/useSettings';

/** Ajustes: cómo se envía la alerta SOS. */
export function SettingsPage() {
  const settingsQuery = useSettings();
  // `mutateAsync` es estable; el formulario espera su promesa para manejar los errores.
  const { mutateAsync, isPending } = useUpdateSettings();

  return (
    <>
      <PageHeader title="Ajustes" description="Personaliza cómo se envía tu alerta." />
      <QueryState query={settingsQuery} loadingLabel="Cargando tus ajustes" errorTitle="No pudimos cargar tus ajustes">
        {(settings) => (
          <Card variant="elevated" padding="large">
            <SettingsForm settings={settings} onSubmit={mutateAsync} isPending={isPending} />
          </Card>
        )}
      </QueryState>
    </>
  );
}
