import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, PhoneIcon, Select, type SelectOption } from '@sora-app/ui';
import { Controller, useForm } from 'react-hook-form';
import { applyServerErrors, FormError, useFocusFirstError } from '../../../forms';
import {
  contactInputSchema,
  RELATIONS,
  relationLabels,
  type ContactFormValues,
  type ContactInput,
  type Relation,
} from '../../../schemas/contact.schema';

/** Opciones fuera del componente: referencia estable para el Select. */
const RELATION_OPTIONS: SelectOption<Relation>[] = RELATIONS.map((value) => ({ value, label: relationLabels[value] }));

const FIELDS = ['name', 'phone', 'relation'] as const;

const EMPTY: ContactFormValues = { name: '', phone: '', relation: undefined as unknown as Relation };

interface ContactFormProps {
  /** Valores iniciales (al editar). */
  defaultValues?: Partial<ContactFormValues>;
  /** Debe devolver la promesa de la mutación (mutateAsync) para manejar sus errores. */
  onSubmit: (input: ContactInput) => Promise<unknown>;
  onCancel: () => void;
  /** Estado pending de la mutación (viene de TanStack Query, no de una bandera local). */
  isPending: boolean;
  submitLabel?: string;
}

/**
 * Formulario de contacto de emergencia.
 * - Validación: solo con `contactInputSchema` (Zod) vía zodResolver; sin reglas en el JSX.
 * - Input de la biblioteca expone ref → `register`. Select no la expone → `Controller`.
 * - El Input/Select de la biblioteca ya enlazan el error con aria-invalid + aria-describedby
 *   y lo anuncian con role="alert".
 */
export function ContactForm({ defaultValues, onSubmit, onCancel, isPending, submitLabel = 'Guardar contacto' }: ContactFormProps) {
  const { formRef, onInvalid, focusFirstError } = useFocusFirstError();

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues, unknown, ContactInput>({
    resolver: zodResolver(contactInputSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
    // Valida al salir del campo y, después del primer error, en cada cambio.
    mode: 'onTouched',
    shouldFocusError: false,
  });

  const submit = handleSubmit(async (input) => {
    try {
      await onSubmit(input);
      reset(input);
    } catch (error) {
      applyServerErrors(error, setError, FIELDS);
      focusFirstError();
    }
  }, onInvalid);

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-busy={isPending || undefined} className="form">
      <p className="form__required-note">Todos los campos son obligatorios.</p>

      {/* fieldset deshabilitado mientras se guarda: bloquea todos los campos de una vez. */}
      <fieldset className="form__fieldset" disabled={isPending}>
        <legend className="sr-only">Datos del contacto</legend>

        <Input
          label="Nombre"
          autoComplete="name"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Teléfono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          icon={<PhoneIcon size={20} />}
          helperText="10 dígitos, por ejemplo 443 123 4567."
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Controller
          control={control}
          name="relation"
          render={({ field, fieldState }) => (
            <Select<Relation>
              label="Relación"
              placeholder="Elige una opción"
              required
              name={field.name}
              options={RELATION_OPTIONS}
              value={field.value ?? null}
              onChange={(value) => field.onChange(value)}
              onOpenChange={(open) => !open && field.onBlur()}
              error={fieldState.error?.message}
            />
          )}
        />
      </fieldset>

      <FormError message={errors.root?.server?.message} />

      <div className="form__actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" loading={isPending}>
          {isPending ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
