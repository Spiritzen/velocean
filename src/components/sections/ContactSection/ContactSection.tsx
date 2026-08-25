import { MapPin } from 'lucide-react'
import { ContactForm } from '../../forms/ContactForm/ContactForm'
import { CONTACT_INFO, OPENING_HOURS, buildDirectionsUrl } from '../../../data/contactInfo'
import styles from './ContactSection.module.css'

export function ContactSection() {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>NOUS TROUVER</p>
          <h2 id="contact-title" className={styles.title}>
            Votre prochaine aventure commence ici.
          </h2>
          <p className={styles.text}>
            Une question sur votre vélo, une plongée, une sortie nautique ou le permis bateau ? Écrivez-nous ou
            passez nous voir : nous prendrons le temps de comprendre votre projet.
          </p>

          <div className={styles.details}>
            <p className={styles.detailName}>{CONTACT_INFO.name}</p>
            <address className={styles.address}>
              {CONTACT_INFO.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <p>
              <a className={styles.link} href={CONTACT_INFO.phoneHref}>
                {CONTACT_INFO.phone}
              </a>
            </p>
            <p>
              <a className={styles.link} href={`mailto:${CONTACT_INFO.email}`}>
                {CONTACT_INFO.email}
              </a>
            </p>

            <dl className={styles.hours}>
              {OPENING_HOURS.map((row) => (
                <div key={row.days} className={styles.hoursRow}>
                  <dt>{row.days}</dt>
                  <dd>{row.hours}</dd>
                </div>
              ))}
            </dl>

            <a
              className={styles.directions}
              href={buildDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin aria-hidden="true" className={styles.directionsIcon} />
              PRÉPARER L’ITINÉRAIRE
            </a>

            <p className={styles.disclaimer}>{CONTACT_INFO.disclaimer}</p>
          </div>
        </div>

        <div className={styles.formWrapper}>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
