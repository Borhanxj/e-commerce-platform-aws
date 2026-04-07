import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const wrapperCls =
  'flex min-h-svh items-center justify-center p-6 bg-[linear-gradient(170deg,#0e0b1c_0%,#160f2a_40%,#1a1035_70%,#100d1e_100%)]'
const cardCls =
  'w-full max-w-sm rounded-[20px] border border-white/15 bg-white/8 p-10 shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl'

function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Something went wrong')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={wrapperCls}>
        <div className={cardCls}>
          <h1 className="mb-7 text-center text-3xl font-medium text-[#eeeaff]">Check your email</h1>
          <p className="mb-6 text-[rgba(190,178,215,0.82)]">
            If an account exists for <strong>{email}</strong>, you'll receive a password reset link
            shortly.
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

  return (
    <div className={wrapperCls}>
      <div className={cardCls}>
        <h1 className="mb-7 text-center text-3xl font-medium text-[#eeeaff]">Reset password</h1>
        <p className="mb-6 text-left text-[rgba(190,178,215,0.82)]">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-email" className="text-[#eeeaff]">
              Email
            </Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="border-white/10 bg-white/5 text-[#eeeaff] placeholder:text-white/30 focus-visible:border-purple-400 focus-visible:ring-purple-400/40"
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
            {loading ? 'Sending…' : 'Send reset link'}
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

export default ForgotPasswordPage
