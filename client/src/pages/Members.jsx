import { useEffect, useState } from 'react'
import { api } from '../api.js'
import useAuth from '../hooks/useAuth.js'
import EmptyState from '../components/EmptyState.jsx'
import { SkeletonCards } from '../components/Skeleton.jsx'
import Badge from '../components/Badge.jsx'
import { SAMPLE_MEMBERS } from '../data/sampleMembers.js'

export default function Members() {
  const { token } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(60)

  useEffect(() => {
    document.title = 'Members — The Club Hub'
    api('/members', { token })
      .then((d) => {
        const liveMembers = d.members || []
        // Deduplicate: If sample members have names matching live members, live takes priority
        const liveNames = new Set(liveMembers.map((m) => m.name.toLowerCase().trim()))
        const additionalSamples = SAMPLE_MEMBERS.filter(
          (s) => !liveNames.has(s.name.toLowerCase().trim())
        )
        setMembers([...liveMembers, ...additionalSamples])
        setLoading(false)
      })
      .catch((e) => {
        // Fallback gracefully to sample members
        setMembers(SAMPLE_MEMBERS)
        setLoading(false)
      })
  }, [token])

  // Sorting: Admin(s) pinned at the very top.
  // Below admin: newest joined member at top, descending to oldest.
  const sorted = [...members].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1
    if (a.role !== 'admin' && b.role === 'admin') return 1
    if (a.role === 'admin' && b.role === 'admin') {
      return new Date(a.createdAt) - new Date(b.createdAt)
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const q = search.trim().toLowerCase()
  const filtered = sorted.filter((m) => !q || m.name.toLowerCase().includes(q))
  const displayed = q ? filtered : filtered.slice(0, visibleCount)

  function getInitials(name) {
    return (name || '?')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const isRecent = (dateStr) => {
    if (!dateStr) return false
    const diffDays = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 2 // joined in last 2 days
  }

  return (
    <div className="page-anim">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>
            Members 👥{' '}
            <span style={{ color: 'var(--muted)', fontSize: '1rem', fontWeight: 400 }}>
              ({members.length})
            </span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: '2px' }}>
            Club leaders & community members. Newly joined members appear right below the Admin.
          </p>
        </div>
        <input
          className="form-input"
          style={{ maxWidth: '280px' }}
          placeholder="Search members by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {loading ? (
        <SkeletonCards count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No members found"
          message={q ? `No members match "${q}"` : 'No members yet.'}
        />
      ) : (
        <>
          <div className="card-grid">
            {displayed.map((m) => {
              const isAdmin = m.role === 'admin'
              const displayName = isAdmin && (m.name === 'Club Admin' || m.name.toLowerCase() === 'admin')
                ? 'The Club Hub Admin'
                : m.name
              const recent = !isAdmin && isRecent(m.createdAt)

              return (
                <div key={m._id} className={`member-card ${isAdmin ? 'member-card-admin' : ''}`}>
                  <div className={`member-avatar ${isAdmin ? 'member-avatar-admin' : ''}`}>
                    {isAdmin ? '👑' : getInitials(displayName)}
                  </div>
                  <div className="member-info">
                    <div className="member-name">
                      {displayName}
                      {isAdmin && <span className="admin-crown-icon" title="Club Administrator"> 👑</span>}
                    </div>
                    <div className="member-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Badge type={isAdmin ? 'admin' : 'user'}>{m.role}</Badge>
                      {recent && (
                        <span className="badge badge-new" style={{ fontSize: '0.7rem' }}>
                          ⚡ New Member
                        </span>
                      )}
                      <span>Joined {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load More Button for large directories */}
          {!q && visibleCount < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setVisibleCount((c) => c + 60)}
                style={{ minWidth: '220px' }}
              >
                Load More Members (+60) · Showing {displayed.length} of {filtered.length}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
