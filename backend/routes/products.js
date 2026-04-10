const express = require('express')
const pool = require('../db')

const router = express.Router()

// GET /api/products/search — search products by name or description, ?q= ?limit=
// Empty or missing q returns all products sorted alphabetically.
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim()
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))

  // Single-character queries match too broadly — reject them early
  if (q.length === 1) return res.json({ products: [] })

  const whereClause = q ? 'WHERE (p.name ILIKE $1 OR p.description ILIKE $1)' : ''
  const params = q ? [`%${q}%`, limit] : [limit]

  const result = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url, p.created_at,
            GREATEST(0, p.stock - COALESCE(SUM(sr.quantity), 0)) AS available_stock,
            pd.discount_percent,
            CASE WHEN pd.discount_percent IS NOT NULL
                 THEN ROUND(p.price * (1 - pd.discount_percent / 100.0), 2)
                 ELSE NULL
            END AS discounted_price
     FROM products p
     LEFT JOIN stock_reservations sr ON sr.product_id = p.id AND sr.expires_at > NOW()
     LEFT JOIN product_discounts pd ON pd.product_id = p.id
       AND pd.start_at <= NOW()
       AND (pd.end_at IS NULL OR pd.end_at > NOW())
     ${whereClause}
     GROUP BY p.id, pd.discount_percent
     ORDER BY p.name ASC
     LIMIT $${params.length}`,
    params
  )

  res.json({ products: result.rows })
})

// GET /api/products — list products, optional ?category= and ?limit=
router.get('/', async (req, res) => {
  const category = (req.query.category || '').trim()
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))

  let where = []
  let params = []
  let idx = 1

  if (category) {
    where.push(`p.category = $${idx}`)
    params.push(category)
    idx++
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const result = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url, p.created_at,
            GREATEST(0, p.stock - COALESCE(SUM(sr.quantity), 0)) AS available_stock,
            pd.discount_percent,
            CASE WHEN pd.discount_percent IS NOT NULL
                 THEN ROUND(p.price * (1 - pd.discount_percent / 100.0), 2)
                 ELSE NULL
            END AS discounted_price
     FROM products p
     LEFT JOIN stock_reservations sr ON sr.product_id = p.id AND sr.expires_at > NOW()
     LEFT JOIN product_discounts pd ON pd.product_id = p.id
       AND pd.start_at <= NOW()
       AND (pd.end_at IS NULL OR pd.end_at > NOW())
     ${whereClause}
     GROUP BY p.id, pd.discount_percent
     ORDER BY p.created_at DESC
     LIMIT $${idx}`,
    [...params, limit]
  )

  res.json({ products: result.rows })
})

module.exports = router
