import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HeroSection } from './HeroSection'

function HeroSectionHarness() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  return <HeroSection videoRef={videoRef} />
}

describe('HeroSection', () => {
  it('utilise public/videos/velocean.mp4 via import.meta.env.BASE_URL', () => {
    render(<HeroSectionHarness />)
    const videoEl = document.querySelector('video')
    expect(videoEl).not.toBeNull()
    expect(videoEl?.getAttribute('src')).toBe(
      `${import.meta.env.BASE_URL}videos/velocean.mp4`,
    )
  })

  it('active autoplay, muted et playsInline, sans controls ni loop', () => {
    render(<HeroSectionHarness />)
    const video = document.querySelector('video') as HTMLVideoElement

    expect(video.autoplay).toBe(true)
    expect(video.muted).toBe(true)
    expect(video.playsInline).toBe(true)
    expect(video.hasAttribute('controls')).toBe(false)
    expect(video.loop).toBe(false)
  })

  it('rend la vidéo non focusable et décorative', () => {
    render(<HeroSectionHarness />)
    const video = document.querySelector('video') as HTMLVideoElement

    expect(video.getAttribute('tabindex')).toBe('-1')
    expect(video.getAttribute('aria-hidden')).toBe('true')
  })

  it('conserve un H1 accessible « Vélocéan — De la route aux abysses »', () => {
    render(<HeroSectionHarness />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Vélocéan — De la route aux abysses',
      }),
    ).toBeInTheDocument()
  })

  it("ne remet jamais currentTime à zéro lorsque la vidéo atteint sa fin", () => {
    render(<HeroSectionHarness />)
    const video = document.querySelector('video') as HTMLVideoElement

    Object.defineProperty(video, 'currentTime', {
      configurable: true,
      value: 42,
    })

    fireEvent(video, new Event('ended'))

    expect(video.currentTime).toBe(42)
    expect(video.loop).toBe(false)
  })
})
