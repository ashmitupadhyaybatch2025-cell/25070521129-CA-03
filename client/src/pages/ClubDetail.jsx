import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getClubById } from '../data/clubsData.js'
import useAuth from '../hooks/useAuth.js'
import { api } from '../api.js'
import { useToast } from '../context/ToastProvider.jsx'
import { confetti } from '../fx.js'
import EmptyState from '../components/EmptyState.jsx'

const STORAGE_KEY = 'theclubhub_club_requests'

export default function ClubDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const toast = useToast()

  const club = getClubById(id)
  const [requested, setRequested] = useState(false)
  const [clubEvents, setClubEvents] = useState([])

  useEffect(() => {
    if (!token || !club) return
    api('/events', { token })
      .then((d) => {
        const matching = (d.events || []).filter(
          (e) => (e.category || '').toLowerCase() === club.category.toLowerCase()
        )
        setClubEvents(matching)
      })
      .catch(() => {})
  }, [club, token])

  useEffect(() => {
    if (club) {
      document.title = `${club.name} — The Club Hub`
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        setRequested(stored.includes(club.id))
      } catch {
        setRequested(false)
      }
    }
  }, [club])

  if (!club) {
    return (
      <div className="page-anim page-container" style={{ paddingTop: '40px' }}>
        <EmptyState
          icon="🔍"
          title="Club Not Found"
          message="We could not find the club you are looking for."
          action={
            <Link to="/clubs" className="btn btn-primary">
              ← Return to Clubs Directory
            </Link>
          }
        />
      </div>
    )
  }

  const handleRequestToggle = (e) => {
    let stored = []
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      stored = []
    }

    if (requested) {
      const updated = stored.filter((cId) => cId !== club.id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setRequested(false)
      toast(`Withdrew membership request for ${club.name}`, 'info')
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      confetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
      const updated = [...stored, club.id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setRequested(true)
      toast(`Membership request submitted to ${club.name}! 🎉`, 'success')
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast('Club link copied to clipboard! 📋', 'success')
    }
  }

  return (
    <div className="page-anim club-detail-wrap">
      {/* Back Button */}
      <div className="club-detail-back">
        <Link to="/clubs" className="btn btn-ghost btn-sm">
          ← Back to All Clubs
        </Link>
      </div>

      {/* Hero Header */}
      <div className="club-hero-card">
        <div className="club-hero-top">
          <div className="club-hero-avatar" style={{ borderColor: club.accentColor }}>
            {club.icon}
          </div>
          <div className="club-hero-titles">
            <div className="club-hero-badges">
              <span className="club-div-badge">{club.badge}</span>
              <span className="club-count-badge">👥 {club.memberCount} Active Members</span>
              <span className="club-status-open">🟢 Open for New Members</span>
            </div>
            <h1 className="club-hero-name">{club.name}</h1>
            <p className="club-hero-tagline">{club.tagline}</p>
          </div>
        </div>

        <div className="club-hero-meta-bar">
          <span>📍 <strong>Venue:</strong> {club.meetingVenue}</span>
          <span className="meta-sep">·</span>
          <span>🕒 <strong>Meets:</strong> {club.meetingSchedule}</span>
          <span className="meta-sep">·</span>
          <span>✉️ <strong>Email:</strong> {club.email}</span>
        </div>
      </div>

      {/* Split Grid */}
      <div className="club-detail-grid">
        {/* Main Left Content */}
        <div className="club-detail-main">
          {/* About Section */}
          <div className="detail-section-card">
            <h3 className="section-title">📖 What We Do & Mission</h3>
            <p className="event-full-desc">{club.description}</p>
            <div className="highlights-box">
              <h4 className="highlights-title">🎯 Why Join {club.name}?</h4>
              <ul className="highlights-list">
                <li>
                  <span className="highlight-icon">🚀</span>
                  <div>
                    <strong>Hands-on Experience:</strong> Work on real projects, hardware kits, and collaborative teams.
                  </div>
                </li>
                <li>
                  <span className="highlight-icon">🤝</span>
                  <div>
                    <strong>Peer & Senior Mentorship:</strong> Direct guidance from experienced coordinators and alumni.
                  </div>
                </li>
                <li>
                  <span className="highlight-icon">🏆</span>
                  <div>
                    <strong>Competitions & Showcases:</strong> Represent the college in state and national collegiate festivals.
                  </div>
                </li>
                <li>
                  <span className="highlight-icon">📜</span>
                  <div>
                    <strong>Official Club Certification:</strong> Gain leadership credits and certificates for your resume.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Leadership Team Section */}
          <div className="detail-section-card">
            <h3 className="section-title">👑 Leadership Team</h3>

            {/* President Card */}
            <div className="leader-profile-card president-card">
              <div className="leader-avatar leader-avatar-pres">
                {club.president.avatar}
              </div>
              <div className="leader-info">
                <div className="leader-role-tag">Club President</div>
                <h4 className="leader-name">{club.president.name}</h4>
                <div className="leader-title">{club.president.role}</div>
                <p className="leader-bio">{club.president.bio}</p>
                <div className="leader-email">✉️ {club.president.email}</div>
              </div>
            </div>

            {/* Coordinators Grid */}
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>
              ⚡ Club Coordinators
            </h4>
            <div className="coordinators-grid">
              {club.coordinators.map((c, i) => (
                <div className="coordinator-card" key={i}>
                  <div className="coord-avatar">{c.avatar}</div>
                  <div className="coord-info">
                    <h5 className="coord-name">{c.name}</h5>
                    <div className="coord-role">{c.role}</div>
                    <div className="coord-focus">🎯 {c.focus}</div>
                    <div className="coord-email">✉️ {c.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conducted Activities Section */}
          <div className="detail-section-card">
            <h3 className="section-title">🏆 Conducted Activities & Milestones</h3>
            <div className="activities-timeline">
              {club.conductedActivities.map((act, i) => (
                <div className="activity-card" key={i}>
                  <div className="activity-header">
                    <span className="activity-date">📅 {act.date}</span>
                    <span className="activity-attendees">👥 {act.attendees} Attendees</span>
                  </div>
                  <h4 className="activity-title">{act.title}</h4>
                  <p className="activity-summary">{act.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Next Plans Section */}
          <div className="detail-section-card">
            <h3 className="section-title">🚀 What We Plan Next</h3>
            <div className="plans-grid">
              {club.nextPlans.map((plan, i) => (
                <div className="plan-card" key={i}>
                  <div className="plan-badge">Upcoming · {plan.expectedDate}</div>
                  <h4 className="plan-title">{plan.title}</h4>
                  <p className="plan-desc">{plan.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Live Events Hosted By This Club */}
          {clubEvents.length > 0 && (
            <div className="detail-section-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <h3 className="section-title">🔥 Live & Upcoming Events by {club.name}</h3>
                <Link to="/events" className="see-all">
                  Browse all events →
                </Link>
              </div>
              <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', marginTop: '12px' }}>
                {clubEvents.map((ev) => (
                  <Link
                    key={ev._id}
                    to={`/events/${ev._id}`}
                    className="event-card event-card-clickable"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="event-card-body" style={{ padding: '18px 20px', gap: '10px' }}>
                      <h4 className="event-card-title" style={{ fontSize: '1.08rem' }}>
                        {ev.title}
                      </h4>
                      <div className="event-card-meta" style={{ fontSize: '0.82rem' }}>
                        <span>
                          📅{' '}
                          {new Date(ev.date).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>📍 {ev.location}</span>
                        <span>👥 {ev.attendees?.length || 0} attending</span>
                      </div>
                      <div
                        style={{
                          marginTop: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '8px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <span className="badge badge-workshop">{ev.category}</span>
                        <span className="view-detail-hint">View Event →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="club-detail-sidebar">
          {/* Action Join Card */}
          <div className="detail-action-card">
            <div className="action-header">
              <span className="free-badge">MEMBERSHIP</span>
              <button onClick={handleShare} className="btn-icon" title="Share club page" style={{ fontSize: '1.2rem' }}>
                🔗
              </button>
            </div>

            <div className="sidebar-capacity-block">
              <div className="capacity-label-row">
                <span>Current Club Strength</span>
                <strong>{club.memberCount} Members</strong>
              </div>
            </div>

            {/* Request to Join Button Block */}
            <div className="action-btn-block">
              {requested ? (
                <div>
                  <div className="registered-alert">
                    <span>⏳</span>
                    <div>
                      <strong>Request Submitted!</strong>
                      <p>
                        Your request to join {club.name} is under review by {club.president.name} & coordinators.
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-full"
                    onClick={handleRequestToggle}
                  >
                    Withdraw Join Request
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-full join-glow-btn"
                  onClick={handleRequestToggle}
                >
                  Request to Join Club ✍️
                </button>
              )}
            </div>

            {/* Quick Facts List */}
            <div className="sidebar-meta-list">
              <div className="meta-tile">
                <span className="meta-tile-icon">👑</span>
                <div>
                  <div className="meta-tile-label">President</div>
                  <div className="meta-tile-val">{club.president.name}</div>
                </div>
              </div>
              <div className="meta-tile">
                <span className="meta-tile-icon">📍</span>
                <div>
                  <div className="meta-tile-label">Headquarters / Lab</div>
                  <div className="meta-tile-val">{club.meetingVenue}</div>
                </div>
              </div>
              <div className="meta-tile">
                <span className="meta-tile-icon">🕒</span>
                <div>
                  <div className="meta-tile-label">Weekly Meetings</div>
                  <div className="meta-tile-val">{club.meetingSchedule}</div>
                </div>
              </div>
              <div className="meta-tile">
                <span className="meta-tile-icon">✉️</span>
                <div>
                  <div className="meta-tile-label">Official Contact</div>
                  <div className="meta-tile-val">{club.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
