/**
 * Détection synchrone et défensive du support WebGL. Utilisée pour ne
 * jamais monter le Canvas R3F sur un device/navigateur qui ne pourrait pas
 * créer de contexte GL — la section et ses textes restent affichés dans
 * tous les cas (voir WheelJourneySection).
 */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  try {
    const canvas = document.createElement('canvas')
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')
    return Boolean(context)
  } catch {
    return false
  }
}
