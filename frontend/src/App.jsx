import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import HomePage from './pages/home/HomePage'
import CartPage from './pages/cart/CartPage'
import WishlistPage from './pages/wishlist/WishlistPage'
import CategoryPage from './pages/category/CategoryPage'
import AccountSettingsPage from './pages/account/AccountSettingsPage'
import OrdersPage from './pages/orders/OrdersPage'
import HelpPage from './pages/help/HelpPage'
import './App.css'

function CategoryRoute() {
  const { state } = useLocation()
  const navigate = useNavigate()
  return <CategoryPage category={state?.category} onBack={() => navigate(-1)} />
}

function App() {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  function handleLogin(t) {
    const payload = JSON.parse(atob(t.split('.')[1]))
    setToken(t)
    setUser({ email: payload.email })
    navigate('/')
  }

  function requireAuth() {
    navigate('/login')
  }

  function handleNavigate(nextView, data) {
    if (nextView === 'category') {
      navigate('/category', { state: { category: data } })
    } else {
      navigate('/' + nextView)
    }
  }

  return (
    <Routes>
      <Route path="/" element={
        <HomePage
          isLoggedIn={!!token}
          userEmail={user?.email}
          onNavigate={handleNavigate}
          onRequireAuth={requireAuth}
          onLogout={() => { setToken(null); setUser(null); navigate('/') }}
        />
      } />
      <Route path="/login" element={
        <LoginPage
          onLogin={handleLogin}
          onRegister={() => navigate('/register')}
          onForgotPassword={() => navigate('/forgot-password')}
        />
      } />
      <Route path="/register"        element={<RegisterPage onBack={() => navigate('/login')} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage onBack={() => navigate('/login')} />} />
      <Route path="/cart"             element={<CartPage onBack={() => navigate(-1)} />} />
      <Route path="/wishlist"         element={<WishlistPage onBack={() => navigate(-1)} />} />
      <Route path="/category"         element={<CategoryRoute />} />
      <Route path="/account-settings" element={<AccountSettingsPage onBack={() => navigate(-1)} />} />
      <Route path="/orders"           element={<OrdersPage onBack={() => navigate(-1)} />} />
      <Route path="/help"             element={<HelpPage onBack={() => navigate(-1)} />} />
      <Route path="*"                 element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
