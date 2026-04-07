import Spline from '@splinetool/react-spline'

export default function HeroBanner() {
  return (
    <section className="hero-banner">
      {/* Spline 3D background */}
      <div className="hero-spline-bg" aria-hidden="true">
        <Spline scene="https://prod.spline.design/smuAGxLA0AM6n8JN/scene.splinecode" />
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
