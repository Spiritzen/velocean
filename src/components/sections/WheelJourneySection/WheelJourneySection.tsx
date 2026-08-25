import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'
import { useSectionScrollProgress } from './useSectionScrollProgress'
import { useAutoJourneyPhase } from './useAutoJourneyPhase'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import { supportsWebGL } from './supportsWebGL'
import {
  applyTextRevealStyle,
  computeApproachHaloOpacity,
  computeBlock1Style,
  computeBlock2Style,
} from './textReveal'
import { computeApproachProximity } from './journeyMath'
import styles from './WheelJourneySection.module.css'

// three.js / @react-three/fiber (lourds) ne sont demandés qu'à l'approche
// de la section : le hero et le reste du bundle initial ne les attendent
// jamais.
const WheelSceneCanvas = lazy(() => import('./WheelSceneCanvas'))

/** Distance avant/après le viewport à partir de laquelle la scène 3D est montée. */
const NEAR_VIEWPORT_MARGIN = '600px 0px'
/** En dessous de ce seuil, l'antialiasing est désactivé pour préserver les perfs mobiles. */
const SMALL_VIEWPORT_WIDTH_PX = 480

export function WheelJourneySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const block1Ref = useRef<HTMLDivElement>(null)
  const block2Ref = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)

  const prefersReducedMotion = usePrefersReducedMotion()
  const [webglSupported] = useState(() => supportsWebGL())
  const [isSmallViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= SMALL_VIEWPORT_WIDTH_PX,
  )
  // Sans IntersectionObserver (navigateur très ancien), on renonce au gate
  // et on considère la section toujours « proche » dès l'état initial.
  const [isNear, setIsNear] = useState(() => typeof IntersectionObserver === 'undefined')

  // Ne monte (et n'anime) la scène 3D que lorsque la section est proche du
  // viewport — évite tout travail GPU/chargement GLB tant que l'utilisateur
  // n'a pas approché la section, et libère les ressources dès qu'il s'en
  // éloigne dans un sens comme dans l'autre. Ce gate reste actif même en
  // prefers-reduced-motion : la roue y est présentée statique, mais reste
  // demandée à l'approche, pas au premier rendu de la page.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return
    }
    const node = sectionRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setIsNear(entries.some((entry) => entry.isIntersecting))
      },
      { rootMargin: NEAR_VIEWPORT_MARGIN },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const handlePhase = useMemo(
    () => (phase: number) => {
      applyTextRevealStyle(block1Ref.current, computeBlock1Style(phase))
      applyTextRevealStyle(block2Ref.current, computeBlock2Style(phase))
      const halo = haloRef.current
      if (halo) {
        halo.style.opacity = String(computeApproachHaloOpacity(computeApproachProximity(phase)))
      }
    },
    [],
  )

  // Progression brute [0, 1] du scroll — sert uniquement à détecter le seuil
  // (voir useAutoJourneyPhase) : le scroll choisit une destination, il ne
  // pilote plus la traversée image par image.
  const rawProgressRef = useSectionScrollProgress(sectionRef, !prefersReducedMotion)
  const journeyPhaseRef = useAutoJourneyPhase(rawProgressRef, !prefersReducedMotion, handlePhase)

  const shouldMountScene = webglSupported && isNear

  return (
    <section
      ref={sectionRef}
      id="notre-passion"
      className={styles.section}
      data-motion={prefersReducedMotion ? 'reduced' : 'full'}
      aria-label="Le mouvement comme terrain commun"
    >
      <div className={styles.scene}>
        <div ref={haloRef} className={styles.approachHalo} aria-hidden="true" />

        <div ref={block1Ref} className={`${styles.block} ${styles.block1}`}>
          <p className={styles.eyebrow}>DE LA ROUTE AUX ABYSSES</p>
          <h2 className={styles.title}>Le mouvement comme terrain commun.</h2>
          <p className={styles.body}>
            À vélo, sous l’eau ou sur le pont d’un bateau, Vélocéan accompagne celles et ceux
            qui aiment apprendre, progresser et partager. Du premier tour de roue à la
            prochaine aventure, notre équipe vous conseille avec la même exigence.
          </p>
          <p className={styles.signature}>
            VÉLO&nbsp;&nbsp;•&nbsp;&nbsp;PLONGÉE&nbsp;&nbsp;•&nbsp;&nbsp;NAUTISME&nbsp;&nbsp;•&nbsp;&nbsp;PERMIS
            BATEAU
          </p>
        </div>

        <div ref={block2Ref} className={`${styles.block} ${styles.block2}`}>
          <p className={styles.eyebrow}>PASSION TRANSMISE</p>
          <h2 className={styles.title}>Des passionnés au service de vos aventures.</h2>
          <p className={styles.body}>
            Matériel choisi avec soin, conseils nés du terrain, réglages précis et
            accompagnement pour tous les niveaux. Seul, entre amis ou en famille, partez
            équipé, confiant et prêt à profiter.
          </p>
          <p className={styles.signature}>
            CONSEILLER&nbsp;&nbsp;•&nbsp;&nbsp;ÉQUIPER&nbsp;&nbsp;•&nbsp;&nbsp;TRANSMETTRE
          </p>
        </div>

        {/* Au-dessus des blocs : la roue est autorisée à passer devant le
            texte pendant la traversée (profondeur voulue). Décoratif,
            jamais interactif. */}
        <div className={styles.canvasLayer} aria-hidden="true">
          {shouldMountScene && (
            <SceneErrorBoundary>
              <Suspense fallback={null}>
                <WheelSceneCanvas
                  journeyPhaseRef={journeyPhaseRef}
                  animate={!prefersReducedMotion}
                  antialias={!isSmallViewport}
                />
              </Suspense>
            </SceneErrorBoundary>
          )}
        </div>
      </div>
    </section>
  )
}
