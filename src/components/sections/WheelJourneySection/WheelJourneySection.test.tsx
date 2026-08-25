import { afterEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { WheelJourneySection } from './WheelJourneySection'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

describe('WheelJourneySection', () => {
  afterEach(() => {
    // jsdom n'implémente pas matchMedia : on restaure le repli du setup global.
    mockMatchMedia(false)
  })

  it('affiche les deux blocs éditoriaux (surtitre, titre, texte, signature)', () => {
    render(<WheelJourneySection />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Le mouvement comme terrain commun.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('DE LA ROUTE AUX ABYSSES')).toBeInTheDocument()
    expect(screen.getByText(/notre équipe vous conseille avec la même exigence/)).toBeInTheDocument()
    expect(screen.getByText(/VÉLO.*PLONGÉE.*NAUTISME.*PERMIS\s*BATEAU/)).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Des passionnés au service de vos aventures.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('PASSION TRANSMISE')).toBeInTheDocument()
    expect(screen.getByText(/partez\s+équipé, confiant et prêt à profiter/)).toBeInTheDocument()
    expect(screen.getByText(/CONSEILLER.*ÉQUIPER.*TRANSMETTRE/)).toBeInTheDocument()
  })

  it('respecte une hiérarchie de titres correcte (deux h2, aucun h1 dans cette section)', () => {
    render(<WheelJourneySection />)

    const region = screen.getByRole('region', { name: 'Le mouvement comme terrain commun' })
    const headings = within(region).getAllByRole('heading')

    expect(headings).toHaveLength(2)
    for (const heading of headings) {
      expect(heading.tagName).toBe('H2')
    }
    expect(within(region).queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('ne monte aucun canvas WebGL sous jsdom mais conserve la section et ses textes', () => {
    const { container } = render(<WheelJourneySection />)

    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Le mouvement comme terrain commun.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Des passionnés au service de vos aventures.',
      }),
    ).toBeInTheDocument()
  })

  it('la zone décorative est ignorée des technologies d’assistance', () => {
    const { container } = render(<WheelJourneySection />)

    const decorative = container.querySelector('[aria-hidden="true"]')
    expect(decorative).not.toBeNull()
  })

  it('avec prefers-reduced-motion : section statique, textes accessibles sans animation JS', () => {
    mockMatchMedia(true)
    const { container } = render(<WheelJourneySection />)

    const region = screen.getByRole('region', { name: 'Le mouvement comme terrain commun' })
    expect(region.getAttribute('data-motion')).toBe('reduced')

    expect(
      screen.getByRole('heading', { level: 2, name: 'Le mouvement comme terrain commun.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Des passionnés au service de vos aventures.',
      }),
    ).toBeInTheDocument()

    // Aucun style inline de choréographie n'a été appliqué : le rendu
    // "sans animation" repose uniquement sur les règles CSS par défaut.
    for (const block of container.querySelectorAll<HTMLElement>('[class*="block"]')) {
      expect(block.style.opacity).toBe('')
      expect(block.style.transform).toBe('')
    }

    expect(container.querySelector('canvas')).not.toBeInTheDocument()
  })
})
