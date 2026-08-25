import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { NAV_REVEAL_SECONDS, useHeroVideoReveal } from './useHeroVideoReveal'

function Harness() {
  const { videoRef, isRevealed } = useHeroVideoReveal()
  return (
    <>
      <video ref={videoRef} data-testid="video" />
      <span data-testid="revealed">{String(isRevealed)}</span>
    </>
  )
}

function setCurrentTime(video: HTMLVideoElement, seconds: number) {
  Object.defineProperty(video, 'currentTime', {
    configurable: true,
    value: seconds,
  })
}

function mockMatchMedia(matches: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

describe('useHeroVideoReveal', () => {
  beforeEach(() => {
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ne révèle pas la navigation avant le seuil de révélation', () => {
    render(<Harness />)
    const video = screen.getByTestId('video') as HTMLVideoElement
    setCurrentTime(video, NAV_REVEAL_SECONDS - 1)
    fireEvent.timeUpdate(video)

    expect(screen.getByTestId('revealed').textContent).toBe('false')
  })

  it('révèle la navigation dès que currentTime atteint le seuil de révélation', () => {
    render(<Harness />)
    const video = screen.getByTestId('video') as HTMLVideoElement
    setCurrentTime(video, NAV_REVEAL_SECONDS)
    fireEvent.timeUpdate(video)

    expect(screen.getByTestId('revealed').textContent).toBe('true')
  })

  it('ne redéclenche pas la révélation sur les timeupdate suivants', () => {
    render(<Harness />)
    const video = screen.getByTestId('video') as HTMLVideoElement

    setCurrentTime(video, NAV_REVEAL_SECONDS)
    fireEvent.timeUpdate(video)
    expect(screen.getByTestId('revealed').textContent).toBe('true')

    setCurrentTime(video, NAV_REVEAL_SECONDS + 4)
    fireEvent.timeUpdate(video)
    expect(screen.getByTestId('revealed').textContent).toBe('true')
  })

  it("révèle immédiatement la navigation sur l'événement error", () => {
    render(<Harness />)
    const video = screen.getByTestId('video') as HTMLVideoElement

    setCurrentTime(video, 0)
    fireEvent.error(video)

    expect(screen.getByTestId('revealed').textContent).toBe('true')
  })

  it('révèle la navigation via le filet de secours si la vidéo reste bloquée', () => {
    vi.useFakeTimers()
    render(<Harness />)

    expect(screen.getByTestId('revealed').textContent).toBe('false')

    act(() => {
      vi.advanceTimersByTime(7500)
    })

    expect(screen.getByTestId('revealed').textContent).toBe('true')
  })

  it('révèle immédiatement la navigation avec prefers-reduced-motion', () => {
    mockMatchMedia(true)
    render(<Harness />)

    expect(screen.getByTestId('revealed').textContent).toBe('true')
  })

  it('nettoie ses listeners au démontage sans erreur', () => {
    const { unmount } = render(<Harness />)
    expect(() => unmount()).not.toThrow()
  })
})
