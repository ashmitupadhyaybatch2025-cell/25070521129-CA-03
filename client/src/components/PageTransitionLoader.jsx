import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransitionLoader() {
  const location = useLocation()
  const prevPathRef = useRef(null)
  
  // Initial load / reload: starts as TRUE so it plays on opening the site or refresh
  const [loading, setLoading] = useState(true)

  // Initial load timer: runs max 2.2s (under 2.5 sec as requested)
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setLoading(false)
      prevPathRef.current = location.pathname
    }, 2200)

    return () => clearTimeout(initialTimer)
  }, [])

  // Route transition effect
  useEffect(() => {
    if (prevPathRef.current === null) return

    const prevPath = prevPathRef.current
    const currentPath = location.pathname
    prevPathRef.current = currentPath

    if (prevPath === currentPath) return

    // ALWAYS trigger when moving from create (/signup) or /login
    const fromAuth = prevPath === '/signup' || prevPath === '/login' || currentPath === '/login'

    // From other pages: trigger SOME OF THE TIME (~35% probability)
    const randomTrigger = Math.random() < 0.35

    if (fromAuth || randomTrigger) {
      setLoading(true)
      // Max 2.2 seconds (under 2.5 sec)
      const timer = setTimeout(() => {
        setLoading(false)
      }, fromAuth ? 2200 : 1800)

      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  if (!loading) return null

  return (
    <div className="page-loader-overlay" role="status" aria-live="polite">
      <div className="page-loader-wrapper">
        {/* From Uiverse.io by Shoh2008 */}
        <div className="loader"></div>
        <div className="loader-label">LOADING</div>
      </div>
    </div>
  )
}
