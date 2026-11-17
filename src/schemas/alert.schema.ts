import { z } from 'zod';

/** Esquemas de las alertas SOS y su historial paginado. */

export const ALERT_STATUSES = ['enviada', 'cancelada', 'resuelta'] as const;

export const alertStatusLabels: Record<(typeof ALERT_STATUSES)[number], string> = {
  enviada: 'Enviada',
  cancelada: 'Cancelada',
  resuelta: 'Resuelta',
};

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/** Datos con los que se dispara una alerta. */
export const sendAlertInputSchema = z.object({
  message: z.string().trim().min(1).max(160),
  location: locationSchema.nullable(),
});

export const alertSchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  status: z.enum(ALERT_STATUSES),
  message: z.string(),
  location: locationSchema.nullable(),
  contactsNotified: z.number().int().nonnegative(),
});

/** Página del historial (paginación por cursor). */
export const alertPageSchema = z.object({
  items: z.array(alertSchema),
  nextCursor: z.string().nullable(),
  total: z.number().int().nonnegative(),
});

export type SendAlertInput = z.infer<typeof sendAlertInputSchema>;
export type SosAlert = z.infer<typeof alertSchema>;
export type AlertPage = z.infer<typeof alertPageSchema>;
export type AlertStatus = (typeof ALERT_STATUSES)[number];
