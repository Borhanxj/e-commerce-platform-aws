import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../src/pages/home/components/Navbar'
import { ThemeProvider } from '../src/context/ThemeContext'

const defaultProps = {
  isLoggedIn: false,
  userEmail: '',
  token: null,
  onNavigate: vi.fn(),
  onRequireAuth: vi.fn(),
  onLogout: vi.fn(),
  cartCount: 0,
  wishlistCount: 0,
  searchQuery: '',
  setSearchQuery: vi.fn(),
}

function renderNavbar(props = {}) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Navbar {...defaultProps} {...props} />
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  it('renders the brand name', () => {
    renderNavbar()

    expect(screen.getByText('FIER')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    renderNavbar()

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('calls onNavigate with "cart" when cart is clicked while logged out', async () => {
    const onNavigate = vi.fn()
    renderNavbar({ isLoggedIn: false, onNavigate })

    await userEvent.click(screen.getByRole('button', { name: /shopping cart/i }))

    expect(onNavigate).toHaveBeenCalledWith('cart')
  })

  it('calls onNavigate with "cart" when cart is clicked while logged in', async () => {
    const onNavigate = vi.fn()
    renderNavbar({ isLoggedIn: true, onNavigate })

    await userEvent.click(screen.getByRole('button', { name: /shopping cart/i }))

    expect(onNavigate).toHaveBeenCalledWith('cart')
  })

  it('shows cart badge when cartCount is greater than 0', () => {
    renderNavbar({ cartCount: 3 })

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows user email in dropdown when logged in', async () => {
    renderNavbar({ isLoggedIn: true, userEmail: 'test@example.com' })

    await userEvent.click(screen.getByRole('button', { name: /account menu/i }))

    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('calls onLogout when Sign Out is clicked', async () => {
    const onLogout = vi.fn()
    renderNavbar({ isLoggedIn: true, onLogout })

    await userEvent.click(screen.getByRole('button', { name: /account menu/i }))
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }))

    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('renders NotificationBell when logged in with a token', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ notifications: [], unreadCount: 0 }) })
    )
    await act(async () => {
      renderNavbar({ isLoggedIn: true, token: 'test-token' })
    })

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it('does not render NotificationBell when logged out', () => {
    renderNavbar({ isLoggedIn: false, token: null })

    expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument()
  })

  it('does not render NotificationBell when logged in without a token', () => {
    renderNavbar({ isLoggedIn: true, token: null })

    expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument()
  })
})
