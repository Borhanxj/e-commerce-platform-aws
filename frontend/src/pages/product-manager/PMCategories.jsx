import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3000/api/product-manager/categories'

function PMCategories({ token }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = useCallback(async () => {
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
  }, [token])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  return (
    <div className="um">
      {error && <p className="um-error">{error}</p>}

      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="2" className="um-empty">Loading…</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="2" className="um-empty">No categories found</td></tr>
            ) : categories.map((name, i) => (
              <tr key={name}>
                <td>{i + 1}</td>
                <td>{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PMCategories
