import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const MATRIX_SYMBOLS = ['日', 'ﾊ', 'ﾐ', '⚡', '💻', '0', '1', '✨', '🚀', '🎉', '💾', '⌨️', '🎯', 'ﾕ', '🌐', 'ﾗ', '📡', '🔒', 'ﾋ', '🛡️']

function validate(form) {
  const errs = {}
  if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
  if (!form.email) {
    errs.email = 'Email is required'
  } else {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!emailPattern.test(form.email)) {
      errs.email = 'Enter a valid email address'
    } else {
      const tld = form.email.split('.').pop().toLowerCase()
      const fakeTLDs = ['www', 'http', 'https', 'ftp', 'html', 'css', 'php', 'asp', 'sql', 'xml', 'json', 'localhost', 'test', 'example', 'invalid', 'abc', 'aaa', 'xxx', 'zzz']
      if (fakeTLDs.includes(tld)) {
        errs.email = `".${tld}" is not a valid email domain. Use a real one like .com, .in, .org`
      }
    }
  }
  if (form.age && (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120))
    errs.age = 'Age must be a number between 1 and 120'
  
  const pass = form.password || ''
  if (!pass) {
    errs.password = 'Password is required'
  } else {
    const hasUpper = /[A-Z]/.test(pass)
    const hasLower = /[a-z]/.test(pass)
    const hasNumber = /[0-9]/.test(pass)
    const hasMinLen = pass.length >= 6

    if (!hasUpper || !hasLower || !hasNumber || !hasMinLen) {
      errs.password = 'Password weak: Must contain at least a capital letter (A-Z), a small letter (a-z), and a number (0-9).'
    }
  }

  if (!form.confirm) {
    errs.confirm = 'Please confirm your password'
  } else if (form.password !== form.confirm) {
    errs.confirm = 'Passwords do not match'
  }

  return errs
}

function PasswordStrengthIndicator({ password }) {
  if (!password) return null
  const hasMinLen = password.length >= 6
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const score = [hasMinLen, hasUpper, hasLower, hasNumber].filter(Boolean).length
  const isWeak = score < 4

  return (
    <div className="pass-strength-card">
      <div className="pass-strength-bar-wrap">
        <div
          className={`pass-strength-bar-fill ${score <= 2 ? 'weak' : score === 3 ? 'medium' : 'strong'}`}
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
      <div className="pass-strength-header">
        <span className="pass-status-text">
          Status:{' '}
          <strong className={isWeak ? 'status-weak' : 'status-strong'}>
            {isWeak ? 'Password weak' : 'Password strong ✓'}
          </strong>
        </span>
        <span className="pass-score-text">{score}/4 requirements</span>
      </div>
      <div className="pass-criteria-badges">
        <span className={`pass-badge ${hasUpper ? 'met' : 'unmet'}`}>
          {hasUpper ? '✓' : '✗'} Capital letter (A-Z)
        </span>
        <span className={`pass-badge ${hasLower ? 'met' : 'unmet'}`}>
          {hasLower ? '✓' : '✗'} Small letter (a-z)
        </span>
        <span className={`pass-badge ${hasNumber ? 'met' : 'unmet'}`}>
          {hasNumber ? '✓' : '✗'} Number (0-9)
        </span>
        <span className={`pass-badge ${hasMinLen ? 'met' : 'unmet'}`}>
          {hasMinLen ? '✓' : '✗'} Min 6 chars
        </span>
      </div>
    </div>
  )
}

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', age: '', password: '', confirm: '' })
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const errs = validate(form)
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onBlur  = (e) => setTouched({ ...touched, [e.target.name]: true })

  const onSubmit = async (e) => {
    e.preventDefault()
    // Touch all fields
    setTouched({ name: true, email: true, age: true, password: true, confirm: true })
    if (Object.keys(errs).length) return
    setError('')
    setBusy(true)
    try {
      await signup(form.name, form.email, form.password, form.age)
      navigate('/login', { state: { message: 'Account created! Please log in.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // Apply theme on auth pages
  useEffect(() => {
    const theme = localStorage.getItem('theclubhub-theme') || localStorage.getItem('flexi-theme') || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    document.title = 'Sign Up — The Club Hub'
  }, [])

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        {/* Floating emojis */}
        <div className="auth-left-emojis" aria-hidden="true">
          {MATRIX_SYMBOLS.map((em, i) => (
            <span
              key={i}
              className={`auth-emoji${i % 4 === 0 ? ' auth-emoji-glow' : ''}`}
              style={{
                left: `${(i * 5) % 95}%`,
                animationDuration: `${10 + (i % 7) * 2.5}s`,
                animationDelay: `${-i * 1.2}s`,
                fontSize: `${1.6 + (i % 4) * 0.5}rem`,
              }}
            >
              {em}
            </span>
          ))}
        </div>

        <div className="auth-left-tagline">
          Join the club.<br />Live the moments.
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

      {/* Right panel — form */}
      <div className="auth-right">
        <form className="auth-form-card" onSubmit={onSubmit} noValidate>
          <div>
            <div className="auth-logo interactive-logo">
              <span className="logo-the">THE</span>
              <span className="logo-club">CLUB</span>
              <span className="logo-hub">HUB</span>
            </div>
            <p className="auth-subtitle" style={{ marginTop: '8px' }}>Create your account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Name */}
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name" name="name" type="text"
              className={`form-input${touched.name && errs.name ? ' error' : ''}`}
              value={form.name} onChange={onChange} onBlur={onBlur}
              required autoComplete="name" placeholder="Your full name"
            />
            {touched.name && errs.name && (
              <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errs.name}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email" name="email" type="email"
              className={`form-input${touched.email && errs.email ? ' error' : ''}`}
              value={form.email} onChange={onChange} onBlur={onBlur}
              required autoComplete="email" placeholder="you@example.com"
            />
            {touched.email && errs.email && (
              <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errs.email}</span>
            )}
          </div>

          {/* Age */}
          <div className="form-field">
            <label htmlFor="age">Age <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              id="age" name="age" type="number" min="1" max="120"
              className={`form-input${touched.age && errs.age ? ' error' : ''}`}
              value={form.age} onChange={onChange} onBlur={onBlur}
              autoComplete="off" placeholder="e.g. 20"
            />
            {touched.age && errs.age && (
              <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errs.age}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <input
                id="password" name="password" type={showPass ? 'text' : 'password'}
                className={`form-input${touched.password && errs.password ? ' error' : ''}`}
                value={form.password} onChange={onChange} onBlur={onBlur}
                required autoComplete="new-password" placeholder="Min. 6 characters"
              />
              <button
                type="button" className="input-toggle"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {touched.password && errs.password && (
              <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errs.password}</span>
            )}
            <PasswordStrengthIndicator password={form.password} />
          </div>

          {/* Confirm password */}
          <div className="form-field">
            <label htmlFor="confirm">Confirm password</label>
            <div className="input-wrap">
              <input
                id="confirm" name="confirm" type={showConfirm ? 'text' : 'password'}
                className={`form-input${touched.confirm && errs.confirm ? ' error' : ''}`}
                value={form.confirm} onChange={onChange} onBlur={onBlur}
                required autoComplete="new-password" placeholder="Repeat password"
              />
              <button
                type="button" className="input-toggle"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            {touched.confirm && errs.confirm && (
              <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{errs.confirm}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            disabled={busy}
          >
            {busy ? <><span className="btn-spinner" />&nbsp;Creating account…</> : 'Create account'}
          </button>

          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
