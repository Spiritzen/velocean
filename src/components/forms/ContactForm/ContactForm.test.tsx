import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from './ContactForm'

describe('ContactForm', () => {
  let originalLocation: Location

  beforeEach(() => {
    originalLocation = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' } as Location,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('affiche des labels toujours visibles pour chaque champ (pas seulement des placeholders)', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Sujet / activité')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
  })

  it('affiche une aide honnête, sans jamais prétendre à un envoi réseau réussi', () => {
    render(<ContactForm />)
    expect(screen.getByText('Votre messagerie va s’ouvrir pour finaliser l’envoi.')).toBeInTheDocument()
    expect(screen.queryByText(/message envoyé/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/envoyé avec succès/i)).not.toBeInTheDocument()
  })

  it('un envoi valide construit un mailto: et redirige la messagerie du visiteur', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText('Nom'), 'Camille Dupont')
    await user.type(screen.getByLabelText('Email'), 'camille@example.com')
    await user.selectOptions(screen.getByLabelText('Sujet / activité'), 'Vélo')
    await user.type(screen.getByLabelText('Message'), 'Bonjour, une question sur mon vélo.')
    await user.click(screen.getByRole('button', { name: /envoyer le message/i }))

    expect(window.location.href).toMatch(/^mailto:bonjour@velocean\.fr\?/)
    expect(window.location.href).toContain(encodeURIComponent('Camille Dupont'))
  })

  it('un envoi incomplet ne navigue jamais (validation HTML bloque la soumission)', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: /envoyer le message/i }))

    expect(window.location.href).toBe('')
  })

  it('n’affiche aucun contour d’erreur avant toute interaction du visiteur', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText('Nom')).not.toHaveAttribute('data-touched')
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('data-touched')
    expect(screen.getByLabelText('Sujet / activité')).not.toHaveAttribute('data-touched')
    expect(screen.getByLabelText('Message')).not.toHaveAttribute('data-touched')
  })

  it('marque un champ comme touché après en être sorti (blur), pour révéler l’état invalide', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    const nameInput = screen.getByLabelText('Nom')
    await user.click(nameInput)
    await user.tab()

    expect(nameInput).toHaveAttribute('data-touched', 'true')
  })
})
