import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import useAuth from '../hooks/useAuth.js'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { CategoryBadge } from '../components/Badge.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { SkeletonCards } from '../components/Skeleton.jsx'
import { useToast } from '../context/ToastProvider.jsx'
import { confetti } from '../fx.js'

const CATEGORIES = ['Workshop', 'Sports', 'Cultural', 'Technical', 'Social']
const EMPTY = { title: '', description: '', date: '', location: '', category: 'Social', capacity: 0 }

const toInput = (d) => {
  const dt = new Date(d)
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset())
  return dt.toISOString().slice(0, 16)
}

const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

function validateForm(form) {
  const errs = {}
  if (!form.title.trim()) errs.title = 'Title is required'
  if (!form.date) errs.date = 'Date is required'
  if (!form.location.trim()) errs.location = 'Location is required'
  return errs
}

function ProgressBar({ going, capacity }) {
  if (!capacity) return (
    <div className="progress-label">{going} attending · Unlimited capacity</div>
  )
  const pct = Math.min(Math.round((going / capacity) * 100), 100)
  const cls = pct >= 100 ? 'full' : pct >= 80 ? 'warn' : ''
  return (
    <div>
      <div className="progress-bar-wrap">
        <div
          className={`progress-bar-fill ${cls}`}
          style={{ width: pct + '%' }}
        />
      </div>
      <div className="progress-label">{going} / {capacity} going ({pct}%)</div>
    </div>
  )
}

export default function Events() {
  const { token, user: me } = useAuth()
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(0)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [upcomingOnly, setUpcomingOnly] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [formErrs, setFormErrs] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { document.title = 'Events — FLEXI Club Hub' }, [])

  const load = useCallback(() => {
    setLoading(true)
    return api('/events', { token })
      .then((d) => {
        setEvents(d.events)
        setNow(Date.now())
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY)
    setFormErrs({})
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (e) => {
    setEditingId(e._id)
    setForm({
      title: e.title,
      description: e.description,
      date: toInput(e.date),
      location: e.location,
      category: e.category,
      capacity: e.capacity,
    })
    setFormErrs({})
    setFormError('')
    setModalOpen(true)
  }

  const onChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value }
    setForm(updated)
    setFormErrs(validateForm(updated))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = validateForm(form)
    setFormErrs(errs)
    if (Object.keys(errs).length) return
    setFormError('')
    setBusy(true)
    try {
      const body = {
        ...form,
        date: new Date(form.date).toISOString(),
        capacity: Number(form.capacity) || 0,
      }
      if (editingId) {
        await api(`/events/${editingId}`, { method: 'PUT', token, body })
        toast('Event updated!', 'success')
      } else {
        await api('/events', { method: 'POST', token, body })
        toast('Event created! 🎉', 'success')
      }
      setModalOpen(false)
      setEditingId(null)
      await load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const act = async (path, options, successMsg) => {
    try {
      await api(path, { token, ...options })
      if (successMsg) toast(successMsg, 'success')
      await load()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleJoin = (e, eventEl) => {
    // Confetti from button
    if (eventEl) {
      const rect = eventEl.getBoundingClientRect()
      confetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }
    act(`/events/${e._id}/join`, { method: 'POST' }, `Joined "${e.title}" 🎉`)
  }

  const handleLeave = (e) => {
    act(`/events/${e._id}/leave`, { method: 'POST' }, `Left "${e.title}"`)
  }

  const handleDelete = (e) => setDeleteTarget(e)

  const confirmDelete = () => {
    if (!deleteTarget) return
    act(`/events/${deleteTarget._id}`, { method: 'DELETE' }, 'Event deleted')
    setDeleteTarget(null)
  }

  const visible = events.filter((e) => {
    if (category !== 'All' && e.category !== category) return false
    if (upcomingOnly && new Date(e.date).getTime() < now) return false
    const q = search.trim().toLowerCase()
    return !q || `${e.title} ${e.location} ${e.description}`.toLowerCase().includes(q)
  })

  return (
    <div className="page-anim">
      {/* Header */}
      <div className="page-header">
        <h2>Events 🎉</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ New event</button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {/* Toolbar */}
      <div className="toolbar">
        <input
          className="form-input"
          style={{ flex: 2 }}
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ flex: 1 }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
          />
          Upcoming only
        </label>
      </div>

      {/* Cards */}
      {loading ? (
        <SkeletonCards count={6} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No events found"
          message="Try a different search or category, or create a new event."
          action={<button className="btn btn-primary" onClick={openCreate}>+ Create event</button>}
        />
      ) : (
        <div className="card-grid">
          {visible.map((e) => {
            const joined = e.attendees.includes(me.id)
            const past = new Date(e.date).getTime() < now
            const full = e.capacity > 0 && e.attendees.length >= e.capacity
            const canModify = me.role === 'admin' || e.createdBy?._id === me.id
            const fillPct = e.capacity > 0 ? Math.round((e.attendees.length / e.capacity) * 100) : 0

            return (
              <div key={e._id} className={`event-card${past ? ' event-past' : ''}`}>
                <div className="event-card-body">
                  {/* Badges */}
                  <div className="event-card-badges">
                    <CategoryBadge category={e.category} />
                    {past && <span className="badge badge-past">Past</span>}
                    {!past && full && <span className="badge badge-full">Full</span>}
                  </div>

                  {/* Title */}
                  <h4 className="event-card-title">{e.title}</h4>

                  {/* Meta */}
                  <div className="event-card-meta">
                    <span>📅 {fmt(e.date)}</span>
                    <span>📍 {e.location}</span>
                    <span>👤 by {e.createdBy?.name || 'Unknown'}</span>
                  </div>

                  {/* Description */}
                  {e.description && (
                    <p className="event-card-desc">{e.description}</p>
                  )}

                  {/* Progress bar */}
                  <ProgressBar going={e.attendees.length} capacity={e.capacity} />

                  {/* Actions */}
                  <div className="event-card-actions">
                    {joined ? (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleLeave(e)}
                      >
                        Leave
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm join-btn"
                        disabled={past || full}
                        onClick={(ev) => handleJoin(e, ev.currentTarget)}
                      >
                        {full ? 'Full' : 'Join'}
                      </button>
                    )}
                    {canModify && (
                      <>
                        <button
                          className="btn-icon"
                          onClick={() => openEdit(e)}
                          title="Edit event"
                          style={{ fontSize: '1.1rem' }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(e)}
                          title="Delete event"
                          style={{ fontSize: '1.1rem', color: 'var(--red)' }}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingId(null) }}
        title={editingId ? '✏️ Edit Event' : '🎉 Create Event'}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={onSubmit} disabled={busy}>
              {busy ? <><span className="btn-spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.4)' }} />&nbsp;Saving…</> : (editingId ? 'Save changes' : 'Create event')}
            </button>
          </>
        }
      >
        {formError && <div className="alert alert-error">{formError}</div>}

        <div className="form-row form-row-2">
          <div className="form-field">
            <label>Title *</label>
            <input
              name="title" className={`form-input${formErrs.title ? ' error' : ''}`}
              value={form.title} onChange={onChange} maxLength={100}
              placeholder="Event title"
            />
            {formErrs.title && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{formErrs.title}</span>}
          </div>
          <div className="form-field">
            <label>Date & Time *</label>
            <input
              type="datetime-local" name="date"
              className={`form-input${formErrs.date ? ' error' : ''}`}
              value={form.date} onChange={onChange}
            />
            {formErrs.date && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{formErrs.date}</span>}
          </div>
        </div>

        <div className="form-row form-row-3">
          <div className="form-field">
            <label>Location *</label>
            <input
              name="location" className={`form-input${formErrs.location ? ' error' : ''}`}
              value={form.location} onChange={onChange}
              placeholder="Where?"
            />
            {formErrs.location && <span style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{formErrs.location}</span>}
          </div>
          <div className="form-field">
            <label>Category</label>
            <select name="category" className="form-select" value={form.category} onChange={onChange}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Capacity <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(0 = unlimited)</span></label>
            <input
              type="number" min="0" name="capacity" className="form-input"
              value={form.capacity} onChange={onChange}
            />
          </div>
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea
            name="description" className="form-input" rows={3}
            value={form.description} onChange={onChange}
            maxLength={1000} placeholder="Tell people about this event…"
            style={{ resize: 'vertical' }}
          />
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete "${deleteTarget?.title}"?`}
        message="This will permanently remove the event and all its attendees."
        confirmLabel="Delete event"
        danger
      />
    </div>
  )
}
