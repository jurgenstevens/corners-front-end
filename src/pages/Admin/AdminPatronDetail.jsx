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
  const [approvedFlash, setApprovedFlash] = useState({})
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '', zip: '', city: '', state: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    adminService.getPatronDetail(id).then(data => {
      setDetail(data)
      setLoading(false)
      if (data?.patron) {
        setEditForm({
          name:  data.patron.name  || '',
          email: data.patron.email || '',
          zip:   data.patron.patron?.location?.zip   || '',
          city:  data.patron.patron?.location?.city  || '',
          state: data.patron.patron?.location?.state || '',
        })
      }
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

  async function handleApproveForStore(productId) {
    await adminService.approveProductForStore(productId)
    setDetail(d => ({
      ...d,
      productRequests: d.productRequests.map(p =>
        p._id === productId ? { ...p, status: 'approved' } : p
      ),
    }))
    setApprovedFlash(prev => ({ ...prev, [productId]: true }))
    setTimeout(() => {
      setApprovedFlash(prev => { const n = { ...prev }; delete n[productId]; return n })
    }, 2000)
  }

  async function handleEditSave() {
    setEditSaving(true)
    setEditError('')
    try {
      const result = await adminService.updateUser(patron._id, editForm)
      if (result.err) { setEditError(result.err); return }
      setDetail(d => ({
        ...d,
        patron: {
          ...d.patron,
          name:  editForm.name  || d.patron.name,
          email: editForm.email || d.patron.email,
          patron: d.patron.patron ? {
            ...d.patron.patron,
            location: { zip: editForm.zip, city: editForm.city, state: editForm.state },
          } : d.patron.patron,
        },
      }))
      setEditMode(false)
      setFeedback('Profile updated successfully.')
    } catch (err) {
      setEditError(err.message || 'Failed to update profile.')
    } finally {
      setEditSaving(false)
    }
  }

  function handleEditCancel() {
    setEditMode(false)
    setEditError('')
    setEditForm({
      name:  patron.name  || '',
      email: patron.email || '',
      zip:   patron.patron?.location?.zip   || '',
      city:  patron.patron?.location?.city  || '',
      state: patron.patron?.location?.state || '',
    })
  }

  if (loading) return <p className={styles.loading}>Loading…</p>
  if (!detail?.patron) return <p className={styles.error}>Patron not found.</p>

  const { patron, connections = [], votes = [], activeFlags = [], productRequests = [] } = detail
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
            <div className={styles.headerRight}>
              <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>{status}</span>
              {!editMode && (
                <button className={styles.editBtn} onClick={() => setEditMode(true)}>Edit</button>
              )}
            </div>
          </div>

          {editMode ? (
            <div className={styles.editForm}>
              {editError && <p className={styles.editError}>{editError}</p>}
              <label className={styles.editField}>
                <span className={styles.metaLabel}>Name</span>
                <input className={styles.input} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </label>
              <label className={styles.editField}>
                <span className={styles.metaLabel}>Email</span>
                <input type="email" className={styles.input} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </label>
              <label className={styles.editField}>
                <span className={styles.metaLabel}>Zip</span>
                <input className={styles.input} value={editForm.zip} maxLength={5} onChange={e => setEditForm(f => ({ ...f, zip: e.target.value }))} />
              </label>
              <label className={styles.editField}>
                <span className={styles.metaLabel}>City</span>
                <input className={styles.input} value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} />
              </label>
              <label className={styles.editField}>
                <span className={styles.metaLabel}>State</span>
                <input className={styles.input} value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} />
              </label>
              <div className={styles.rowActions}>
                <button className={styles.btnGreen} onClick={handleEditSave} disabled={editSaving}>
                  {editSaving ? 'Saving…' : 'Save changes'}
                </button>
                <button className={styles.btnGhost} onClick={handleEditCancel} disabled={editSaving}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.metaGrid}>
              <span className={styles.metaLabel}>Joined</span>
              <span>{new Date(patron.createdAt).toLocaleDateString()}</span>
              {patron.patron?.location?.zip && (
                <>
                  <span className={styles.metaLabel}>Location</span>
                  <span>{[patron.patron.location.city, patron.patron.location.state, patron.patron.location.zip].filter(Boolean).join(', ')}</span>
                </>
              )}
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
          )}

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

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Product Requests ({productRequests.length})</h3>
          {productRequests.length === 0
            ? <p className={styles.empty}>No product requests.</p>
            : productRequests.map(p => {
                const badgeClass =
                  p.status === 'stocked'  ? styles.success :
                  p.status === 'approved' ? styles.info    :
                  p.status === 'on_sale'  ? styles.warn    :
                  p.status === 'rejected' ? styles.danger  :
                  styles.muted
                return (
                  <div key={p._id} className={styles.reqRow}>
                    <div className={styles.reqInfo}>
                      <p className={styles.itemName}>{p.name}</p>
                      {p.brand && <p className={styles.itemMeta}>{p.brand}</p>}
                      {p.storeName && <p className={styles.itemMeta}>{p.storeName}</p>}
                    </div>
                    <div className={styles.reqRight}>
                      <span className={`${styles.reqStatus} ${badgeClass}`}>
                        {p.status.replace(/_/g, ' ')}
                      </span>
                      {p.status === 'pending' && !approvedFlash[p._id] && (
                        <button className={styles.btnApprove} onClick={() => handleApproveForStore(p._id)}>
                          Approve for store
                        </button>
                      )}
                      {approvedFlash[p._id] && (
                        <span className={styles.approvedFlash}>Approved</span>
                      )}
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}
