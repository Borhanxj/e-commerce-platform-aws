require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

async function seedAdmin() {
  try {
    const existing = await pool.query('SELECT id FROM auth.users WHERE email = $1', [EMAIL]);
    if (existing.rows.length > 0) {
      console.log(`Admin user "${EMAIL}" already exists (id: ${existing.rows[0].id}). Skipping.`);
      process.exit(0);
    }

    const hash = await bcrypt.hash(PASSWORD, 10);
    const result = await pool.query(
      'INSERT INTO auth.users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [EMAIL, hash, 'admin']
    );

    console.log('Admin user created:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
