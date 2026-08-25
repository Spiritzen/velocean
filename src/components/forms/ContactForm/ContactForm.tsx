import { useId, useRef, useState, type FocusEvent, type FormEvent } from 'react'
import { buildContactMailto } from '../../../lib/buildContactMailto'
import styles from './ContactForm.module.css'

const SUBJECT_OPTIONS = ['Vélo', 'Plongée', 'Nautisme', 'Permis bateau', 'Autre'] as const
const MAILTO_HELP_TEXT = 'Votre messagerie va s’ouvrir pour finaliser l’envoi.'
type FieldName = 'name' | 'email' | 'subject' | 'message'

/**
 * Formulaire de contact sans backend : à la soumission, construit un lien
 * `mailto:` (voir `buildContactMailto`, fonction pure testée séparément) et
 * ouvre la messagerie du visiteur. Ne prétend jamais effectuer un envoi
 * réseau réussi — aucun serveur n'existe pour le recevoir.
 */
export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  // Un champ n'affiche son état invalide qu'après y avoir touché (blur) ou
  // après une tentative d'envoi : sans ce suivi, `:invalid` seul colorerait
  // tous les champs requis en rouge dès le chargement de la page, avant même
  // que le visiteur n'ait commencé à écrire quoi que ce soit.
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})

  const nameId = useId()
  const emailId = useId()
  const subjectId = useId()
  const messageId = useId()
  const helpId = useId()

  const markTouched = (field: FieldName) => (event: FocusEvent) => {
    void event
    setTouched((previous) => (previous[field] ? previous : { ...previous, [field]: true }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = formRef.current
    if (!form) {
      return
    }

    if (!form.checkValidity()) {
      // Déclenche l'UI de validation native du navigateur (accessible,
      // annoncée par les lecteurs d'écran) sans état d'erreur maison, et
      // révèle le contour rouge sur tous les champs concernés.
      setTouched({ name: true, email: true, subject: true, message: true })
      form.reportValidity()
      return
    }

    const data = new FormData(form)
    const mailto = buildContactMailto({
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      subject: String(data.get('subject') ?? ''),
      message: String(data.get('message') ?? ''),
    })

    window.location.href = mailto
  }

  return (
    <form ref={formRef} className={styles.form} noValidate={false} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={nameId}>
          Nom
        </label>
        <input
          className={styles.input}
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          required
          data-touched={touched.name ? 'true' : undefined}
          onBlur={markTouched('name')}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={emailId}>
          Email
        </label>
        <input
          className={styles.input}
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          data-touched={touched.email ? 'true' : undefined}
          onBlur={markTouched('email')}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={subjectId}>
          Sujet / activité
        </label>
        <select
          className={styles.input}
          id={subjectId}
          name="subject"
          defaultValue=""
          required
          data-touched={touched.subject ? 'true' : undefined}
          onBlur={markTouched('subject')}
        >
          <option value="" disabled>
            Choisir une activité
          </option>
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={messageId}>
          Message
        </label>
        <textarea
          className={styles.textarea}
          id={messageId}
          name="message"
          rows={5}
          required
          data-touched={touched.message ? 'true' : undefined}
          onBlur={markTouched('message')}
        />
      </div>

      <p id={helpId} className={styles.help} aria-live="polite">
        {MAILTO_HELP_TEXT}
      </p>

      <button type="submit" className={styles.submit} aria-describedby={helpId}>
        ENVOYER LE MESSAGE
      </button>
    </form>
  )
}
