import { useState, useEffect } from 'react'

const API = 'http://localhost:3000/api/product-manager/categories'

function PMCategories({ token }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  async function fetchCategories() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [token])

  async function handleCreate(formData) {
    const res = await fetch(API, { method: 'POST', headers: authHeaders, body: JSON.stringify(formData) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create category')
    setModal(null)
    fetchCategories()
  }

  async function handleUpdate(categoryId, formData) {
    const res = await fetch(`${API}/${categoryId}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(formData) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update category')
    setModal(null)
    fetchCategories()
  }

  async function handleDelete(categoryId) {
    try {
      const res = await fetch(`${API}/${categoryId}`, { method: 'DELETE', headers: authHeaders })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to delete category')
        return
      }
      setDeleteConfirm(null)
      fetchCategories()
    } catch {
      setError('Could not connect to server')
    }
  }

  return (
    <div className="um">
      <div className="um-toolbar">
        <div style={{ flex: 1 }} />
        <button className="um-btn um-btn-create" onClick={() => setModal({ mode: 'create' })}>
          + New Category
        </button>
      </div>

      {error && <p className="um-error">{error}</p>}

      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="um-empty">Loading…</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" className="um-empty">No categories found</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description || '—'}</td>
                <td className="um-actions">
                  <button className="um-btn um-btn-edit" onClick={() => setModal({ mode: 'edit', category: c })}>Edit</button>
                  <button className="um-btn um-btn-delete" onClick={() => setDeleteConfirm(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <CategoryModal
          mode={modal.mode}
          category={modal.category}
          onClose={() => setModal(null)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {deleteConfirm && (
        <div className="um-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Category</h2>
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

function CategoryModal({ mode, category, onClose, onCreate, onUpdate }) {
  const [name, setName] = useState(category?.name || '')
  const [description, setDescription] = useState(category?.description || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = { name, description }
      if (mode === 'create') {
        await onCreate(body)
      } else {
        await onUpdate(category.id, body)
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
        <h2>{mode === 'create' ? 'Create Category' : 'Edit Category'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="um-field">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Category name" />
          </div>
          <div className="um-field">
            <label>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
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

export default PMCategories
