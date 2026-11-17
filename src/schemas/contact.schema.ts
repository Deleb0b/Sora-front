import { z } from 'zod';

/**
 * Esquemas de contactos de emergencia.
 * Son la única fuente de verdad: los usan los formularios (zodResolver),
 * la capa de servicios (validar respuestas) y la API simulada (validar peticiones).
 */

export const RELATIONS = ['familia', 'pareja', 'amistad', 'trabajo', 'otro'] as const;

export const relationLabels: Record<(typeof RELATIONS)[number], string> = {
  familia: 'Familia',
  pareja: 'Pareja',
  amistad: 'Amistad',
  trabajo: 'Trabajo',
  otro: 'Otro',
};

/** Teléfono de México: 10 dígitos; se aceptan espacios, guiones y el prefijo +52. */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Escribe el número de teléfono.')
  .transform((v) => v.replace(/[\s()-]/g, '').replace(/^\+?52/, ''))
  .pipe(z.string().regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos.'));

/** Datos que captura la usuaria al crear o editar un contacto. */
export const contactInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 letras.')
    .max(40, 'El nombre no puede pasar de 40 caracteres.'),
  phone: phoneSchema,
  relation: z.enum(RELATIONS, { error: 'Elige la relación con este contacto.' }),
});

/** Contacto tal como lo devuelve el servidor. */
export const contactSchema = contactInputSchema.extend({
  id: z.string(),
  isPrimary: z.boolean(),
  available: z.boolean(),
  createdAt: z.iso.datetime(),
});

export const contactListSchema = z.array(contactSchema);

/** Cambios parciales (p. ej. marcar como contacto principal). */
export const contactPatchSchema = contactInputSchema.partial().extend({
  isPrimary: z.boolean().optional(),
});

/** Valores del formulario (antes de transformar) y datos ya validados. */
export type ContactFormValues = z.input<typeof contactInputSchema>;
export type ContactInput = z.output<typeof contactInputSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type ContactPatch = z.infer<typeof contactPatchSchema>;
export type Relation = (typeof RELATIONS)[number];
