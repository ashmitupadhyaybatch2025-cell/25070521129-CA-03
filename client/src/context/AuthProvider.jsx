import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { AuthContext } from './auth-context.js'

const TOKEN_KEY = 'theclubhub_token'
const getStoredToken = () => localStorage.getItem('theclubhub_token') || localStorage.getItem('flexi_token')

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(null)
  // Only "loading" if a saved token must be verified on first render
  const [loading, setLoading] = useState(() => !!getStoredToken())

  // Restore the session after a page refresh
  useEffect(() => {
    if (!token) return
    let cancelled = false
    api('/me', { token })
      .then((d) => {
        if (!cancelled) setUser(d.user)
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  // POST /login -> { jwtToken }, then load the profile with that token
  const login = async (email, password) => {
    const data = await api('/login', { method: 'POST', body: { email, password } })
    const me = await api('/me', { token: data.jwtToken })
    localStorage.setItem(TOKEN_KEY, data.jwtToken)
    setUser(me.user)
    setToken(data.jwtToken)
    return me.user
  }

  // POST /create (the teacher's signup route)
  const signup = (name, email, password, age) =>
    api('/create', { method: 'POST', body: { name, email, password, age } })

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('flexi_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
