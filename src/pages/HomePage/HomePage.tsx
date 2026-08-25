import { Header } from '../../components/layout/Header/Header'
import { Footer } from '../../components/layout/Footer/Footer'
import { HeroSection } from '../../components/sections/HeroSection/HeroSection'
import { WheelJourneySection } from '../../components/sections/WheelJourneySection/WheelJourneySection'
import { ActivitySection } from '../../components/sections/ActivitySection/ActivitySection'
import { TestimonialsSection } from '../../components/sections/TestimonialsSection/TestimonialsSection'
import { ContactSection } from '../../components/sections/ContactSection/ContactSection'
import { ACTIVITIES } from '../../data/activities'
import { useHeroVideoReveal } from '../../hooks/useHeroVideoReveal'
import styles from './HomePage.module.css'

/**
 * Ordre final du site : Hero → Notre passion (3D) → Vélo → Plongée →
 * Nautisme → Permis bateau → Avis → Contact → Footer. Aucun contenu
 * temporaire après la 3D : chaque ancre de navigation cible désormais une
 * vraie section.
 */
export function HomePage() {
  const { videoRef, isRevealed } = useHeroVideoReveal()

  return (
    <div className={styles.page}>
      <Header isRevealed={isRevealed} />
      <main className={styles.main}>
        <HeroSection videoRef={videoRef} />
        <WheelJourneySection />
        {ACTIVITIES.map((activity) => (
          <ActivitySection key={activity.id} activity={activity} />
        ))}
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
