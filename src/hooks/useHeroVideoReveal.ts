import { useEffect, useRef, useState } from 'react'

/**
 * Seconde de lecture vidéo à partir de laquelle la navbar doit apparaître.
 * Source de vérité : le temps de lecture réel de la vidéo (currentTime),
 * pas un minuteur déclenché au montage.
 */
export const NAV_REVEAL_SECONDS = 3

/**
 * Filet de sécurité : si la vidéo échoue ou reste bloquée avant d'atteindre
 * NAV_REVEAL_SECONDS, la navigation est révélée quand même après ce délai.
 */
const FALLBACK_REVEAL_DELAY_MS = 7500

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number
  cancelVideoFrameCallback?: (handle: number) => void
}

interface UseHeroVideoRevealResult {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isRevealed: boolean
}

/**
 * Pilote la révélation de la navbar cinétique en fonction de la lecture
 * réelle de la hero vidéo. Se déclenche une seule fois, dès que
 * currentTime >= NAV_REVEAL_SECONDS, avec repli sur requestVideoFrameCallback
 * quand il est disponible, et un filet de sécurité temporel + sur erreur.
 * Ne provoque aucun rendu React tant que le seuil n'est pas franchi.
 */
export function useHeroVideoReveal(): UseHeroVideoRevealResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const revealedRef = useRef(false)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const reveal = () => {
      if (revealedRef.current) {
        return
      }
      revealedRef.current = true
      setIsRevealed(true)
    }

    // Avec prefers-reduced-motion, la navigation doit être immédiatement
    // disponible : la vidéo n'est jamais requise pour y accéder.
    if (prefersReducedMotion) {
      reveal()
      return
    }

    const fallbackTimer = window.setTimeout(reveal, FALLBACK_REVEAL_DELAY_MS)
    const video = videoRef.current

    if (!video) {
      return () => window.clearTimeout(fallbackTimer)
    }

    const checkProgress = () => {
      if (!revealedRef.current && video.currentTime >= NAV_REVEAL_SECONDS) {
        reveal()
      }
    }

    const handleError = () => reveal()

    video.addEventListener('timeupdate', checkProgress)
    video.addEventListener('error', handleError)

    let frameHandle: number | null = null
    const videoWithFrameCallback = video as VideoWithFrameCallback

    if (typeof videoWithFrameCallback.requestVideoFrameCallback === 'function') {
      const onFrame = () => {
        checkProgress()
        if (!revealedRef.current) {
          frameHandle =
            videoWithFrameCallback.requestVideoFrameCallback?.(onFrame) ?? null
        }
      }
      frameHandle = videoWithFrameCallback.requestVideoFrameCallback(onFrame)
    }

    return () => {
      window.clearTimeout(fallbackTimer)
      video.removeEventListener('timeupdate', checkProgress)
      video.removeEventListener('error', handleError)
      if (frameHandle !== null) {
        videoWithFrameCallback.cancelVideoFrameCallback?.(frameHandle)
      }
    }
  }, [])

  return { videoRef, isRevealed }
}
