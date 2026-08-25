import { useEffect, useRef, type RefObject } from 'react'

/**
 * Calcule une progression déterministe [0, 1] à partir de la position de
 * `sectionRef` : 0 tant que le haut de la section n'a pas atteint le haut du
 * viewport, 1 une fois la hauteur « sticky » entièrement consommée par le
 * scroll. Purement fonction de la position au moment du calcul — remonter
 * ou redescendre rejoue donc naturellement la même courbe en sens inverse,
 * sans timeline ni état séparés.
 *
 * Écoute passive du scroll/resize, calcul regroupé dans un seul
 * requestAnimationFrame par tick pour éviter le travail redondant, nettoyage
 * complet au démontage. La progression est exposée via une ref (jamais un
 * state) pour qu'aucun re-render React ne soit déclenché par le scroll :
 * `useFrame` côté 3D et `onProgress` côté DOM (texte) la consomment
 * directement à chaque frame.
 */
export function useSectionScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onProgress?: (progress: number) => void,
): RefObject<number> {
  const progressRef = useRef(0)
  const rafHandleRef = useRef<number | null>(null)
  const onProgressRef = useRef(onProgress)

  // Garde la dernière callback à jour sans jamais muter de ref pendant le
  // rendu (interdit par les règles react-hooks) : l'effet s'exécute après
  // chaque rendu, avant tout scroll/frame suivant.
  useEffect(() => {
    onProgressRef.current = onProgress
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    const section = sectionRef.current
    if (!section) {
      return
    }

    const computeProgress = () => {
      const rect = section.getBoundingClientRect()
      const scrollableDistance = rect.height - window.innerHeight
      let next: number
      if (scrollableDistance > 0) {
        next = -rect.top / scrollableDistance
      } else {
        next = rect.top <= 0 ? 1 : 0
      }
      next = Math.min(1, Math.max(0, next))
      progressRef.current = next
      onProgressRef.current?.(next)
    }

    const scheduleUpdate = () => {
      if (rafHandleRef.current !== null) {
        return
      }
      rafHandleRef.current = window.requestAnimationFrame(() => {
        rafHandleRef.current = null
        computeProgress()
      })
    }

    computeProgress()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (rafHandleRef.current !== null) {
        window.cancelAnimationFrame(rafHandleRef.current)
        rafHandleRef.current = null
      }
    }
  }, [enabled, sectionRef])

  return progressRef
}
