import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import NotificationBell from '../src/pages/home/components/NotificationBell'

const TOKEN = 'test-token'

function makeFetch(notifications = [], unreadCount = 0) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ notifications, unreadCount }),
  })
}

const unreadNotification = {
  id: 1,
  product_name: 'Cool Gadget',
  original_price: '50.00',
  discounted_price: '40.00',
  discount_percent: 20,
  is_read: false,
}

const readNotification = {
  id: 2,
  product_name: 'Old Deal',
  original_price: '30.00',
  discounted_price: '24.00',
  discount_percent: 20,
  is_read: true,
}

describe('NotificationBell', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders bell button with accessible label', async () => {
    vi.stubGlobal('fetch', makeFetch())
    render(<NotificationBell token={TOKEN} />)

    // findBy* waits for the component to settle after the initial fetch
    expect(await screen.findByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows no unread badge when unreadCount is 0', async () => {
    vi.stubGlobal('fetch', makeFetch([], 0))
    render(<NotificationBell token={TOKEN} />)

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows unread badge with count when unreadCount > 0', async () => {
    vi.stubGlobal('fetch', makeFetch([unreadNotification], 1))
    render(<NotificationBell token={TOKEN} />)

    expect(await screen.findByText('1')).toBeInTheDocument()
  })

  it('caps badge at "9+" when unreadCount > 9', async () => {
    const manyNotifications = Array.from({ length: 10 }, (_, i) => ({
      ...unreadNotification,
      id: i + 1,
    }))
    vi.stubGlobal('fetch', makeFetch(manyNotifications, 10))
    render(<NotificationBell token={TOKEN} />)

    expect(await screen.findByText('9+')).toBeInTheDocument()
  })

  it('opens dropdown and shows notifications on bell click', async () => {
    vi.stubGlobal('fetch', makeFetch([unreadNotification], 1))
    render(<NotificationBell token={TOKEN} />)

    await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

    expect(await screen.findByText('Cool Gadget')).toBeInTheDocument()
    expect(screen.getByText(/price dropped from/i)).toBeInTheDocument()
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.getByText('$40.00')).toBeInTheDocument()
    expect(screen.getByText('(-20%)')).toBeInTheDocument()
  })

  it('shows "No notifications yet" when list is empty', async () => {
    vi.stubGlobal('fetch', makeFetch([], 0))
    render(<NotificationBell token={TOKEN} />)

    await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

    expect(await screen.findByText(/no notifications yet/i)).toBeInTheDocument()
  })

  it('shows "Mark all as read" button only when there are unread notifications', async () => {
    vi.stubGlobal('fetch', makeFetch([unreadNotification], 1))
    render(<NotificationBell token={TOKEN} />)

    await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

    expect(await screen.findByRole('button', { name: /mark all as read/i })).toBeInTheDocument()
  })

  it('does not show "Mark all as read" when all notifications are read', async () => {
    vi.stubGlobal('fetch', makeFetch([readNotification], 0))
    render(<NotificationBell token={TOKEN} />)

    await userEvent.click(screen.getByRole('button', { name: /notifications/i }))

    await screen.findByText('Old Deal')
    expect(screen.queryByRole('button', { name: /mark all as read/i })).not.toBeInTheDocument()
  })

  it('calls PATCH /read when an unread notification is clicked and marks it read', async () => {
    const mockFetch = vi
      .fn()
      // Initial load
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [unreadNotification], unreadCount: 1 }),
      })
      // Bell open refetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [unreadNotification], unreadCount: 1 }),
      })
      // PATCH /read
      .mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('fetch', mockFetch)

    render(<NotificationBell token={TOKEN} />)

    await userEvent.click(screen.getByRole('button', { name: /notifications/i }))
    const notifButton = await screen.findByRole('button', { name: /cool gadget/i })
    await userEvent.click(notifButton)

    await waitFor(() => {
      const patchCall = mockFetch.mock.calls.find(
        (call) => call[1]?.method === 'PATCH' && call[0].includes('/read')
      )
      expect(patchCall).toBeDefined()
    })
  })

  it('calls PATCH /read-all and clears unread badge when "Mark all as read" is clicked', async () => {
    const mockFetch = vi
      .fn()
      // Initial load
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [unreadNotification], unreadCount: 1 }),
      })
      // Bell open refetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [unreadNotification], unreadCount: 1 }),
      })
      // PATCH /read-all
      .mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('fetch', mockFetch)

    render(<NotificationBell token={TOKEN} />)

    await userEvent.click(screen.getByRole('button', { name: /notifications/i }))
    const markAllBtn = await screen.findByRole('button', { name: /mark all as read/i })
    await userEvent.click(markAllBtn)

    await waitFor(() => {
      const patchCall = mockFetch.mock.calls.find(
        (call) => call[1]?.method === 'PATCH' && call[0].includes('read-all')
      )
      expect(patchCall).toBeDefined()
    })
    // Badge should be gone
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('does not fetch when no token is provided', () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    render(<NotificationBell token={null} />)

    expect(mockFetch).not.toHaveBeenCalled()
  })
})
