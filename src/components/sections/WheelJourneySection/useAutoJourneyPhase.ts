import { useEffect, useRef, type RefObject } from 'react'
import { computeHysteresisTarget, computeTweenDurationMs, computeTweenValue } from './journeyMath'

interface TweenState {
  readonly startValue: number
  readonly startTime: number
  readonly durationMs: number
  readonly target: 0 | 1
}

const INITIAL_TWEEN: TweenState = { startValue: 0, startTime: 0, durationMs: 0, target: 0 }

/**
 * Anime `journeyPhase` [0, 1] dans le temps, indépendamment du scroll
 * continu : le scroll (via `rawProgressRef`, voir useSectionScrollProgress)
 * ne fait que choisir la destination (0 = état A, 1 = état B) selon un seuil
 * à hystérésis. Une fois la destination choisie, la progression avance
 * seule en `requestAnimationFrame`, avec un easing sportif, même si le
 * scroll s'arrête. Si la destination change en cours de route, la reprise
 * repart sans saut depuis la valeur courante de la phase.
 *
 * Exposé via une ref (jamais un state) pour qu'aucun re-render React ne
 * soit déclenché à chaque frame : `useFrame` côté 3D et `onPhase` côté DOM
 * (texte) la consomment directement.
 */
export function useAutoJourneyPhase(
  rawProgressRef: RefObject<number>,
  enabled: boolean,
  onPhase?: (phase: number) => void,
): RefObject<number> {
  const phaseRef = useRef(0)
  const rafHandleRef = useRef<number | null>(null)
  const tweenRef = useRef<TweenState>(INITIAL_TWEEN)
  const onPhaseRef = useRef(onPhase)

  // Garde la dernière callback à jour sans jamais muter de ref pendant le
  // rendu (interdit par les règles react-hooks).
  useEffect(() => {
    onPhaseRef.current = onPhase
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    const tick = (now: number) => {
      const raw = rawProgressRef.current ?? 0
      const currentTween = tweenRef.current
      const nextTarget = computeHysteresisTarget(currentTween.target, raw)

      if (nextTarget !== currentTween.target) {
        tweenRef.current = {
          startValue: phaseRef.current,
          startTime: now,
          durationMs: computeTweenDurationMs(phaseRef.current, nextTarget),
          target: nextTarget,
        }
      }

      const { startValue, startTime, durationMs, target } = tweenRef.current
      phaseRef.current = computeTweenValue(startValue, target, now - startTime, durationMs)
      onPhaseRef.current?.(phaseRef.current)

      rafHandleRef.current = window.requestAnimationFrame(tick)
    }

    rafHandleRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (rafHandleRef.current !== null) {
        window.cancelAnimationFrame(rafHandleRef.current)
        rafHandleRef.current = null
      }
    }
  }, [enabled, rawProgressRef])

  return phaseRef
}
