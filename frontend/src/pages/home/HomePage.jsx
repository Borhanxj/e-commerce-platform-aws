import { useState, useRef } from 'react'
import { MiniCartIcon, StarRating } from '../../components/icons'
import Navbar from './components/Navbar'
import HeroBanner from './components/HeroBanner'
import Footer from './components/Footer'
import './HomePage.css'

const CATEGORIES = [
  { id: 1, title: "Women's Clothing", subtitle: 'New arrivals every week', hue: 280 },
  { id: 2, title: "Men's Clothing", subtitle: 'Timeless essentials', hue: 210 },
  { id: 3, title: 'Outerwear', subtitle: 'Coats, jackets & more', hue: 200 },
  { id: 4, title: 'Footwear', subtitle: 'Step into style', hue: 160 },
  { id: 5, title: 'Accessories', subtitle: 'Finish the look', hue: 40 },
  { id: 6, title: 'Activewear', subtitle: 'Move in comfort', hue: 340 },
  { id: 7, title: 'Formal', subtitle: 'Dress to impress', hue: 260 },
  { id: 8, title: 'Kids & Baby', subtitle: 'Adorable styles for little ones', hue: 20 },
]

const NEW_RELEASES = [
  { id: 101, name: 'Oversized Linen Shirt', category: "Women's", price: 79.99, hue: 280 },
  { id: 102, name: 'Slim Fit Chinos', category: "Men's", price: 69.99, hue: 210 },
  { id: 103, name: 'Leather Moto Jacket', category: 'Outerwear', price: 249.99, hue: 200 },
  { id: 104, name: 'Platform Loafers', category: 'Footwear', price: 119.99, hue: 160 },
  { id: 105, name: 'Structured Tote', category: 'Accessories', price: 139.99, hue: 40 },
  { id: 106, name: 'Ribbed Midi Dress', category: "Women's", price: 94.99, hue: 340 },
  { id: 107, name: 'Merino Polo', category: "Men's", price: 89.99, hue: 190 },
  { id: 108, name: 'Cropped Blazer', category: 'Formal', price: 179.99, hue: 260 },
]

const REVIEWS = [
  {
    id: 1,
    name: 'Sophie M.',
    rating: 5,
    text: 'Absolutely love the quality. The fabric is soft and the fit is perfect — I get compliments every time I wear it.',
  },
  {
    id: 2,
    name: 'James K.',
    rating: 5,
    text: 'Fast shipping and exactly as described. Already ordered two more colours.',
  },
  {
    id: 3,
    name: 'Priya R.',
    rating: 4,
    text: 'Great value for money. Sizing runs slightly large but the quality is excellent.',
  },
  {
    id: 4,
    name: 'Lucas B.',
    rating: 5,
    text: "The best online fashion store I've used. Returns were hassle-free too.",
  },
  {
    id: 5,
    name: 'Emma T.',
    rating: 5,
    text: 'Stunning piece — looks even better in person. Will definitely be shopping here again.',
  },
  {
    id: 6,
    name: 'Callum D.',
    rating: 4,
    text: 'Really happy with my purchase. Packaged beautifully and arrived ahead of schedule.',
  },
  {
    id: 7,
    name: 'Yuki N.',
    rating: 5,
    text: 'I was unsure about ordering online but the size guide was spot on. Perfect fit!',
  },
  {
    id: 8,
    name: 'Amara O.',
    rating: 5,
    text: 'Lovely materials and the colours are true to the photos. Highly recommend.',
  },
  {
    id: 9,
    name: 'Finn W.',
    rating: 4,
    text: 'Solid quality at a fair price. The stitching is neat and it washes really well.',
  },
  {
    id: 10,
    name: 'Isabella C.',
    rating: 5,
    text: 'Customer service was brilliant when I needed to exchange a size. So easy.',
  },
]

export default function HomePage({
  isLoggedIn,
  userEmail,
  onNavigate,
  onRequireAuth,
  onLogout,
  cartCount = 0,
  wishlistCount = 0,
  onAddToCart,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const releasesRef = useRef(null)

  function scrollReleases(dir) {
    const el = releasesRef.current
    if (el) el.scrollBy({ left: dir * 240, behavior: 'smooth' })
  }

  return (
    <div className="home">
      {/* Liquid glass ambient background */}
      <div className="home-bg" aria-hidden="true" />

      <Navbar
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        onNavigate={onNavigate}
        onRequireAuth={onRequireAuth}
        onLogout={onLogout}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <HeroBanner />

      {/* Category grid */}
      <main className="categories-section">
        <div className="section-header">
          <h2 className="section-title">Browse Categories</h2>
          <button className="section-link">View All</button>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className="category-card"
              onClick={() => onNavigate('category', cat)}
            >
              <div
                className="card-image-placeholder"
                style={{
                  background: `linear-gradient(160deg, hsl(${cat.hue},35%,10%) 0%, hsl(${cat.hue},45%,17%) 100%)`,
                }}
              >
                <span className="placeholder-label" style={{ color: `hsl(${cat.hue},70%,70%)` }}>
                  {cat.title[0]}
                </span>
              </div>
              <div className="card-info">
                <span className="card-title">{cat.title}</span>
                <span className="card-subtitle">{cat.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* New Releases */}
      <section className="releases-section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Just Dropped</p>
            <h2 className="section-title">New Releases</h2>
          </div>
          <div className="releases-nav">
            <button
              className="releases-arrow"
              onClick={() => scrollReleases(-1)}
              aria-label="Scroll left"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="releases-arrow"
              onClick={() => scrollReleases(1)}
              aria-label="Scroll right"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button className="section-link">View All</button>
          </div>
        </div>
        <div className="releases-scroll" ref={releasesRef}>
          {NEW_RELEASES.map((product) => (
            <div key={product.id} className="release-card">
              <div
                className="release-image"
                style={{
                  background: `linear-gradient(160deg, hsl(${product.hue},35%,10%) 0%, hsl(${product.hue},50%,20%) 100%)`,
                }}
              >
                <span
                  className="release-placeholder"
                  style={{ color: `hsl(${product.hue},70%,70%)` }}
                >
                  {product.name[0]}
                </span>
              </div>
              <div className="release-info">
                <span className="release-category">{product.category}</span>
                <span className="release-name">{product.name}</span>
                <div className="release-footer">
                  <span className="release-price">${product.price.toFixed(2)}</span>
                  <button
                    className="release-cart-btn"
                    aria-label="Add to cart"
                    onClick={() => onAddToCart && onAddToCart(product)}
                  >
                    <MiniCartIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews marquee */}
      <section className="reviews-section">
        <div className="section-header reviews-section-header">
          <div>
            <p className="section-eyebrow">Testimonials</p>
            <h2 className="section-title">What Our Customers Say</h2>
          </div>
        </div>
        <div className="reviews-track-wrapper">
          <div className="reviews-track">
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <div key={i} className="review-card">
                <StarRating rating={review.rating} />
                <p className="review-text">"{review.text}"</p>
                <div className="review-author">
                  <div className="review-avatar">{review.name[0]}</div>
                  <div>
                    <p className="review-name">{review.name}</p>
                    <p className="review-verified">Verified Purchase</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
