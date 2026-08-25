import { describe, expect, it } from 'vitest'
import {
  computeApproachScaleMultiplier,
  computeHysteresisTarget,
  computeTweenDurationMs,
  computeTweenValue,
  JOURNEY_DOWN_THRESHOLD,
  JOURNEY_UP_THRESHOLD,
} from './journeyMath'

describe('computeApproachScaleMultiplier', () => {
  const peakScale = 1.55

  it('vaut exactement 1 à la phase 0', () => {
    expect(computeApproachScaleMultiplier(0, peakScale)).toBe(1)
  })

  it('vaut exactement 1 à la phase 1', () => {
    expect(computeApproachScaleMultiplier(1, peakScale)).toBe(1)
  })

  it('atteint son maximum (peakScale) au voisinage de 0.5', () => {
    const atMidpoint = computeApproachScaleMultiplier(0.5, peakScale)
    expect(atMidpoint).toBeCloseTo(peakScale, 5)

    // Le pic est bien un maximum : les valeurs de part et d'autre sont plus basses.
    const before = computeApproachScaleMultiplier(0.3, peakScale)
    const after = computeApproachScaleMultiplier(0.7, peakScale)
    expect(before).toBeLessThan(atMidpoint)
    expect(after).toBeLessThan(atMidpoint)
    expect(before).toBeGreaterThan(1)
    expect(after).toBeGreaterThan(1)
  })
})

describe('computeHysteresisTarget', () => {
  it('bascule vers B (1) une fois le seuil haut franchi', () => {
    expect(computeHysteresisTarget(0, JOURNEY_UP_THRESHOLD + 0.01)).toBe(1)
  })

  it('reste en A tant que le seuil haut n’est pas franchi', () => {
    expect(computeHysteresisTarget(0, JOURNEY_UP_THRESHOLD - 0.01)).toBe(0)
    expect(computeHysteresisTarget(0, JOURNEY_UP_THRESHOLD)).toBe(0)
  })

  it('revient vers A (0) une fois le seuil bas repassé', () => {
    expect(computeHysteresisTarget(1, JOURNEY_DOWN_THRESHOLD - 0.01)).toBe(0)
  })

  it('reste en B tant que le seuil bas n’est pas repassé', () => {
    expect(computeHysteresisTarget(1, JOURNEY_DOWN_THRESHOLD + 0.01)).toBe(1)
    expect(computeHysteresisTarget(1, JOURNEY_DOWN_THRESHOLD)).toBe(1)
  })

  it('n’oscille jamais dans la zone morte entre les deux seuils', () => {
    const midZone = (JOURNEY_UP_THRESHOLD + JOURNEY_DOWN_THRESHOLD) / 2
    // Venant de A : reste en A dans la zone morte.
    expect(computeHysteresisTarget(0, midZone)).toBe(0)
    // Venant de B : reste en B dans la même zone morte.
    expect(computeHysteresisTarget(1, midZone)).toBe(1)
  })
})

describe('computeTweenValue / computeTweenDurationMs — réversibilité sans saut', () => {
  it('atteint exactement la cible à la fin de la durée', () => {
    const duration = computeTweenDurationMs(0, 1, 1300)
    expect(duration).toBe(1300)
    expect(computeTweenValue(0, 1, 1300, duration)).toBe(1)
  })

  it('une reprise à mi-chemin repart de la valeur courante, sans saut', () => {
    // Traversée A → B stoppée à mi-chemin (valeur courante 0.5).
    const midValue = computeTweenValue(0, 1, 650, computeTweenDurationMs(0, 1, 1300))
    expect(midValue).toBeCloseTo(0.5, 1)

    // La direction s'inverse : on retombe vers 0 en partant de la valeur
    // courante — à elapsedMs = 0, la nouvelle valeur doit être identique à
    // l'ancienne (continuité), pas revenir à 1 ni sauter à 0.
    const reverseDuration = computeTweenDurationMs(midValue, 0, 1300)
    const valueAtReversalStart = computeTweenValue(midValue, 0, 0, reverseDuration)
    expect(valueAtReversalStart).toBeCloseTo(midValue, 10)
  })

  it('une reprise à mi-chemin prend proportionnellement moins de temps qu’une traversée complète', () => {
    const fullDuration = computeTweenDurationMs(0, 1, 1300)
    const halfDuration = computeTweenDurationMs(0.5, 1, 1300)
    expect(halfDuration).toBeCloseTo(fullDuration / 2, 5)
  })
})
