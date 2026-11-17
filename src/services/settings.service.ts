import { settingsSchema } from '../schemas/settings.schema';
import type { Settings } from '../types';
import { http } from './http';

/** Capa de servicios de los ajustes de la alerta. */
export const settingsService = {
  get: (signal?: AbortSignal) => http.get<Settings>('/settings', { signal, schema: settingsSchema }),
  update: (settings: Settings) => http.put<Settings>('/settings', settings, { schema: settingsSchema }),
};
