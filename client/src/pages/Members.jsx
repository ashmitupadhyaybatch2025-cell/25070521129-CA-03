import { useEffect, useState } from 'react'
import { api } from '../api.js'
import useAuth from '../hooks/useAuth.js'
import EmptyState from '../components/EmptyState.jsx'
import { SkeletonCards } from '../components/Skeleton.jsx'
import Badge from '../components/Badge.jsx'

export default function Members() {
  const { token } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Members — FLEXI Club Hub'
    api('/members', { token })
      .then((d) => { setMembers(d.members); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [token])

  const q = search.trim().toLowerCase()
  const shown = members.filter((m) => !q || m.name.toLowerCase().includes(q))

  function getInitials(name) {
    return (name || '?')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="page-anim">
      {/* Header */}
      <div className="page-header">
        <h2>Members 👥 <span style={{ color: 'var(--muted)', fontSize: '1rem', fontWeight: 400 }}>({members.length})</span></h2>
        <input
          className="form-input"
          style={{ maxWidth: '260px' }}
          placeholder="Search members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {loading ? (
        <SkeletonCards count={6} />
      ) : shown.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No members found"
          message={q ? `No members match "${q}"` : 'No members yet.'}
        />
      ) : (
        <div className="card-grid">
          {shown.map((m) => (
            <div key={m._id} className="member-card">
              <div className="member-avatar">{getInitials(m.name)}</div>
              <div className="member-info">
                <div className="member-name">{m.name}</div>
                <div className="member-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <Badge type={m.role === 'admin' ? 'admin' : 'user'}>{m.role}</Badge>
                  <span>Joined {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
