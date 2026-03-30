const express = require('express');
const authenticate = require('../middleware/auth');
const requireProductManager = require('../middleware/product-manager');
const pool = require('../db');

const router = express.Router();

router.use(authenticate);
router.use(requireProductManager);

// ─── Products ────────────────────────────────────────────────────────────────

// GET /api/product-manager/categories
router.get('/categories', async (req, res) => {
  const result = await pool.query(
    'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
  );
  res.json({ categories: result.rows.map((r) => r.category) });
});

// GET /api/product-manager/products
router.get('/products', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const category = (req.query.category || '').trim();

  let where = [];
  let params = [];
  let idx = 1;

  if (search) { where.push(`name ILIKE $${idx}`); params.push(`%${search}%`); idx++; }
  if (category) { where.push(`category = $${idx}`); params.push(category); idx++; }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) FROM products ${whereClause}`, params);
  const total = parseInt(countResult.rows[0].count);

  const dataResult = await pool.query(
    `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  res.json({
    products: dataResult.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/product-manager/products/:id
router.get('/products/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: result.rows[0] });
});

// POST /api/product-manager/products
router.post('/products', async (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'Name and price are required' });
  if (parseFloat(price) < 0) return res.status(400).json({ error: 'Price must be non-negative' });

  const result = await pool.query(
    `INSERT INTO products (name, description, price, stock, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, description || null, price, Number.isFinite(parseInt(stock)) ? parseInt(stock) : 0, category || null, image_url || null]
  );
  res.status(201).json({ product: result.rows[0] });
});

// PUT /api/product-manager/products/:id
router.put('/products/:id', async (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;
  const productId = req.params.id;

  const existing = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

  let sets = [];
  let params = [];
  let idx = 1;

  if (name !== undefined) { sets.push(`name = $${idx}`); params.push(name); idx++; }
  if (description !== undefined) { sets.push(`description = $${idx}`); params.push(description); idx++; }
  if (price !== undefined) {
    if (parseFloat(price) < 0) return res.status(400).json({ error: 'Price must be non-negative' });
    sets.push(`price = $${idx}`); params.push(price); idx++;
  }
  if (stock !== undefined) { sets.push(`stock = $${idx}`); params.push(Number.isFinite(parseInt(stock)) ? parseInt(stock) : 0); idx++; }
  if (category !== undefined) { sets.push(`category = $${idx}`); params.push(category); idx++; }
  if (image_url !== undefined) { sets.push(`image_url = $${idx}`); params.push(image_url); idx++; }

  if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

  sets.push(`updated_at = NOW()`);
  params.push(productId);

  const result = await pool.query(
    `UPDATE products SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
  res.json({ product: result.rows[0] });
});

// DELETE /api/product-manager/products/:id
router.delete('/products/:id', async (req, res) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted successfully' });
});

// ─── Orders ──────────────────────────────────────────────────────────────────

// GET /api/product-manager/orders
router.get('/orders', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;
  const status = (req.query.status || '').trim();
  const search = (req.query.search || '').trim();

  const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  let where = [];
  let params = [];
  let idx = 1;

  if (status && VALID_STATUSES.includes(status)) {
    where.push(`o.status = $${idx}::order_status`);
    params.push(status);
    idx++;
  }
  if (search) {
    where.push(`u.email ILIKE $${idx}`);
    params.push(`%${search}%`);
    idx++;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM orders o JOIN auth.users u ON u.id = o.user_id ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  const dataResult = await pool.query(
    `SELECT o.id, o.status, o.total, o.address, o.created_at, o.updated_at,
            u.id AS user_id, u.email AS user_email
     FROM orders o
     JOIN auth.users u ON u.id = o.user_id
     ${whereClause}
     ORDER BY o.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  res.json({
    orders: dataResult.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/product-manager/orders/:id
router.get('/orders/:id', async (req, res) => {
  const orderResult = await pool.query(
    `SELECT o.id, o.status, o.total, o.address, o.created_at, o.updated_at,
            u.id AS user_id, u.email AS user_email
     FROM orders o
     JOIN auth.users u ON u.id = o.user_id
     WHERE o.id = $1`,
    [req.params.id]
  );
  if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

  const itemsResult = await pool.query(
    `SELECT oi.id, oi.quantity, oi.price, p.id AS product_id, p.name AS product_name
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.id`,
    [req.params.id]
  );

  res.json({ order: orderResult.rows[0], items: itemsResult.rows });
});

// ─── Comments / Reviews ──────────────────────────────────────────────────────

// GET /api/product-manager/comments
router.get('/comments', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15));
  const offset = (page - 1) * limit;
  const status = (req.query.status || '').trim();

  let where = [];
  let params = [];
  let idx = 1;

  if (status) { where.push(`r.status = $${idx}::review_status`); params.push(status); idx++; }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM product_reviews r ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  const dataResult = await pool.query(
    `SELECT r.id, r.rating, r.content, r.status, r.created_at,
            p.name AS product_name,
            u.email AS customer_email
     FROM product_reviews r
     JOIN products p ON p.id = r.product_id
     JOIN auth.users u ON u.id = r.user_id
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  res.json({
    comments: dataResult.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// PUT /api/product-manager/comments/:id/approve
router.put('/comments/:id/approve', async (req, res) => {
  const result = await pool.query(
    `UPDATE product_reviews SET status = 'approved' WHERE id = $1 RETURNING id, status`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
  res.json({ comment: result.rows[0] });
});

// PUT /api/product-manager/comments/:id/reject
router.put('/comments/:id/reject', async (req, res) => {
  const result = await pool.query(
    `UPDATE product_reviews SET status = 'rejected' WHERE id = $1 RETURNING id, status`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
  res.json({ comment: result.rows[0] });
});

module.exports = router;
