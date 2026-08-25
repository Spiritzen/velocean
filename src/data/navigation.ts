export interface NavigationItem {
  readonly label: string
  readonly href: string
}

/**
 * Six entrées de navigation principale du site Vélocéan. « Notre passion »
 * cible la section 3D de la roue (WheelJourneySection, id="notre-passion").
 */
export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'Notre passion', href: '#notre-passion' },
  { label: 'Vélo', href: '#velo' },
  { label: 'Plongée', href: '#plongee' },
  { label: 'Nautisme', href: '#nautisme' },
  { label: 'Permis bateau', href: '#permis-bateau' },
  { label: 'Contact', href: '#contact' },
]
