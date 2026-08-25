import { Component, type ReactNode } from 'react'

interface SceneErrorBoundaryProps {
  children: ReactNode
}

interface SceneErrorBoundaryState {
  hasError: boolean
}

/**
 * Isole les échecs de la scène 3D (GLB introuvable/corrompu, perte de
 * contexte WebGL, etc.) pour qu'ils ne fassent jamais tomber le reste de la
 * page : la section et ses deux blocs éditoriaux, rendus en dehors de cette
 * frontière, restent affichés. @react-three/fiber capture déjà les erreurs
 * internes à la scène three.js et les relance vers l'arbre React englobant,
 * ce que cette frontière attrape ici.
 */
export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown): void {
    if (import.meta.env.DEV) {
      console.warn('[WheelJourneySection] scène 3D indisponible :', error)
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}
