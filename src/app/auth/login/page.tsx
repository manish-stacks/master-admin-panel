'use client'

import { useState, FormEvent } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }
      // Hard redirect so cookies are properly sent on next request
      window.location.href = '/dashboard'
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', width: 48, height: 48,
            background: 'var(--brand)', borderRadius: 13,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, boxShadow: '0 4px 14px rgb(79 70 229 / 0.35)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            NexusCMS
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Sign in to your admin panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a href="#" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none' }}>
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-light)',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius)',
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 13,
              color: 'var(--danger)'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }}></span> Signing in…</>
            ) : 'Sign in'}
          </button>
        </form>

        <div style={{
          marginTop: 24, padding: 14,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: 12,
          color: 'var(--text-tertiary)'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Demo credentials</div>
          <div>Super Admin: admin@example.com / Admin@123</div>
          <div>Editor: editor@example.com / Editor@123</div>
        </div>
      </div>
    </div>
  )
}
