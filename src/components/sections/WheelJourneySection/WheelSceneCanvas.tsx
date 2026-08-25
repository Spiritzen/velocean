import { Suspense } from 'react'
import type { RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { WheelScene } from './WheelScene'
import { CAMERA_DISTANCE, CAMERA_FOV_DEG } from './journeyMath'

interface WheelSceneCanvasProps {
  journeyPhaseRef: RefObject<number>
  /** false en prefers-reduced-motion : la roue reste statique, trois-quarts, sans traversée ni rotation. */
  animate: boolean
  antialias: boolean
}

/**
 * Regroupe tout ce qui dépend de three.js / @react-three/fiber dans un
 * module à part, chargé via `React.lazy` depuis WheelJourneySection : le
 * hero (et le reste du bundle initial) n'attend jamais ce code, demandé
 * seulement à l'approche de la section.
 */
export default function WheelSceneCanvas({ journeyPhaseRef, animate, antialias }: WheelSceneCanvasProps) {
  return (
    <Canvas
      camera={{ fov: CAMERA_FOV_DEG, position: [0, 0, CAMERA_DISTANCE], near: 0.1, far: 50 }}
      gl={{
        antialias,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <WheelScene journeyPhaseRef={journeyPhaseRef} animate={animate} />
      </Suspense>
    </Canvas>
  )
}
