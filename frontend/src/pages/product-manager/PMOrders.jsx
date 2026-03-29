import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3000/api/product-manager/orders'

const STATUS_COLORS = {
  pending:    'um-role-product_manager',
  processing: 'um-role-customer',
  shipped:    'um-role-sales_manager',
  delivered:  'um-role-sales_manager',
  cancelled:  'um-role-admin',
}

function PMOrders({ token }) {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`${API}?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, search, statusFilter])

  useEffect(() => { fetchOrders(1) }, [fetchOrders])

  function handleSearch(e) {
    e.preventDefault()
    fetchOrders(1)
  }

  async function viewOrder(orderId) {
    setError('')
    try {
      const res = await fetch(`${API}/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load order')
      setDetail(data)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="um">
      <div className="um-toolbar">
        <form className="um-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="um-search"
            placeholder="Search by customer or order ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="um-btn um-btn-search">Search</button>
        </form>
        <select
          className="um-role-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <p className="um-error">{error}</p>}

      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="um-empty">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="6" className="um-empty">No orders found</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_email || o.user_email || '—'}</td>
                <td>
                  <span className={`um-role-badge ${STATUS_COLORS[o.status] || 'um-role-customer'}`}>
                    {o.status}
                  </span>
                </td>
                <td>${parseFloat(o.total || o.total_price || 0).toFixed(2)}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="um-actions">
                  <button className="um-btn um-btn-edit" onClick={() => viewOrder(o.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="um-pagination">
          <button className="um-btn" disabled={pagination.page <= 1} onClick={() => fetchOrders(pagination.page - 1)}>Previous</button>
          <span className="um-page-info">Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)</span>
          <button className="um-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchOrders(pagination.page + 1)}>Next</button>
        </div>
      )}

      {detail && (
        <div className="um-overlay" onClick={() => setDetail(null)}>
          <div className="um-modal om-detail-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Order #{detail.order?.id ?? detail.id}</h2>
            <div className="om-detail-grid">
              <div className="om-detail-item">
                <span className="om-label">Customer</span>
                <span>{detail.order?.customer_email ?? detail.customer_email ?? '—'}</span>
              </div>
              <div className="om-detail-item">
                <span className="om-label">Status</span>
                <span className={`um-role-badge ${STATUS_COLORS[detail.order?.status ?? detail.status] || 'um-role-customer'}`}>
                  {detail.order?.status ?? detail.status}
                </span>
              </div>
              <div className="om-detail-item">
                <span className="om-label">Total</span>
                <span>${parseFloat(detail.order?.total ?? detail.total ?? detail.total_price ?? 0).toFixed(2)}</span>
              </div>
              <div className="om-detail-item">
                <span className="om-label">Date</span>
                <span>{new Date(detail.order?.created_at ?? detail.created_at).toLocaleString()}</span>
              </div>
              {(detail.order?.shipping_address ?? detail.shipping_address) && (
                <div className="om-detail-item om-full">
                  <span className="om-label">Shipping Address</span>
                  <span>{detail.order?.shipping_address ?? detail.shipping_address}</span>
                </div>
              )}
            </div>
            {(detail.items ?? detail.order?.items)?.length > 0 && (
              <>
                <p className="om-items-title">Items</p>
                <div className="um-table-wrap">
                  <table className="um-table">
                    <thead>
                      <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
                    </thead>
                    <tbody>
                      {(detail.items ?? detail.order?.items).map((item, i) => (
                        <tr key={i}>
                          <td>{item.product_name ?? item.name}</td>
                          <td>{item.quantity}</td>
                          <td>${parseFloat(item.price ?? item.unit_price ?? 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <div className="um-modal-actions">
              <button className="um-btn" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PMOrders
