require('dotenv').config()

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.')
  process.exit(1)
}

const app = require('./app')
const pool = require('./db')

const PORT = process.env.PORT || 3000

// Test endpoint - çalışıyor mu diye kontrol
app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ message: 'Backend çalışıyor!', db: 'DB bağlı!' })
  } catch (err) {
    res.status(500).json({ message: 'DB connection failed', error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`)
})
