import { rangeProgress, smoothstep } from './journeyMath'

export interface TextRevealStyle {
  readonly opacity: number
  readonly translateY: number
  readonly blurPx: number
}

/** Plafonds imposés : translation 24px max, blur initial 6px max. */
const TEXT_TRANSLATE_PX = 24
const TEXT_BLUR_PX = 6

/**
 * Bloc 1 (état A, à droite) : pleinement visible dès journeyPhase = 0,
 * l'entrée sobre au montage est jouée une fois via une animation CSS
 * indépendante — voir `.block1` dans WheelJourneySection.module.css.
 * S'efface entre 0.12 et 0.55 : le bloc 2 a déjà commencé à apparaître
 * (0.35) avant que le bloc 1 ne soit totalement invisible (0.55) — à aucun
 * moment les deux blocs ne sont simultanément à opacité nulle.
 */
export function computeBlock1Style(phase: number): TextRevealStyle {
  const exit = smoothstep(rangeProgress(phase, 0.12, 0.55))
  const visibility = 1 - exit
  return {
    opacity: visibility,
    translateY: -exit * TEXT_TRANSLATE_PX,
    blurPx: exit * TEXT_BLUR_PX,
  }
}

/**
 * Bloc 2 (état B, à gauche) : commence à apparaître à 0.35 (le bloc 1 est
 * encore partiellement visible à ce moment), pleinement visible à 0.78.
 */
export function computeBlock2Style(phase: number): TextRevealStyle {
  const enter = smoothstep(rangeProgress(phase, 0.35, 0.78))
  return {
    opacity: enter,
    translateY: (1 - enter) * TEXT_TRANSLATE_PX,
    blurPx: (1 - enter) * TEXT_BLUR_PX,
  }
}

/** Halo dynamique au centre : suit la même proximité que l'effet d'approche 3D. */
export function computeApproachHaloOpacity(proximity: number): number {
  return Math.max(0, Math.min(1, proximity)) * 0.5
}

/** Applique un style de révélation directement en styles inline (pas de re-render React). */
export function applyTextRevealStyle(element: HTMLElement | null, style: TextRevealStyle): void {
  if (!element) {
    return
  }
  element.style.opacity = String(style.opacity)
  element.style.transform = `translate3d(0, ${style.translateY.toFixed(2)}px, 0)`
  element.style.filter = style.blurPx > 0.05 ? `blur(${style.blurPx.toFixed(2)}px)` : 'none'
}
