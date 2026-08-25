import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Polices auto-hébergées (Fontsource) — import unique du socle.
import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/barlow-condensed/600-italic.css'
import '@fontsource-variable/dm-sans'

import './styles/globals.css'
import { App } from './app/App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Élément racine "#root" introuvable.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
