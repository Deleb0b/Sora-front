import { env, LIMITS } from '../config/env';
import { contactInputSchema, contactPatchSchema } from '../schemas/contact.schema';
import { sendAlertInputSchema } from '../schemas/alert.schema';
import { settingsSchema } from '../schemas/settings.schema';
import type { ApiErrorBody, Contact, FieldErrors, SosAlert } from '../types';
import { createId, db, persist, resetDb } from './db';
import type { z } from 'zod';

/**
 * API REST simulada que corre en el navegador.
 * Imita una red real: latencia variable, errores aleatorios de servidor,
 * errores de validación (400/409/422), modo sin conexión y cancelación con AbortSignal.
 *
 * Endpoints:
 *   GET    /contacts            PATCH /contacts/:id
 *   POST   /contacts            DELETE /contacts/:id
 *   GET    /alerts?cursor&limit POST /alerts
 *   GET    /settings            PUT /settings
 */

interface MockRequest {
  method: string;
  path: string;
  body?: unknown;
  signal?: AbortSignal;
}

export interface MockResponse {
  status: number;
  body: unknown;
}

const FAILURE_KEY = 'sora:mock-failure-rate';

/** Permite forzar errores desde la consola para probar los rollbacks: soraMock.setFailureRate(1) */
function failureRate(): number {
  const stored = Number(globalThis.localStorage?.getItem(FAILURE_KEY));
  return globalThis.localStorage?.getItem(FAILURE_KEY) !== null && Number.isFinite(stored) ? stored : env.mockFailureRate;
}

if (env.isDev && typeof window !== 'undefined') {
  Object.assign(window, {
    soraMock: {
      setFailureRate: (rate: number) => localStorage.setItem(FAILURE_KEY, String(rate)),
      clearFailureRate: () => localStorage.removeItem(FAILURE_KEY),
      reset: resetDb,
    },
  });
}

const ok = (body: unknown, status = 200): MockResponse => ({ status, body });
const fail = (status: number, message: string, fieldErrors?: FieldErrors): MockResponse => ({
  status,
  body: { message, fieldErrors } satisfies ApiErrorBody,
});

function validationError(error: z.ZodError): MockResponse {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fail(400, 'Revisa los datos marcados.', fieldErrors);
}

function delay(signal?: AbortSignal) {
  const { min, max } = env.mockLatency;
  const ms = min + Math.random() * Math.max(0, max - min);
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

const sortContacts = (list: Contact[]) =>
  [...list].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.createdAt.localeCompare(b.createdAt));

function phoneTaken(phone: string, exceptId?: string) {
  return db.contacts.some((c) => c.phone === phone && c.id !== exceptId);
}

function route(method: string, url: URL, body: unknown): MockResponse {
  const [resource, id] = url.pathname.split('/').filter(Boolean);

  // ---- Contactos ----
  if (resource === 'contacts' && !id) {
    if (method === 'GET') return ok(sortContacts(db.contacts));

    if (method === 'POST') {
      const parsed = contactInputSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);
      if (db.contacts.length >= LIMITS.maxContacts) {
        return fail(422, `Solo puedes tener ${LIMITS.maxContacts} contactos de emergencia.`);
      }
      if (phoneTaken(parsed.data.phone)) {
        return fail(409, 'Este número ya está en tu red.', { phone: 'Ya tienes un contacto con este número.' });
      }
      const contact: Contact = {
        ...parsed.data,
        id: createId('c'),
        isPrimary: db.contacts.length === 0,
        available: true,
        createdAt: new Date().toISOString(),
      };
      db.contacts.push(contact);
      persist();
      return ok(contact, 201);
    }
  }

  if (resource === 'contacts' && id) {
    const index = db.contacts.findIndex((c) => c.id === id);
    if (index === -1) return fail(404, 'Este contacto ya no existe.');

    if (method === 'PATCH') {
      const parsed = contactPatchSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);
      if (parsed.data.phone && phoneTaken(parsed.data.phone, id)) {
        return fail(409, 'Este número ya está en tu red.', { phone: 'Ya tienes un contacto con este número.' });
      }
      if (parsed.data.isPrimary) db.contacts.forEach((c) => (c.isPrimary = false));
      db.contacts[index] = { ...db.contacts[index], ...parsed.data };
      persist();
      return ok(db.contacts[index]);
    }

    if (method === 'DELETE') {
      const [removed] = db.contacts.splice(index, 1);
      // Si se elimina la principal, la siguiente pasa a ser principal.
      if (removed.isPrimary && db.contacts[0]) db.contacts[0].isPrimary = true;
      persist();
      return ok(null, 204);
    }
  }

  // ---- Alertas (paginación por cursor) ----
  if (resource === 'alerts' && !id) {
    if (method === 'GET') {
      const limit = Math.min(Number(url.searchParams.get('limit')) || LIMITS.historyPageSize, 50);
      const start = Number(url.searchParams.get('cursor')) || 0;
      const sorted = [...db.alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const items = sorted.slice(start, start + limit);
      const next = start + limit;
      return ok({ items, nextCursor: next < sorted.length ? String(next) : null, total: sorted.length });
    }

    if (method === 'POST') {
      const parsed = sendAlertInputSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);
      const alert: SosAlert = {
        id: createId('alerta'),
        createdAt: new Date().toISOString(),
        status: 'enviada',
        message: parsed.data.message,
        location: parsed.data.location,
        contactsNotified: db.contacts.length,
      };
      db.alerts.push(alert);
      persist();
      return ok(alert, 201);
    }
  }

  // ---- Ajustes ----
  if (resource === 'settings') {
    if (method === 'GET') return ok(db.settings);
    if (method === 'PUT') {
      const parsed = settingsSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);
      db.settings = parsed.data;
      persist();
      return ok(db.settings);
    }
  }

  return fail(404, 'Recurso no encontrado.');
}

export async function handleMockRequest({ method, path, body, signal }: MockRequest): Promise<MockResponse> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return fail(0, 'No hay conexión. Revisa tu internet e inténtalo de nuevo.');
  }

  await delay(signal);

  if (Math.random() < failureRate()) {
    return fail(503, 'El servidor no respondió. Inténtalo de nuevo en un momento.');
  }

  // Clonar para que la interfaz nunca comparta referencias con la "base de datos".
  const res = route(method, new URL(path, 'http://sora.mock'), body);
  return { status: res.status, body: res.body == null ? null : structuredClone(res.body) };
}
