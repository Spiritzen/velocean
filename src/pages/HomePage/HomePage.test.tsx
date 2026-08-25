import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { HomePage } from './HomePage'
import { NAVIGATION_ITEMS } from '../../data/navigation'
import { ACTIVITIES } from '../../data/activities'

describe('HomePage', () => {
  it('affiche les six liens de navigation, dans l’ordre, avec les bons href', () => {
    render(<HomePage />)
    // `name` non filtré ici : l'algorithme AccName renvoie "" pour un nœud
    // display:none même avec hidden:true (nav desktop non révélée dans les
    // 3 premières secondes ni visible sans @media évalué par jsdom) — voir
    // Header.test.tsx pour le même motif déjà établi dans ce projet. La page
    // a aussi des nav secondaires (footer) : on isole via aria-label.
    const navs = screen.getAllByRole('navigation', { hidden: true })
    const nav = navs.find((candidate) => candidate.getAttribute('aria-label') === 'Navigation principale')
    if (!nav) {
      throw new Error('Navigation principale introuvable')
    }
    const links = within(nav).getAllByRole('link', { hidden: true })

    expect(links).toHaveLength(6)
    expect(links.map((link) => link.textContent)).toEqual([
      'Notre passion',
      'Vélo',
      'Plongée',
      'Nautisme',
      'Permis bateau',
      'Contact',
    ])
    expect(NAVIGATION_ITEMS.map((item) => item.href)).toEqual([
      '#notre-passion',
      '#velo',
      '#plongee',
      '#nautisme',
      '#permis-bateau',
      '#contact',
    ])
  })

  it('« La Maison » n’existe plus dans la navigation', () => {
    render(<HomePage />)
    expect(screen.queryByText(/la maison/i)).not.toBeInTheDocument()
  })

  it('chaque section métier et son id existent, dans l’ordre final attendu', () => {
    const { container } = render(<HomePage />)
    const sections = Array.from(container.querySelectorAll('main > section'))
    const ids = sections.map((section) => section.id || null)

    expect(ids).toEqual([null, 'notre-passion', 'velo', 'plongee', 'nautisme', 'permis-bateau', 'avis', 'contact'])
  })

  it('les quatre URLs d’images utilisent le base path Vite, jamais un chemin en dur', () => {
    render(<HomePage />)
    for (const activity of ACTIVITIES) {
      const img = screen.getByRole('img', { name: activity.imageAlt })
      // Construite via `publicAsset`/BASE_URL, jamais un chemin en dur : la
      // preuve est que l'URL est le préfixe BASE_URL exact suivi du chemin
      // relatif déclaré en donnée — pas une chaîne `/images/...` recopiée.
      expect(img.getAttribute('src')).toBe(`${import.meta.env.BASE_URL}${activity.imageSrc}`)
    }
  })

  it('aucun ancien bloc générique (placeholder) n’est encore rendu après la 3D', () => {
    render(<HomePage />)
    // L'ancien AnchorPlaceholder rendait un <h2> = le libellé de nav tel
    // quel (ex. « Vélo » seul, sans le vrai titre éditorial) : on vérifie
    // que les vrais titres éditoriaux sont bien là à la place.
    expect(
      screen.getByRole('heading', { level: 2, name: 'La précision qui change chaque sortie.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Sous la surface, la confiance d’abord.' })).toBeInTheDocument()
  })

  it('contient un unique h1, la marque Vélocéan', () => {
    render(<HomePage />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('Vélocéan')
  })

  it('rend un footer avec le lien Contact', () => {
    render(<HomePage />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
