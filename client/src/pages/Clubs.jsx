import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CLUBS_DATA } from '../data/clubsData.js'
import { useToast } from '../context/ToastProvider.jsx'
import { confetti } from '../fx.js'
import EmptyState from '../components/EmptyState.jsx'

const CATEGORIES = ['All', 'Technical', 'Workshop', 'Sports', 'Cultural', 'Social', 'Media']
const STORAGE_KEY = 'theclubhub_club_requests'

export default function Clubs() {
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [requestedOnly, setRequestedOnly] = useState(false)
  const [requestedClubs, setRequestedClubs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    document.title = 'Clubs — The Club Hub'
  }, [])

  const handleRequestToggle = (club, e) => {
    e.stopPropagation()
    const isRequested = requestedClubs.includes(club.id)

    if (isRequested) {
      const updated = requestedClubs.filter((id) => id !== club.id)
      setRequestedClubs(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      toast(`Withdrew request to join ${club.name}`, 'info')
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      confetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
      const updated = [...requestedClubs, club.id]
      setRequestedClubs(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      toast(`Membership request sent to ${club.name}! 🎉`, 'success')
    }
  }

  const filteredClubs = CLUBS_DATA.filter((club) => {
    if (requestedOnly && !requestedClubs.includes(club.id)) return false
    if (category !== 'All' && club.category !== category) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      club.name.toLowerCase().includes(q) ||
      club.description.toLowerCase().includes(q) ||
      club.president.name.toLowerCase().includes(q) ||
      club.coordinators.some((c) => c.name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="page-anim">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Campus Clubs 🏛️</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Discover student-led clubs, meet the presidents and coordinators, and request membership.
          </p>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="toolbar" style={{ marginBottom: '28px' }}>
        <input
          className="form-input"
          style={{ flex: 2, minWidth: '220px' }}
          placeholder="Search by club name, president, coordinator, or keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ flex: 1, minWidth: '160px' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="toggle-label" style={{ paddingLeft: '8px' }}>
          <input
            type="checkbox"
            checked={requestedOnly}
            onChange={(e) => setRequestedOnly(e.target.checked)}
          />
          My requests ({requestedClubs.length})
        </label>
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No clubs found"
          message="Try adjusting your search query or category filter."
          action={
            <button
              className="btn btn-ghost"
              onClick={() => {
                setSearch('')
                setCategory('All')
              }}
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="card-grid clubs-grid">
          {filteredClubs.map((club) => {
            const isRequested = requestedClubs.includes(club.id)

            return (
              <div
                key={club.id}
                className="club-card"
                onClick={() => navigate(`/clubs/${club.id}`)}
                title="Click to view complete club profile & activities"
              >
                {/* Card Top / Badges */}
                <div className="club-card-top">
                  <div className="club-avatar-circle" style={{ borderColor: club.accentColor }}>
                    {club.icon}
                  </div>
                  <div className="club-badges-right">
                    <span className="club-div-badge">{club.badge}</span>
                    <span className="club-count-badge">👥 {club.memberCount} members</span>
                  </div>
                </div>

                {/* Name & Tagline */}
                <div className="club-card-title-box">
                  <h3 className="club-card-title">
                    <Link
                      to={`/clubs/${club.id}`}
                      className="club-title-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {club.name}
                    </Link>
                  </h3>
                  <div className="club-card-tagline">{club.tagline}</div>
                </div>

                {/* What they do description */}
                <p className="club-card-desc">{club.description}</p>

                {/* Leadership Info Block */}
                <div className="club-leadership-snippet">
                  <div className="leadership-line">
                    <span className="lead-role">👑 President:</span>
                    <span className="lead-name">{club.president.name}</span>
                  </div>
                  <div className="leadership-line">
                    <span className="lead-role">⚡ Coordinators:</span>
                    <span className="lead-name">
                      {club.coordinators.map((c) => c.name).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Next Up Highlight */}
                {club.nextPlans?.[0] && (
                  <div className="club-plan-snippet">
                    <span className="plan-label">🚀 Next Up:</span>
                    <span className="plan-text">{club.nextPlans[0].title}</span>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="club-card-actions">
                  <Link
                    to={`/clubs/${club.id}`}
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Club Details →
                  </Link>

                  <button
                    className={`btn btn-sm ${isRequested ? 'btn-outline-requested' : 'btn-primary join-btn'}`}
                    onClick={(e) => handleRequestToggle(club, e)}
                  >
                    {isRequested ? '✓ Requested' : 'Request to Join ✍️'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
