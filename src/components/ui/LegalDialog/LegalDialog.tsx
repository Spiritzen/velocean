import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { LegalDocument } from '../../../data/legalContent'
import styles from './LegalDialog.module.css'

interface LegalDialogProps {
  readonly document: LegalDocument | null
  readonly onClose: () => void
}

/**
 * `<dialog>` natif : gestion de la fermeture au Escape, du piège de focus et
 * de la restitution du focus déjà prises en charge par le navigateur —
 * aucune bibliothèque de dialog nécessaire.
 */
export function LegalDialog({ document: doc, onClose }: LegalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }
    if (doc && !dialog.open) {
      dialog.showModal()
    } else if (!doc && dialog.open) {
      dialog.close()
    }
  }, [doc])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="legal-dialog-title"
      onClose={onClose}
      onCancel={onClose}
    >
      {doc && (
        <>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer">
            <X aria-hidden="true" />
          </button>
          <h2 id="legal-dialog-title" className={styles.title}>
            {doc.title}
          </h2>
          {doc.paragraphs.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </>
      )}
    </dialog>
  )
}
