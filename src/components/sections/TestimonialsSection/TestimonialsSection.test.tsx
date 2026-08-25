import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { TestimonialsSection } from './TestimonialsSection'
import { TESTIMONIALS } from '../../../data/testimonials'

type ObserverCallback = (entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: ObserverCallback
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()

  constructor(callback: ObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  trigger(isIntersecting: boolean) {
    act(() => {
      this.callback([{ isIntersecting }])
    })
  }
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

describe('TestimonialsSection', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockMatchMedia(false)
  })

  it('affiche les trois avis, leurs auteurs/contextes et une note accessible « 5 étoiles sur 5 »', () => {
    render(<TestimonialsSection />)

    for (const testimonial of TESTIMONIALS) {
      expect(screen.getByText(testimonial.author)).toBeInTheDocument()
      expect(screen.getByText(testimonial.context)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(testimonial.text.slice(0, 20)))).toBeInTheDocument()
    }

    const ratings = screen.getAllByRole('img', { name: '5 étoiles sur 5' })
    expect(ratings).toHaveLength(3)
  })

  it('révèle une carte quand elle entre dans le viewport, et la réinitialise à la sortie', () => {
    render(<TestimonialsSection />)
    const card = screen.getByText(TESTIMONIALS[0].author).closest('article')
    expect(card).not.toBeNull()
    expect(card).toHaveAttribute('data-state', 'idle')

    const observer = MockIntersectionObserver.instances[0]
    observer.trigger(true)
    expect(card).toHaveAttribute('data-state', 'revealed')

    observer.trigger(false)
    expect(card).toHaveAttribute('data-state', 'idle')
  })

  it('peut rejouer l’animation : ré-entrée après sortie repasse bien à l’état révélé', () => {
    render(<TestimonialsSection />)
    const card = screen.getByText(TESTIMONIALS[1].author).closest('article')
    const observer = MockIntersectionObserver.instances[1]

    observer.trigger(true)
    expect(card).toHaveAttribute('data-state', 'revealed')
    observer.trigger(false)
    expect(card).toHaveAttribute('data-state', 'idle')
    observer.trigger(true)
    expect(card).toHaveAttribute('data-state', 'revealed')
  })

  it('nettoie chaque observer au démontage', () => {
    const { unmount } = render(<TestimonialsSection />)
    const observers = [...MockIntersectionObserver.instances]
    expect(observers.length).toBeGreaterThan(0)
    unmount()
    for (const observer of observers) {
      expect(observer.disconnect).toHaveBeenCalled()
    }
  })

  it('avec prefers-reduced-motion : les avis sont visibles immédiatement (data-motion="reduced")', () => {
    mockMatchMedia(true)
    render(<TestimonialsSection />)
    const card = screen.getByText(TESTIMONIALS[0].author).closest('article')
    expect(card).toHaveAttribute('data-motion', 'reduced')
    expect(card).toHaveAttribute('data-state', 'revealed')
  })
})
