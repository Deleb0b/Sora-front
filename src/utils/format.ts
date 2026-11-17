/** Formateadores reutilizables. Se crean una sola vez (Intl es costoso de instanciar). */

const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const relativeFormatter = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' });

export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso));

/** "hace 3 horas", "ayer", etc. */
export function formatRelative(iso: string, now = Date.now()) {
  const diffSec = Math.round((new Date(iso).getTime() - now) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSec) >= seconds) return relativeFormatter.format(Math.round(diffSec / seconds), unit);
  }
  return 'justo ahora';
}

/** 4431234567 → "443 123 4567" */
export const formatPhone = (phone: string) => phone.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3');
