import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { Menu, X } from 'lucide-react'
import { NAVIGATION_ITEMS } from '../../../data/navigation'
import { useScrollThreshold } from '../../../hooks/useScrollThreshold'
import styles from './Header.module.css'

/** Seuil de scroll, en pixels, à partir duquel la navbar passe en état compact. */
const SCROLL_COMPACT_THRESHOLD_PX = 24

interface HeaderProps {
  /** true dès que la révélation synchronisée (ou son filet de secours) a eu lieu. */
  isRevealed: boolean
}

export function Header({ isRevealed }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null)
  const panelId = useId()
  const isScrolled = useScrollThreshold(SCROLL_COMPACT_THRESHOLD_PX)

  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    firstMobileLinkRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    const menuButton = menuButtonRef.current

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      menuButton?.focus()
    }
  }, [isMenuOpen])

  const revealState = isRevealed ? 'revealed' : 'hidden'

  return (
    <header
      className={styles.header}
      data-scrolled={isScrolled}
      inert={!isRevealed}
    >
      <div className={styles.bar}>
        <nav
          className={styles.desktopNav}
          aria-label="Navigation principale"
          data-state={revealState}
        >
          <ul className={styles.navList}>
            {NAVIGATION_ITEMS.map((item, index) => (
              <li
                key={item.href}
                className={styles.navItem}
                data-nav-key={item.href.slice(1)}
                style={{ '--nav-index': index } as CSSProperties}
              >
                <a href={item.href} className={styles.navLink}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuToggle}
          data-state={revealState}
          aria-expanded={isMenuOpen}
          aria-controls={panelId}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <Menu aria-hidden="true" className={styles.menuIcon} />
          <span>Menu</span>
        </button>
      </div>

      <div
        id={panelId}
        className={styles.mobilePanel}
        data-open={isMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={closeMenu}
          aria-label="Fermer le menu"
        >
          <X aria-hidden="true" />
        </button>
        <ul className={styles.mobileList}>
          {NAVIGATION_ITEMS.map((item, index) => (
            <li key={item.href} data-nav-key={item.href.slice(1)}>
              <a
                href={item.href}
                className={styles.mobileLink}
                ref={index === 0 ? firstMobileLinkRef : undefined}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
