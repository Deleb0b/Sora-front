import { useQuery } from '@tanstack/react-query';
import type { Settings } from '../../../types';
import { settingsQueryOptions } from '../../settings/hooks/useSettings';

export interface AlertConfig {
  holdDuration: number;
  message: string;
  shareLocation: boolean;
  notifyAuthorities: boolean;
}

/** `select` convierte los ajustes al formato que necesita el botón SOS (ms como número). */
const toAlertConfig = (s: Settings): AlertConfig => ({
  holdDuration: Number(s.holdDuration),
  message: s.alertMessage,
  shareLocation: s.shareLocation,
  notifyAuthorities: s.notifyAuthorities,
});

/** Misma caché que la vista Ajustes: un cambio guardado allí se refleja aquí sin otra petición. */
export function useAlertConfig() {
  return useQuery({ ...settingsQueryOptions, select: toAlertConfig });
}
