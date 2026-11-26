import { memo } from 'react';

/**
 * Logotipo horizontal de Sora (variante A del Manual de Identidad Visual).
 *
 * Construido con la retícula del manual, en unidades del módulo x:
 * - Símbolo en una caja de 12x × 12x: dos círculos de radio 4x con centros a 4x
 *   (Coral Sora y Malva Abrazo), intersección en Ciruela Noche y dos ondas Coral
 *   de 5.5x y 7.5x de radio, grosor 1x y 76° de apertura.
 * - Separación de 3x entre símbolo y palabra.
 * - «sora» en minúsculas, Nunito ExtraBold (800), cuerpo de 9.4x (78 % de la altura del símbolo),
 *   en Ciruela Noche. La fuente la carga @sora-app/ui.
 *
 * Tamaño mínimo según el manual: 100 px de ancho. Por eso `width` no baja de 100.
 * Si el equipo tiene el archivo original del logotipo, debe reemplazar este componente por él.
 */

const X = 10; // módulo en unidades del viewBox
const CORAL = '#E4555D';
const MALVA = '#8E5FA8';
const CIRUELA = '#3B1F4E';

const WORD_WIDTH = 2.05 * 9.4 * X; // ancho de «sora» en Nunito ExtraBold (2.05 em)
const VIEW_W = 12 * X + 3 * X + WORD_WIDTH;
const VIEW_H = 12 * X;

const cx = 6 * X;
const cy = 8 * X;
const r = 4 * X;
const half = Math.sqrt(r * r - (2 * X) ** 2); // mitad de la altura de la intersección
const sin = Math.sin((38 * Math.PI) / 180);
const cos = Math.cos((38 * Math.PI) / 180);

const wave = (R: number) => `M ${cx - R * sin} ${cy - R * cos} A ${R} ${R} 0 0 1 ${cx + R * sin} ${cy - R * cos}`;

interface SoraLogoProps {
  /** Ancho en px (mínimo 100, según el manual). */
  width?: number;
}

export const SoraLogo = memo(function SoraLogo({ width = 112 }: SoraLogoProps) {
  const w = Math.max(100, width);
  return (
    <svg
      width={w}
      height={(w * VIEW_H) / VIEW_W}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      aria-hidden="true"
      focusable="false"
      className="sora-logo"
    >
      <path d={wave(5.5 * X)} fill="none" stroke={CORAL} strokeWidth={X} strokeLinecap="round" />
      <path d={wave(7.5 * X)} fill="none" stroke={CORAL} strokeWidth={X} strokeLinecap="round" />
      <circle cx={cx - 2 * X} cy={cy} r={r} fill={CORAL} />
      <circle cx={cx + 2 * X} cy={cy} r={r} fill={MALVA} />
      <path d={`M ${cx} ${cy - half} A ${r} ${r} 0 0 1 ${cx} ${cy + half} A ${r} ${r} 0 0 1 ${cx} ${cy - half} Z`} fill={CIRUELA} />
      <text
        x={15 * X}
        y={9.1 * X}
        fill={CIRUELA}
        fontFamily="Nunito, 'Nunito Sans', system-ui, sans-serif"
        fontWeight={800}
        fontSize={9.4 * X}
      >
        sora
      </text>
    </svg>
  );
});
