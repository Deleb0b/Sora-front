import type { Contact, Settings, SosAlert } from '../types';

/**
 * "Base de datos" de la API simulada. Se guarda en localStorage para que
 * los cambios sobrevivan a recargas. Solo contiene datos de demostración.
 */

const STORAGE_KEY = 'sora:mock-db:v1';

export interface MockDb {
  contacts: Contact[];
  alerts: SosAlert[];
  settings: Settings;
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

function seedAlerts(): SosAlert[] {
  const messages = [
    'Necesito ayuda, esta es mi ubicación.',
    'Me siento insegura, por favor llámame.',
    'Alerta de prueba.',
  ];
  const statuses: SosAlert['status'][] = ['resuelta', 'cancelada', 'resuelta', 'enviada'];
  // 34 alertas espaciadas ~1.5 días para que el historial tenga varias páginas.
  return Array.from({ length: 34 }, (_, i) => ({
    id: `alerta-${34 - i}`,
    createdAt: minutesAgo(90 + i * 2_100),
    status: i === 0 ? 'resuelta' : statuses[i % statuses.length],
    message: messages[i % messages.length],
    location: i % 3 === 0 ? null : { lat: 19.7008 + i * 0.001, lng: -101.1844 - i * 0.001 },
    contactsNotified: (i % 3) + 1,
  }));
}

function seed(): MockDb {
  return {
    contacts: [
      { id: 'c-1', name: 'Mamá', phone: '4431234567', relation: 'familia', isPrimary: true, available: true, createdAt: minutesAgo(60 * 24 * 30) },
      { id: 'c-2', name: 'Fer López', phone: '4439876543', relation: 'amistad', isPrimary: false, available: true, createdAt: minutesAgo(60 * 24 * 12) },
      { id: 'c-3', name: 'Ana Ruiz', phone: '4435550101', relation: 'trabajo', isPrimary: false, available: false, createdAt: minutesAgo(60 * 24 * 3) },
    ],
    alerts: seedAlerts(),
    settings: {
      alertMessage: 'Necesito ayuda. Esta es mi ubicación actual, por favor contáctame.',
      shareLocation: true,
      notifyAuthorities: false,
      holdDuration: '3000',
    },
  };
}

function load(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    // localStorage no disponible o datos corruptos: se reinicia con la semilla.
  }
  return seed();
}

export const db: MockDb = load();

export function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Sin almacenamiento: los datos viven solo en memoria.
  }
}

/** Restablece los datos de demostración. */
export function resetDb() {
  Object.assign(db, seed());
  persist();
}

export const createId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
