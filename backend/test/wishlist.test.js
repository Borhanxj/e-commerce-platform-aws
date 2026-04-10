const request = require('supertest')

jest.mock('../db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}))

const pool = require('../db')

process.env.JWT_SECRET = 'test-secret'

const app = require('../app')

const jwt = require('jsonwebtoken')
const userToken = jwt.sign(
  { userId: 42, email: 'user@example.com', role: 'customer' },
  'test-secret'
)

const wishlistRows = [
  {
    id: 1,
    name: 'Widget',
    price: '19.99',
    available_stock: '5',
    discount_percent: null,
    discounted_price: null,
  },
]

describe('GET /api/wishlist', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when no token provided', async () => {
    const res = await request(app).get('/api/wishlist')

    expect(res.status).toBe(401)
  })

  it('returns items for authenticated user', async () => {
    pool.query.mockResolvedValueOnce({ rows: wishlistRows })

    const res = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('items')
    expect(res.body.items).toHaveLength(1)
    expect(res.body.items[0].name).toBe('Widget')
  })

  it('returns empty items array when wishlist is empty', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.items).toEqual([])
  })

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('db error'))

    const res = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(500)
  })
})

describe('POST /api/wishlist', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when no token provided', async () => {
    const res = await request(app).post('/api/wishlist').send({ productId: 1 })

    expect(res.status).toBe(401)
  })

  it('returns 400 when productId is missing', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('productId is required')
  })

  it('returns 404 when product does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: 999 })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Product not found')
  })

  it('adds item and returns updated wishlist', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // product exists
      .mockResolvedValueOnce({ rows: [] }) // INSERT ON CONFLICT DO NOTHING
      .mockResolvedValueOnce({ rows: wishlistRows }) // fetchWishlist

    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: 1 })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('items')
    expect(res.body.items).toHaveLength(1)
    expect(res.body.items[0].name).toBe('Widget')
  })

  it('is idempotent — second add does not duplicate the item', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // product exists
      .mockResolvedValueOnce({ rows: [] }) // INSERT ON CONFLICT DO NOTHING (no-op)
      .mockResolvedValueOnce({ rows: wishlistRows }) // fetchWishlist still returns 1 row

    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: 1 })

    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(1)
  })

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('db error'))

    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: 1 })

    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/wishlist/:productId', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when no token provided', async () => {
    const res = await request(app).delete('/api/wishlist/1')

    expect(res.status).toBe(401)
  })

  it('removes item and returns updated wishlist', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // DELETE
      .mockResolvedValueOnce({ rows: [] }) // fetchWishlist (now empty)

    const res = await request(app)
      .delete('/api/wishlist/1')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('items')
    expect(res.body.items).toEqual([])
  })

  it('returns remaining items after removal', async () => {
    const remainingRows = [
      {
        id: 2,
        name: 'Gadget',
        price: '29.99',
        available_stock: '3',
        discount_percent: null,
        discounted_price: null,
      },
    ]
    pool.query
      .mockResolvedValueOnce({ rows: [] }) // DELETE
      .mockResolvedValueOnce({ rows: remainingRows }) // fetchWishlist

    const res = await request(app)
      .delete('/api/wishlist/1')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(1)
    expect(res.body.items[0].name).toBe('Gadget')
  })

  it('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('db error'))

    const res = await request(app)
      .delete('/api/wishlist/1')
      .set('Authorization', `Bearer ${userToken}`)

    expect(res.status).toBe(500)
  })
})
