import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) => (isActive ? 'active-link' : '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ---- Navbar ---- */}
      <nav className="flexi-nav">
        <div className="nav-inner">
          <NavLink className="nav-logo" to="/home">FLEXI</NavLink>

          {/* Desktop links */}
          <ul className="nav-links">
            <li className="nav-link-item">
              <NavLink className={linkClass} to="/home">Home</NavLink>
            </li>
            <li className="nav-link-item">
              <NavLink className={linkClass} to="/events">Events</NavLink>
            </li>
            <li className="nav-link-item">
              <NavLink className={linkClass} to="/announcements">Announcements</NavLink>
            </li>
            <li className="nav-link-item">
              <NavLink className={linkClass} to="/members">Members</NavLink>
            </li>
            {user?.role === 'admin' && (
              <li className="nav-link-item">
                <NavLink className={linkClass} to="/admin">Admin</NavLink>
              </li>
            )}
          </ul>

          {/* Desktop right (User & Logout) */}
          <div className="nav-right">
            <span className="nav-user" title={user?.name}>{user?.name}</span>
            <button className="nav-btn" onClick={onLogout}>Log out</button>
          </div>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Open menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <NavLink className={linkClass} to="/home"    onClick={() => setMenuOpen(false)}>🏠 Home</NavLink>
        <NavLink className={linkClass} to="/events"  onClick={() => setMenuOpen(false)}>🎉 Events</NavLink>
        <NavLink className={linkClass} to="/announcements" onClick={() => setMenuOpen(false)}>📢 Announcements</NavLink>
        <NavLink className={linkClass} to="/members" onClick={() => setMenuOpen(false)}>👥 Members</NavLink>
        {user?.role === 'admin' && (
          <NavLink className={linkClass} to="/admin" onClick={() => setMenuOpen(false)}>⚙️ Admin</NavLink>
        )}
        <div className="nav-mobile-bottom">
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 600 }}>{user?.name}</span>
          <button className="nav-btn" onClick={onLogout}>Log out</button>
        </div>
      </div>

      {/* Page content */}
      <main className="flexi-main page-container page-anim">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="flexi-footer">
        <strong>FLEXI Club Hub</strong> · Made at SIT Nagpur
      </footer>
    </div>
  )
}
