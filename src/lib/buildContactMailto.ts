export interface ContactFormValues {
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
}

const CONTACT_EMAIL = 'bonjour@velocean.fr'

/**
 * Construit un lien `mailto:` complet (sujet + corps encodés) à partir des
 * valeurs du formulaire de contact. Fonction pure et testable : aucun appel
 * réseau, aucun état — le site n'a pas de backend, ouvrir ce lien délègue
 * l'envoi réel à la messagerie du visiteur.
 *
 * `encodeURIComponent` est utilisé à la main plutôt que `URLSearchParams`,
 * qui encoderait les espaces en `+` — invalide pour un `mailto:`, où de
 * nombreux clients mail afficheraient le `+` littéralement au lieu d'un
 * espace.
 */
export function buildContactMailto(values: ContactFormValues): string {
  const subjectLine = `Demande Vélocéan – ${values.subject}`
  const bodyLines = [
    `Nom : ${values.name}`,
    `Email : ${values.email}`,
    `Sujet / activité : ${values.subject}`,
    '',
    values.message,
  ]

  const query = [
    `subject=${encodeURIComponent(subjectLine)}`,
    `body=${encodeURIComponent(bodyLines.join('\n'))}`,
  ].join('&')

  return `mailto:${CONTACT_EMAIL}?${query}`
}
