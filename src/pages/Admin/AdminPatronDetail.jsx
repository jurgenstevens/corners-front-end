import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as adminService from '../../services/adminService'
import styles from './AdminPatronDetail.module.css'

const FLAG_LABELS = {
  rapid_voting: f => `Voted ${f.votesInWindow} times in ${f.windowMinutes} minutes`,
  new_account_burst: f => `New account, ${f.votesInWindow} votes in ${Math.round(f.windowMinutes / 1440)} days`,
  single_store_focus: f => `${f.votesInWindow} of their votes go to one store`,
  coordinated_pattern: () => 'Manually flagged by admin',
}

export default function AdminPatronDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState(null)
  const [suspendDays, setSuspendDays] = useState(7)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    adminService.getPatronDetail(id).then(data => {
      setDetail(data)
      setLoading(false)
    })
  }, [id])

  async function handleBan() {
    await adminService.banUser(id, 'Banned by admin')
    setDetail(d => ({ ...d, patron: { ...d.patron, isBanned: true, isSuspended: false } }))
    setFeedback('Account banned.')
    setConfirmAction(null)
  }

  async function handleSuspend() {
    await adminService.suspendUser(id, 'Suspended by admin', suspendDays)
    setDetail(d => ({ ...d, patron: { ...d.patron, isSuspended: true } }))
    setFeedback(`Account suspended for ${suspendDays} days.`)
    setConfirmAction(null)
  }

  async function handleLiftBan() {
    await adminService.liftBan(id)
    setDetail(d => ({ ...d, patron: { ...d.patron, isBanned: false } }))
    setFeedback('Ban lifted.')
    setConfirmAction(null)
  }

  async function handleLiftSuspension() {
    await adminService.liftSuspension(id)
    setDetail(d => ({ ...d, patron: { ...d.patron, isSuspended: false } }))
    setFeedback('Suspension lifted.')
    setConfirmAction(null)
  }

  async function handleDismissFlag(flagId) {
    await adminService.dismissAbuseFlag(flagId)
    setDetail(d => ({ ...d, activeFlags: d.activeFlags.filter(f => f._id !== flagId) }))
  }

  async function handleDelete() {
    await adminService.deletePatron(id)
    navigate('/dashboard/admin/patrons')
  }

  if (loading) return <p className={styles.loading}>Loading…</p>
  if (!detail?.patron) return <p className={styles.error}>Patron not found.</p>

  const { patron, connections = [], votes = [], activeFlags = [] } = detail
  const status = patron.isBanned ? 'banned' : patron.isSuspended ? 'suspended' : 'active'

  return (
    <div className={styles.layout}>
      {/* LEFT — Profile info + actions */}
      <div className={styles.col}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard/admin/patrons')}>
          ← Back to Patrons
        </button>

        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              {patron.photo && <img src={patron.photo} className={styles.avatar} alt="" />}
              <h2 className={styles.name}>{patron.name}</h2>
              <p className={styles.email}>{patron.email}</p>
            </div>
            <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>{status}</span>
          </div>

          <div className={styles.metaGrid}>
            <span className={styles.metaLabel}>Joined</span>
            <span>{new Date(patron.createdAt).toLocaleDateString()}</span>
            {patron.isSuspended && patron.suspendedUntil && (
              <>
                <span className={styles.metaLabel}>Suspended until</span>
                <span>{new Date(patron.suspendedUntil).toLocaleDateString()}</span>
              </>
            )}
            {patron.isSuspended && patron.suspensionReason && (
              <>
                <span className={styles.metaLabel}>Reason</span>
                <span>{patron.suspensionReason}</span>
              </>
            )}
            {patron.isBanned && patron.banReason && (
              <>
                <span className={styles.metaLabel}>Ban reason</span>
                <span>{patron.banReason}</span>
              </>
            )}
            {patron.isBanned && patron.bannedAt && (
              <>
                <span className={styles.metaLabel}>Banned</span>
                <span>{new Date(patron.bannedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>

          {feedback && <p className={styles.feedback}>{feedback}</p>}

          {confirmAction === 'ban' && (
            <div className={styles.confirm}>
              <p>Permanently ban this account? Their connections and votes will be removed.</p>
              <div className={styles.rowActions}>
                <button className={styles.btnRed} onClick={handleBan}>Confirm Ban</button>
                <button className={styles.btnGhost} onClick={() => setConfirmAction(null)}>Cancel</button>
              </div>
            </div>
          )}

          {confirmAction === 'suspend' && (
            <div className={styles.confirmWarn}>
              <p>Suspend account for how many days?</p>
              <input
                type="number"
                className={styles.input}
                value={suspendDays}
                min={1}
                max={365}
                onChange={e => setSuspendDays(Number(e.target.value))}
              />
              <div className={styles.rowActions}>
                <button className={styles.btnOrange} onClick={handleSuspend}>Confirm Suspend</button>
                <button className={styles.btnGhost} onClick={() => setConfirmAction(null)}>Cancel</button>
              </div>
            </div>
          )}

          {confirmAction === 'delete' && (
            <div className={styles.confirm}>
              <p>Permanently delete this account and all associated data? This cannot be undone.</p>
              <div className={styles.rowActions}>
                <button className={styles.btnRed} onClick={handleDelete}>Delete Account</button>
                <button className={styles.btnGhost} onClick={() => setConfirmAction(null)}>Cancel</button>
              </div>
            </div>
          )}

          <div className={styles.rowActions} style={{ marginTop: '16px' }}>
            {!patron.isBanned && !patron.isSuspended && (
              <button className={styles.btnOrange} onClick={() => setConfirmAction('suspend')}>Suspend</button>
            )}
            {patron.isSuspended && (
              <button className={styles.btnGreen} onClick={handleLiftSuspension}>Lift Suspension</button>
            )}
            {!patron.isBanned && (
              <button className={styles.btnRed} onClick={() => setConfirmAction('ban')}>Ban Account</button>
            )}
            {patron.isBanned && (
              <button className={styles.btnGreen} onClick={handleLiftBan}>Lift Ban</button>
            )}
            <button className={styles.btnDelete} onClick={() => setConfirmAction('delete')}>Delete Account</button>
          </div>
        </div>

        {activeFlags.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Abuse Flags ({activeFlags.length})</h3>
            {activeFlags.map(flag => (
              <div key={flag._id} className={styles.flagItem}>
                <div className={styles.flagTop}>
                  <span className={styles.reasonBadge}>{flag.reason}</span>
                  <button className={styles.btnGhost} onClick={() => handleDismissFlag(flag._id)}>Dismiss</button>
                </div>
                <p className={styles.flagDesc}>{FLAG_LABELS[flag.reason]?.(flag) ?? flag.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — Connections + Voted products */}
      <div className={styles.col}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Connected Stores ({connections.length})</h3>
          {connections.length === 0
            ? <p className={styles.empty}>Not connected to any stores.</p>
            : connections.map(c => (
              <Link key={c._id} to={`/dashboard/admin/stores/${c.business?._id}`} className={styles.itemRow}>
                <div>
                  <p className={styles.itemName}>{c.business?.displayName ?? 'Unnamed Store'}</p>
                  {c.business?.location?.city && (
                    <p className={styles.itemMeta}>{c.business.location.city}, {c.business.location.state}</p>
                  )}
                </div>
                <span className={`${styles.connBadge} ${c.status === 'approved' ? styles.connApproved : c.status === 'pending' ? styles.connPending : styles.connDenied}`}>
                  {c.status}
                </span>
              </Link>
            ))
          }
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Voted Products ({votes.length})</h3>
          {votes.length === 0
            ? <p className={styles.empty}>No products voted on yet.</p>
            : votes.map(p => (
              <Link key={p._id} to={`/dashboard/admin/products/${p._id}`} className={styles.itemRow}>
                <div>
                  <p className={styles.itemName}>{p.name}</p>
                  {p.brand && <p className={styles.itemMeta}>{p.brand}</p>}
                </div>
                <span className={`${styles.reqStatus} ${p.status === 'stocked' ? styles.success : p.status === 'rejected' ? styles.danger : styles.warn}`}>
                  {p.status}
                </span>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  )
}
