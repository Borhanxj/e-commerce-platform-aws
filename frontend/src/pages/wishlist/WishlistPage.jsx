import './WishlistPage.css'

function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

export default function WishlistPage({ onBack, wishlistItems, onRemove, onAddToCart }) {
  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <header className="wishlist-header">
          <div className="wishlist-header-inner">
            <button className="back-btn" onClick={onBack}>
              <BackIcon /> Back
            </button>
            <span className="brand">MODÉ</span>
          </div>
        </header>
        <main className="wishlist-main">
          <h1 className="wishlist-title">Wishlist</h1>
          <div className="wishlist-empty">
            <div className="empty-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <p className="empty-title">Your wishlist is empty</p>
            <p className="empty-sub">Save items you love and come back to them anytime.</p>
            <button className="cta-btn" onClick={onBack}>
              Start Shopping
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <header className="wishlist-header">
        <div className="wishlist-header-inner">
          <button className="back-btn" onClick={onBack}>
            <BackIcon /> Back
          </button>
          <span className="brand">MODÉ</span>
        </div>
      </header>

      <main className="wishlist-main">
        <h1 className="wishlist-title">Wishlist</h1>

        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist-item">
              <div className="wishlist-item-image">
                <span className="wishlist-item-image-label">{item.name[0]}</span>
              </div>
              <div className="wishlist-item-info">
                <span className="wishlist-item-name">{item.name}</span>
                <span className="wishlist-item-price">${item.price.toFixed(2)}</span>
              </div>
              <div className="wishlist-item-actions">
                <button className="wishlist-add-cart-btn" onClick={() => onAddToCart(item)}>
                  <CartIcon /> Add to Cart
                </button>
                <button
                  className="wishlist-remove-btn"
                  onClick={() => onRemove(item.id)}
                  aria-label="Remove from wishlist"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
