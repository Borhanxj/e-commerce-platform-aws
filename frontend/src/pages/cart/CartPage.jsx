import { useNavigate } from 'react-router-dom'
import './CartPage.css'

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

export default function CartPage({ onBack, cartItems, onRemove, onUpdateQuantity, isLoggedIn }) {
  const navigate = useNavigate()
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function handleCheckout() {
    if (!isLoggedIn) {
      navigate('/login')
    }
    // logged-in checkout will be implemented later
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <header className="cart-header">
          <div className="cart-header-inner">
            <button className="back-btn" onClick={onBack}>
              <BackIcon /> Back
            </button>
            <span className="brand">MODÉ</span>
          </div>
        </header>
        <main className="cart-main">
          <h1 className="cart-title">Shopping Cart</h1>
          <div className="cart-empty">
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
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="empty-title">Your cart is empty</p>
            <p className="empty-sub">Browse our categories and add items you love.</p>
            <button className="cta-btn" onClick={onBack}>
              Start Shopping
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <header className="cart-header">
        <div className="cart-header-inner">
          <button className="back-btn" onClick={onBack}>
            <BackIcon /> Back
          </button>
          <span className="brand">MODÉ</span>
        </div>
      </header>

      <main className="cart-main">
        <h1 className="cart-title">Shopping Cart</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <span className="cart-item-image-label">{item.name[0]}</span>
                </div>
                <div className="cart-item-details">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-price">${item.price.toFixed(2)}</span>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-item-subtotal">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className="remove-btn"
                    onClick={() => onRemove(item.id)}
                    aria-label="Remove item"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="summary-free">{total >= 50 ? 'Free' : '$4.99'}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${(total + (total >= 50 ? 0 : 4.99)).toFixed(2)}</span>
            </div>
            {total < 50 && (
              <p className="summary-shipping-hint">
                Add ${(50 - total).toFixed(2)} more for free shipping
              </p>
            )}
            <button className="checkout-btn" onClick={handleCheckout}>
              {isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
            {!isLoggedIn && (
              <p className="summary-guest-note">You need an account to complete your purchase.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
