import { useState, useEffect, useCallback } from 'react'
import API_BASE from '../../api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { btnBase, btnEdit, fieldInputClass } from '../../styles/dashboardStyles'

const API = `${API_BASE}/api/sales-manager/products`

export default function DiscountManagement({ token }) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [discountPercent, setDiscountPercent] = useState('')
  const [applying, setApplying] = useState(false)

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ page, limit: 15 })
        const res = await fetch(`${API}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setProducts(data.products)
        setPagination(data.pagination)
        setSelectedIds(new Set())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  function previewPrice(price) {
    const pct = parseInt(discountPercent, 10)
    if (isNaN(pct) || pct < 1 || pct > 100) return null
    return (parseFloat(price) * (1 - pct / 100)).toFixed(2)
  }

  async function applyDiscount() {
    const pct = parseInt(discountPercent, 10)
    if (isNaN(pct) || pct < 1 || pct > 100) {
      setError('Discount must be between 1 and 100%')
      return
    }
    if (selectedIds.size === 0) {
      setError('Select at least one product')
      return
    }
    setApplying(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/api/sales-manager/products/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productIds: [...selectedIds], discountPercent: pct }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to apply discount')
        return
      }
      setSuccess(
        `Discount applied to ${data.updated} product(s). ${data.notified} customer(s) notified.`
      )
      setDiscountPercent('')
      await fetchProducts(pagination.page)
    } catch {
      setError('Could not connect to server')
    } finally {
      setApplying(false)
    }
  }

  async function removeDiscount(productId) {
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/api/sales-manager/products/${productId}/discount`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to remove discount')
        return
      }
      await fetchProducts(pagination.page)
    } catch {
      setError('Could not connect to server')
    }
  }

  const allSelected = products.length > 0 && selectedIds.size === products.length

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-[var(--shadow)] backdrop-blur-xl">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold tracking-[1px] text-[var(--text)] uppercase">
            Discount %
          </label>
          <input
            type="number"
            min="1"
            max="100"
            step="1"
            placeholder="e.g. 20"
            className={`${fieldInputClass} !w-36`}
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-[var(--text)] opacity-50">
            {selectedIds.size === 0
              ? 'No products selected'
              : `${selectedIds.size} product(s) selected`}
          </span>
          <button
            className={btnEdit}
            onClick={applyDiscount}
            disabled={applying || selectedIds.size === 0}
          >
            {applying ? 'Applying…' : 'Apply Discount'}
          </button>
        </div>

        {success && <p className="text-sm text-green-400">{success}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] shadow-[var(--shadow)] backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--border)] hover:bg-transparent">
              <TableHead className="w-10 bg-purple-400/12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="accent-purple-400"
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[var(--text)] uppercase">
                Name
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[var(--text)] uppercase">
                Category
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[var(--text)] uppercase">
                Price
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[var(--text)] uppercase">
                Discount
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[var(--text)] uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-[var(--border)]">
                <TableCell colSpan={6} className="py-8 text-center text-[var(--text)]">
                  Loading…
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow className="border-[var(--border)]">
                <TableCell colSpan={6} className="py-8 text-center text-[var(--text)]">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => {
                const preview = previewPrice(p.price)
                const isSelected = selectedIds.has(p.id)
                return (
                  <TableRow
                    key={p.id}
                    className={`border-[var(--border)] transition-colors hover:bg-purple-400/5 ${isSelected ? 'bg-purple-400/8' : ''}`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(p.id)}
                        className="accent-purple-400"
                        aria-label={`Select ${p.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-[var(--text-h)]">{p.name}</TableCell>
                    <TableCell className="text-[var(--text-h)]">{p.category || '—'}</TableCell>
                    <TableCell className="text-[var(--text-h)]">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={
                            p.discount_percent != null
                              ? 'text-[var(--text)] line-through opacity-60'
                              : ''
                          }
                        >
                          ${parseFloat(p.price).toFixed(2)}
                        </span>
                        {p.discount_percent != null && (
                          <span className="text-[13px] font-semibold text-green-400">
                            ${parseFloat(p.discounted_price).toFixed(2)}
                          </span>
                        )}
                        {preview != null && !p.discount_percent && isSelected && (
                          <span className="text-[11px] text-purple-400 opacity-70">
                            → ${preview}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.discount_percent != null ? (
                        <span className="rounded-full bg-green-400/15 px-2 py-0.5 text-[11px] font-semibold text-green-400">
                          -{p.discount_percent}%
                        </span>
                      ) : (
                        <span className="text-[12px] text-[var(--text)] opacity-40">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.discount_percent != null && (
                        <button className={btnBase} onClick={() => removeDiscount(p.id)}>
                          Remove
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            className={btnBase}
            disabled={pagination.page <= 1}
            onClick={() => fetchProducts(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="text-[13px] text-[var(--text)]">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
          </span>
          <button
            className={btnBase}
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchProducts(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
