const express = require('express');
const bcrypt = require('bcrypt');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const pool = require('../db');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/me — verify admin session and return admin profile
router.get('/me', async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, role, created_at FROM auth.users WHERE id = $1',
    [req.user.userId]
  );
  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

// ─── User Management ────────────────────────────────────────────────

// GET /api/admin/users — list users with pagination and search
router.get('/users', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const role = (req.query.role || '').trim();

  let where = [];
  let params = [];
  let idx = 1;

  if (search) {
    where.push(`email ILIKE $${idx}`);
    params.push(`%${search}%`);
    idx++;
  }

  if (role) {
    where.push(`role = $${idx}::auth.user_role`);
    params.push(role);
    idx++;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM auth.users ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  const dataResult = await pool.query(
    `SELECT id, email, role, created_at FROM auth.users ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  res.json({
    users: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/admin/users/:id — get single user
router.get('/users/:id', async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, role, created_at FROM auth.users WHERE id = $1',
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user: result.rows[0] });
});

// POST /api/admin/users — create a new user
router.post('/users', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const validRoles = ['customer', 'sales_manager', 'product_manager', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'customer';

  const existing = await pool.query('SELECT id FROM auth.users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO auth.users (email, password_hash, role) VALUES ($1, $2, $3::auth.user_role) RETURNING id, email, role, created_at',
    [email, hash, userRole]
  );

  res.status(201).json({ user: result.rows[0] });
});

// PUT /api/admin/users/:id — update user (email, role, optional password)
router.put('/users/:id', async (req, res) => {
  const { email, role, password } = req.body;
  const userId = req.params.id;

  const existing = await pool.query('SELECT id FROM auth.users WHERE id = $1', [userId]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent admin from demoting themselves
  if (parseInt(userId) === req.user.userId && role && role !== 'admin') {
    return res.status(400).json({ error: 'You cannot change your own role' });
  }

  const validRoles = ['customer', 'sales_manager', 'product_manager', 'admin'];
  let sets = [];
  let params = [];
  let idx = 1;

  if (email) {
    const dup = await pool.query('SELECT id FROM auth.users WHERE email = $1 AND id != $2', [email, userId]);
    if (dup.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    sets.push(`email = $${idx}`);
    params.push(email);
    idx++;
  }

  if (role && validRoles.includes(role)) {
    sets.push(`role = $${idx}::auth.user_role`);
    params.push(role);
    idx++;
  }

  if (password) {
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const hash = await bcrypt.hash(password, 10);
    sets.push(`password_hash = $${idx}`);
    params.push(hash);
    idx++;
  }

  if (sets.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(userId);
  const result = await pool.query(
    `UPDATE auth.users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, email, role, created_at`,
    params
  );

  res.json({ user: result.rows[0] });
});

// DELETE /api/admin/users/:id — delete user
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  // Prevent admin from deleting themselves
  if (parseInt(userId) === req.user.userId) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  const result = await pool.query('DELETE FROM auth.users WHERE id = $1 RETURNING id', [userId]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ message: 'User deleted successfully' });
});

module.exports = router;
