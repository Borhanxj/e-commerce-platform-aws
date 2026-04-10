const express = require('express')
const authenticate = require('../middleware/auth')
const requireSalesManager = require('../middleware/sales-manager')
const pool = require('../db')

const router = express.Router()

router.use(authenticate)
router.use(requireSalesManager)

// GET /api/sales-manager/products — paginated product list with active discount info
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15))
  const offset = (page - 1) * limit

  const countResult = await pool.query('SELECT COUNT(*) FROM products')
  const total = parseInt(countResult.rows[0].count)

  const dataResult = await pool.query(
    `SELECT p.id, p.name, p.category, p.price, p.stock,
            pd.discount_percent,
            CASE WHEN pd.discount_percent IS NOT NULL
                 THEN ROUND(p.price * (1 - pd.discount_percent / 100.0), 2)
                 ELSE NULL
            END AS discounted_price
     FROM products p
     LEFT JOIN product_discounts pd ON pd.product_id = p.id
       AND pd.start_at <= NOW()
       AND (pd.end_at IS NULL OR pd.end_at > NOW())
     ORDER BY p.name ASC LIMIT $1 OFFSET $2`,
    [limit, offset]
  )

  res.json({
    products: dataResult.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

// PATCH /api/sales-manager/products/:id/price — update price only
router.patch('/:id/price', async (req, res) => {
  const productId = parseInt(req.params.id, 10)
  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const { price } = req.body

  if (price == null) {
    return res.status(400).json({ error: 'Price is required' })
  }

  if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' })
  }

  const existing = await pool.query('SELECT id FROM products WHERE id = $1', [productId])
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found' })
  }

  const result = await pool.query(
    'UPDATE products SET price = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [price, productId]
  )

  res.json({ product: result.rows[0] })
})

// POST /api/sales-manager/products/discount — apply discount to one or more products
router.post('/discount', async (req, res) => {
  const { productIds, discountPercent } = req.body

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'productIds must be a non-empty array' })
  }

  const ids = [...new Set(productIds.map(Number))]
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    return res.status(400).json({ error: 'All product IDs must be positive integers' })
  }

  const pct = Number(discountPercent)
  if (!Number.isInteger(pct) || pct < 1 || pct > 100) {
    return res.status(400).json({ error: 'discountPercent must be an integer between 1 and 100' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const productsResult = await client.query(
      'SELECT id, name, price FROM products WHERE id = ANY($1)',
      [ids]
    )
    if (productsResult.rows.length !== ids.length) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'One or more products not found' })
    }

    await client.query(
      `INSERT INTO product_discounts (product_id, discount_percent, created_by)
       SELECT id, $2, $3 FROM UNNEST($1::int[]) AS id
       ON CONFLICT (product_id) DO UPDATE
         SET discount_percent = EXCLUDED.discount_percent,
             created_by = EXCLUDED.created_by,
             start_at = NOW(),
             end_at = NULL`,
      [ids, pct, req.user.userId]
    )

    const wishlistResult = await client.query(
      `INSERT INTO notifications (user_id, product_id, product_name, original_price, discounted_price, discount_percent)
       SELECT wi.user_id, p.id, p.name, p.price,
              ROUND(p.price * (1 - $2 / 100.0), 2),
              $2
       FROM wishlist_items wi
       JOIN products p ON p.id = wi.product_id
       WHERE wi.product_id = ANY($1)
       RETURNING user_id`,
      [ids, pct]
    )

    await client.query('COMMIT')
    res.json({ updated: productsResult.rows.length, notified: wishlistResult.rows.length })
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
})

// DELETE /api/sales-manager/products/:id/discount — remove active discount from a product
router.delete('/:id/discount', async (req, res) => {
  const productId = parseInt(req.params.id, 10)
  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  const existing = await pool.query('SELECT id FROM products WHERE id = $1', [productId])
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Product not found' })
  }

  await pool.query('DELETE FROM product_discounts WHERE product_id = $1', [productId])
  res.status(204).send()
})

module.exports = router
