import Spline from '@splinetool/react-spline'

export default function HeroBanner() {
  return (
    <section className="hero-banner">
      {/* Spline 3D background */}
      <div className="hero-spline-bg" aria-hidden="true">
        <Spline scene="https://prod.spline.design/smuAGxLA0AM6n8JN/scene.splinecode" />
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
