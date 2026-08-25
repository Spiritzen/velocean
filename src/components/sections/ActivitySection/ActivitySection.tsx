import { Check } from 'lucide-react'
import type { ActivityContent } from '../../../data/activities'
import { publicAsset } from '../../../lib/publicAsset'
import { useInView } from '../../../hooks/useInView'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'
import styles from './ActivitySection.module.css'

interface ActivitySectionProps {
  readonly activity: ActivityContent
}

/**
 * Composant unique et réutilisé pour les quatre sections métier (vélo,
 * plongée, nautisme, permis bateau) : la variété visuelle vient des données
 * (thème de fond, côté de l'image, contenu) et non de quatre implémentations
 * séparées — évite la répétition de « cartes » identiques tout en gardant
 * une seule structure à maintenir.
 */
export function ActivitySection({ activity }: ActivitySectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
  const revealed = prefersReducedMotion || isInView

  return (
    <section
      ref={ref}
      id={activity.id}
      className={styles.section}
      data-theme={activity.theme}
      aria-labelledby={`${activity.id}-title`}
    >
      <div
        className={styles.inner}
        data-image-side={activity.imageSide}
        data-state={revealed ? 'revealed' : 'idle'}
        data-motion={prefersReducedMotion ? 'reduced' : 'full'}
      >
        <div className={styles.media}>
          <span className={styles.number} aria-hidden="true">
            {activity.number}
          </span>
          <figure
            className={styles.figure}
            style={{ aspectRatio: `${activity.imageWidth} / ${activity.imageHeight}` }}
          >
            <img
              className={styles.image}
              src={publicAsset(activity.imageSrc)}
              alt={activity.imageAlt}
              width={activity.imageWidth}
              height={activity.imageHeight}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow}>{activity.eyebrow}</p>
          <h2 id={`${activity.id}-title`} className={styles.title}>
            {activity.title}
          </h2>
          <p className={styles.paragraph}>{activity.paragraph}</p>

          <ul className={styles.proofs}>
            {activity.proofs.map((proof) => (
              <li key={proof} className={styles.proof}>
                <Check aria-hidden="true" className={styles.proofIcon} />
                <span>{proof}</span>
              </li>
            ))}
          </ul>

          <p className={styles.secondary}>{activity.secondaryPhrase}</p>
          {activity.priceNote && <p className={styles.priceNote}>{activity.priceNote}</p>}

          <a href="#contact" className={styles.cta}>
            {activity.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
