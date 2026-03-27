import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3000/api/admin'
const ROLES = ['customer', 'sales_manager', 'product_manager', 'admin']
const ROLE_LABELS = {
  customer: 'Customer',
  sales_manager: 'Sales Manager',
  product_manager: 'Product Manager',
  admin: 'Admin',
}

function UserManagement({ token }) {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Modal state
  const [modal, setModal] = useState(null) // null | { mode: 'create' } | { mode: 'edit', user }
  const [deleteConfirm, setDeleteConfirm] = useState(null) // null | user

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ page, limit: 10 })
        if (search) params.set('search', search)
        if (roleFilter) params.set('role', roleFilter)

        const res = await fetch(`${API}/users?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data.users)
        setPagination(data.pagination)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [token, search, roleFilter]
  )

  useEffect(() => {
    fetchUsers(1)
  }, [fetchUsers])

  function handleSearch(e) {
    e.preventDefault()
    fetchUsers(1)
  }

  // ─── Create User ──────────────────────────────────
  async function handleCreate(formData) {
    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create user')
    setModal(null)
    fetchUsers(pagination.page)
  }

  // ─── Update User ──────────────────────────────────
  async function handleUpdate(userId, formData) {
    const res = await fetch(`${API}/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update user')
    setModal(null)
    fetchUsers(pagination.page)
  }

  // ─── Delete User ──────────────────────────────────
  async function handleDelete(userId) {
    try {
      const res = await fetch(`${API}/users/${userId}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to delete user')
        return
      }
      setDeleteConfirm(null)
      fetchUsers(pagination.page)
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
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="um-role-filter"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
            }}
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <button type="submit" className="um-btn um-btn-search">
            Search
          </button>
        </form>
        <button className="um-btn um-btn-create" onClick={() => setModal({ mode: 'create' })}>
          + New User
        </button>
      </div>

      {error && <p className="um-error">{error}</p>}

      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="um-empty">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="um-empty">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`um-role-badge um-role-${u.role}`}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="um-actions">
                    <button
                      className="um-btn um-btn-edit"
                      onClick={() => setModal({ mode: 'edit', user: u })}
                    >
                      Edit
                    </button>
                    <button className="um-btn um-btn-delete" onClick={() => setDeleteConfirm(u)}>
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
            onClick={() => fetchUsers(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="um-page-info">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
          </span>
          <button
            className="um-btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchUsers(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="um-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete User</h2>
            <p>
              Are you sure you want to delete <strong>{deleteConfirm.email}</strong>? This action
              cannot be undone.
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

function UserModal({ mode, user, onClose, onCreate, onUpdate }) {
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState(user?.role || 'customer')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (mode === 'create') {
        await onCreate({ email, password, role })
      } else {
        const body = { email, role }
        if (password) body.password = password
        await onUpdate(user.id, body)
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
        <h2>{mode === 'create' ? 'Create User' : 'Edit User'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="um-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>
          <div className="um-field">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="um-field">
            <label>{mode === 'create' ? 'Password' : 'New Password (leave blank to keep)'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              {...(mode === 'create' ? { required: true, minLength: 8 } : {})}
            />
          </div>
          {error && <p className="um-error">{error}</p>}
          <div className="um-modal-actions">
            <button type="button" className="um-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="um-btn um-btn-create" disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserManagement
