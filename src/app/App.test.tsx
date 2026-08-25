import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

// Ce fichier conserve les trois assertions du socle. Le H1 change de texte
// et la marque « Vélocéan » n'est plus un span dédié dans le Header (le
// logo animé vit désormais dans la vidéo, cf. mission hero/navbar) : la
// marque est donc vérifiée via le H1 accessible, qui la contient toujours.
describe('App', () => {
  it('rend le H1 accessible « Vélocéan — De la route aux abysses », qui porte la marque', () => {
    render(<App />)
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Vélocéan — De la route aux abysses',
    })
    expect(heading).toBeInTheDocument()
    expect(heading.textContent).toContain('Vélocéan')
  })

  it('affiche la phrase d’accroche accessible', () => {
    render(<App />)
    expect(
      screen.getByText('L’aventure se vit, s’équipe et se partage.'),
    ).toBeInTheDocument()
  })

  it('se rend sans erreur avec la navigation principale présente dans le DOM', () => {
    render(<App />)
    // hidden: true car (a) la navbar desktop n'est visible qu'à partir de
    // 769px via @media, non évaluée par jsdom, et (b) la navigation est
    // volontairement inert tant que la révélation à 3s n'a pas eu lieu
    // (comportement dédié testé dans Header.test.tsx). Le nom n'est pas
    // filtré via `name` : l'algorithme AccName renvoie "" pour un élément
    // display:none quel que soit `hidden`, donc on identifie le nav via
    // aria-label en attribut plutôt que via l'option `name` du rôle — la
    // page a aussi désormais des nav secondaires (footer), d'où getAllByRole.
    const navs = screen.getAllByRole('navigation', { hidden: true })
    const mainNav = navs.find((nav) => nav.getAttribute('aria-label') === 'Navigation principale')
    expect(mainNav).toBeDefined()
  })
})
