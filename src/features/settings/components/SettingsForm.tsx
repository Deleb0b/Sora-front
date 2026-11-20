import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, Switch, type SelectOption } from '@sora-app/ui';
import { Controller, useForm, useWatch, type Control, type UseFormRegister } from 'react-hook-form';
import { applyServerErrors, FormError, useFocusFirstError } from '../../../forms';
import {
  HOLD_DURATIONS,
  holdDurationLabels,
  settingsSchema,
  type Settings,
  type SettingsFormValues,
} from '../../../schemas/settings.schema';

type HoldDuration = (typeof HOLD_DURATIONS)[number];

const HOLD_OPTIONS: SelectOption<HoldDuration>[] = HOLD_DURATIONS.map((value) => ({
  value,
  label: holdDurationLabels[value],
}));

const FIELDS = ['alertMessage', 'shareLocation', 'notifyAuthorities', 'holdDuration'] as const;
const MESSAGE_MAX = 160;

interface SettingsFormProps {
  settings: Settings;
  onSubmit: (settings: Settings) => Promise<unknown>;
  isPending: boolean;
}

type FormControl = Control<SettingsFormValues, unknown, Settings>;

/**
 * Campo del mensaje con contador de caracteres.
 * `useWatch` sobre UN solo campo y dentro de este componente: al escribir solo se vuelve a
 * renderizar este campo, no todo el formulario (lo que pasaría con `watch()` en el padre).
 *
 * El contador va en `helperText` para que el Input de la biblioteca lo enlace con
 * aria-describedby; si hay error, el Input muestra el error en su lugar (también enlazado).
 * No pasamos nuestro propio aria-describedby porque el Input lo sobrescribiría.
 */
function MessageField({
  control,
  register,
  error,
}: {
  control: FormControl;
  register: UseFormRegister<SettingsFormValues>;
  error?: string;
}) {
  const message = useWatch({ control, name: 'alertMessage' }) ?? '';
  const remaining = MESSAGE_MAX - message.length;
  const counter = remaining >= 0 ? `Te quedan ${remaining} caracteres.` : `Te pasaste por ${-remaining} caracteres.`;

  return (
    <Input
      label="Mensaje que recibirá tu red"
      required
      helperText={counter}
      error={error}
      {...register('alertMessage')}
    />
  );
}

/**
 * Formulario de ajustes de la alerta.
 * - Zod (`settingsSchema`) es la única fuente de validación.
 * - Input (expone ref y es no controlado) → `register`.
 * - Switch → `Controller`: aunque expone ref, la biblioteca siempre le pasa `checked` desde su
 *   estado interno, así que `register` no puede fijar su valor inicial ni el reset.
 * - Select → `Controller`: no expone ref.
 * - Tras guardar, `reset(saved)` deja el formulario "limpio" con los datos confirmados.
 */
export function SettingsForm({ settings, onSubmit, isPending }: SettingsFormProps) {
  const { formRef, onInvalid, focusFirstError } = useFocusFirstError();

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues, unknown, Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
    mode: 'onTouched',
    shouldFocusError: false,
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      reset(values);
    } catch (error) {
      applyServerErrors(error, setError, FIELDS);
      focusFirstError();
    }
  }, onInvalid);

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-busy={isPending || undefined} className="form">
      <p className="form__required-note">Los campos marcados con * son obligatorios.</p>
      <fieldset className="form__fieldset" disabled={isPending}>
        <legend className="form__legend">Mensaje de alerta</legend>
        <MessageField control={control} register={register} error={errors.alertMessage?.message} />
      </fieldset>

      <fieldset className="form__fieldset" disabled={isPending}>
        <legend className="form__legend">Qué se comparte</legend>
        <Controller
          control={control}
          name="shareLocation"
          render={({ field }) => (
            <Switch
              ref={field.ref}
              name={field.name}
              label="Compartir mi ubicación en tiempo real"
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="notifyAuthorities"
          render={({ field }) => (
            <Switch
              ref={field.ref}
              name={field.name}
              label="Avisar también a las autoridades (911)"
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </fieldset>

      <fieldset className="form__fieldset" disabled={isPending}>
        <legend className="form__legend">Botón SOS</legend>
        <Controller
          control={control}
          name="holdDuration"
          render={({ field, fieldState }) => (
            <Select<HoldDuration>
              label="Tiempo para mantener presionado"
              helperText="Evita enviar alertas por accidente."
              name={field.name}
              options={HOLD_OPTIONS}
              value={field.value}
              onChange={(value) => field.onChange(value)}
              onOpenChange={(open) => !open && field.onBlur()}
              error={fieldState.error?.message}
            />
          )}
        />
      </fieldset>

      <FormError message={errors.root?.server?.message} />

      <div className="form__actions">
        <Button type="button" variant="secondary" onClick={() => reset()} disabled={!isDirty || isPending}>
          Descartar cambios
        </Button>
        <Button type="submit" loading={isPending} disabled={!isDirty}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
