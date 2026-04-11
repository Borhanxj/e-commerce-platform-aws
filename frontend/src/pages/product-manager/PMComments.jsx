import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3000/api/product-manager/comments'

function PMComments({ token }) {
  const [comments, setComments] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 })
  const [statusFilter, setStatusFilter] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionPending, setActionPending] = useState(null)

  const fetchComments = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ page, limit: 15 })
        if (statusFilter) params.set('status', statusFilter)
        const res = await fetch(`${API}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch comments')
        const data = await res.json()
        setComments(data.comments || [])
        setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 0 })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [token, statusFilter]
  )

  useEffect(() => {
    fetchComments(1)
  }, [fetchComments])

  async function handleModerate(id, action) {
    setActionPending(id)
    setError('')
    try {
      const res = await fetch(`${API}/${id}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Failed to ${action} comment`)
      }
      // optimistic removal from pending queue; full refresh otherwise
      if (statusFilter === 'pending') {
        setComments((prev) => prev.filter((c) => c.id !== id))
      } else {
        fetchComments(pagination.page)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setActionPending(null)
    }
  }

  function truncate(text, max = 80) {
    if (!text) return '—'
    return text.length > max ? text.slice(0, max) + '…' : text
  }

  return (
    <div className="um">
      <div className="um-toolbar">
        <div style={{ flex: 1 }} />
        <select
          className="um-role-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {error && <p className="um-error">{error}</p>}

      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="um-empty">
                  Loading…
                </td>
              </tr>
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan="8" className="um-empty">
                  No comments found
                </td>
              </tr>
            ) : (
              comments.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.product_name || '—'}</td>
                  <td>{c.customer_email || c.user_email || '—'}</td>
                  <td>{c.rating != null ? `${c.rating}/5` : '—'}</td>
                  <td style={{ maxWidth: '200px' }}>
                    {truncate(c.content || c.comment || c.text)}
                  </td>
                  <td>
                    <span className={`um-role-badge pm-status-${c.status}`}>{c.status}</span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="um-actions">
                    {c.status !== 'approved' && (
                      <button
                        className="um-btn um-btn-approve"
                        disabled={actionPending === c.id}
                        onClick={() => handleModerate(c.id, 'approve')}
                      >
                        {actionPending === c.id ? '…' : 'Approve'}
                      </button>
                    )}
                    {c.status !== 'rejected' && (
                      <button
                        className="um-btn um-btn-delete"
                        disabled={actionPending === c.id}
                        onClick={() => handleModerate(c.id, 'reject')}
                      >
                        {actionPending === c.id ? '…' : 'Reject'}
                      </button>
                    )}
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
            onClick={() => fetchComments(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="um-page-info">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} comments)
          </span>
          <button
            className="um-btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchComments(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default PMComments
