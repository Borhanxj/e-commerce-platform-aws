const request = require('supertest')

jest.mock('../db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}))

const pool = require('../db')

process.env.JWT_SECRET = 'test-secret'

const app = require('../app')

const jwt = require('jsonwebtoken')
const customerToken = jwt.sign({ userId: 2, email: 'c@test.com', role: 'customer' }, 'test-secret')
const otherToken = jwt.sign(
  { userId: 99, email: 'other@test.com', role: 'customer' },
  'test-secret'
)

const sampleNotification = {
  id: 1,
  product_id: 10,
  product_name: 'Blue Shirt',
  original_price: '99.99',
  discounted_price: '79.99',
  discount_percent: 20,
  is_read: false,
  created_at: new Date().toISOString(),
}

describe('GET /api/notifications', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/notifications')
    expect(res.status).toBe(401)
  })

  it('returns notifications in descending order with unread count', async () => {
    const readNotification = { ...sampleNotification, id: 2, is_read: true }
    pool.query.mockResolvedValueOnce({ rows: [sampleNotification, readNotification] })

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customerToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('notifications')
    expect(res.body.notifications).toHaveLength(2)
    expect(res.body.unreadCount).toBe(1)
  })

  it('returns empty list when user has no notifications', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.notifications).toHaveLength(0)
    expect(res.body.unreadCount).toBe(0)
  })
})

describe('PATCH /api/notifications/:id/read', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 without token', async () => {
    const res = await request(app).patch('/api/notifications/1/read')
    expect(res.status).toBe(401)
  })

  it('returns 404 for non-existent notification', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .patch('/api/notifications/999/read')
      .set('Authorization', `Bearer ${customerToken}`)

    expect(res.status).toBe(404)
  })

  it('returns 403 when notification belongs to another user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, user_id: 2 }] })

    const res = await request(app)
      .patch('/api/notifications/1/read')
      .set('Authorization', `Bearer ${otherToken}`) // userId 99, not 2

    expect(res.status).toBe(403)
  })

  it('marks notification as read and returns it', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 2 }] }) // ownership check
      .mockResolvedValueOnce({ rows: [{ ...sampleNotification, is_read: true }] }) // UPDATE

    const res = await request(app)
      .patch('/api/notifications/1/read')
      .set('Authorization', `Bearer ${customerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.notification.is_read).toBe(true)
  })
})

describe('PATCH /api/notifications/read-all', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 without token', async () => {
    const res = await request(app).patch('/api/notifications/read-all')
    expect(res.status).toBe(401)
  })

  it('marks all user notifications as read', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${customerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE notifications'),
      [2] // userId from token
    )
  })
})
