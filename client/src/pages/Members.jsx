import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import useAuth from '../hooks/useAuth.js'
import EmptyState from '../components/EmptyState.jsx'
import { SkeletonCards } from '../components/Skeleton.jsx'
import Badge from '../components/Badge.jsx'
import { SAMPLE_MEMBERS } from '../data/sampleMembers.js'
import { getClubLeaders } from '../data/clubsData.js'

export default function Members() {
  const { token } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'leaders' | 'general'
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(60)

  useEffect(() => {
    document.title = 'Members — The Club Hub'
    const clubLeaders = getClubLeaders()
    const leaderMap = new Map(clubLeaders.map((l) => [l.name.toLowerCase().trim(), l]))

    api('/members', { token })
      .then((d) => {
        const liveMembers = d.members || []
        const liveNames = new Set(liveMembers.map((m) => m.name.toLowerCase().trim()))

        // Ensure all club leaders are present!
        const missingLeaders = clubLeaders.filter(
          (l) => !liveNames.has(l.name.toLowerCase().trim())
        )

        // Enrich live members if they are club leaders
        const enrichedLive = liveMembers.map((m) => {
          const leaderMeta = leaderMap.get(m.name.toLowerCase().trim())
          if (leaderMeta && m.role !== 'admin') {
            return { ...m, ...leaderMeta, _id: m._id }
          }
          return m
        })

        // Merge additional sample members if directory is small
        const allKnown = new Set([
          ...liveNames,
          ...missingLeaders.map((l) => l.name.toLowerCase().trim()),
        ])
        const additionalSamples = SAMPLE_MEMBERS.filter(
          (s) => !allKnown.has(s.name.toLowerCase().trim())
        )

        setMembers([...enrichedLive, ...missingLeaders, ...additionalSamples])
        setLoading(false)
      })
      .catch(() => {
        // Fallback gracefully
        setMembers([...clubLeaders, ...SAMPLE_MEMBERS])
        setLoading(false)
      })
  }, [token])

  // Sorting hierarchy:
  // 1. Admin at the very top (👑)
  // 2. Club Presidents (⭐)
  // 3. Club Coordinators (⚡)
  // 4. Community Members (descending by join date)
  const sorted = [...members].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1
    if (a.role !== 'admin' && b.role === 'admin') return 1
    if (a.role === 'admin' && b.role === 'admin') return 0

    const aIsPres = a.leaderType === 'president'
    const bIsPres = b.leaderType === 'president'
    if (aIsPres && !bIsPres) return -1
    if (!aIsPres && bIsPres) return 1

    const aIsCoord = a.leaderType === 'coordinator'
    const bIsCoord = b.leaderType === 'coordinator'
    if (aIsCoord && !bIsCoord) return -1
    if (!aIsCoord && bIsCoord) return 1

    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const q = search.trim().toLowerCase()
  const filtered = sorted.filter((m) => {
    // Tab filter
    if (filterType === 'leaders' && !m.leaderType && m.role !== 'admin') return false
    if (filterType === 'general' && (m.leaderType || m.role === 'admin')) return false

    // Search query
    if (!q) return true
    const haystack = `${m.name} ${m.role} ${m.clubName || ''} ${m.roleTitle || ''}`.toLowerCase()
    return haystack.includes(q)
  })

  const displayed = q ? filtered : filtered.slice(0, visibleCount)

  const leadersCount = sorted.filter((m) => m.leaderType || m.role === 'admin').length
  const generalCount = sorted.filter((m) => !m.leaderType && m.role !== 'admin').length

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
    return diffDays <= 2
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
            Club leaders & collegiate community members. Team leaders & Presidents are highlighted below.
          </p>
        </div>
        <input
          className="form-input"
          style={{ maxWidth: '300px' }}
          placeholder="Search by name, role, or club…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {/* Filter Tabs */}
      <div className="member-filter-bar">
        <button
          className={`member-filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All Members ({members.length})
        </button>
        <button
          className={`member-filter-btn ${filterType === 'leaders' ? 'active' : ''}`}
          onClick={() => setFilterType('leaders')}
        >
          ⭐ Team Leaders & Admins ({leadersCount})
        </button>
        <button
          className={`member-filter-btn ${filterType === 'general' ? 'active' : ''}`}
          onClick={() => setFilterType('general')}
        >
          👥 General Members ({generalCount})
        </button>
      </div>

      {loading ? (
        <SkeletonCards count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No members found"
          message={q ? `No members match "${q}"` : 'No members in this category.'}
        />
      ) : (
        <>
          <div className="card-grid">
            {displayed.map((m) => {
              const isAdmin = m.role === 'admin'
              const isPresident = m.leaderType === 'president'
              const isCoordinator = m.leaderType === 'coordinator'
              const isLeader = isPresident || isCoordinator

              const displayName =
                isAdmin && (m.name === 'Club Admin' || m.name.toLowerCase() === 'admin')
                  ? 'The Club Hub Admin'
                  : m.name
              const recent = !isAdmin && !isLeader && isRecent(m.createdAt)

              const cardClass = isAdmin
                ? 'member-card member-card-admin'
                : isPresident
                ? 'member-card member-card-president'
                : isCoordinator
                ? 'member-card member-card-coordinator'
                : 'member-card'

              const avatarClass = isAdmin
                ? 'member-avatar member-avatar-admin'
                : isPresident
                ? 'member-avatar member-avatar-president'
                : isCoordinator
                ? 'member-avatar member-avatar-coordinator'
                : 'member-avatar'

              return (
                <div key={m._id} className={cardClass}>
                  <div className={avatarClass}>
                    {isAdmin ? '👑' : isPresident ? (m.clubIcon || '⭐') : isCoordinator ? (m.clubIcon || '⚡') : getInitials(displayName)}
                  </div>
                  <div className="member-info">
                    <div className="member-name">
                      {displayName}
                      {isAdmin && <span className="admin-crown-icon" title="Club Administrator"> 👑</span>}
                      {isPresident && <span className="leader-star-icon" title="Club President"> ⭐</span>}
                      {isCoordinator && <span className="coordinator-bolt-icon" title="Club Coordinator"> ⚡</span>}
                    </div>

                    {/* Club Affiliation Link for Leaders */}
                    {isLeader && m.clubId && (
                      <Link to={`/clubs/${m.clubId}`} className="member-club-link" title={`View ${m.clubName} Profile`}>
                        {m.roleTitle} · {m.clubName} →
                      </Link>
                    )}

                    <div className="member-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: isLeader ? '6px' : '4px' }}>
                      {isAdmin ? (
                        <Badge type="admin">Admin</Badge>
                      ) : isPresident ? (
                        <span className="badge badge-president">⭐ Club President</span>
                      ) : isCoordinator ? (
                        <span className="badge badge-coordinator">⚡ Coordinator</span>
                      ) : (
                        <Badge type="user">{m.role}</Badge>
                      )}

                      {isLeader && m.clubBadge && (
                        <span className="badge badge-social" style={{ fontSize: '0.72rem' }}>
                          {m.clubBadge}
                        </span>
                      )}

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
                style={{ minWidth: '240px' }}
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
