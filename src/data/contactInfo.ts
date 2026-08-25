export interface OpeningHoursRow {
  readonly days: string
  readonly hours: string
}

export const CONTACT_INFO = {
  name: 'Vélocéan',
  addressLines: ['42 boulevard de Beauvillé', '80000 Amiens'] as const,
  phone: '03 22 00 00 00',
  phoneHref: 'tel:+33322000000',
  email: 'bonjour@velocean.fr',
  disclaimer: 'Coordonnées et horaires présentés pour la démonstration — à confirmer avec Vélocéan.',
} as const

export const OPENING_HOURS: readonly OpeningHoursRow[] = [
  { days: 'Mardi–vendredi', hours: '09:00–12:30 / 14:00–18:30' },
  { days: 'Samedi', hours: '09:00–18:00' },
  { days: 'Dimanche–lundi', hours: 'Fermé' },
]

/** URL de recherche cartographique (aucune clé API requise). */
export function buildDirectionsUrl(): string {
  const fullAddress = `${CONTACT_INFO.name}, ${CONTACT_INFO.addressLines.join(', ')}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
}
