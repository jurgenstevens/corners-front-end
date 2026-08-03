import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as adminService from '../../services/adminService'
import styles from './AdminBusinessDetail.module.css'

const BASE_MSG = `${import.meta.env.VITE_BACK_END_SERVER_URL}/api/messages`

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

const CHECKLIST = [
  'Business name matches registration',
  'Address verified via map lookup',
  'Not a chain/franchise',
  'Owner contact confirmed',
  'Business is active (not closed)',
]

const STATUS_CLASS = { pending: 'warn', approved: 'success', verified: 'success', rejected: 'danger' }

export default function AdminBusinessDetail() {
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifyNotes, setVerifyNotes] = useState('')
  const [checks, setChecks] = useState(Array(CHECKLIST.length).fill(false))
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [composeMode, setComposeMode] = useState(false)
  const [compose, setCompose] = useState({ subject: '', body: '' })
  const [replyBody, setReplyBody] = useState('')
  const [actionFeedback, setActionFeedback] = useState('')
  const [confirmReject, setConfirmReject] = useState(false)
  const [trialExtendDays, setTrialExtendDays] = useState(30)
  const [trialExtending, setTrialExtending] = useState(false)
  const [trialFeedback, setTrialFeedback] = useState('')
  const [confirmExtend, setConfirmExtend] = useState(false)

  useEffect(() => {
    adminService.getBusinessDetail(id).then(data => { setDetail(data); setLoading(false) })
    fetch(`${BASE_MSG}?businessId=${id}`, { headers: authHeaders() })
      .then(r => r.json()).then(data => setThreads(Array.isArray(data) ? data : []))
  }, [id])

  async function loadThread(threadId) {
    const res = await fetch(`${BASE_MSG}/${threadId}`, { headers: authHeaders() })
    const data = await res.json()
    setActiveThread(data.thread)
    setMessages(data.messages ?? [])
  }

  async function handleStartThread() {
    const res = await fetch(`${BASE_MSG}/start`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        recipientProfileId: detail.business.profile._id,
        subject: compose.subject,
        body: compose.body,
        relatedBusinessId: id,
      }),
    })
    const data = await res.json()
    setThreads(t => [data.thread, ...t])
    setComposeMode(false)
    setCompose({ subject: '', body: '' })
    loadThread(data.thread._id)
  }

  async function handleReply() {
    if (!replyBody.trim() || !activeThread) return
    await fetch(`${BASE_MSG}/${activeThread._id}/reply`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ body: replyBody }),
    })
    setReplyBody('')
    loadThread(activeThread._id)
  }

  async function handleApprove() {
    const data = await adminService.verifyBusiness(id, verifyNotes)
    if (data.verificationStatus) {
      setDetail(d => ({ ...d, business: { ...d.business, verificationStatus: data.verificationStatus, verificationNotes: data.verificationNotes } }))
      setActionFeedback('Store approved.')
    }
  }

  async function handleRevoke() {
    const data = await adminService.revokeBusiness(id)
    if (data.verificationStatus) {
      setDetail(d => ({ ...d, business: { ...d.business, verificationStatus: data.verificationStatus, verificationNotes: null } }))
      setActionFeedback('Approval revoked. Store is now pending.')
    }
  }

  async function handleExtendTrial() {
    setTrialExtending(true)
    const data = await adminService.extendTrial(id, trialExtendDays)
    setTrialExtending(false)
    setConfirmExtend(false)
    if (data.err) {
      setTrialFeedback(`Error: ${data.err}`)
    } else {
      setDetail(d => ({ ...d, billing: data.billing }))
      setTrialFeedback(data.stripeSyncError
        ? `Trial extended (Stripe sync failed: ${data.stripeSyncError})`
        : 'Trial extended.')
    }
  }

  async function handleRejectStore() {
    const data = await adminService.rejectStore(id)
    if (data.verificationStatus) {
      setDetail(d => ({ ...d, business: { ...d.business, verificationStatus: data.verificationStatus, rejectedAt: data.rejectedAt } }))
      setActionFeedback('Store rejected. The owner has been notified and the account will be deleted in 3 days.')
      setConfirmReject(false)
    }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>
  if (!detail) return <p className={styles.error}>Business not found.</p>

  const { business, connectionStats = [], productCount, tallyCount } = detail
  const owner = business.profile

  const connMap = {}
  connectionStats.forEach(({ _id, count }) => { connMap[_id] = count })

  const vStatus = business.verificationStatus ?? 'unverified'
  const isAuthentic = business.isAuthentic ?? false

  return (
    <div className={styles.layout}>
      {/* LEFT — Business info + actions */}
      <div className={styles.col}>
        <div className={styles.card}>
          <div className={styles.bizHeader}>
            <h2 className={styles.bizName}>{business.displayName || owner?.name}</h2>
            <div className={styles.badgeRow}>
              <span className={`${styles.badge} ${styles[STATUS_CLASS[vStatus]]}`}>{vStatus.charAt(0).toUpperCase() + vStatus.slice(1)}</span>
            </div>
          </div>

          {owner && (
            <div className={styles.ownerRow}>
              {owner.photo && <img src={owner.photo} className={styles.ownerPhoto} alt="" />}
              <div>
                <p className={styles.ownerName}>{owner.name}</p>
                <p className={styles.ownerEmail}>{owner.email}</p>
              </div>
            </div>
          )}

          <div className={styles.detailGrid}>
            {business.businessType && <><span className={styles.detailLabel}>Type</span><span>{business.businessType}</span></>}
            {business.phone && <><span className={styles.detailLabel}>Phone</span><span>{business.phone}</span></>}
            {business.address && <><span className={styles.detailLabel}>Address</span><span>{business.address}</span></>}
            {(business.location?.city || business.location?.state) && (
              <><span className={styles.detailLabel}>Location</span><span>{[business.location.city, business.location.state].filter(Boolean).join(', ')}</span></>
            )}
          </div>

          {business.description && <p className={styles.description}>{business.description}</p>}

          {business.photos?.length > 0 && (
            <div className={styles.photos}>
              {business.photos.slice(0, 4).map((p, i) => <img key={i} src={p} className={styles.photo} alt="" />)}
            </div>
          )}
        </div>
      </div>

      {/* CENTER — Activity + Messages */}
      <div className={styles.col}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Activity</h3>
          <div className={styles.statRow}>
            <div className={styles.stat}><span className={styles.statCount}>{connMap.approved ?? 0}</span><span className={styles.statLabel}>Connected Patrons</span></div>
            <div className={styles.stat}><span className={styles.statCount}>{connMap.pending ?? 0}</span><span className={styles.statLabel}>Pending Requests</span></div>
            <div className={styles.stat}><span className={styles.statCount}>{productCount ?? 0}</span><span className={styles.statLabel}>Products Listed</span></div>
            <div className={styles.stat}><span className={styles.statCount}>{tallyCount ?? 0}</span><span className={styles.statLabel}>Hit Tally</span></div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>Messages</h3>
            {!composeMode && !activeThread && (
              <button className={styles.btnAccent} onClick={() => setComposeMode(true)}>+ Start Conversation</button>
            )}
            {(composeMode || activeThread) && (
              <button className={styles.btnGhost} onClick={() => { setComposeMode(false); setActiveThread(null); setMessages([]) }}>← Back</button>
            )}
          </div>

          {composeMode && (
            <div>
              <input className={styles.input} placeholder="Subject" value={compose.subject}
                onChange={e => setCompose(c => ({ ...c, subject: e.target.value }))} />
              <textarea className={styles.textarea} placeholder="Message…" rows={4} value={compose.body}
                onChange={e => setCompose(c => ({ ...c, body: e.target.value }))} />
              <div className={styles.actions}>
                <button className={styles.btnAccent} onClick={handleStartThread}>Send</button>
                <button className={styles.btnGhost} onClick={() => setComposeMode(false)}>Cancel</button>
              </div>
            </div>
          )}

          {!composeMode && !activeThread && threads.length === 0 && (
            <p className={styles.empty}>No conversations yet.</p>
          )}

          {!composeMode && !activeThread && threads.length > 0 && threads.map(t => (
            <div key={t._id} className={styles.threadRow} onClick={() => loadThread(t._id)}>
              <p className={styles.threadSubject}>{t.subject || '(No subject)'}</p>
              <p className={styles.threadPreview}>{t.lastMessagePreview}</p>
              <p className={styles.threadDate}>{t.lastMessage ? new Date(t.lastMessage).toLocaleDateString() : ''}</p>
            </div>
          ))}

          {activeThread && (
            <div>
              <p className={styles.threadSubjectFull}>{activeThread.subject}</p>
              <div className={styles.messageList}>
                {messages.map(m => (
                  <div key={m._id} className={`${styles.message} ${m.isSystemMessage ? styles.sysMsg : ''}`}>
                    <p className={styles.msgSender}>{m.sender?.name}</p>
                    <p className={styles.msgBody}>{m.body}</p>
                    <p className={styles.msgTime}>{new Date(m.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className={styles.replyRow}>
                <textarea className={styles.textarea} placeholder="Reply…" rows={2} value={replyBody}
                  onChange={e => setReplyBody(e.target.value)} />
                <button className={styles.btnAccent} onClick={handleReply}>Send</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Verification */}
      <div className={styles.col}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Status</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span className={`${styles.badge} ${styles[STATUS_CLASS[vStatus]]} ${styles.badgeLarge}`}>{vStatus.charAt(0).toUpperCase() + vStatus.slice(1)}</span>
          </div>

          {business.verificationNotes && (
            <p className={styles.verifyNotes}>{business.verificationNotes}</p>
          )}

          {actionFeedback && <p className={styles.feedback}>{actionFeedback}</p>}

          <textarea
            className={styles.textarea}
            placeholder="Admin notes (optional)…"
            rows={3}
            value={verifyNotes}
            onChange={e => setVerifyNotes(e.target.value)}
            style={{ marginTop: '12px' }}
          />

          <div className={styles.actions}>
            {vStatus === 'pending' && (
              <button className={styles.btnGreen} onClick={handleApprove}>✓ Approve Store</button>
            )}
            {vStatus === 'approved' && (
              <button className={styles.btnOrange} onClick={handleRevoke}>Revoke Approval</button>
            )}
            {vStatus !== 'rejected' && (
              <button className={styles.btnRed} onClick={() => setConfirmReject(true)}>Reject Store</button>
            )}
          </div>

          {confirmReject && (
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>Reject this store? The owner will be notified and their account deleted in 3 days.</p>
              <div className={styles.actions}>
                <button className={styles.btnRed} onClick={handleRejectStore}>Confirm Reject</button>
                <button className={styles.btnGhost} onClick={() => setConfirmReject(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className={styles.checklist}>
            <p className={styles.checklistTitle}>Verification Checklist</p>
            {CHECKLIST.map((item, i) => (
              <label key={i} className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() => setChecks(c => c.map((v, idx) => idx === i ? !v : v))}
                  className={styles.checkbox}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Billing</h3>
          {!detail.billing ? (
            <p className={styles.empty}>No billing record.</p>
          ) : (
            <>
              <div className={styles.detailGrid}>
                <span className={styles.detailLabel}>Status</span>
                <span>{detail.billing.subscriptionStatus}</span>
                <span className={styles.detailLabel}>Trial ends</span>
                <span>
                  {detail.billing.trialEndsAt
                    ? new Date(detail.billing.trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className={styles.actions}>
                <select
                  className={styles.input}
                  style={{ width: 'auto' }}
                  value={trialExtendDays}
                  onChange={e => setTrialExtendDays(Number(e.target.value))}
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
                <button className={styles.btnAccent} onClick={() => setConfirmExtend(true)}>
                  + Extend Trial
                </button>
              </div>
              {trialFeedback && <p className={styles.feedback}>{trialFeedback}</p>}
              {confirmExtend && (
                <div className={styles.confirmBox} style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)' }}>
                  <p className={styles.confirmText} style={{ color: '#e2e8f0' }}>
                    Extend {business.displayName || owner?.name}&apos;s trial by {trialExtendDays} days?
                  </p>
                  <div className={styles.actions}>
                    <button className={styles.btnGreen} disabled={trialExtending} onClick={handleExtendTrial}>
                      {trialExtending ? 'Extending…' : 'Confirm'}
                    </button>
                    <button className={styles.btnGhost} onClick={() => setConfirmExtend(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
