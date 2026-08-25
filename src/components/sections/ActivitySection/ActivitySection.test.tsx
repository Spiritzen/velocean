import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivitySection } from './ActivitySection'
import { ACTIVITIES } from '../../../data/activities'

const [velo] = ACTIVITIES

describe('ActivitySection', () => {
  it('rend la section avec son id et son titre h2', () => {
    render(<ActivitySection activity={velo} />)
    const heading = screen.getByRole('heading', { level: 2, name: velo.title })
    expect(heading).toBeInTheDocument()

    const region = screen.getByRole('region', { name: velo.title })
    expect(region).toHaveAttribute('id', velo.id)
  })

  it('affiche les trois preuves et le CTA vers #contact', () => {
    render(<ActivitySection activity={velo} />)
    for (const proof of velo.proofs) {
      expect(screen.getByText(proof)).toBeInTheDocument()
    }
    const cta = screen.getByRole('link', { name: velo.ctaLabel })
    expect(cta).toHaveAttribute('href', '#contact')
  })

  it('utilise le base path Vite pour l’URL de l’image, jamais un chemin en dur', () => {
    render(<ActivitySection activity={velo} />)
    const img = screen.getByRole('img', { name: velo.imageAlt })
    expect(img.getAttribute('src')).toBe(`${import.meta.env.BASE_URL}${velo.imageSrc}`)
  })

  it('charge l’image en lazy avec un décodage asynchrone et des dimensions intrinsèques', () => {
    render(<ActivitySection activity={velo} />)
    const img = screen.getByRole('img', { name: velo.imageAlt })
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(img).toHaveAttribute('width', String(velo.imageWidth))
    expect(img).toHaveAttribute('height', String(velo.imageHeight))
  })
})
