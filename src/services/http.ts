import type { z } from 'zod';
import { env } from '../config/env';
import { handleMockRequest } from '../mocks/server';
import type { ApiErrorBody, FieldErrors } from '../types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Error normalizado de la API. Los componentes solo dependen de esta clase. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: FieldErrors;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = body.fieldErrors;
  }

  /** Sin conexión o el servidor no respondió. */
  get isNetworkError() {
    return this.status === 0;
  }

  /** Error de datos enviados (no tiene sentido reintentar sin cambiar algo). */
  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

interface RequestOptions<T> {
  body?: unknown;
  /** AbortSignal que entrega TanStack Query para cancelar peticiones obsoletas. */
  signal?: AbortSignal;
  /** Esquema de Zod para validar la respuesta (los mismos que usan los formularios). */
  schema?: z.ZodType<T>;
}

const NETWORK_ERROR: ApiErrorBody = {
  message: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.',
};

async function realFetch(method: HttpMethod, path: string, body: unknown, signal?: AbortSignal) {
  try {
    const res = await fetch(`${env.apiUrl}${path}`, {
      method,
      signal,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data: unknown = res.status === 204 ? null : await res.json().catch(() => null);
    return { status: res.status, body: data };
  } catch (error) {
    if (signal?.aborted) throw error;
    return { status: 0, body: NETWORK_ERROR };
  }
}

/**
 * Cliente HTTP de la app. Si hay `VITE_API_URL` usa `fetch`; si no, la API simulada.
 * Lanza `ApiError` en respuestas no exitosas y valida el cuerpo con Zod cuando se pasa un esquema.
 */
export async function request<T = void>(method: HttpMethod, path: string, options: RequestOptions<T> = {}): Promise<T> {
  const { body, signal, schema } = options;

  const res = env.apiUrl
    ? await realFetch(method, path, body, signal)
    : await handleMockRequest({ method, path, body, signal });

  if (res.status === 0 || res.status >= 400) {
    const errorBody = (res.body as ApiErrorBody | null) ?? { message: 'Ocurrió un error inesperado.' };
    throw new ApiError(res.status, errorBody);
  }

  return schema ? schema.parse(res.body) : (res.body as T);
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions<T>, 'body'>) => request<T>('GET', path, options),
  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions<T>, 'body'>) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body: unknown, options?: Omit<RequestOptions<T>, 'body'>) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body: unknown, options?: Omit<RequestOptions<T>, 'body'>) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: (path: string, options?: Omit<RequestOptions<void>, 'body' | 'schema'>) => request<void>('DELETE', path, options),
};
