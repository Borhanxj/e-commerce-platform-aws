import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3000/api/product-manager/products'
const CATS_API = 'http://localhost:3000/api/product-manager/categories'

function PMProducts({ token }) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [categories, setCategories] = useState([])

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (search) params.set('search', search)
      const res = await fetch(`${API}?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch products')
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

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(CATS_API, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      } catch {
        // categories stay empty — field falls back gracefully
      }
    }
    fetchCategories()
  }, [token])

  function handleSearch(e) {
    e.preventDefault()
    fetchProducts(1)
  }

  async function handleCreate(formData) {
    const res = await fetch(API, { method: 'POST', headers: authHeaders, body: JSON.stringify(formData) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create product')
    setModal(null)
    fetchProducts(pagination.page)
  }

  async function handleUpdate(productId, formData) {
    const res = await fetch(`${API}/${productId}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(formData) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update product')
    setModal(null)
    fetchProducts(pagination.page)
  }

  async function handleDelete(productId) {
    try {
      const res = await fetch(`${API}/${productId}`, { method: 'DELETE', headers: authHeaders })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to delete product')
        return
      }
      setDeleteConfirm(null)
      fetchProducts(pagination.page)
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
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="um-btn um-btn-search">Search</button>
        </form>
        <button className="um-btn um-btn-create" onClick={() => setModal({ mode: 'create' })}>
          + New Product
        </button>
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
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="um-empty">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="7" className="um-empty">No products found</td></tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.category || '—'}</td>
                <td>${parseFloat(p.price).toFixed(2)}</td>
                <td>
                  <span className={`um-role-badge ${parseInt(p.stock) === 0 ? 'um-role-admin' : parseInt(p.stock) < 10 ? 'um-role-product_manager' : 'um-role-sales_manager'}`}>
                    {p.stock}
                  </span>
                </td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="um-actions">
                  <button className="um-btn um-btn-edit" onClick={() => setModal({ mode: 'edit', product: p })}>Edit</button>
                  <button className="um-btn um-btn-delete" onClick={() => setDeleteConfirm(p)}>Delete</button>
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

      {modal && (
        <ProductModal
          mode={modal.mode}
          product={modal.product}
          categories={categories}
          onClose={() => setModal(null)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {deleteConfirm && (
        <div className="um-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Product</h2>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div className="um-modal-actions">
              <button className="um-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="um-btn um-btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductModal({ mode, product, categories, onClose, onCreate, onUpdate }) {
  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product?.price || '')
  const [stock, setStock] = useState(product?.stock ?? 0)
  const [category, setCategory] = useState(product?.category || '')
  const [imageUrl, setImageUrl] = useState(product?.image_url || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const parsedStock = parseInt(stock, 10)
      const body = { name, description, price: parseFloat(price), stock: Number.isNaN(parsedStock) ? 0 : parsedStock, category, image_url: imageUrl }
      if (mode === 'create') {
        await onCreate(body)
      } else {
        await onUpdate(product.id, body)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="um-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === 'create' ? 'Create Product' : 'Edit Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="um-field">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Product name" />
          </div>
          <div className="um-field">
            <label>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
          </div>
          <div className="um-field-row">
            <div className="um-field">
              <label>Price ($)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0.00" />
            </div>
            <div className="um-field">
              <label>Stock</label>
              <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="um-field">
            <label>Category</label>
            {categories.length > 0 ? (
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            ) : (
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Footwear" />
            )}
          </div>
          <div className="um-field">
            <label>Image URL</label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
          </div>
          {error && <p className="um-error">{error}</p>}
          <div className="um-modal-actions">
            <button type="button" className="um-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="um-btn um-btn-create" disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PMProducts
