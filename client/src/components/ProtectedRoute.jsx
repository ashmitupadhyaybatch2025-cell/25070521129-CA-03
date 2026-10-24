import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
      </div>
    )
  }
  if (!token || !user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/home" replace />

  return children
}
