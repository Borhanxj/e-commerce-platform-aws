import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3000/api/admin/orders'
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
const STATUS_COLORS = {
  pending: 'um-role-customer',
  processing: 'um-role-product_manager',
  shipped: 'um-role-sales_manager',
  delivered: 'um-role-sales_manager',
  cancelled: 'um-role-admin',
}

function OrderManagement({ token }) {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null) // { order, items }
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ page, limit: 10 })
        if (search) params.set('search', search)
        if (statusFilter) params.set('status', statusFilter)
        const res = await fetch(`${API}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch orders')
        const data = await res.json()
        setOrders(data.orders)
        setPagination(data.pagination)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [token, search, statusFilter]
  )

  useEffect(() => {
    fetchOrders(1)
  }, [fetchOrders])

  function handleSearch(e) {
    e.preventDefault()
    fetchOrders(1)
  }

  async function viewOrder(orderId) {
    try {
      const res = await fetch(`${API}/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch order details')
      const data = await res.json()
      setDetail(data)
    } catch (err) {
      setError(err.message)
    }
  }

  async function updateStatus(orderId, status) {
    try {
      const res = await fetch(`${API}/${orderId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update order')
      fetchOrders(pagination.page)
      if (detail && detail.order.id === orderId) {
        setDetail({ ...detail, order: { ...detail.order, status } })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(orderId) {
    try {
      const res = await fetch(`${API}/${orderId}`, { method: 'DELETE', headers: authHeaders })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to delete order')
        return
      }
      setDeleteConfirm(null)
      fetchOrders(pagination.page)
    } catch {
      setError('Could not connect to server')
    }
  }

  return (
    <div className="um">
      <div className="um-toolbar">
        <form className="um-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="um-search"
            placeholder="Search by customer email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="um-role-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button type="submit" className="um-btn um-btn-search">
            Search
          </button>
        </form>
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
              <tr>
                <td colSpan="6" className="um-empty">
                  Loading…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="um-empty">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.user_email}</td>
                  <td>
                    <span className={`um-role-badge ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td>${parseFloat(o.total).toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="um-actions">
                    <button className="um-btn um-btn-edit" onClick={() => viewOrder(o.id)}>
                      View
                    </button>
                    <button className="um-btn um-btn-delete" onClick={() => setDeleteConfirm(o)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="um-pagination">
          <button
            className="um-btn"
            disabled={pagination.page <= 1}
            onClick={() => fetchOrders(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="um-page-info">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
          </span>
          <button
            className="um-btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchOrders(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {detail && (
        <div className="um-overlay" onClick={() => setDetail(null)}>
          <div className="um-modal om-detail-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Order #{detail.order.id}</h2>
            <div className="om-detail-grid">
              <div className="om-detail-item">
                <span className="om-label">Customer</span>
                <span>{detail.order.user_email}</span>
              </div>
              <div className="om-detail-item">
                <span className="om-label">Status</span>
                <select
                  className="um-role-filter"
                  value={detail.order.status}
                  onChange={(e) => updateStatus(detail.order.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="om-detail-item">
                <span className="om-label">Total</span>
                <span>${parseFloat(detail.order.total).toFixed(2)}</span>
              </div>
              <div className="om-detail-item">
                <span className="om-label">Date</span>
                <span>{new Date(detail.order.created_at).toLocaleString()}</span>
              </div>
              {detail.order.address && (
                <div className="om-detail-item om-full">
                  <span className="om-label">Address</span>
                  <span>{detail.order.address}</span>
                </div>
              )}
            </div>

            {detail.items.length > 0 && (
              <>
                <h3 className="om-items-title">Items</h3>
                <div className="um-table-wrap">
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>${parseFloat(item.price).toFixed(2)}</td>
                          <td>${(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="um-modal-actions">
              <button className="um-btn" onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="um-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Order</h2>
            <p>
              Are you sure you want to delete order <strong>#{deleteConfirm.id}</strong>? This will
              also remove all associated items.
            </p>
            <div className="um-modal-actions">
              <button className="um-btn" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                className="um-btn um-btn-danger"
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement
