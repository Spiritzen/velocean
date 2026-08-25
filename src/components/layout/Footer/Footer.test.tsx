import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Footer } from './Footer'

describe('Footer', () => {
  it('affiche la signature, la baseline et les quatre activités', () => {
    render(<Footer />)
    expect(screen.getByText('Vélocéan')).toBeInTheDocument()
    expect(screen.getByText('DE LA ROUTE AUX ABYSSES')).toBeInTheDocument()
    for (const label of ['Vélo', 'Plongée', 'Nautisme', 'Permis bateau']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('affiche l’année courante calculée, pas écrite en dur', () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })

  it('le lien Instagram cible la bonne URL avec les attributs de sécurité', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Vélocéan sur Instagram' })
    expect(link).toHaveAttribute('href', 'https://www.instagram.com/velocean_fr/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('ouvre les Mentions légales dans un dialog accessible et le referme', async () => {
    const user = userEvent.setup()
    render(<Footer />)

    await user.click(screen.getByRole('button', { name: 'Mentions légales' }))
    const dialog = screen.getByRole('dialog', { name: 'Mentions légales' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getAllByText(/démonstrateur/i).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
