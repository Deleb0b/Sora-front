import { ZodError } from 'zod';
import { ApiError } from '../services/http';

/** Convierte cualquier error en un mensaje claro para la usuaria. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof ZodError) return 'El servidor respondió con datos inesperados.';
  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

/** true si el error es por falta de conexión. */
export const isNetworkError = (error: unknown) => error instanceof ApiError && error.isNetworkError;
