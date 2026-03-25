import { useState } from 'react'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import ForgotPasswordPage from './ForgotPasswordPage'
import HomePage from './HomePage'
import CartPage from './CartPage'
import './App.css'

function App() {
  const [token, setToken] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [page, setPage] = useState('login')
  const [view, setView] = useState('home')

  function handleLogin(t) {
    setToken(t)
    setShowAuth(false)
  }

  function requireAuth() {
    setPage('login')
    setShowAuth(true)
  }

  if (!token && showAuth) {
    if (page === 'register') {
      return <RegisterPage onBack={() => setPage('login')} />
    }
    if (page === 'forgot-password') {
      return <ForgotPasswordPage onBack={() => setPage('login')} />
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={() => setPage('register')}
        onForgotPassword={() => setPage('forgot-password')}
      />
    )
  }

  if (view === 'cart') {
    return <CartPage onBack={() => setView('home')} />
  }

  return (
    <HomePage
      isLoggedIn={!!token}
      onNavigate={setView}
      onRequireAuth={requireAuth}
      onLogout={() => { setToken(null); setPage('login'); setView('home') }}
    />
  )
}

export default App
