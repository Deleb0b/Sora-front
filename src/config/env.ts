/**
 * Configuración de la aplicación leída de las variables de entorno de Vite.
 * Ver `.env.example` para la lista completa.
 */
const toNumber = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const env = {
  /** URL de una API REST real. Si está vacía se usa la API simulada (src/mocks). */
  apiUrl: import.meta.env.VITE_API_URL?.trim() ?? '',
  /** Probabilidad (0–1) de que la API simulada responda con error de servidor. */
  mockFailureRate: toNumber(import.meta.env.VITE_MOCK_FAILURE_RATE, 0.1),
  /** Latencia mínima y máxima (ms) de la API simulada. */
  mockLatency: {
    min: toNumber(import.meta.env.VITE_MOCK_LATENCY_MIN, 400),
    max: toNumber(import.meta.env.VITE_MOCK_LATENCY_MAX, 1100),
  },
  isDev: import.meta.env.DEV,
} as const;

export const APP_NAME = 'Sora';

/** Límites de negocio compartidos entre la API simulada y la interfaz. */
export const LIMITS = {
  maxContacts: 5,
  historyPageSize: 10,
} as const;
