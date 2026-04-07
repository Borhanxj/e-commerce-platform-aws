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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const API = `${API_BASE}/api/admin/products`

const btnBase =
  'font-[inherit] text-[13px] font-medium px-4 py-2 border border-white/10 rounded-[10px] bg-white/5 text-[#eeeaff] cursor-pointer transition-all duration-150 whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed hover:not-disabled:border-purple-400 hover:not-disabled:text-purple-400'
const btnCreate =
  'font-[inherit] text-[13px] font-medium px-4 py-2 rounded-[10px] bg-purple-400 text-[#100d1e] border-none cursor-pointer transition-opacity duration-150 hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed'
const btnSearch =
  'font-[inherit] text-[13px] font-medium px-4 py-2 border border-purple-400/30 rounded-[10px] bg-purple-400/12 text-purple-400 cursor-pointer transition-all duration-150 whitespace-nowrap'
const btnEdit =
  'font-[inherit] text-[12px] font-medium px-3 py-1 border border-white/10 rounded-[10px] bg-white/5 text-[#eeeaff] cursor-pointer transition-all duration-150 hover:border-purple-400 hover:text-purple-400'
const btnDelete =
  'font-[inherit] text-[12px] font-medium px-3 py-1 border border-red-500/20 rounded-[10px] bg-red-500/10 text-red-400 cursor-pointer transition-all duration-150 hover:bg-red-500/20 hover:border-red-500'
const btnDanger =
  'font-[inherit] text-[13px] font-medium px-4 py-2 rounded-[10px] bg-red-500 text-white border-none cursor-pointer transition-opacity duration-150 hover:opacity-90'
const fieldInputClass =
  'w-full font-[inherit] text-sm py-2.5 px-3 border border-white/10 rounded-md bg-[#100d1e] text-[#eeeaff] outline-none transition-all duration-150 focus:border-purple-400 focus:shadow-[0_0_0_3px_rgba(192,132,252,0.12)]'

function ProductManagement({ token }) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ page, limit: 10 })
        if (search) params.set('search', search)
        const res = await fetch(`${API}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setProducts(data.products)
        setPagination(data.pagination)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [token, search]
  )

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  function handleSearch(e) {
    e.preventDefault()
    fetchProducts(1)
  }

  async function handleCreate(formData) {
    const res = await fetch(API, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create product')
    setModal(null)
    fetchProducts(pagination.page)
  }

  async function handleUpdate(productId, formData) {
    const res = await fetch(`${API}/${productId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(formData),
    })
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

  function stockBadgeClass(stock) {
    const n = parseInt(stock)
    if (n === 0) return 'bg-purple-400/12 text-purple-400 border-0'
    if (n < 10) return 'bg-amber-500/10 text-amber-400 border-0'
    return 'bg-emerald-500/10 text-emerald-400 border-0'
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <form className="flex min-w-0 flex-1 gap-2" onSubmit={handleSearch}>
          <Input
            type="text"
            className="min-w-[140px] flex-1 border-white/10 bg-white/5 text-[#eeeaff] placeholder:text-white/30"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className={btnSearch}>
            Search
          </button>
        </form>
        <button className={btnCreate} onClick={() => setModal({ mode: 'create' })}>
          + New Product
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/8 shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/9 hover:bg-transparent">
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[rgba(190,178,215,0.82)] uppercase">
                ID
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[rgba(190,178,215,0.82)] uppercase">
                Name
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[rgba(190,178,215,0.82)] uppercase">
                Category
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[rgba(190,178,215,0.82)] uppercase">
                Price
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[rgba(190,178,215,0.82)] uppercase">
                Stock
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[rgba(190,178,215,0.82)] uppercase">
                Created
              </TableHead>
              <TableHead className="bg-purple-400/12 text-xs tracking-wide text-[rgba(190,178,215,0.82)] uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-white/9">
                <TableCell colSpan={7} className="py-8 text-center text-[rgba(190,178,215,0.82)]">
                  Loading…
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow className="border-white/9">
                <TableCell colSpan={7} className="py-8 text-center text-[rgba(190,178,215,0.82)]">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} className="border-white/9 hover:bg-purple-400/5">
                  <TableCell className="text-[#eeeaff]">{p.id}</TableCell>
                  <TableCell className="text-[#eeeaff]">{p.name}</TableCell>
                  <TableCell className="text-[#eeeaff]">{p.category || '—'}</TableCell>
                  <TableCell className="text-[#eeeaff]">
                    ${parseFloat(p.price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={stockBadgeClass(p.stock)}>{p.stock}</Badge>
                  </TableCell>
                  <TableCell className="text-[#eeeaff]">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <button
                        className={btnEdit}
                        onClick={() => setModal({ mode: 'edit', product: p })}
                      >
                        Edit
                      </button>
                      <button className={btnDelete} onClick={() => setDeleteConfirm(p)}>
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            className={btnBase}
            disabled={pagination.page <= 1}
            onClick={() => fetchProducts(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="text-[13px] text-[rgba(190,178,215,0.82)]">
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

      {/* Create / Edit Modal */}
      {modal && (
        <ProductModal
          mode={modal.mode}
          product={modal.product}
          onClose={() => setModal(null)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-white/15 bg-[rgba(25,20,45,0.95)] shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#eeeaff]">Delete Product</DialogTitle>
          </DialogHeader>
          <p className="mb-5 leading-relaxed text-[rgba(190,178,215,0.82)]">
            Are you sure you want to delete{' '}
            <strong className="text-[#eeeaff]">{deleteConfirm?.name}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2">
            <button className={btnBase} onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button className={btnDanger} onClick={() => handleDelete(deleteConfirm.id)}>
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProductModal({ mode, product, onClose, onCreate, onUpdate }) {
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
      const body = {
        name,
        description,
        price: parseFloat(price),
        stock: Number.isNaN(parsedStock) ? 0 : parsedStock,
        category,
        image_url: imageUrl,
      }
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border border-white/15 bg-[rgba(25,20,45,0.95)] shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#eeeaff]">
            {mode === 'create' ? 'Create Product' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#eeeaff]">Name</label>
            <input
              type="text"
              className={fieldInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Product name"
            />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#eeeaff]">Description</label>
            <input
              type="text"
              className={fieldInputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div className="mb-4 flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#eeeaff]">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={fieldInputClass}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#eeeaff]">Stock</label>
              <input
                type="number"
                min="0"
                className={fieldInputClass}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#eeeaff]">Category</label>
            <input
              type="text"
              className={fieldInputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Footwear"
            />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#eeeaff]">Image URL</label>
            <input
              type="text"
              className={fieldInputClass}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className={btnBase} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnCreate} disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProductManagement
