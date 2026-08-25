import { useEffect, useState } from 'react'

/**
 * Retourne true dès que window.scrollY dépasse thresholdPx. Utilisé pour
 * faire passer la navbar dans son état compact après quelques pixels de
 * scroll, sans dépendre de la longueur des futures sections.
 */
export function useScrollThreshold(thresholdPx: number): boolean {
  const [isPastThreshold, setIsPastThreshold] = useState(
    () => typeof window !== 'undefined' && window.scrollY > thresholdPx,
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsPastThreshold(window.scrollY > thresholdPx)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [thresholdPx])

  return isPastThreshold
}
