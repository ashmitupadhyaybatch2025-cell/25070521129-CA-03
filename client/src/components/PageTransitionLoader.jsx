import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransitionLoader() {
  const location = useLocation()
  const prevPathRef = useRef(null)
  
  // 1. Initial load / reload: Start as TRUE so it plays fully every time the site opens or refreshes
  const [loading, setLoading] = useState(true)

  // Initial load timer (plays for 3.5 seconds on fresh load or reload)
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setLoading(false)
      prevPathRef.current = location.pathname
    }, 3500)

    return () => clearTimeout(initialTimer)
  }, [])

  // Route transition effect
  useEffect(() => {
    // Skip if it's the very first mount (handled by initial load effect above)
    if (prevPathRef.current === null) return

    const prevPath = prevPathRef.current
    const currentPath = location.pathname
    prevPathRef.current = currentPath

    if (prevPath === currentPath) return

    // ALWAYS trigger when moving from create (/signup) or /login
    const fromAuth = prevPath === '/signup' || prevPath === '/login' || currentPath === '/login'

    // From other pages: trigger SOME OF THE TIME (~40% probability)
    const randomTrigger = Math.random() < 0.40

    if (fromAuth || randomTrigger) {
      setLoading(true)
      // Run for 3.5 seconds (at least 3-4s) so the full 3s Uiverse cycle finishes completely
      const timer = setTimeout(() => {
        setLoading(false)
      }, 3500)

      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  if (!loading) return null

  return (
    <div className="page-loader-overlay" role="status" aria-live="polite">
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
