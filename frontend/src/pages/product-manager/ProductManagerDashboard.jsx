import { useState, useEffect } from 'react'
import PMProducts from './PMProducts'
import PMCategories from './PMCategories'
import PMInventory from './PMInventory'
import PMOrders from './PMOrders'
import PMComments from './PMComments'
import './ProductManagerDashboard.css'

const API_BASE = 'http://localhost:3000/api/product-manager'

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.')
    if (parts.length < 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

function PMOverview({ token, onNavigate }) {
  const [stats, setStats] = useState({ products: 0, orders: 0, lowStock: 0 })

  useEffect(() => {
    async function fetchStats() {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [pRes, oRes] = await Promise.all([
          fetch(`${API_BASE}/products?page=1&limit=1`, { headers }),
          fetch(`${API_BASE}/orders?page=1&limit=1`, { headers }),
        ])
        const pData = pRes.ok ? await pRes.json() : {}
        const oData = oRes.ok ? await oRes.json() : {}

        // Fetch low-stock count (stock < 10)
        const lsRes = await fetch(`${API_BASE}/products?page=1&limit=1&lowStock=true`, { headers })
        const lsData = lsRes.ok ? await lsRes.json() : {}

        setStats({
          products: pData.pagination?.total ?? 0,
          orders: oData.pagination?.total ?? 0,
          lowStock: lsData.pagination?.total ?? 0,
        })
      } catch {
        // stats stay at 0
      }
    }
    fetchStats()
  }, [token])

  return (
    <div>
      <div className="dh-kpi-grid">
        <button className="dh-kpi" onClick={() => onNavigate('products')}>
          <span className="dh-kpi-value">{stats.products}</span>
          <span className="dh-kpi-label">Total Products</span>
        </button>
        <button className="dh-kpi" onClick={() => onNavigate('inventory')}>
          <span className="dh-kpi-value">{stats.lowStock}</span>
          <span className="dh-kpi-label">Low / Out of Stock</span>
        </button>
        <button className="dh-kpi" onClick={() => onNavigate('orders')}>
          <span className="dh-kpi-value">{stats.orders}</span>
          <span className="dh-kpi-label">Total Orders</span>
        </button>
      </div>
    </div>
  )
}

function ProductManagerDashboard({ token, onLogout }) {
  const tokenPayload = decodeJwtPayload(token)
  const [pmUser, setPmUser] = useState(tokenPayload ? { email: tokenPayload.email } : null)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401 || res.status === 403) {
          onLogout()
          return
        }
        if (res.ok) {
          const data = await res.json()
          setPmUser(data.user)
        }
        // 404 / 500 = endpoint not yet implemented — stay on dashboard using token data
      } catch {
        // network error — stay on dashboard, don't force logout
      }
    }
    fetchUser()
  }, [token, onLogout])

  const sections = [
    { key: 'overview', label: 'Overview', icon: <DashboardIcon /> },
    { key: 'products', label: 'Products', icon: <ProductsIcon /> },
    { key: 'categories', label: 'Categories', icon: <CategoriesIcon /> },
    { key: 'inventory', label: 'Inventory', icon: <InventoryIcon /> },
    { key: 'orders', label: 'Orders', icon: <OrdersIcon /> },
    { key: 'comments', label: 'Comments', icon: <CommentsIcon /> },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-brand">MODÉ Manager</h2>
        <nav className="admin-sidebar-nav">
          {sections.map((s) => (
            <button
              key={s.key}
              className={`admin-sidebar-link${activeSection === s.key ? ' active' : ''}`}
              onClick={() => setActiveSection(s.key)}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-sidebar-link" onClick={onLogout}>
            <LogoutIcon />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header-title">
            {sections.find((s) => s.key === activeSection)?.label}
          </h1>
          <div className="admin-header-user">
            <span>{pmUser?.email}</span>
            <button className="admin-logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="admin-content">
          {activeSection === 'overview' && (
            <PMOverview token={token} onNavigate={setActiveSection} />
          )}
          {activeSection === 'products' && <PMProducts token={token} />}
          {activeSection === 'categories' && <PMCategories token={token} />}
          {activeSection === 'inventory' && <PMInventory token={token} />}
          {activeSection === 'orders' && <PMOrders token={token} />}
          {activeSection === 'comments' && <PMComments token={token} />}
        </main>
      </div>
    </div>
  )
}

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

function CategoriesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function InventoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20h20" />
      <path d="M5 20V8l7-5 7 5v12" />
      <path d="M9 20v-5h6v5" />
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

function CommentsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

export default ProductManagerDashboard
