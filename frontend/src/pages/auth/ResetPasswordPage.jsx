import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './LoginPage.css'

function ResetPasswordPage({ onBack }) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h1>Invalid link</h1>
          <p style={{ marginBottom: '24px', color: 'var(--text)' }}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button className="login-btn" onClick={onBack}>Back to sign in</button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h1>Password reset</h1>
          <p style={{ marginBottom: '24px', color: 'var(--text)' }}>
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <button className="login-btn" onClick={onBack}>Sign in</button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>Set new password</h1>
        <p style={{ marginBottom: '24px', color: 'var(--text)', textAlign: 'left' }}>
          Enter your new password below.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="reset-pw">New Password</label>
            <input
              id="reset-pw"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="field">
            <label htmlFor="reset-pw-confirm">Confirm Password</label>
            <input
              id="reset-pw-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
        <div className="login-links">
          <button type="button" className="link-btn" onClick={onBack}>
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
