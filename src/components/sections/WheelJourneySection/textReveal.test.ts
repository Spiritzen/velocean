import { describe, expect, it } from 'vitest'
import { computeBlock1Style, computeBlock2Style } from './textReveal'

describe('courbes de texte — croisement bloc 1 / bloc 2', () => {
  it('bloc 1 est pleinement visible à journeyPhase = 0', () => {
    expect(computeBlock1Style(0).opacity).toBe(1)
  })

  it('bloc 2 est pleinement visible à journeyPhase = 1', () => {
    expect(computeBlock2Style(1).opacity).toBe(1)
  })

  it("bloc 1 commence à s'effacer avant que le bloc 2 n'apparaisse (0.35), jamais brutalement", () => {
    // Au tout début de l'apparition du bloc 2 (0.35), le bloc 1 est déjà
    // engagé dans sa sortie (débutée à 0.12) mais pas encore invisible.
    expect(computeBlock1Style(0.35).opacity).toBeGreaterThan(0)
    expect(computeBlock1Style(0.35).opacity).toBeLessThan(1)
  })

  it('aucun intervalle où les deux blocs sont simultanément à opacité nulle', () => {
    for (let phase = 0; phase <= 1; phase += 0.02) {
      const visible1 = computeBlock1Style(phase).opacity
      const visible2 = computeBlock2Style(phase).opacity
      expect(visible1 + visible2).toBeGreaterThan(0)
    }
  })

  it('au voisinage du milieu, les deux blocs peuvent être partiellement présents', () => {
    const visible1 = computeBlock1Style(0.45).opacity
    const visible2 = computeBlock2Style(0.45).opacity
    expect(visible1).toBeGreaterThan(0)
    expect(visible2).toBeGreaterThan(0)
  })

  it('translation et blur restent dans les plafonds imposés (24px, 6px)', () => {
    for (let phase = 0; phase <= 1; phase += 0.05) {
      const style1 = computeBlock1Style(phase)
      const style2 = computeBlock2Style(phase)
      expect(Math.abs(style1.translateY)).toBeLessThanOrEqual(24)
      expect(Math.abs(style2.translateY)).toBeLessThanOrEqual(24)
      expect(style1.blurPx).toBeLessThanOrEqual(6)
      expect(style2.blurPx).toBeLessThanOrEqual(6)
    }
  })
})
