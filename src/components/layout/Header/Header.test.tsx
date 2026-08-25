import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'
import { NAVIGATION_ITEMS } from '../../../data/navigation'

// La navbar desktop est cachée via `.desktopNav { display: none }` levé
// seulement par `@media (min-width: 769px)` (mobile-first). jsdom n'évalue
// jamais les media queries de largeur (matchMedia y renvoie toujours
// matches:false), donc l'élément y reste « display: none » calculé quelle
// que soit la largeur simulée : on interroge donc ces rôles avec
// `hidden: true`, l'option prévue par testing-library pour ce cas précis
// (élément réellement présent et sémantiquement correct, seulement rendu
// visible par une media query que l'environnement de test ne sait pas
// évaluer). Le nom accessible n'est volontairement pas filtré via `name` :
// l'algorithme AccName renvoie "" pour un nœud display:none même avec
// hidden:true (qui ne pilote que le filtrage du listing de rôles) ; on
// vérifie aria-label directement en attribut à la place.
describe('Header', () => {
  it('affiche les six libellés de navigation', () => {
    render(<Header isRevealed />)
    const nav = screen.getByRole('navigation', { hidden: true })
    expect(nav).toHaveAttribute('aria-label', 'Navigation principale')

    for (const item of NAVIGATION_ITEMS) {
      expect(within(nav).getByText(item.label)).toBeInTheDocument()
    }
  })

  it('attribue un --nav-index distinct à chaque lien pour cadencer son délai', () => {
    render(<Header isRevealed />)
    const nav = screen.getByRole('navigation', { hidden: true })
    const items = within(nav).getAllByRole('listitem', { hidden: true })

    const indexes = items.map((item) => item.style.getPropertyValue('--nav-index'))
    expect(indexes).toEqual(NAVIGATION_ITEMS.map((_, index) => String(index)))
  })

  it('rend la navbar inerte tant que la révélation n’a pas eu lieu', () => {
    const { container } = render(<Header isRevealed={false} />)
    const header = container.querySelector('header')
    expect(header?.hasAttribute('inert')).toBe(true)
  })

  it('retire l’attribut inert une fois la navigation révélée', () => {
    const { container } = render(<Header isRevealed />)
    const header = container.querySelector('header')
    expect(header?.hasAttribute('inert')).toBe(false)
  })

  it('le menu mobile est fermé par défaut (aria-expanded="false")', () => {
    render(<Header isRevealed />)
    expect(screen.getByRole('button', { name: /menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('ouvre le panneau mobile au clic et place le focus dedans', async () => {
    const user = userEvent.setup()
    render(<Header isRevealed />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByRole('dialog', { name: 'Menu de navigation' })
    expect(within(panel).getAllByText(NAVIGATION_ITEMS[0].label)[0]).toHaveFocus()
  })

  it('Escape ferme le panneau et restitue le focus au bouton', async () => {
    const user = userEvent.setup()
    render(<Header isRevealed />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton).toHaveFocus()
  })

  it('le clic sur un lien du panneau referme le menu', async () => {
    const user = userEvent.setup()
    render(<Header isRevealed />)

    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)

    const panel = screen.getByRole('dialog', { name: 'Menu de navigation' })
    const diveLink = within(panel).getByText('Plongée')
    await user.click(diveLink)

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
