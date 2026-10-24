import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const MATRIX_SYMBOLS = ['日', 'ﾊ', 'ﾐ', '⚡', '💻', '0', '1', '✨', '🚀', '🎉']

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form.email, form.password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const theme = localStorage.getItem('flexi-theme') || 'light'
    document.documentElement.setAttribute('data-theme', theme)
    document.title = 'Log In — The Club Hub'
  }, [])

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-emojis" aria-hidden="true">
          {MATRIX_SYMBOLS.map((em, i) => (
            <span
              key={i}
              className="auth-emoji"
              style={{
                left: `${(i * 10) % 100}%`,
                animationDuration: `${12 + i * 2}s`,
                animationDelay: `${-i * 1.5}s`,
                fontSize: `${1.5 + (i % 3) * 0.5}rem`,
              }}
            >
              {em}
            </span>
          ))}
        </div>

        <div className="auth-left-tagline">
          Welcome back!<br />Your club awaits. 🎊
        </div>

        <div className="auth-left-features">
          <div className="auth-feature">
            <span className="auth-feature-icon">🎉</span>
            <span className="auth-feature-text">Discover and join exciting campus events</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">📢</span>
            <span className="auth-feature-text">Stay updated with club announcements</span>
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">👥</span>
            <span className="auth-feature-text">Connect with fellow club members</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <form className="auth-form-card" onSubmit={onSubmit} noValidate>
          <div>
            <div className="auth-logo">THE</div>
            <p className="auth-subtitle" style={{ marginTop: '8px' }}>Sign in to your account</p>
          </div>

          {location.state?.message && (
            <div className="alert alert-success">{location.state.message}</div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email" name="email" type="email"
              className="form-input"
              value={form.email} onChange={onChange}
              required autoComplete="email" placeholder="you@example.com"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <input
                id="password" name="password" type={showPass ? 'text' : 'password'}
                className="form-input"
                value={form.password} onChange={onChange}
                required autoComplete="current-password" placeholder="Your password"
              />
              <button
                type="button" className="input-toggle"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            disabled={busy}
          >
            {busy ? <><span className="btn-spinner" />&nbsp;Logging in…</> : 'Log in'}
          </button>

          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>
            New here?{' '}
            <Link to="/signup" style={{ fontWeight: 600 }}>Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
