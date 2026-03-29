import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3000/api/product-manager/products'

function PMInventory({ token }) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [draftStock, setDraftStock] = useState('')
  const [saving, setSaving] = useState(false)

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      const res = await fetch(`${API}?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch inventory')
      const data = await res.json()
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, search])

  useEffect(() => { fetchProducts(1) }, [fetchProducts])

  function handleSearch(e) {
    e.preventDefault()
    fetchProducts(1)
  }

  function startEdit(product) {
    setEditingId(product.id)
    setDraftStock(String(product.stock))
  }

  function cancelEdit() {
    setEditingId(null)
    setDraftStock('')
  }

  async function saveStock(productId) {
    setSaving(true)
    setError('')
    try {
      const parsedStock = parseInt(draftStock, 10)
      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        setError('Stock must be a non-negative integer')
        return
      }
      const res = await fetch(`${API}/${productId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ stock: parsedStock }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update stock')
      setEditingId(null)
      setDraftStock('')
      // update local state without full refetch for snappy UX
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stock: parsedStock } : p))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="um">
      <div className="um-toolbar">
        <form className="um-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="um-search"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="um-btn um-btn-search">Search</button>
        </form>
      </div>

      {error && <p className="um-error">{error}</p>}

      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="um-empty">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="6" className="um-empty">No products found</td></tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.category || '—'}</td>
                <td>${parseFloat(p.price).toFixed(2)}</td>
                <td>
                  {editingId === p.id ? (
                    <div className="pm-stock-cell">
                      <input
                        type="number"
                        min="0"
                        className="pm-stock-input"
                        value={draftStock}
                        onChange={(e) => setDraftStock(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="um-btn um-btn-create"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        disabled={saving}
                        onClick={() => saveStock(p.id)}
                      >
                        {saving ? '…' : 'Save'}
                      </button>
                      <button
                        className="um-btn"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className={`um-role-badge ${parseInt(p.stock) === 0 ? 'um-role-admin' : parseInt(p.stock) < 10 ? 'um-role-product_manager' : 'um-role-sales_manager'}`}>
                      {p.stock}
                    </span>
                  )}
                </td>
                <td className="um-actions">
                  {editingId !== p.id && (
                    <button className="um-btn um-btn-edit" onClick={() => startEdit(p)}>Edit Stock</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="um-pagination">
          <button className="um-btn" disabled={pagination.page <= 1} onClick={() => fetchProducts(pagination.page - 1)}>Previous</button>
          <span className="um-page-info">Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)</span>
          <button className="um-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchProducts(pagination.page + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

export default PMInventory
