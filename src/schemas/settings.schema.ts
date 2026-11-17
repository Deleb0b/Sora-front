import { z } from 'zod';

/** Esquema de los ajustes de la alerta SOS. */

export const HOLD_DURATIONS = ['2000', '3000', '5000'] as const;

export const holdDurationLabels: Record<(typeof HOLD_DURATIONS)[number], string> = {
  '2000': '2 segundos',
  '3000': '3 segundos (recomendado)',
  '5000': '5 segundos',
};

export const settingsSchema = z.object({
  alertMessage: z
    .string()
    .trim()
    .min(10, 'El mensaje debe tener al menos 10 caracteres.')
    .max(160, 'El mensaje no puede pasar de 160 caracteres (límite de un SMS).'),
  shareLocation: z.boolean(),
  notifyAuthorities: z.boolean(),
  holdDuration: z.enum(HOLD_DURATIONS, { error: 'Elige cuánto tiempo mantener presionado.' }),
});

export type Settings = z.infer<typeof settingsSchema>;
export type SettingsFormValues = z.input<typeof settingsSchema>;
