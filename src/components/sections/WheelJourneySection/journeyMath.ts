/**
 * Fonctions pures pilotant la chorégraphie de la roue. Aucune dépendance à
 * three.js ou React ici : facilement lisible/testable. La conversion vers
 * des unités monde (caméra, taille réelle du canvas) revient à WheelScene.
 *
 * Modèle à deux étages :
 * - une progression brute de scroll [0, 1] (calculée ailleurs, voir
 *   useSectionScrollProgress) sert uniquement à détecter un seuil ;
 * - une fois le seuil franchi, `journeyPhase` [0, 1] s'anime seule dans le
 *   temps (voir useAutoJourneyPhase) jusqu'à l'état A (0) ou B (1), avec
 *   hystérésis pour ne jamais osciller et reprise sans saut si la direction
 *   change en cours de route.
 */

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** Courbe d'ease-in-out classique, utilisée pour des entrées/sorties « sobres ». */
export function smoothstep(t: number): number {
  const clamped = clamp01(t)
  return clamped * clamped * (3 - 2 * clamped)
}

/** Ease-in-out cubique — sportif, jamais élastique/cartoon. */
export function easeInOutCubic(t: number): number {
  const clamped = clamp01(t)
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - (-2 * clamped + 2) ** 3 / 2
}

/** Reprojette `value` sur [0, 1] entre `start` et `end`, hors bornes clampé. */
export function rangeProgress(value: number, start: number, end: number): number {
  if (end === start) {
    return value >= end ? 1 : 0
  }
  return clamp01((value - start) / (end - start))
}

// ---------------------------------------------------------------------------
// Seuil de scroll → destination, avec hystérésis (voir useAutoJourneyPhase)
// ---------------------------------------------------------------------------

/** Progression brute au-delà de laquelle l'état A bascule vers la destination B. */
export const JOURNEY_UP_THRESHOLD = 0.18
/** Progression brute en deçà de laquelle l'état B revient vers la destination A. */
export const JOURNEY_DOWN_THRESHOLD = 0.1
/** Durée d'une traversée complète (0 → 1) de journeyPhase, en millisecondes. */
export const JOURNEY_FULL_DURATION_MS = 1300

/**
 * Décide la destination (0 = A, 1 = B) à partir de la progression brute de
 * scroll et de la destination courante, avec hystérésis : ne change d'avis
 * que lorsque le seuil pertinent est franchi, jamais d'oscillation.
 */
export function computeHysteresisTarget(currentTarget: 0 | 1, rawProgress: number): 0 | 1 {
  if (currentTarget === 0 && rawProgress > JOURNEY_UP_THRESHOLD) {
    return 1
  }
  if (currentTarget === 1 && rawProgress < JOURNEY_DOWN_THRESHOLD) {
    return 0
  }
  return currentTarget
}

/**
 * Durée d'une transition partant de `startValue` vers `target`, mise à
 * l'échelle de la distance à parcourir : une reprise à mi-chemin (après un
 * changement de direction) va donc proportionnellement plus vite, à vitesse
 * angulaire constante, jamais plus lentement qu'une traversée complète.
 */
export function computeTweenDurationMs(
  startValue: number,
  target: number,
  fullDurationMs: number = JOURNEY_FULL_DURATION_MS,
): number {
  return fullDurationMs * Math.abs(target - startValue)
}

/** Valeur de journeyPhase à `elapsedMs` dans une transition ease-in-out cubique. */
export function computeTweenValue(
  startValue: number,
  target: number,
  elapsedMs: number,
  durationMs: number,
): number {
  if (durationMs <= 0) {
    return target
  }
  const t = easeInOutCubic(clamp01(elapsedMs / durationMs))
  return startValue + (target - startValue) * t
}

// ---------------------------------------------------------------------------
// Gabarits responsive
// ---------------------------------------------------------------------------

export type JourneyTier = 'mobile' | 'tablet' | 'desktop'

export interface JourneyTierConfig {
  /** Écart départ/arrivée par rapport au centre, en fraction de la largeur du canvas. */
  readonly xAmplitude: number
  /** Écart départ/arrivée par rapport au centre, en fraction de la hauteur du canvas. */
  readonly yAmplitude: number
  /** Diamètre de repos de la roue, en fraction de la largeur du canvas. */
  readonly wheelDiameterRatio: number
  /** Multiplicateur d'échelle au pic de l'effet d'approche (journeyPhase ≈ 0.5). */
  readonly peakScale: number
}

/**
 * Roue nettement plus grande et plus présente qu'avant (+40 à +55 % de
 * diamètre selon le palier — mobile plafonné un peu plus bas pour rester
 * lisible, voir plus loin). Desktop/tablette séparent la roue et son texte
 * horizontalement (texte à droite en A, à gauche en B — voir le CSS) : au
 * repos, aucun chevauchement.
 *
 * Sur mobile, les blocs restent centrés en largeur (le texte imposé est
 * trop long pour tenir à côté d'une roue de cette taille sur un viewport
 * étroit) : la séparation au repos se fait donc verticalement, via un
 * `yAmplitude` négatif — la roue part BAS en A (le bloc 1 occupe le haut)
 * et arrive HAUTE en B (le bloc 2 occupe le bas). Le chevauchement pendant
 * la traversée elle-même reste autorisé et voulu.
 */
const TIER_CONFIG: Record<JourneyTier, JourneyTierConfig> = {
  desktop: { xAmplitude: 0.32, yAmplitude: 0.14, wheelDiameterRatio: 0.235, peakScale: 1.55 },
  tablet: { xAmplitude: 0.24, yAmplitude: 0.11, wheelDiameterRatio: 0.225, peakScale: 1.45 },
  mobile: { xAmplitude: 0.12, yAmplitude: -0.27, wheelDiameterRatio: 0.42, peakScale: 1.3 },
}

const TABLET_MIN_WIDTH_PX = 640
const DESKTOP_MIN_WIDTH_PX = 1024

export function getJourneyTier(viewportWidthPx: number): JourneyTier {
  if (viewportWidthPx < TABLET_MIN_WIDTH_PX) return 'mobile'
  if (viewportWidthPx < DESKTOP_MIN_WIDTH_PX) return 'tablet'
  return 'desktop'
}

export function getJourneyTierConfig(tier: JourneyTier): JourneyTierConfig {
  return TIER_CONFIG[tier]
}

export interface JourneyPointFraction {
  readonly x: number
  readonly y: number
}

/** Point de départ (état A, gauche/haut) en fraction de viewport. */
export function getJourneyStartFraction(config: JourneyTierConfig): JourneyPointFraction {
  return { x: -config.xAmplitude, y: config.yAmplitude }
}

/** Point d'arrivée (état B, droite/bas) en fraction de viewport. */
export function getJourneyEndFraction(config: JourneyTierConfig): JourneyPointFraction {
  return { x: config.xAmplitude, y: -config.yAmplitude }
}

// ---------------------------------------------------------------------------
// Orientation et rotation de la roue
// ---------------------------------------------------------------------------

const DEG_TO_RAD = Math.PI / 180
/** Face caméra pure (jamais utilisée telle quelle) : l'essieu pointe vers la caméra. */
const FACE_CAMERA_RADIANS = Math.PI / 2
/** Trois-quarts au repos : entre 18° et 25° d'écart avec le face caméra. */
const REST_QUARTER_RADIANS = 22 * DEG_TO_RAD
/** Bascule supplémentaire vers le profil au pic de la transition (~0.5). */
const PIVOT_DIP_RADIANS = 68 * DEG_TO_RAD

/**
 * Orientation (axe Y) du groupe extérieur en fonction de journeyPhase :
 * trois-quarts à l'état A (0), balayage continu à travers un point plus
 * proche du profil au milieu (jamais illisible : ≥ ~30 % de largeur
 * apparente, sin(22°) ≈ 0.37), trois-quarts opposé à l'état B (1).
 */
export function computeWheelYRotation(phase: number): number {
  const p = clamp01(phase)
  const restA = FACE_CAMERA_RADIANS - REST_QUARTER_RADIANS
  const restB = FACE_CAMERA_RADIANS + REST_QUARTER_RADIANS
  const base = restA + (restB - restA) * p
  const dip = PIVOT_DIP_RADIANS * Math.sin(Math.PI * p)
  return base - dip
}

/** Tours par seconde de la rotation continue de repos (jamais statique). */
export const CONTINUOUS_SPIN_TURNS_PER_SECOND = 0.4
/** Tours mécaniques supplémentaires parcourus pendant une traversée complète. */
export const TRANSIT_EXTRA_TURNS = 4

/** Angle de roulement supplémentaire dû au trajet lui-même (réversible avec journeyPhase). */
export function computeTransitExtraRotation(phase: number): number {
  return clamp01(phase) * TRANSIT_EXTRA_TURNS * Math.PI * 2
}

// ---------------------------------------------------------------------------
// Effet d'approche (la roue semble venir vers la caméra puis repartir)
// ---------------------------------------------------------------------------

/** 0 → 1 → 0, pic exactement à journeyPhase = 0.5. */
export function computeApproachProximity(phase: number): number {
  return Math.sin(Math.PI * clamp01(phase))
}

/** 1 aux phases 0 et 1, `peakScale` au voisinage de 0.5. */
export function computeApproachScaleMultiplier(phase: number, peakScale: number): number {
  return 1 + (peakScale - 1) * computeApproachProximity(phase)
}

export const CAMERA_FOV_DEG = 32
export const CAMERA_DISTANCE = 6
