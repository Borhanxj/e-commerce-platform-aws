import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function RegisterPage({ onBack }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Registration failed')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const wrapperCls =
    'flex min-h-svh items-center justify-center p-6 bg-[linear-gradient(170deg,#0e0b1c_0%,#160f2a_40%,#1a1035_70%,#100d1e_100%)]'
  const cardCls =
    'w-full max-w-sm rounded-[20px] border border-white/15 bg-white/8 p-10 shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl'
  const inputCls =
    'border-white/10 bg-white/5 text-[#eeeaff] placeholder:text-white/30 focus-visible:ring-purple-400/40 focus-visible:border-purple-400'

  if (success) {
    return (
      <div className={wrapperCls}>
        <div className={cardCls}>
          <h1 className="mb-7 text-center text-3xl font-medium text-[#eeeaff]">Account created</h1>
          <p className="mb-6 text-[rgba(190,178,215,0.82)]">
            Your account has been created. You can now sign in.
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
        <h1 className="mb-7 text-center text-3xl font-medium text-[#eeeaff]">Create account</h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reg-name" className="text-[#eeeaff]">
              Name
            </Label>
            <Input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jane Smith"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reg-email" className="text-[#eeeaff]">
              Email
            </Label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reg-password" className="text-[#eeeaff]">
              Password
            </Label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reg-confirm" className="text-[#eeeaff]">
              Confirm password
            </Label>
            <Input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer border-0 bg-transparent p-0 text-sm text-purple-400 underline underline-offset-2 hover:opacity-75"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
