import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import useAuth from '../hooks/useAuth.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useToast } from '../context/ToastProvider.jsx'

export default function Admin() {
  const { token, user: me } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { document.title = 'Admin — The Club Hub' }, [])

  const load = useCallback(
    () =>
      api('/getall', { token })
        .then((list) => { setUsers(list); setLoading(false) })
        .catch((e) => { setError(e.message); setLoading(false) }),
    [token]
  )

  useEffect(() => { load() }, [load])

  const changeRole = async (u, newStatus) => {
    try {
      await api(`/update/${u._id}`, {
        method: 'PUT',
        token,
        body: { status: newStatus },
      })
      toast(`${u.name} is now ${newStatus}`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await api(`/delete/${deleteTarget._id}`, { method: 'DELETE', token })
      toast(`${deleteTarget.name} removed`, 'success')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
    setDeleteTarget(null)
  }

  const totalAdmins = users.filter((u) => u.status === 'admin').length

  return (
    <div className="page-anim">
      <div className="page-header">
        <h2>⚙️ Admin Panel</h2>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {/* Summary */}
      <div className="admin-summary">
        <div className="admin-stat">
          <div className="admin-stat-num">{users.length}</div>
          <div className="admin-stat-label">Total Users</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-num">{totalAdmins}</div>
          <div className="admin-stat-label">Admins</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-num">{users.length - totalAdmins}</div>
          <div className="admin-stat-label">Regular Users</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <strong>{u.name}</strong>
                    {String(u._id) === me.id && (
                      <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: 'var(--muted)' }}>(you)</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                  <td>{u.age ?? '—'}</td>
                  <td>
                    {String(u._id) !== me.id ? (
                      <select
                        className="admin-role-select"
                        value={u.status}
                        onChange={(e) => changeRole(u, e.target.value)}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span
                        className={`badge badge-${u.status === 'admin' ? 'admin' : 'user'}`}
                      >
                        {u.status}
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {String(u._id) !== me.id && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(u)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.name}?`}
        message={`This will permanently remove ${deleteTarget?.email} from the system.`}
        confirmLabel="Delete user"
        danger
      />
    </div>
  )
}
