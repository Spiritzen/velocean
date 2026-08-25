/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Déploiement prévu sur GitHub Pages en tant que projet, servi depuis
  // https://spiritzen.github.io/velocean/ (et non à la racine du domaine) :
  // `base` doit donc correspondre au nom du dépôt. `import.meta.env.BASE_URL`
  // en hérite automatiquement (voir `src/lib/publicAsset.ts` et les URLs de
  // la vidéo/du modèle 3D, déjà construites via cette variable).
  base: '/velocean/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
    css: true,
  },
})
