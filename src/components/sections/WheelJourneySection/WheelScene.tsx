import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import * as THREE from 'three'
import {
  CAMERA_DISTANCE,
  CAMERA_FOV_DEG,
  CONTINUOUS_SPIN_TURNS_PER_SECOND,
  clamp01,
  computeApproachProximity,
  computeApproachScaleMultiplier,
  computeTransitExtraRotation,
  computeWheelYRotation,
  getJourneyEndFraction,
  getJourneyStartFraction,
  getJourneyTier,
  getJourneyTierConfig,
} from './journeyMath'
import { WJ_COLOR_ABYSSES, WJ_COLOR_ECUME, WJ_COLOR_KEY_LIGHT, WJ_COLOR_VERT_VELO } from './palette'

const MODEL_URL = `${import.meta.env.BASE_URL}models/bike-wheel.glb`

const RUBBER_MATERIAL_NAME = 'caoutchouxgold'
const METAL_MATERIAL_NAME = 'rmetalMiddle'

const KEY_LIGHT_BASE_INTENSITY = 1.3
/** « Légère hausse de lumière » au pic de l'approche — jamais de bloom. */
const KEY_LIGHT_PROXIMITY_BOOST = 0.3

interface WheelSceneProps {
  journeyPhaseRef: RefObject<number>
  /** false en prefers-reduced-motion : pose figée (phase 0, trois-quarts), aucune rotation. */
  animate: boolean
}

/**
 * Centre et normalise le modèle chargé via sa bounding box (rayon de la
 * sphère englobante ramené à 1 unité monde), puis ajuste les deux matériaux
 * bakés selon la spec DA. Ne modifie pas les deux autres matériaux du GLB.
 */
function prepareWheelRoot(gltfScene: THREE.Object3D): THREE.Object3D {
  const scene = gltfScene.clone(true)

  const box = new THREE.Box3().setFromObject(scene)
  const center = box.getCenter(new THREE.Vector3())
  scene.position.sub(center)

  const sphere = box.getBoundingSphere(new THREE.Sphere())
  const normalizationScale = sphere.radius > 0 ? 1 / sphere.radius : 1
  scene.scale.setScalar(normalizationScale)

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return
    }
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) {
        continue
      }
      if (material.name === RUBBER_MATERIAL_NAME) {
        material.metalness = 0
        material.roughness = 0.8
      } else if (material.name === METAL_MATERIAL_NAME) {
        material.metalness = 0.8
        material.roughness = 0.4
      }
    }
  })

  return scene
}

export function WheelScene({ journeyPhaseRef, animate }: WheelSceneProps) {
  const gltf = useLoader(GLTFLoader, MODEL_URL)
  const { size, gl, scene } = useThree()

  const wheelRoot = useMemo(() => prepareWheelRoot(gltf.scene), [gltf])

  // Environnement procédural léger (aucun asset distant) : les bakes de
  // couleur du GLB n'ont pas de lumière propre, et le matériau métallique
  // (metalness ≈ 0.8) a besoin d'un environnement pour ne pas rester noir.
  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl)
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    // `scene` est l'objet three.js impératif exposé par useThree (pas un
    // state React) : lui assigner `.environment` est l'API standard de
    // three.js/R3F pour brancher un environnement PMREM, pas une mutation
    // interdite de valeur React.
    // eslint-disable-next-line react-hooks/immutability
    scene.environment = envTexture
    return () => {
      envTexture.dispose()
      pmremGenerator.dispose()
      scene.environment = null
    }
  }, [gl, scene])

  const tier = getJourneyTier(size.width)
  const config = getJourneyTierConfig(tier)

  const { startWorld, endWorld, pxPerWorldUnit } = useMemo(() => {
    const fovRad = THREE.MathUtils.degToRad(CAMERA_FOV_DEG)
    const worldHeightAtDepth = 2 * Math.tan(fovRad / 2) * CAMERA_DISTANCE
    const unitsPerPixel = size.height > 0 ? worldHeightAtDepth / size.height : 0
    const start = getJourneyStartFraction(config)
    const end = getJourneyEndFraction(config)
    const toWorld = (fraction: { x: number; y: number }) =>
      new THREE.Vector2(fraction.x * size.width * unitsPerPixel, fraction.y * size.height * unitsPerPixel)
    return {
      startWorld: toWorld(start),
      endWorld: toWorld(end),
      pxPerWorldUnit: unitsPerPixel > 0 ? 1 / unitsPerPixel : 0,
    }
  }, [config, size.width, size.height])

  const wheelWorldRadius = useMemo(() => {
    if (pxPerWorldUnit <= 0) {
      return 1
    }
    const diameterPx = config.wheelDiameterRatio * size.width
    return diameterPx / 2 / pxPerWorldUnit
  }, [config, size.width, pxPerWorldUnit])

  const outerGroupRef = useRef<THREE.Group>(null)
  const wheelGroupRef = useRef<THREE.Group>(null)
  const keyLightRef = useRef<THREE.DirectionalLight>(null)

  useFrame((state) => {
    const outer = outerGroupRef.current
    const wheel = wheelGroupRef.current
    if (!outer || !wheel) {
      return
    }

    // En prefers-reduced-motion, la phase reste figée à 0 (état A, pose
    // trois-quarts de repos) et aucune rotation temporelle n'est appliquée :
    // ni traversée automatique, ni rotation continue.
    const phase = animate ? clamp01(journeyPhaseRef.current ?? 0) : 0

    // En mode statique, centrer plutôt que se caler sur la position de
    // repos A : la boîte statique (46svh, pleine largeur) a un rapport
    // largeur/hauteur très différent de la scène plein écran, et une
    // position fortement décentrée y paraîtrait déformée par la
    // perspective. Centrée, la pose trois-quarts reste propre quel que
    // soit le format de la boîte.
    outer.position.set(
      animate ? THREE.MathUtils.lerp(startWorld.x, endWorld.x, phase) : 0,
      animate ? THREE.MathUtils.lerp(startWorld.y, endWorld.y, phase) : 0,
      0,
    )

    // Effet d'approche : la roue grossit vers la caméra puis repart dans la
    // profondeur, pic exactement au milieu de la traversée, retour exact à
    // l'échelle de repos aux deux extrémités.
    const proximity = computeApproachProximity(phase)
    const scaleMultiplier = computeApproachScaleMultiplier(phase, config.peakScale)
    outer.scale.setScalar(wheelWorldRadius * scaleMultiplier)

    // Jamais face caméra : trois-quarts aux deux repos, balayage à travers
    // un point plus proche du profil (jamais illisible) au milieu.
    outer.rotation.y = computeWheelYRotation(phase)

    // Roulement = rotation continue de repos (jamais statique, ~0.4 tour/s)
    // + rotation supplémentaire due au trajet lui-même (réversible avec la
    // phase, ~4 tours sur une traversée complète). Aucune des deux en mode
    // statique (reduced motion).
    const continuousSpin = animate
      ? state.clock.elapsedTime * CONTINUOUS_SPIN_TURNS_PER_SECOND * Math.PI * 2
      : 0
    wheel.rotation.x = continuousSpin + computeTransitExtraRotation(phase)

    // Légère hausse de lumière au pic de l'approche — pas de bloom/néon.
    const keyLight = keyLightRef.current
    if (keyLight) {
      keyLight.intensity = KEY_LIGHT_BASE_INTENSITY * (1 + KEY_LIGHT_PROXIMITY_BOOST * (animate ? proximity : 0))
    }
  })

  return (
    <>
      {/* Fill douce, tonalité écume → abysses cohérente avec le décor. */}
      <hemisphereLight args={[WJ_COLOR_ECUME, WJ_COLOR_ABYSSES, 0.55]} />
      {/* Key froide. */}
      <directionalLight ref={keyLightRef} color={WJ_COLOR_KEY_LIGHT} intensity={KEY_LIGHT_BASE_INTENSITY} position={[2.6, 3.2, 4.2]} />
      {/* Rim bleu/vert très mesuré, pour détacher la roue du fond marine. */}
      <directionalLight color={WJ_COLOR_VERT_VELO} intensity={0.35} position={[-3, -0.8, -2.6]} />
      <group ref={outerGroupRef}>
        <group ref={wheelGroupRef}>
          <primitive object={wheelRoot} />
        </group>
      </group>
    </>
  )
}
