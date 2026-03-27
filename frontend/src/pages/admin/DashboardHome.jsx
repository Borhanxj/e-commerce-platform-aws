import { useState, useEffect } from 'react'

const API = 'http://localhost:3000/api/admin/settings/stats'
const STATUS_LABELS = { pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
const STATUS_COLORS = { pending: '#3b82f6', processing: '#f59e0b', shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' }

function DashboardHome({ token, onNavigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch stats')
        setStats(await res.json())
      } catch {
        // silent — dashboard is non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [token])

  if (loading) return <p style={{ color: 'var(--text)' }}>Loading dashboard…</p>
  if (!stats) return <p style={{ color: 'var(--text)' }}>Could not load dashboard data.</p>

  const maxStatusCount = Math.max(1, ...stats.ordersByStatus.map((s) => parseInt(s.count)))

  return (
    <div className="dh">
      {/* ─── KPI Cards ─────────────────────────────── */}
      <div className="dh-kpi-grid">
        <button className="dh-kpi" onClick={() => onNavigate('users')}>
          <span className="dh-kpi-value">{stats.totalUsers}</span>
          <span className="dh-kpi-label">Total Users</span>
        </button>
        <button className="dh-kpi" onClick={() => onNavigate('products')}>
          <span className="dh-kpi-value">{stats.totalProducts}</span>
          <span className="dh-kpi-label">Total Products</span>
        </button>
        <button className="dh-kpi" onClick={() => onNavigate('orders')}>
          <span className="dh-kpi-value">{stats.totalOrders}</span>
          <span className="dh-kpi-label">Total Orders</span>
        </button>
        <div className="dh-kpi dh-kpi-revenue">
          <span className="dh-kpi-value">${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span className="dh-kpi-label">Total Revenue</span>
        </div>
      </div>

      <div className="dh-panels">
        {/* ─── Orders by Status Chart ──────────────── */}
        <div className="dh-panel">
          <h3 className="dh-panel-title">Orders by Status</h3>
          {stats.ordersByStatus.length === 0 ? (
            <p className="dh-empty">No orders yet</p>
          ) : (
            <div className="dh-bar-chart">
              {stats.ordersByStatus.map((s) => (
                <div key={s.status} className="dh-bar-row">
                  <span className="dh-bar-label">{STATUS_LABELS[s.status] || s.status}</span>
                  <div className="dh-bar-track">
                    <div
                      className="dh-bar-fill"
                      style={{
                        width: `${(parseInt(s.count) / maxStatusCount) * 100}%`,
                        backgroundColor: STATUS_COLORS[s.status] || 'var(--accent)',
                      }}
                    />
                  </div>
                  <span className="dh-bar-count">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Recent Orders ───────────────────────── */}
        <div className="dh-panel">
          <h3 className="dh-panel-title">Recent Orders</h3>
          {stats.recentOrders.length === 0 ? (
            <p className="dh-empty">No orders yet</p>
          ) : (
            <div className="dh-recent-list">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="dh-recent-item">
                  <div className="dh-recent-main">
                    <span className="dh-recent-id">#{o.id}</span>
                    <span className="dh-recent-email">{o.user_email}</span>
                  </div>
                  <div className="dh-recent-meta">
                    <span
                      className="dh-recent-status"
                      style={{ color: STATUS_COLORS[o.status] }}
                    >
                      {STATUS_LABELS[o.status]}
                    </span>
                    <span className="dh-recent-total">${parseFloat(o.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
