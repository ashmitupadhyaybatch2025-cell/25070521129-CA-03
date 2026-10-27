import { useEffect, useState, useMemo } from 'react'
import { api } from '../api.js'
import useAuth from '../hooks/useAuth.js'
import { SAMPLE_MEMBERS } from '../data/sampleMembers.js'
import { getClubLeaders } from '../data/clubsData.js'

export default function LiveActivityTicker() {
  const { token } = useAuth()
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (!token) return
    api('/members', { token })
      .then((d) => {
        if (d.members && d.members.length > 0) {
          setMembers(d.members)
        } else {
          setMembers(SAMPLE_MEMBERS)
        }
      })
      .catch(() => {
        setMembers(SAMPLE_MEMBERS)
      })
  }, [token])

  // Generate engaging, realistic collegiate live activity items
  const tickerItems = useMemo(() => {
    const list = members.length > 0 ? members : SAMPLE_MEMBERS
    const leaders = getClubLeaders()
    const pool = [...list]
    // Shuffle pool lightly
    const shuffled = pool.sort(() => 0.5 - Math.random())

    const clubs = [
      { name: 'Binary Beats', icon: '💻' },
      { name: 'SkillForge Guild', icon: '🛠️' },
      { name: 'Thunderbolts Sports', icon: '⚡' },
      { name: 'Rhythm & Resonance', icon: '🎭' },
      { name: 'Nexus Social Cell', icon: '🤝' },
      { name: 'Chronicle Media', icon: '📸' },
    ]

    const events = [
      'Hackathon 24h',
      'Web Dev Workshop',
      'Inter-College Cricket Match',
      'Cultural Gala Night',
      'Freshers Meet & Mixer',
      'Robotics Prototyping Lab',
    ]

    const activities = []

    for (let i = 0; i < Math.min(shuffled.length, 24); i++) {
      const m = shuffled[i]
      const name = m.name === 'Club Admin' ? 'The Club Hub Admin' : m.name
      const club = clubs[i % clubs.length]
      const event = events[i % events.length]

      if (i % 4 === 0) {
        activities.push({
          icon: '🎉',
          text: (
            <>
              <strong>{name}</strong> joined <em>The Club Hub</em>
            </>
          ),
          time: 'just now',
        })
      } else if (i % 4 === 1) {
        activities.push({
          icon: club.icon,
          text: (
            <>
              <strong>{name}</strong> joined <em>{club.name}</em>
            </>
          ),
          time: `${(i % 12) + 2}m ago`,
        })
      } else if (i % 4 === 2) {
        activities.push({
          icon: '🎟️',
          text: (
            <>
              <strong>{name}</strong> registered for <em>{event}</em>
            </>
          ),
          time: `${(i % 25) + 5}m ago`,
        })
      } else {
        activities.push({
          icon: '⚡',
          text: (
            <>
              <strong>{name}</strong> unlocked <em>Active Member</em> status
            </>
          ),
          time: `${(i % 45) + 10}m ago`,
        })
      }
    }

    // Add club leaders welcome item
    if (leaders.length > 0) {
      const l = leaders[0]
      activities.unshift({
        icon: '⭐',
        text: (
          <>
            <strong>{l.name}</strong> ({l.clubName}) welcomed new club members
          </>
        ),
        time: 'live',
      })
    }

    return activities
  }, [members])

  if (tickerItems.length === 0) return null

  return (
    <div className="activity-ticker-wrap" title="Live Campus Community Stream (Hover to pause)">
      <div className="ticker-badge-left">
        <span className="ticker-pulsing-dot" />
        <span className="ticker-label">LIVE FEED</span>
      </div>

      <div className="ticker-viewport">
        {/* Track duplicated for seamless infinite scroll */}
        <div className="ticker-track">
          {tickerItems.map((item, idx) => (
            <div className="ticker-item" key={`t1-${idx}`}>
              <span className="ticker-item-icon">{item.icon}</span>
              <span className="ticker-item-text">{item.text}</span>
              <span className="ticker-item-time">{item.time}</span>
              <span className="ticker-dot-sep">·</span>
            </div>
          ))}
          {/* Duplicate set for 100% loop continuity */}
          {tickerItems.map((item, idx) => (
            <div className="ticker-item" key={`t2-${idx}`}>
              <span className="ticker-item-icon">{item.icon}</span>
              <span className="ticker-item-text">{item.text}</span>
              <span className="ticker-item-time">{item.time}</span>
              <span className="ticker-dot-sep">·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
