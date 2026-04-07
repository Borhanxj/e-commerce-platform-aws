import { Suspense, lazy, useState, useEffect } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

function HeroFallback() {
  return <div className="hero-spline-fallback" aria-hidden="true" />
}

export default function HeroBanner() {
  const [shouldLoad3D, setShouldLoad3D] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setShouldLoad3D(!e.matches)
    motionQuery.addEventListener('change', handler)
    return () => motionQuery.removeEventListener('change', handler)
  }, [])

  return (
    <section className="hero-banner">
      <div className="hero-spline-bg" aria-hidden="true">
        {shouldLoad3D ? (
          <Suspense fallback={<HeroFallback />}>
            <Spline scene="https://prod.spline.design/smuAGxLA0AM6n8JN/scene.splinecode" />
          </Suspense>
        ) : (
          <HeroFallback />
        )}
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
