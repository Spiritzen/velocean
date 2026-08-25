export interface LegalDocument {
  readonly id: string
  readonly label: string
  readonly title: string
  readonly paragraphs: readonly string[]
}

const DEMO_NOTICE =
  'Ce site est un démonstrateur. Ce texte est un espace réservé : les mentions légales réelles devront être rédigées et fournies par Vélocéan (identité de l’entreprise, forme juridique, RCS/SIRET, capital social, directeur de publication, hébergeur, etc.) avant toute mise en ligne publique.'

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  {
    id: 'mentions-legales',
    label: 'Mentions légales',
    title: 'Mentions légales',
    paragraphs: [
      DEMO_NOTICE,
      'Aucune donnée personnelle réelle n’est collectée ou transmise par ce démonstrateur : le formulaire de contact ouvre uniquement la messagerie du visiteur, sans envoi à un serveur.',
    ],
  },
  {
    id: 'cgu',
    label: 'CGU',
    title: 'Conditions générales d’utilisation',
    paragraphs: [
      DEMO_NOTICE,
      'Les conditions générales d’utilisation définitives (règles d’usage du site, propriété intellectuelle, responsabilité) devront être rédigées avec Vélocéan avant mise en ligne publique.',
    ],
  },
  {
    id: 'cgv',
    label: 'CGV',
    title: 'Conditions générales de vente',
    paragraphs: [
      DEMO_NOTICE,
      'Aucune vente n’est réalisée sur ce démonstrateur (le tarif affiché en section Permis bateau est fictif). Les conditions générales de vente définitives devront être rédigées avec Vélocéan si une offre commerciale en ligne est mise en place.',
    ],
  },
]
