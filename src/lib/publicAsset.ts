/**
 * Construit l'URL d'un fichier servi depuis `public/` en respectant le
 * `base` Vite (`import.meta.env.BASE_URL`) : un chemin codé en dur comme
 * `/images/x.webp` casserait le site une fois déployé sous un sous-chemin
 * (ex. GitHub Pages, `/velocean/`).
 */
export function publicAsset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
