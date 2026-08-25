/**
 * Contenu typé des quatre sections métier (vélo, plongée, nautisme, permis
 * bateau), consommé par `ActivitySection`. Centraliser ces données évite de
 * dupliquer la structure JSX quatre fois : seul le thème et la disposition
 * varient, le composant reste unique.
 */

export type ActivityTheme = 'foam' | 'abyss' | 'mist' | 'ocean'

export interface ActivityContent {
  readonly id: string
  readonly number: string
  readonly eyebrow: string
  readonly title: string
  readonly paragraph: string
  readonly proofs: readonly string[]
  readonly secondaryPhrase: string
  readonly priceNote?: string
  readonly ctaLabel: string
  readonly imageSrc: string
  readonly imageAlt: string
  readonly imageWidth: number
  readonly imageHeight: number
  /** Côté de l'image sur desktop ; le texte occupe l'autre côté. */
  readonly imageSide: 'left' | 'right'
  readonly theme: ActivityTheme
}

export const ACTIVITIES: readonly ActivityContent[] = [
  {
    id: 'velo',
    number: '01',
    eyebrow: 'ATELIER VÉLO',
    title: 'La précision qui change chaque sortie.',
    paragraph:
      'Un vélo bien réglé se fait oublier pour laisser toute la place aux sensations. À l’atelier Vélocéan, chaque machine est écoutée, contrôlée et ajustée avec le même soin : celui d’artisans qui roulent, testent et savent ce qu’un cycliste attend vraiment sur la route.',
    proofs: [
      'Diagnostic clair avant intervention',
      'Entretien, réglages et réparations',
      'Préparation route, gravel et loisir',
    ],
    secondaryPhrase:
      'Du premier tour de roue à la prochaine longue échappée, nous cherchons le même résultat : un vélo fiable, fluide et prêt à vous faire sourire.',
    ctaLabel: 'CONFIER MON VÉLO',
    imageSrc: 'images/velocean-atelier-velo.webp',
    imageAlt: 'Détail d’un vélo de route entretenu par l’atelier Vélocéan',
    imageWidth: 660,
    imageHeight: 877,
    imageSide: 'left',
    theme: 'foam',
  },
  {
    id: 'plongee',
    number: '02',
    eyebrow: 'PLONGÉE',
    title: 'Sous la surface, la confiance d’abord.',
    paragraph:
      'La plongée commence bien avant la mise à l’eau. Elle naît d’un équipement contrôlé, de gestes compris et d’un encadrement attentif. Vélocéan vous accompagne avec exigence et simplicité pour que chaque immersion reste un plaisir, quel que soit votre niveau.',
    proofs: [
      'Conseils adaptés à votre pratique',
      'Équipement préparé avec rigueur',
      'Progression à votre rythme',
    ],
    secondaryPhrase:
      'Respirer, observer, partager : sous l’eau, l’aventure devient plus belle quand chacun se sent prêt.',
    ctaLabel: 'PRÉPARER MA PLONGÉE',
    imageSrc: 'images/velocean-plongee-securite.webp',
    imageAlt: 'Trois plongeurs équipés évoluent ensemble en toute sécurité',
    imageWidth: 1672,
    imageHeight: 941,
    imageSide: 'right',
    theme: 'abyss',
  },
  {
    id: 'nautisme',
    number: '03',
    eyebrow: 'NAUTISME',
    title: 'Prendre le large, ensemble.',
    paragraph:
      'Une sortie en mer, c’est une autre manière de regarder l’horizon. Pour une découverte en famille, une exploration entre amis ou l’envie de gagner en autonomie, Vélocéan vous aide à préparer une navigation simple, sûre et pleinement vécue.',
    proofs: [
      'Conseils issus du terrain',
      'Équipement pensé pour naviguer serein',
      'Accompagnement avant le départ',
    ],
    secondaryPhrase:
      'Comprendre son matériel, anticiper les conditions et garder le plaisir au centre : c’est ainsi que naissent les meilleurs souvenirs sur l’eau.',
    ctaLabel: 'PRÉPARER MA SORTIE',
    imageSrc: 'images/velocean-nautisme-exploration.webp',
    imageAlt: 'Une famille navigue sur un bateau à moteur au large de la côte',
    imageWidth: 1672,
    imageHeight: 941,
    imageSide: 'left',
    theme: 'mist',
  },
  {
    id: 'permis-bateau',
    number: '04',
    eyebrow: 'PERMIS BATEAU',
    title: 'Votre liberté commence au quai.',
    paragraph:
      'Une formation claire, un rythme efficace et des conseils concrets pour prendre la barre avec confiance. De la théorie à la pratique, nous avançons étape par étape afin que la sécurité devienne un réflexe et que votre projet prenne rapidement le large.',
    proofs: [
      'Planning souple et accompagnement humain',
      'Apprentissage concret, sans jargon inutile',
      'Formule côtière dès 349 €*',
    ],
    priceNote: '* Tarif fictif présenté pour cette démonstration. Offre et conditions à valider avec Vélocéan.',
    secondaryPhrase:
      'Accessible, rassurant et pensé pour votre réussite : le permis devient le premier chapitre de vos prochaines aventures.',
    ctaLabel: 'DEMANDER LES PROCHAINES DATES',
    imageSrc: 'images/velocean-permis-bateau.webp',
    imageAlt: 'Un client souriant présente son permis bateau aux côtés de son formateur',
    imageWidth: 1672,
    imageHeight: 941,
    imageSide: 'right',
    theme: 'ocean',
  },
]
