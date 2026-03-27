import { useState, useEffect, useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../../../components/icons'

const HERO_THEMES = [
  'linear-gradient(135deg, #0d0d1a 0%, #1a1030 40%, #2a1040 70%, #0d1a2e 100%)', // purple
  'linear-gradient(135deg, #071a0f 0%, #0d2818 40%, #0f3520 70%, #061510 100%)', // forest
  'linear-gradient(135deg, #1a060d 0%, #2a0f18 40%, #350f22 70%, #160810 100%)', // rose
  'linear-gradient(135deg, #06101a 0%, #0d1828 40%, #0f2040 70%, #06101e 100%)', // navy
  'linear-gradient(135deg, #1a1006 0%, #2a1e08 40%, #34260a 70%, #1a1506 100%)', // amber
]

export default function HeroBanner() {
  const [heroIndex, setHeroIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const transitionRef = useRef(null)

  // Clear the inner transition timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(transitionRef.current)
    }
  }, [])

  function goTo(idx) {
    if (transitioning) return
    setTransitioning(true)
    clearTimeout(transitionRef.current)
    transitionRef.current = setTimeout(() => {
      setHeroIndex(idx)
      setTransitioning(false)
    }, 350)
  }

  useEffect(() => {
    if (transitioning) return
    const id = setTimeout(() => {
      setTransitioning(true)
      clearTimeout(transitionRef.current)
      transitionRef.current = setTimeout(() => {
        setHeroIndex((i) => (i + 1) % HERO_THEMES.length)
        setTransitioning(false)
      }, 350)
    }, 5000)
    return () => clearTimeout(id)
  }, [heroIndex, transitioning])

  return (
    <section className="hero-banner">
      {/* Animated background */}
      <div
        className={`hero-bg${transitioning ? ' hero-bg--fading' : ''}`}
        style={{ background: HERO_THEMES[heroIndex] }}
        aria-hidden="true"
      />

      {/* Arrow controls */}
      <div className="hero-arrows" aria-hidden="true">
        <button
          className="hero-arrow"
          onClick={() => goTo((heroIndex - 1 + HERO_THEMES.length) % HERO_THEMES.length)}
          aria-label="Previous theme"
        >
          <ChevronLeftIcon />
        </button>
        <button
          className="hero-arrow"
          onClick={() => goTo((heroIndex + 1) % HERO_THEMES.length)}
          aria-label="Next theme"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {/* Decorative background elements */}
      <div className="hero-decor" aria-hidden="true">
        <div className="decor-circle decor-circle-1" />
        <div className="decor-circle decor-circle-2" />
        <div className="decor-circle decor-circle-3" />
        <div className="decor-lines" />
        <div className="decor-diamond decor-diamond-1" />
        <div className="decor-diamond decor-diamond-2" />
        <div className="decor-stripe decor-stripe-1" />
        <div className="decor-stripe decor-stripe-2" />
        <div className="decor-stripe decor-stripe-3" />
      </div>

      <div className="hero-text">
        <p className="hero-eyebrow">New Season</p>
        <h1>Discover Your Style</h1>
        <p className="hero-sub">Curated fashion for every occasion</p>
        <button className="cta-btn">Shop Now</button>
      </div>
    </section>
  )
}
