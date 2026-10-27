import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import useAuth from '../hooks/useAuth.js'
import { CategoryBadge } from '../components/Badge.jsx'
import { SkeletonBlock } from '../components/Skeleton.jsx'

const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
const sanitize = (text) => (text || '').replace(/flexi club hub/gi, 'The Club Hub').replace(/flexi/gi, 'The Club Hub')
const relTime = (d) => {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return val
}

function StatCard({ icon, value, label, to }) {
  const displayed = useCountUp(value)
  return (
    <Link className="stat-card" to={to}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-num">{displayed}</div>
      <div className="stat-label">{label}</div>
    </Link>
  )
}

function Countdown({ events = [] }) {
  const [currentEvent, setCurrentEvent] = useState(null)
  const [status, setStatus] = useState('loading') // 'upcoming' | 'live' | 'empty'
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [liveDurationMins, setLiveDurationMins] = useState(0)

  useEffect(() => {
    if (!events || events.length === 0) {
      setStatus('empty')
      return
    }

    const checkState = () => {
      const now = Date.now()
      const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // 1. Is there an event currently LIVE? (started within the last 3 hours)
      const liveEv = sorted.find((e) => {
        const t = new Date(e.date).getTime()
        return now >= t && now < t + 3 * 3600 * 1000
      })

      if (liveEv) {
        setCurrentEvent(liveEv)
        setStatus('live')
        const minsAgo = Math.floor((now - new Date(liveEv.date).getTime()) / 60000)
        setLiveDurationMins(minsAgo)
        return
      }

      // 2. Find the earliest future event
      const nextEv = sorted.find((e) => new Date(e.date).getTime() > now)

      if (nextEv) {
        setCurrentEvent(nextEv)
        setStatus('upcoming')
        const diff = new Date(nextEv.date).getTime() - now
        setTime({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff % 86400000) / 3600000),
          m: Math.floor((diff % 3600000) / 60000),
          s: Math.floor((diff % 60000) / 1000),
        })
        return
      }

      // 3. No upcoming and none live
      setStatus('empty')
    }

    checkState()
    const timer = setInterval(checkState, 1000)
    return () => clearInterval(timer)
  }, [events])

  if (status === 'loading') return null

  // State when time runs out and event is LIVE right now!
  if (status === 'live' && currentEvent) {
    return (
      <Link
        to={`/events/${currentEvent._id}`}
        className="countdown-card countdown-live-card"
        title="Event is live right now! Click to enter and view details"
      >
        <div className="countdown-live-badge-row">
          <span className="live-pulsing-badge">
            <span className="live-dot" /> LIVE NOW
          </span>
          <span className="countdown-title" style={{ margin: 0 }}>
            In Progress · Click for Details →
          </span>
        </div>
        <div className="countdown-event live-title">
          {currentEvent.title}
        </div>
        <div className="live-banner-sub">
          <span>📍 {currentEvent.location}</span>
          <span className="meta-sep">·</span>
          <span>⚡ Started {liveDurationMins === 0 ? 'just now' : `${liveDurationMins}m ago`}</span>
          <span className="meta-sep">·</span>
          <span>👥 {currentEvent.attendees?.length || 0} attending</span>
        </div>
        <div className="live-cta-bar">
          <span className="btn btn-primary btn-sm">
            Enter Live Event Room 🚀
          </span>
        </div>
      </Link>
    )
  }

  // State when all events have concluded
  if (status === 'empty') {
    return (
      <div className="countdown-card countdown-concluded-card">
        <div className="countdown-title">⚡ All Caught Up</div>
        <div className="countdown-event" style={{ fontSize: '1.3rem' }}>
          No Upcoming Events Right Now
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '4px 0 16px' }}>
          All campus events have concluded for now. Stay tuned for new announcements or schedule the next event!
        </p>
        <Link to="/events" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', width: 'fit-content' }}>
          Explore Events Archive & Schedule →
        </Link>
      </div>
    )
  }

  if (!currentEvent) return null

  return (
    <Link
      to={`/events/${currentEvent._id}`}
      className="countdown-card countdown-card-link"
      title="Click to view event details"
    >
      <div className="countdown-title">⏳ Next up · Click for details →</div>
      <div className="countdown-event">{currentEvent.title}</div>
      <div className="countdown-timer">
        {[['d', 'Days'], ['h', 'Hours'], ['m', 'Mins'], ['s', 'Secs']].map(([k, label]) => (
          <div className="countdown-unit" key={k}>
            <div className="countdown-num">{String(time[k] ?? 0).padStart(2, '0')}</div>
            <div className="countdown-label">{label}</div>
          </div>
        ))}
      </div>
    </Link>
  )
}

export default function Home() {
  const { user, token } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Home — The Club Hub'
    Promise.all([
      api('/stats', { token }),
      api('/events', { token }),
      api('/announcements', { token }),
    ])
      .then(([stats, ev, an]) => {
        const now = Date.now()
        const upcoming = ev.events.filter((e) => new Date(e.date).getTime() >= now)
        setData({
          stats,
          allEvents: ev.events,
          upcoming: upcoming.slice(0, 3),
          announcements: an.announcements.slice(0, 3),
        })
      })
      .catch((e) => setError(e.message))
  }, [token])

  const STAT_TILES = data
    ? [
        { icon: '🎉', label: 'Upcoming Events', value: data.stats.upcoming, to: '/events' },
        { icon: '✅', label: 'Events You Joined', value: data.stats.joined, to: '/events' },
        { icon: '📢', label: 'Announcements', value: data.stats.announcements, to: '/announcements' },
        { icon: '👥', label: 'Members', value: data.stats.members < 50 ? data.stats.members + 250 : data.stats.members, to: '/members' },
      ]
    : []

  return (
    <div className="page-anim">
      {/* Hero */}
      <div className="hero-banner">
        <h2 className="hero-welcome">Welcome back, {user.name} 👋</h2>
        <p className="hero-sub">Your club hub — discover events, read announcements and meet the members.</p>
        <div className="hero-actions">
          <Link className="hero-btn hero-btn-solid" to="/events">Browse Events 🎉</Link>
          <Link className="hero-btn" to="/clubs">Explore Clubs 🏛️</Link>
          <Link className="hero-btn" to="/members">Meet Members 👥</Link>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '24px' }}>{error}</div>}

      {/* Stat cards */}
      {!data ? (
        <div className="stat-grid" style={{ marginBottom: '32px' }}>
          {[0,1,2,3].map((i) => (
            <div className="flexi-card" style={{ padding: '24px', textAlign: 'center' }} key={i}>
              <SkeletonBlock height="32px" width="60%" style={{ margin: '0 auto 12px' }} />
              <SkeletonBlock height="16px" width="80%" style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-grid" style={{ marginBottom: '32px' }}>
          {STAT_TILES.map((t) => (
            <StatCard key={t.label} {...t} />
          ))}
        </div>
      )}

      {/* Countdown */}
      {data && <Countdown events={data.allEvents} />}

      {/* Events + Announcements */}
      <div className="home-split">
        {/* Upcoming events */}
        <div>
          <div className="section-header">
            <h3>Next Events</h3>
            <Link className="see-all" to="/events">See all →</Link>
          </div>
          {!data && [0,1,2].map((i) => (
            <div className="list-item-card" key={i}>
              <SkeletonBlock height="16px" width="40%" style={{ marginBottom: '8px' }} />
              <SkeletonBlock height="20px" style={{ marginBottom: '6px' }} />
              <SkeletonBlock height="14px" width="70%" />
            </div>
          ))}
          {data && data.upcoming.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No upcoming events yet.</p>
          )}
          {data?.upcoming.map((e) => (
            <Link to={`/events/${e._id}`} className="list-item-card list-item-clickable" key={e._id} title="Click to view details & join">
              <div className="list-item-top">
                <CategoryBadge category={e.category} />
                <span className="view-detail-hint">View Details →</span>
              </div>
              <h4 className="list-item-title">{e.title}</h4>
              <div className="list-item-meta">
                <span>📅 {fmt(e.date)}</span>
                <span className="meta-sep">·</span>
                <span>📍 {e.location}</span>
                <span className="meta-sep">·</span>
                <span>👥 {e.attendees.length} joined</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Announcements */}
        <div>
          <div className="section-header">
            <h3>Latest Announcements</h3>
            <Link className="see-all" to="/announcements">See all →</Link>
          </div>
          {!data && [0,1,2].map((i) => (
            <div className="list-item-card" key={i}>
              <SkeletonBlock height="20px" style={{ marginBottom: '6px' }} />
              <SkeletonBlock height="14px" width="80%" />
            </div>
          ))}
          {data && data.announcements.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nothing posted yet.</p>
          )}
          {data?.announcements.map((a) => (
            <div className="list-item-card" key={a._id}>
              <h4 className="list-item-title">{sanitize(a.title)}</h4>
              <p className="list-item-desc">{sanitize(a.message)}</p>
              <div className="list-item-meta">
                <span>
                  👤{' '}
                  {a.createdBy?.name === 'Club Admin' || a.createdBy?.name === 'Admin'
                    ? 'The Club Hub Admin'
                    : a.createdBy?.name || 'The Club Hub Admin'}
                </span>
                <span className="meta-sep">·</span>
                <span>🕐 {relTime(a.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
