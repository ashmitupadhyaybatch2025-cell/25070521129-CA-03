import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-page">
        {/* From Uiverse.io by SelfMadeSystem with LOADING */}
        <div className="loader">
          <div className="ph1">
            <div className="record"></div>
            <div className="record-text">LOADING</div>
          </div>
          <div className="ph2">
            <div className="laptop-b"></div>
            <svg
              className="laptop-t"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 42 30"
            >
              <path
                d="M21 1H5C2.78 1 1 2.78 1 5V25a4 4 90 004 4H37a4 4 90 004-4V5c0-2.22-1.8-4-4-4H21"
                pathLength="100"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
              />
            </svg>
          </div>
          <div className="icon"></div>
        </div>
      </div>
    )
  }
  if (!token || !user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/home" replace />

  return children
}
