import { EmptyState } from '../../components/feedback';
import { PageHeader } from '../../components/layout';

/**
 * Ajustes — PARTE 3 (Rodrigo).
 * Pendiente:
 * - Formulario con React Hook Form + zodResolver(settingsSchema).
 * - Switch con register; Select con Controller (no expone ref).
 * - Envío con useMutation (settingsService.update), setError con errores del servidor,
 *   reset con los datos guardados y foco al primer error.
 */
export function SettingsPage() {
  return (
    <>
      <PageHeader title="Ajustes" description="Personaliza cómo se envía tu alerta." />
      <EmptyState title="Próximamente" description="Aquí irán los ajustes de la alerta." />
    </>
  );
}
