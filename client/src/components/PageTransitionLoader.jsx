import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const KATAKANA_SNIPPETS = ['日ﾊﾐﾋｰ', 'ｼﾅﾓﾆｻ', 'ｱｲｳｴｵ', 'ｶｷｹｺｻ', 'SYSTEM OK', 'ACCESSING']

export default function PageTransitionLoader() {
  const location = useLocation()
  const prevPathRef = useRef(location.pathname)
  const [loading, setLoading] = useState(false)
  const [loaderText, setLoaderText] = useState('LOADING...')

  useEffect(() => {
    const prevPath = prevPathRef.current
    const currentPath = location.pathname
    prevPathRef.current = currentPath

    // Don't trigger if same path
    if (prevPath === currentPath) return

    // 1. ALWAYS trigger when moving from /signup (create) or /login
    const fromAuth = prevPath === '/signup' || prevPath === '/login' || currentPath === '/login'

    // 2. From other pages: trigger SOME OF THE TIME, not every time (approx 40% probability)
    const randomTrigger = Math.random() < 0.40

    if (fromAuth || randomTrigger) {
      setLoading(true)
      const randomWord = KATAKANA_SNIPPETS[Math.floor(Math.random() * KATAKANA_SNIPPETS.length)]
      setLoaderText(fromAuth ? 'AUTHENTICATING // FLEXI HUB...' : `LOADING // ${randomWord}`)

      const timer = setTimeout(() => {
        setLoading(false)
      }, fromAuth ? 600 : 420)

      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  if (!loading) return null

  return (
    <div className="page-loader-overlay" role="status" aria-live="polite">
      <div className="page-loader-box">
        <div className="page-loader-spinner">
          <div className="spinner-ring" />
          <span className="spinner-icon">⚡</span>
        </div>
        <div className="page-loader-text">{loaderText}</div>
        <div className="page-loader-bar">
          <div className="page-loader-bar-fill" />
        </div>
      </div>
    </div>
  )
}
