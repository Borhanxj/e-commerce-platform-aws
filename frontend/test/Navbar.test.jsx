import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Navbar from '../src/pages/home/components/Navbar'

const defaultProps = {
  isLoggedIn: false,
  userEmail: '',
  onNavigate: vi.fn(),
  onRequireAuth: vi.fn(),
  onLogout: vi.fn(),
  cartCount: 0,
  wishlistCount: 0,
  searchQuery: '',
  setSearchQuery: vi.fn(),
}

describe('Navbar', () => {
  it('renders the brand name', () => {
    render(<Navbar {...defaultProps} />)

    expect(screen.getByText('FIER')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    render(<Navbar {...defaultProps} />)

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('calls onRequireAuth when cart is clicked while logged out', async () => {
    const onRequireAuth = vi.fn()
    render(<Navbar {...defaultProps} onRequireAuth={onRequireAuth} />)

    await userEvent.click(screen.getByRole('button', { name: /shopping cart/i }))

    expect(onRequireAuth).toHaveBeenCalledOnce()
  })

  it('calls onNavigate with "cart" when cart is clicked while logged in', async () => {
    const onNavigate = vi.fn()
    render(<Navbar {...defaultProps} isLoggedIn={true} onNavigate={onNavigate} />)

    await userEvent.click(screen.getByRole('button', { name: /shopping cart/i }))

    expect(onNavigate).toHaveBeenCalledWith('cart')
  })

  it('shows cart badge when cartCount is greater than 0', () => {
    render(<Navbar {...defaultProps} cartCount={3} />)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows user email in dropdown when logged in', async () => {
    render(<Navbar {...defaultProps} isLoggedIn={true} userEmail="test@example.com" />)

    await userEvent.click(screen.getByRole('button', { name: /account menu/i }))

    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('calls onLogout when Sign Out is clicked', async () => {
    const onLogout = vi.fn()
    render(<Navbar {...defaultProps} isLoggedIn={true} onLogout={onLogout} />)

    await userEvent.click(screen.getByRole('button', { name: /account menu/i }))
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }))

    expect(onLogout).toHaveBeenCalledOnce()
  })
})
