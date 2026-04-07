import { useState, useEffect } from 'react'
import API_BASE from '../../api'
import UserManagement from './UserManagement'
import ProductManagement from './ProductManagement'
import OrderManagement from './OrderManagement'
import SettingsManagement from './SettingsManagement'
import DashboardHome from './DashboardHome'

function AdminDashboard({ token, onLogout }) {
  const [admin, setAdmin] = useState(null)
  const [activeSection, setActiveSection] = useState('dashboard')

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          onLogout()
          return
        }
        const data = await res.json()
        setAdmin(data.user)
      } catch {
        onLogout()
      }
    }
    fetchAdmin()
  }, [token, onLogout])

  const sections = [
    { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { key: 'users', label: 'Users', icon: <UsersIcon /> },
    { key: 'products', label: 'Products', icon: <ProductsIcon /> },
    { key: 'orders', label: 'Orders', icon: <OrdersIcon /> },
    { key: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ]

  return (
    <div className="flex min-h-svh bg-[var(--bg)] transition-colors duration-300">
      <aside className="box-border flex w-60 min-w-[240px] flex-col border-r border-[var(--border)] bg-[rgba(var(--background),0.4)] py-6 backdrop-blur-xl">
        <h2 className="m-0 border-b border-[var(--border)] px-6 pb-6 text-xl font-semibold text-purple-400">
          FIER Admin
        </h2>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {sections.map((s) => (
            <button
              key={s.key}
              className={`flex cursor-pointer items-center gap-2.5 rounded-md border-none px-3 py-2.5 text-left font-[inherit] text-[15px] transition-all duration-150 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0 ${
                activeSection === s.key
                  ? 'border-l-2 border-purple-400 bg-purple-400/15 font-medium text-purple-400'
                  : 'bg-transparent text-[var(--text)] hover:bg-purple-400/10 hover:text-[var(--text-h)]'
              }`}
              onClick={() => setActiveSection(s.key)}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] px-3 py-4">
          <button
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md border-none bg-transparent px-3 py-2.5 text-left font-[inherit] text-[15px] text-[var(--text)] transition-all duration-150 hover:bg-red-500/10 hover:text-red-400 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0"
            onClick={onLogout}
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--border)] bg-[rgba(var(--background),0.4)] px-8 py-4 backdrop-blur-xl">
          <h1 className="m-0 text-lg font-medium text-[var(--text-h)]">
            {sections.find((s) => s.key === activeSection)?.label}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[var(--text)]">
            <span>{admin?.email}</span>
            <button
              className="cursor-pointer rounded-md border border-[var(--border)] bg-transparent px-3.5 py-1.5 font-[inherit] text-[13px] text-[var(--text)] transition-all duration-150 hover:border-purple-400 hover:text-purple-400"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeSection === 'dashboard' && (
            <DashboardHome token={token} onNavigate={setActiveSection} />
          )}
          {activeSection === 'users' && <UserManagement token={token} />}
          {activeSection === 'products' && <ProductManagement token={token} />}
          {activeSection === 'orders' && <OrderManagement token={token} />}
          {activeSection === 'settings' && <SettingsManagement token={token} />}
        </main>
      </div>
    </div>
  )
}

/* Inline SVG icons — keeps admin self-contained, consistent with project pattern */

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ProductsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default AdminDashboard
