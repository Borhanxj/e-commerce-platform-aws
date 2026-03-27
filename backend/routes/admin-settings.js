const express = require('express');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const pool = require('../db');

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/settings — list all settings
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM system_settings ORDER BY key');
  res.json({ settings: result.rows });
});

// PUT /api/admin/settings — bulk update settings
router.put('/', async (req, res) => {
  const { settings } = req.body;

  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({ error: 'Settings array is required' });
  }

  for (const s of settings) {
    if (!s.key || s.value == null) continue;
    await pool.query(
      'UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = $2',
      [String(s.value), s.key]
    );
  }

  const result = await pool.query('SELECT * FROM system_settings ORDER BY key');
  res.json({ settings: result.rows });
});

// GET /api/admin/settings/stats — dashboard analytics
router.get('/stats', async (req, res) => {
  const [users, products, orders, revenue, recentOrders, ordersByStatus] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM auth.users'),
    pool.query('SELECT COUNT(*) FROM products'),
    pool.query('SELECT COUNT(*) FROM orders'),
    pool.query('SELECT COALESCE(SUM(total), 0) AS total_revenue FROM orders WHERE status != $1', ['cancelled']),
    pool.query(
      `SELECT o.id, o.status, o.total, o.created_at, u.email AS user_email
       FROM orders o JOIN auth.users u ON u.id = o.user_id
       ORDER BY o.created_at DESC LIMIT 5`
    ),
    pool.query(
      `SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY status`
    ),
  ]);

  res.json({
    totalUsers: parseInt(users.rows[0].count),
    totalProducts: parseInt(products.rows[0].count),
    totalOrders: parseInt(orders.rows[0].count),
    totalRevenue: parseFloat(revenue.rows[0].total_revenue),
    recentOrders: recentOrders.rows,
    ordersByStatus: ordersByStatus.rows,
  });
});

module.exports = router;
