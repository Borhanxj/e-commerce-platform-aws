import { useState, useRef, useEffect } from 'react'
import { CartIcon, WishlistIcon, SearchIcon, UserIcon, OrdersIcon, SettingsIcon, HelpIcon, LogoutIcon } from '../../../components/icons'

export default function Navbar({ onNavigate, onLogout, cartCount, wishlistCount, searchQuery, setSearchQuery }) {
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">MODÉ</div>

        <div className="search-bar">
          <span className="search-icon"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search for clothes, brands…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <nav className="nav-actions">
          <button className="sale-nav-btn">SALE</button>
          <button className="icon-btn" aria-label="Wishlist" onClick={() => onNavigate('wishlist')}>
            <WishlistIcon />
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </button>
          <button className="icon-btn" aria-label="Shopping cart" onClick={() => onNavigate('cart')}>
            <CartIcon />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
          <div className="avatar-menu" ref={avatarRef}>
            <button
              className="avatar-btn"
              onClick={() => setAvatarOpen(o => !o)}
              aria-label="Account menu"
              aria-expanded={avatarOpen}
            >
              <UserIcon />
            </button>

            {avatarOpen && (
              <div className="avatar-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar-circle"><UserIcon /></div>
                  <div>
                    <p className="dropdown-name">My Account</p>
                    <p className="dropdown-email">user@example.com</p>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button className="dropdown-item" onClick={() => { setAvatarOpen(false); onNavigate('orders') }}>
                  <OrdersIcon /> My Orders
                </button>

                <div className="dropdown-divider" />

                <button className="dropdown-item" onClick={() => { setAvatarOpen(false); onNavigate('account-settings') }}>
                  <SettingsIcon /> Account Settings
                </button>
                <button className="dropdown-item" onClick={() => { setAvatarOpen(false); onNavigate('help') }}>
                  <HelpIcon /> Help & Support
                </button>

                <div className="dropdown-divider" />

                <button className="dropdown-item dropdown-item--danger" onClick={onLogout}>
                  <LogoutIcon /> Sign Out
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
