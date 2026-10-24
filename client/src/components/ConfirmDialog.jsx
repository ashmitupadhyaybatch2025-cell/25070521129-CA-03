import Modal from './Modal.jsx'

/**
 * ConfirmDialog — wraps Modal with a styled confirm/cancel layout.
 * Props: open, onClose, onConfirm, title, message, confirmLabel, danger
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      className="confirm-box"
      footer={
        <>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'} btn-sm`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-icon">⚠️</div>
      <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '4px' }}>{message}</p>
    </Modal>
  )
}
