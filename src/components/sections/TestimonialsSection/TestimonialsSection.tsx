import { Star } from 'lucide-react'
import type { CSSProperties } from 'react'
import { TESTIMONIALS } from '../../../data/testimonials'
import { useInView } from '../../../hooks/useInView'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'
import styles from './TestimonialsSection.module.css'

const STAR_COUNT = 5

function TestimonialCard({ testimonial, index }: { testimonial: (typeof TESTIMONIALS)[number]; index: number }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  // triggerOnce: false — l'avis doit rejouer son entrée à chaque fois qu'il
  // redevient visible (montée ou descente), et revenir à son état initial
  // dès qu'il quitte complètement le viewport.
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15, triggerOnce: false })
  const revealed = prefersReducedMotion || isInView

  return (
    <article
      ref={ref}
      className={styles.card}
      data-direction={testimonial.direction}
      data-state={revealed ? 'revealed' : 'idle'}
      data-motion={prefersReducedMotion ? 'reduced' : 'full'}
      style={{ '--testimonial-index': index } as CSSProperties}
    >
      <div className={styles.stars} role="img" aria-label="5 étoiles sur 5">
        {Array.from({ length: STAR_COUNT }, (_, starIndex) => (
          <Star
            key={starIndex}
            aria-hidden="true"
            className={styles.star}
            style={{ '--star-index': starIndex } as CSSProperties}
            fill="currentColor"
          />
        ))}
      </div>
      <p className={styles.text}>« {testimonial.text} »</p>
      <p className={styles.author}>
        {testimonial.author}
        <span className={styles.context}>{testimonial.context}</span>
      </p>
    </article>
  )
}

export function TestimonialsSection() {
  return (
    <section className={styles.section} id="avis" aria-labelledby="avis-title">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>ILS ONT PRIS LE DÉPART</p>
        <h2 id="avis-title" className={styles.title}>
          Des expériences qui donnent envie d’aller plus loin.
        </h2>
        <p className={styles.intro}>
          Un réglage retrouvé, une première immersion ou le plaisir de prendre enfin la barre : ce sont ces
          réussites concrètes qui font vivre Vélocéan.
        </p>

        <div className={styles.grid}>
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={testimonial.author} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
