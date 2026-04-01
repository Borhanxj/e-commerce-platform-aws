import { useState, useEffect } from 'react'
import API_BASE from '../../api'

const API = `${API_BASE}/api/admin/settings`

function SettingsManagement({ token }) {
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

  if (loading) return <p className="sm-loading">Loading settings…</p>

  return (
    <div className="sm">
      <div className="sm-header">
        <h1>System Settings</h1>
        <p>Configure application-wide settings. Changes take effect immediately.</p>
      </div>

      {error && <p className="um-error">{error}</p>}
      {success && <p className="sm-success">{success}</p>}

      <form onSubmit={handleSave}>
        <div className="sm-grid">
          {settings.map((s) => (
            <div key={s.key} className="sm-card">
              <label className="sm-label">{s.label}</label>
              <span className="sm-key">{s.key}</span>
              {s.type === 'boolean' ? (
                <label className="sm-toggle">
                  <input
                    type="checkbox"
                    checked={s.value === 'true'}
                    onChange={(e) => handleChange(s.key, e.target.checked ? 'true' : 'false')}
                  />
                  <span className="sm-toggle-slider" />
                  <span className="sm-toggle-text">
                    {s.value === 'true' ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              ) : s.type === 'number' ? (
                <input
                  type="number"
                  className="sm-input"
                  value={s.value}
                  onChange={(e) => handleChange(s.key, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  className="sm-input"
                  value={s.value}
                  onChange={(e) => handleChange(s.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="sm-actions">
          <button type="submit" className="um-btn um-btn-create" disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SettingsManagement
