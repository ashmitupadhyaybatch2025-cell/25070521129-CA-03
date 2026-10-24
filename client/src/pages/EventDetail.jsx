import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api.js'
import useAuth from '../hooks/useAuth.js'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { CategoryBadge } from '../components/Badge.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { SkeletonBlock } from '../components/Skeleton.jsx'
import { useToast } from '../context/ToastProvider.jsx'
import { confetti } from '../fx.js'

const CATEGORIES = ['Workshop', 'Sports', 'Cultural', 'Technical', 'Social']
const EMPTY = { title: '', description: '', date: '', location: '', category: 'Social', capacity: 0 }

const toInput = (d) => {
  const dt = new Date(d)
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset())
  return dt.toISOString().slice(0, 16)
}

const fmtFull = (d) => {
  const dt = new Date(d)
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Smart conducting club profile mapper
export function getConductingClub(event) {
  const cat = (event?.category || '').toLowerCase()
  const title = (event?.title || '').toLowerCase()

  if (cat === 'technical' || title.includes('hack') || title.includes('code') || title.includes('web')) {
    return {
      name: 'Binary Beats & Cyber Coding Club',
      badge: '💻 Tech Division',
      lead: 'Lead Dev: Alex Vance & Core Tech Guild',
      email: 'tech@clubhub.internal',
      meeting: 'Lab 402, Cyber Tower',
      desc: 'Dedicated to competitive programming, machine learning, systems architecture, and open-source software development.',
      color: '#facc15',
    }
  }
  if (cat === 'workshop' || title.includes('workshop') || title.includes('masterclass') || title.includes('design')) {
    return {
      name: 'SkillForge Technical Guild',
      badge: '🛠️ Innovation & Labs',
      lead: 'Faculty Advisor: Dr. V. Ramanujan',
      email: 'workshops@clubhub.internal',
      meeting: 'Maker Studio, Room 108',
      desc: 'Hands-on experiential workshops focused on high-impact industry engineering, rapid prototyping, and professional masterclasses.',
      color: '#38bdf8',
    }
  }
  if (cat === 'sports' || title.includes('match') || title.includes('league') || title.includes('tournament') || title.includes('esport')) {
    return {
      name: 'Thunderbolts Sports & Esports Council',
      badge: '⚡ Athletics & Gaming',
      lead: 'Council Captain: Marcus Ray',
      email: 'sports@clubhub.internal',
      meeting: 'Arena Complex & Sports Pavilion',
      desc: 'Organizing inter-collegiate athletic championships, sports fitness leagues, and campus-wide esports tournaments.',
      color: '#22c55e',
    }
  }
  if (cat === 'cultural' || title.includes('dance') || title.includes('music') || title.includes('fest') || title.includes('drama')) {
    return {
      name: 'Rhythm & Resonance Cultural Society',
      badge: '🎭 Performing Arts',
      lead: 'Creative Director: Maya Sen',
      email: 'cultural@clubhub.internal',
      meeting: 'Amphitheatre & Fine Arts Hall',
      desc: 'Celebrating music, performing theatre, visual exhibitions, dance troupes, and festive artistic traditions across campus.',
      color: '#f43f5e',
    }
  }
  return {
    name: 'Nexus Student Affairs & Social Cell',
    badge: '🤝 Community & Social',
    lead: 'Student Affairs Head: Sarah Jenkins',
    email: 'nexus@clubhub.internal',
    meeting: 'Student Union Lounge, 2nd Floor',
    desc: 'Empowering campus camaraderie with networking mixers, interactive socials, leadership roundtables, and student festivals.',
    color: '#eab308',
  }
}

// Smart duration calculator / heuristic
export function getEventDuration(event) {
  const cat = (event?.category || '').toLowerCase()
  const title = (event?.title || '').toLowerCase()
  const desc = (event?.description || '').toLowerCase()

  if (title.includes('hackathon') || desc.includes('24 hour') || desc.includes('overnight')) {
    return '24 Hours (Full Overnight Sprint)'
  }
  if (title.includes('bootcamp') || title.includes('day')) {
    return '6 Hours (Full-Day Masterclass)'
  }
  if (cat === 'workshop') {
    return '2.5 Hours (Hands-on Lab)'
  }
  if (cat === 'sports') {
    return '3.5 Hours (Playoffs & Ceremonies)'
  }
  if (cat === 'cultural') {
    return '3 Hours (Showcase & Gala)'
  }
  if (cat === 'technical') {
    return '2 Hours (Keynote & Demos)'
  }
  return '2 Hours (Interactive Session)'
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user: me } = useAuth()
  const toast = useToast()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionBusy, setActionBusy] = useState(false)

  // Edit / Delete states
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [formErrs, setFormErrs] = useState({})
  const [formError, setFormError] = useState('')
  const [editBusy, setEditBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    return api('/events', { token })
      .then((d) => {
        const found = (d.events || []).find((e) => String(e._id) === String(id))
        if (found) {
          setEvent(found)
          document.title = `${found.title} — The Club Hub`
        } else {
          setError('Event not found')
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, token])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="page-anim page-container" style={{ paddingTop: '24px' }}>
        <SkeletonBlock height="24px" width="140px" style={{ marginBottom: '24px' }} />
        <div className="event-detail-grid">
          <div>
            <SkeletonBlock height="40px" width="80%" style={{ marginBottom: '16px' }} />
            <SkeletonBlock height="120px" style={{ marginBottom: '24px', borderRadius: '18px' }} />
            <SkeletonBlock height="240px" style={{ borderRadius: '18px' }} />
          </div>
          <div>
            <SkeletonBlock height="320px" style={{ borderRadius: '18px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="page-anim page-container" style={{ paddingTop: '40px' }}>
        <EmptyState
          icon="🔍"
          title="Event Not Found"
          message="We couldn't find the event you are looking for. It may have been removed or the link is invalid."
          action={
            <Link to="/events" className="btn btn-primary">
              ← Return to Events
            </Link>
          }
        />
      </div>
    )
  }

  const isJoined = (event.attendees || []).includes(me.id)
  const isPast = new Date(event.date).getTime() < Date.now()
  const isFull = event.capacity > 0 && (event.attendees || []).length >= event.capacity
  const canModify = me.role === 'admin' || event.createdBy?._id === me.id
  const club = getConductingClub(event)
  const duration = getEventDuration(event)
  const going = (event.attendees || []).length
  const pct = event.capacity ? Math.min(Math.round((going / event.capacity) * 100), 100) : 0

  const handleJoin = async (e) => {
    if (actionBusy || isPast || isFull) return
    const rect = e.currentTarget.getBoundingClientRect()
    confetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
    setActionBusy(true)
    try {
      const res = await api(`/events/${event._id}/join`, { method: 'POST', token })
      setEvent(res.event)
      toast(`You joined "${event.title}"! 🎉`, 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setActionBusy(false)
    }
  }

  const handleLeave = async () => {
    if (actionBusy) return
    setActionBusy(true)
    try {
      const res = await api(`/events/${event._id}/leave`, { method: 'POST', token })
      setEvent(res.event)
      toast(`You left "${event.title}"`, 'info')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setActionBusy(false)
    }
  }

  const openEdit = () => {
    setForm({
      title: event.title,
      description: event.description,
      date: toInput(event.date),
      location: event.location,
      category: event.category,
      capacity: event.capacity,
    })
    setFormErrs({})
    setFormError('')
    setModalOpen(true)
  }

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      setFormError('Please fill in all required fields.')
      return
    }
    setEditBusy(true)
    try {
      const body = {
        ...form,
        date: new Date(form.date).toISOString(),
        capacity: Number(form.capacity) || 0,
      }
      const res = await api(`/events/${event._id}`, { method: 'PUT', token, body })
      setEvent(res.event)
      toast('Event updated successfully! ✏️', 'success')
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setEditBusy(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api(`/events/${event._id}`, { method: 'DELETE', token })
      toast('Event deleted', 'success')
      navigate('/events')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast('Event link copied to clipboard! 📋', 'success')
    }
  }

  return (
    <div className="page-anim event-detail-wrap">
      {/* Top Breadcrumb Nav */}
      <div className="event-detail-back">
        <Link to="/events" className="btn btn-ghost btn-sm">
          ← Back to All Events
        </Link>
      </div>

      {/* Main Header / Badges */}
      <div className="event-detail-header">
        <div className="event-detail-badges">
          <CategoryBadge category={event.category} />
          {isPast && <span className="badge badge-past">Past Event</span>}
          {!isPast && isFull && <span className="badge badge-full">Capacity Full</span>}
          {isJoined && (
            <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', border: '1px solid #22c55e' }}>
              ✓ You are Registered
            </span>
          )}
        </div>

        <h1 className="event-detail-title">{event.title}</h1>

        <div className="event-detail-submeta">
          <span>📅 {fmtFull(event.date)}</span>
          <span className="meta-sep">·</span>
          <span>📍 {event.location}</span>
          <span className="meta-sep">·</span>
          <span>⏱️ {duration}</span>
        </div>
      </div>

      {/* Split Grid */}
      <div className="event-detail-grid">
        {/* Left Column: Club conducting, About, Schedule, Requirements */}
        <div className="event-detail-main">
          {/* Conducting Club Card */}
          <div className="conducting-club-card">
            <div className="club-badge-row">
              <span className="club-division-badge">{club.badge}</span>
              <span className="club-verified">Official Club Host</span>
            </div>
            <div className="club-header-info">
              <div className="club-avatar-glow">
                {event.category === 'Technical' ? '💻' : event.category === 'Workshop' ? '🛠️' : event.category === 'Sports' ? '⚡' : event.category === 'Cultural' ? '🎭' : '🤝'}
              </div>
              <div>
                <h3 className="club-name">{club.name}</h3>
                <p className="club-lead">{club.lead}</p>
              </div>
            </div>
            <p className="club-description">{club.desc}</p>
            <div className="club-footer-meta">
              <span>📍 Headquarters: {club.meeting}</span>
              <span>✉️ Contact: {club.email}</span>
            </div>
          </div>

          {/* About This Event Card */}
          <div className="detail-section-card">
            <h3 className="section-title">📖 What This Event Is About</h3>
            <p className="event-full-desc">
              {event.description || 'Join fellow students and club members for this interactive event. Expect an engaging experience with community networking, skill-building, and real-time collaboration.'}
            </p>

            <div className="highlights-box">
              <h4 className="highlights-title">✨ Event Highlights & Key Takeaways</h4>
              <ul className="highlights-list">
                <li>
                  <span className="highlight-icon">🎯</span>
                  <div>
                    <strong>Interactive Session & Discussions:</strong> Direct engagement with club leads and guest mentors.
                  </div>
                </li>
                <li>
                  <span className="highlight-icon">⏱️</span>
                  <div>
                    <strong>Duration:</strong> {duration} packed with organized activities and networking.
                  </div>
                </li>
                <li>
                  <span className="highlight-icon">📜</span>
                  <div>
                    <strong>Certification & Credits:</strong> Official Certificate of Participation issued by {club.name}.
                  </div>
                </li>
                <li>
                  <span className="highlight-icon">🍕</span>
                  <div>
                    <strong>Refreshments & Goodies:</strong> Complimentary refreshments and exclusive club stickers provided.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Schedule Breakdown */}
          <div className="detail-section-card">
            <h3 className="section-title">⏱️ Event Agenda & Timeline</h3>
            <div className="agenda-timeline">
              <div className="agenda-item">
                <div className="agenda-time">Phase 01</div>
                <div className="agenda-content">
                  <h4>Check-In & Registration Desk</h4>
                  <p>Check in at {event.location}, receive your attendee pass and welcome kit.</p>
                </div>
              </div>
              <div className="agenda-item">
                <div className="agenda-time">Phase 02</div>
                <div className="agenda-content">
                  <h4>Keynote & Main Activity</h4>
                  <p>Conducted by {club.name} — core demonstrations, talks, or tournament kickoff.</p>
                </div>
              </div>
              <div className="agenda-item">
                <div className="agenda-time">Phase 03</div>
                <div className="agenda-content">
                  <h4>Interactive Practice & Group Challenge</h4>
                  <p>Hands-on work, peer collaborations, and active engagement with mentors.</p>
                </div>
              </div>
              <div className="agenda-item">
                <div className="agenda-time">Phase 04</div>
                <div className="agenda-content">
                  <h4>Open Q&A, Networking & Awards</h4>
                  <p>Wrap-up celebrations, awards presentation, social mixer and photo session.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Card, Stats, Organizer */}
        <div className="event-detail-sidebar">
          {/* Action Box */}
          <div className="detail-action-card">
            <div className="action-header">
              <div className="action-price">
                <span className="free-badge">FREE</span>
                <span className="student-pass">Student Club Access</span>
              </div>
              <button onClick={handleShare} className="btn-icon" title="Share event link" style={{ fontSize: '1.2rem' }}>
                🔗
              </button>
            </div>

            {/* Attendance Progress */}
            <div className="sidebar-capacity-block">
              <div className="capacity-label-row">
                <span>Registration Status</span>
                <strong>
                  {going} {event.capacity ? `/ ${event.capacity} seats` : 'attending'}
                </strong>
              </div>
              {event.capacity > 0 && (
                <div className="progress-bar-wrap" style={{ height: '8px', marginTop: '6px' }}>
                  <div
                    className={`progress-bar-fill ${pct >= 100 ? 'full' : pct >= 80 ? 'warn' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>

            {/* Registration Button */}
            <div className="action-btn-block">
              {isJoined ? (
                <div>
                  <div className="registered-alert">
                    <span>🎉</span>
                    <div>
                      <strong>You are all set!</strong>
                      <p>Your seat is confirmed. Show up on time at {event.location}.</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-full"
                    onClick={handleLeave}
                    disabled={actionBusy}
                  >
                    {actionBusy ? 'Updating...' : 'Leave Event'}
                  </button>
                </div>
              ) : isPast ? (
                <button className="btn btn-full" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                  Event Has Concluded
                </button>
              ) : isFull ? (
                <button className="btn btn-full" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                  Event is Full (Max Capacity)
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-full join-glow-btn"
                  onClick={handleJoin}
                  disabled={actionBusy}
                >
                  {actionBusy ? 'Securing Seat...' : 'Join Event 🚀'}
                </button>
              )}
            </div>

            {/* Quick Metadata Tiles */}
            <div className="sidebar-meta-list">
              <div className="meta-tile">
                <span className="meta-tile-icon">⏱️</span>
                <div>
                  <div className="meta-tile-label">Duration</div>
                  <div className="meta-tile-val">{duration}</div>
                </div>
              </div>
              <div className="meta-tile">
                <span className="meta-tile-icon">📅</span>
                <div>
                  <div className="meta-tile-label">Date & Time</div>
                  <div className="meta-tile-val">{fmtFull(event.date)}</div>
                </div>
              </div>
              <div className="meta-tile">
                <span className="meta-tile-icon">📍</span>
                <div>
                  <div className="meta-tile-label">Venue Location</div>
                  <div className="meta-tile-val">{event.location}</div>
                </div>
              </div>
              <div className="meta-tile">
                <span className="meta-tile-icon">🏛️</span>
                <div>
                  <div className="meta-tile-label">Conducting Club</div>
                  <div className="meta-tile-val">{club.name}</div>
                </div>
              </div>
              <div className="meta-tile">
                <span className="meta-tile-icon">👤</span>
                <div>
                  <div className="meta-tile-label">Posted by</div>
                  <div className="meta-tile-val">{event.createdBy?.name || 'Club Admin'}</div>
                </div>
              </div>
            </div>

            {/* Admin / Creator Controls */}
            {canModify && (
              <div className="sidebar-owner-controls">
                <button className="btn btn-ghost btn-sm" onClick={openEdit}>
                  ✏️ Edit Event Details
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(true)} style={{ color: 'var(--red)' }}>
                  🗑️ Delete Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="✏️ Edit Event"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleFormSubmit} disabled={editBusy}>
              {editBusy ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </>
        }
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <div className="form-row form-row-2">
          <div className="form-field">
            <label>Title *</label>
            <input
              name="title"
              className="form-input"
              value={form.title}
              onChange={handleFormChange}
              maxLength={100}
            />
          </div>
          <div className="form-field">
            <label>Date & Time *</label>
            <input
              type="datetime-local"
              name="date"
              className="form-input"
              value={form.date}
              onChange={handleFormChange}
            />
          </div>
        </div>
        <div className="form-row form-row-3">
          <div className="form-field">
            <label>Location *</label>
            <input
              name="location"
              className="form-input"
              value={form.location}
              onChange={handleFormChange}
            />
          </div>
          <div className="form-field">
            <label>Category</label>
            <select name="category" className="form-select" value={form.category} onChange={handleFormChange}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Capacity</label>
            <input
              type="number"
              min="0"
              name="capacity"
              className="form-input"
              value={form.capacity}
              onChange={handleFormChange}
            />
          </div>
        </div>
        <div className="form-field">
          <label>Description</label>
          <textarea
            name="description"
            className="form-input"
            rows={4}
            value={form.description}
            onChange={handleFormChange}
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget}
        onClose={() => setDeleteTarget(false)}
        onConfirm={handleDelete}
        title={`Delete "${event.title}"?`}
        message="This action cannot be undone. All registrations will be removed."
        confirmLabel="Delete Event"
        danger
      />
    </div>
  )
}
