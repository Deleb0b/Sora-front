import type { IconProps } from '@sora-app/ui';

/**
 * Íconos que la biblioteca aún no incluye. Siguen el mismo estilo (trazo 2, 24×24)
 * y se ocultan siempre a tecnologías de asistencia: el nombre accesible lo da el botón.
 */
function AppSvg({ size = 24, color = 'currentColor', strokeWidth = 2, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const TrashIcon = (p: IconProps) => (
  <AppSvg {...p}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </AppSvg>
);

export const PlusIcon = (p: IconProps) => (
  <AppSvg {...p}>
    <path d="M12 5v14M5 12h14" />
  </AppSvg>
);

export const StarIcon = (p: IconProps) => (
  <AppSvg {...p}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z" />
  </AppSvg>
);
