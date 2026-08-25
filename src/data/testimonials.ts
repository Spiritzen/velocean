export interface Testimonial {
  readonly text: string
  readonly author: string
  readonly context: string
  /** Sens d'arrivée de la carte au scroll. */
  readonly direction: 'left' | 'right'
}

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    text: 'Mon gravel est ressorti de l’atelier précis, silencieux et parfaitement adapté à ma position. J’ai surtout apprécié les explications : on sent que les conseils viennent de personnes qui roulent vraiment.',
    author: 'Camille D.',
    context: 'Cycliste gravel',
    direction: 'left',
  },
  {
    text: 'Pour notre première plongée, tout a été expliqué calmement. Nous nous sommes sentis encadrés sans jamais perdre le plaisir de découvrir. Une expérience que nous avons déjà envie de recommencer.',
    author: 'Thomas & Inès',
    context: 'Première immersion',
    direction: 'right',
  },
  {
    text: 'Formation claire, organisation simple et moniteur très rassurant. J’ai obtenu mon permis avec de bonnes bases et surtout la confiance nécessaire pour naviguer avec ma famille.',
    author: 'Marc L.',
    context: 'Permis côtier',
    direction: 'left',
  },
]
