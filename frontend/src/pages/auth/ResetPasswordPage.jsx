import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const wrapperCls =
  'flex min-h-svh items-center justify-center p-6 bg-[linear-gradient(170deg,#0e0b1c_0%,#160f2a_40%,#1a1035_70%,#100d1e_100%)]'
const cardCls =
  'w-full max-w-sm rounded-[20px] border border-white/15 bg-white/8 p-10 shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl'
const inputCls =
  'border-white/10 bg-white/5 text-[#eeeaff] placeholder:text-white/30 focus-visible:ring-purple-400/40 focus-visible:border-purple-400'

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
      <div className={wrapperCls}>
        <div className={cardCls}>
          <h1 className="mb-7 text-center text-3xl font-medium text-[#eeeaff]">Invalid link</h1>
          <p className="mb-6 text-[rgba(190,178,215,0.82)]">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button
            onClick={onBack}
            className="w-full bg-purple-400 text-[#100d1e] hover:bg-purple-300"
          >
            Back to sign in
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className={wrapperCls}>
        <div className={cardCls}>
          <h1 className="mb-7 text-center text-3xl font-medium text-[#eeeaff]">Password reset</h1>
          <p className="mb-6 text-[rgba(190,178,215,0.82)]">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Button
            onClick={onBack}
            className="w-full bg-purple-400 text-[#100d1e] hover:bg-purple-300"
          >
            Sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperCls}>
      <div className={cardCls}>
        <h1 className="mb-7 text-center text-3xl font-medium text-[#eeeaff]">Set new password</h1>
        <p className="mb-6 text-left text-[rgba(190,178,215,0.82)]">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-pw" className="text-[#eeeaff]">
              New Password
            </Label>
            <Input
              id="reset-pw"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-pw-confirm" className="text-[#eeeaff]">
              Confirm Password
            </Label>
            <Input
              id="reset-pw-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-purple-400 text-[#100d1e] hover:bg-purple-300 disabled:opacity-55"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer border-0 bg-transparent p-0 text-sm text-purple-400 underline underline-offset-2 hover:opacity-75"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
