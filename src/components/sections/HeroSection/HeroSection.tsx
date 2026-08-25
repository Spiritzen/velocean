import type { RefObject } from 'react'
import styles from './HeroSection.module.css'

const VIDEO_SRC = `${import.meta.env.BASE_URL}videos/velocean.mp4`

interface HeroSectionProps {
  videoRef: RefObject<HTMLVideoElement | null>
}

export function HeroSection({ videoRef }: HeroSectionProps) {
  return (
    <section className={styles.hero}>
      <video
        ref={videoRef}
        className={styles.video}
        src={VIDEO_SRC}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate nofullscreen"
        tabIndex={-1}
        aria-hidden="true"
      />
      <h1 className="sr-only">Vélocéan — De la route aux abysses</h1>
      <p className="sr-only">L’aventure se vit, s’équipe et se partage.</p>
    </section>
  )
}
