import { useState, useEffect } from 'react'
import API_BASE from '../../api'

const API = `${API_BASE}/api/admin/settings`

const btnCreate =
  'font-[inherit] text-[13px] font-medium px-4 py-2 rounded-[10px] bg-purple-400 text-white border-none cursor-pointer transition-opacity duration-150 hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed'

function SettingsManagement({ token }) {
  // ... rest of state stays same ...
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch settings')
        const data = await res.json()
        setSettings(data.settings)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [token])

  function handleChange(key, value) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)))
    setSuccess('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ settings: settings.map((s) => ({ key: s.key, value: s.value })) }),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      const data = await res.json()
      setSettings(data.settings)
      setSuccess('Settings saved successfully')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-[var(--text)]">Loading settings…</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="m-0 mb-2 text-[28px] text-[var(--text-h)]">System Settings</h1>
        <p className="leading-relaxed text-[var(--text)]">
          Configure application-wide settings. Changes take effect immediately.
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {success && <p className="mb-4 text-sm text-emerald-400">{success}</p>}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {settings.map((s) => (
            <div
              key={s.key}
              className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-[var(--shadow)]"
            >
              <label className="text-[15px] font-medium text-[var(--text-h)]">{s.label}</label>
              <span className="font-mono text-[12px] text-[var(--text)] opacity-70">{s.key}</span>
              {s.type === 'boolean' ? (
                <label className="mt-1 flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="absolute m-0 h-px w-px opacity-0"
                    checked={s.value === 'true'}
                    onChange={(e) => handleChange(s.key, e.target.checked ? 'true' : 'false')}
                  />
                  {/* Custom toggle slider */}
                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 after:absolute after:top-[3px] after:left-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-[var(--bg)] after:shadow-sm after:transition-transform after:duration-200 after:content-[''] ${
                      s.value === 'true'
                        ? 'bg-purple-400 after:translate-x-5'
                        : 'bg-[var(--border)] after:translate-x-0'
                    }`}
                  />
                  <span className="text-sm text-[var(--text)]">
                    {s.value === 'true' ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              ) : s.type === 'number' ? (
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 font-[inherit] text-sm text-[var(--text-h)] transition-all duration-150 outline-none focus:border-purple-400 focus:shadow-[0_0_0_3px_rgba(192,132,252,0.12)]"
                  value={s.value}
                  onChange={(e) => handleChange(s.key, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 font-[inherit] text-sm text-[var(--text-h)] transition-all duration-150 outline-none focus:border-purple-400 focus:shadow-[0_0_0_3px_rgba(192,132,252,0.12)]"
                  value={s.value}
                  onChange={(e) => handleChange(s.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className={btnCreate} disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SettingsManagement
