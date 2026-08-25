import { useState } from 'react'
import { InstagramIcon } from '../../icons/InstagramIcon'
import { LegalDialog } from '../../ui/LegalDialog/LegalDialog'
import { LEGAL_DOCUMENTS, type LegalDocument } from '../../../data/legalContent'
import { NAVIGATION_ITEMS } from '../../../data/navigation'
import styles from './Footer.module.css'

const INSTAGRAM_URL = 'https://www.instagram.com/velocean_fr/'

const ACTIVITY_LINKS = NAVIGATION_ITEMS.filter(
  (item) => item.href !== '#notre-passion' && item.href !== '#contact',
)

export function Footer() {
  const [openDocument, setOpenDocument] = useState<LegalDocument | null>(null)
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.signature}>Vélocéan</p>
          <p className={styles.baseline}>DE LA ROUTE AUX ABYSSES</p>
        </div>

        <nav className={styles.activities} aria-label="Activités Vélocéan">
          <ul className={styles.list}>
            {ACTIVITY_LINKS.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.legal} aria-label="Informations légales">
          <ul className={styles.list}>
            <li>
              <a href="#contact">Contact</a>
            </li>
            {LEGAL_DOCUMENTS.map((doc) => (
              <li key={doc.id}>
                <button type="button" className={styles.legalButton} onClick={() => setOpenDocument(doc)}>
                  {doc.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <a
          className={styles.instagram}
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Vélocéan sur Instagram"
        >
          <InstagramIcon className={styles.instagramIcon} />
        </a>
      </div>

      <p className={styles.copyright}>© {year} Vélocéan — démonstrateur, tous droits réservés.</p>

      <LegalDialog document={openDocument} onClose={() => setOpenDocument(null)} />
    </footer>
  )
}
