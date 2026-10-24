import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import useAuth from '../hooks/useAuth.js'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../context/ToastProvider.jsx'
import { SkeletonBlock } from '../components/Skeleton.jsx'

function relTime(d) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} minute${m !== 1 ? 's' : ''} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h !== 1 ? 's' : ''} ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  return new Date(d).toLocaleDateString()
}

function isNew(d) {
  return Date.now() - new Date(d).getTime() < 24 * 3600 * 1000
}

function getInitials(name) {
  return (name || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Announcements() {
  const { token, user } = useAuth()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { document.title = 'Announcements — The Club Hub' }, [])

  const load = useCallback(
    () =>
      api('/announcements', { token })
        .then((d) => { setItems(d.announcements); setLoading(false) })
        .catch((e) => { setError(e.message); setLoading(false) }),
    [token]
  )

  useEffect(() => { load() }, [load])

  const openModal = () => {
    setForm({ title: '', message: '' })
    setFormError('')
    setModalOpen(true)
  }

  const post = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) {
      setFormError('Title and message are required')
      return
    }
    setFormError('')
    setBusy(true)
    try {
      await api('/announcements', { method: 'POST', token, body: form })
      setModalOpen(false)
      toast('Announcement posted! 📢', 'success')
      await load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await api(`/announcements/${deleteTarget._id}`, { method: 'DELETE', token })
      toast('Announcement deleted', 'success')
      await load()
    } catch (err) {
      toast(err.message, 'error')
    }
    setDeleteTarget(null)
  }

  return (
    <div className="page-anim">
      {/* Header */}
      <div className="announce-header">
        <div>
          <h2>Announcements 📢</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            {user.role !== 'admin' && 'Only admins can post announcements.'}
          </p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-primary btn-sm" onClick={openModal}>
            + Post announcement
          </button>
        )}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '24px' }}>{error}</div>}

      {/* Timeline */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: 'flex', gap: '20px' }}>
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
              <div className="flexi-card flexi-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <SkeletonBlock height="20px" width="50%" />
                <SkeletonBlock height="14px" />
                <SkeletonBlock height="14px" width="70%" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No announcements yet"
          message={user.role === 'admin' ? 'Post the first announcement to get started.' : 'Check back later for updates.'}
          action={user.role === 'admin' ? (
            <button className="btn btn-primary" onClick={openModal}>+ Post announcement</button>
          ) : null}
        />
      ) : (
        <div className="timeline">
          {items.map((a) => (
            <div className="timeline-item" key={a._id}>
              <div className="timeline-dot">
                {getInitials(a.createdBy?.name)}
              </div>
              <div className="timeline-card">
                <div className="timeline-card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="timeline-card-title">{a.title}</span>
                      {isNew(a.createdAt) && <span className="badge badge-new">New</span>}
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <button
                      className="btn-icon"
                      style={{ color: 'var(--red)', fontSize: '1rem' }}
                      onClick={() => setDeleteTarget(a)}
                      title="Delete announcement"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.6, marginBottom: '8px' }}>
                  {a.message}
                </p>
                <div className="timeline-meta">
                  👤 {a.createdBy?.name || 'Admin'} · 🕐 {relTime(a.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal (admin only) */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="📢 Post Announcement"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={post} disabled={busy}>
              {busy ? <><span className="btn-spinner" />&nbsp;Posting…</> : 'Post'}
            </button>
          </>
        }
      >
        {formError && <div className="alert alert-error">{formError}</div>}
        <div className="form-field">
          <label>Title *</label>
          <input
            className="form-input"
            placeholder="Announcement title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={120}
          />
        </div>
        <div className="form-field">
          <label>Message *</label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Write your announcement…"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            maxLength={2000}
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
        message="This announcement will be permanently removed."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
