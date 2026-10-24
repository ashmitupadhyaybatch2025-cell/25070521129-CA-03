import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        <div className="page-loader-wrapper">
          {/* From Uiverse.io by Shoh2008 */}
          <div className="loader"></div>
          <div className="loader-label">LOADING</div>
        </div>
      </div>
    )
  }
  if (!token || !user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/home" replace />

  return children
}
