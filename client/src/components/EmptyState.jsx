/**
 * EmptyState component.
 * Props: icon, title, message, action (optional JSX)
 */
export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      {title && <h3>{title}</h3>}
      {message && <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>{message}</p>}
      {action && <div style={{ marginTop: '24px' }}>{action}</div>}
    </div>
  )
}
