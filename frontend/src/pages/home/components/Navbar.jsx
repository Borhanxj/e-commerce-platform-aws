import { useState, useRef, useEffect } from 'react'
import {
  CartIcon,
  WishlistIcon,
  SearchIcon,
  UserIcon,
  OrdersIcon,
  SettingsIcon,
  HelpIcon,
  LogoutIcon,
} from '../../../components/icons'

export default function Navbar({
  isLoggedIn,
  userEmail,
  onNavigate,
  onRequireAuth,
  onLogout,
  cartCount,
  wishlistCount,
  searchQuery,
  setSearchQuery,
}) {
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
    <header className="fixed top-0 right-0 left-0 z-[1000] border-b border-white/8 bg-[rgba(16,13,30,0.75)] px-6 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6">
        {/* Brand */}
        <div className="shrink-0 text-[22px] font-bold tracking-[4px] text-[#eeeaff]">MODÉ</div>

        {/* Search bar */}
        <div className="flex h-10 max-w-[480px] flex-1 items-center gap-2 rounded-[10px] border border-white/10 bg-white/6 px-[14px] backdrop-blur-xl transition-[border-color,background] duration-200 focus-within:border-purple-400/50 focus-within:bg-white/9">
          <span className="flex items-center text-[rgba(190,178,215,0.82)]">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search for clothes, brands…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm text-[#eeeaff] outline-none placeholder:text-[rgba(190,178,215,0.82)]"
          />
        </div>

        {/* Actions */}
        <nav className="ml-auto flex items-center gap-2">
          <button className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold tracking-widest text-[#eeeaff] transition-colors hover:border-purple-400/40 hover:bg-purple-400/12 hover:text-purple-400">
            SALE
          </button>

          {/* Wishlist */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border-none bg-transparent text-[#eeeaff] transition-colors hover:bg-purple-400/12 hover:text-purple-400"
            aria-label="Wishlist"
            onClick={() => (isLoggedIn ? onNavigate('wishlist') : onRequireAuth())}
          >
            <WishlistIcon />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-400 px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border-none bg-transparent text-[#eeeaff] transition-colors hover:bg-purple-400/12 hover:text-purple-400"
            aria-label="Shopping cart"
            onClick={() => (isLoggedIn ? onNavigate('cart') : onRequireAuth())}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-400 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* Avatar menu */}
          <div className="relative" ref={avatarRef}>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-purple-400/12 text-[#eeeaff] transition-[border-color,background] hover:border-purple-400 hover:text-purple-400 aria-expanded:border-purple-400 aria-expanded:text-purple-400"
              onClick={() => setAvatarOpen((o) => !o)}
              aria-label="Account menu"
              aria-expanded={avatarOpen}
            >
              <UserIcon />
            </button>

            {avatarOpen && (
              <div className="animate-in fade-in slide-in-from-top-1.5 absolute top-[calc(100%+10px)] right-0 z-[200] w-[220px] rounded-2xl border border-white/10 bg-[rgba(12,10,20,0.85)] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-2.5 px-2 pt-2 pb-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-400/12 text-purple-400">
                        <UserIcon />
                      </div>
                      <div>
                        <p className="m-0 text-[13px] font-semibold text-[#eeeaff]">My Account</p>
                        <p className="m-0 text-[11px] text-[rgba(190,178,215,0.82)]">{userEmail}</p>
                      </div>
                    </div>

                    <div className="my-1 h-px bg-white/9" />

                    {[
                      {
                        icon: <OrdersIcon />,
                        label: 'My Orders',
                        action: () => {
                          setAvatarOpen(false)
                          onNavigate('orders')
                        },
                      },
                    ].map(({ icon, label, action }) => (
                      <button
                        key={label}
                        className="flex w-full items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 py-[9px] text-left text-[13px] text-[rgba(190,178,215,0.82)] transition-[background,color] duration-100 hover:bg-purple-400/12 hover:text-[#eeeaff]"
                        onClick={action}
                      >
                        {icon} {label}
                      </button>
                    ))}

                    <div className="my-1 h-px bg-white/9" />

                    {[
                      {
                        icon: <SettingsIcon />,
                        label: 'Account Settings',
                        action: () => {
                          setAvatarOpen(false)
                          onNavigate('account-settings')
                        },
                      },
                      {
                        icon: <HelpIcon />,
                        label: 'Help & Support',
                        action: () => {
                          setAvatarOpen(false)
                          onNavigate('help')
                        },
                      },
                    ].map(({ icon, label, action }) => (
                      <button
                        key={label}
                        className="flex w-full items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 py-[9px] text-left text-[13px] text-[rgba(190,178,215,0.82)] transition-[background,color] duration-100 hover:bg-purple-400/12 hover:text-[#eeeaff]"
                        onClick={action}
                      >
                        {icon} {label}
                      </button>
                    ))}

                    <div className="my-1 h-px bg-white/9" />

                    <button
                      className="flex w-full items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 py-[9px] text-left text-[13px] text-red-400 transition-[background] duration-100 hover:bg-red-500/8"
                      onClick={onLogout}
                    >
                      <LogoutIcon /> Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    className="flex w-full items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 py-[9px] text-left text-[13px] text-[rgba(190,178,215,0.82)] transition-[background,color] duration-100 hover:bg-purple-400/12 hover:text-[#eeeaff]"
                    onClick={() => {
                      setAvatarOpen(false)
                      onRequireAuth()
                    }}
                  >
                    <UserIcon /> Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
