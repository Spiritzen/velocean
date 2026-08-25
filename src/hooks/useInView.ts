import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  /** Fraction de l'élément visible avant de déclencher (0 à 1). */
  readonly threshold?: number
  readonly rootMargin?: string
  /**
   * true (par défaut) : une fois entré dans le viewport, reste `true` pour
   * toujours (usage : révélation ponctuelle d'une section). false : bascule
   * à chaque entrée/sortie complète du viewport (usage : animation qui doit
   * se rejouer, comme les avis clients).
   */
  readonly triggerOnce?: boolean
}

/**
 * Hook générique de révélation au scroll basé sur `IntersectionObserver`.
 * Nettoie systématiquement l'observer au démontage (et à chaque changement
 * de cible/options).
 */
export function useInView<T extends Element>(
  options: UseInViewOptions = {},
): { ref: (node: T | null) => void; isInView: boolean } {
  const { threshold = 0.2, rootMargin = '0px', triggerOnce = true } = options

  const [isInView, setIsInView] = useState(false)
  const nodeRef = useRef<T | null>(null)
  const hasTriggeredRef = useRef(false)

  // Callback ref plutôt que useRef+useEffect(deps: []) : garantit que
  // l'observer est (re)créé dès que le nœud DOM réel est disponible, y
  // compris si le composant est remonté.
  const [node, setNode] = useState<T | null>(null)

  const setRef = (value: T | null) => {
    nodeRef.current = value
    setNode(value)
  }

  useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) {
          return
        }
        if (entry.isIntersecting) {
          hasTriggeredRef.current = true
          setIsInView(true)
        } else if (!triggerOnce) {
          setIsInView(false)
        } else if (!hasTriggeredRef.current) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node, threshold, rootMargin, triggerOnce])

  return { ref: setRef, isInView }
}
