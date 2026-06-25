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

const STATUS_CLASS = { unverified: 'warn', pending_verification: 'warn', verified: 'success', rejected: 'danger' }

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

  async function handleVerify() {
    const data = await adminService.verifyBusiness(id, verifyNotes)
    if (data.verificationStatus) {
      setDetail(d => ({ ...d, business: { ...d.business, verificationStatus: data.verificationStatus, verificationNotes: data.verificationNotes } }))
      setActionFeedback('Business verified.')
    }
  }

  async function handleReject() {
    const data = await adminService.rejectBusiness(id, verifyNotes)
    if (data.verificationStatus) {
      setDetail(d => ({ ...d, business: { ...d.business, verificationStatus: data.verificationStatus, verificationNotes: data.verificationNotes } }))
      setActionFeedback('Business rejected.')
    }
  }

  if (loading) return <p className={styles.loading}>Loading…</p>
  if (!detail) return <p className={styles.error}>Business not found.</p>

  const { business, connectionStats = [], productCount, tallyCount } = detail
  const owner = business.profile

  const connMap = {}
  connectionStats.forEach(({ _id, count }) => { connMap[_id] = count })

  const vStatus = business.verificationStatus ?? 'unverified'

  return (
    <div className={styles.layout}>
      {/* LEFT — Business info + actions */}
      <div className={styles.col}>
        <div className={styles.card}>
          <div className={styles.bizHeader}>
            <h2 className={styles.bizName}>{business.displayName || owner?.name}</h2>
            <div className={styles.badgeRow}>
              <span className={`${styles.badge} ${styles[STATUS_CLASS[vStatus]]}`}>{vStatus}</span>
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
          <h3 className={styles.cardTitle}>Verification</h3>
          <span className={`${styles.badge} ${styles[STATUS_CLASS[vStatus]]} ${styles.badgeLarge}`}>{vStatus}</span>

          {business.verificationNotes && (
            <p className={styles.verifyNotes}>{business.verificationNotes}</p>
          )}

          {actionFeedback && <p className={styles.feedback}>{actionFeedback}</p>}

          <textarea
            className={styles.textarea}
            placeholder="Admin notes…"
            rows={3}
            value={verifyNotes}
            onChange={e => setVerifyNotes(e.target.value)}
            style={{ marginTop: '12px' }}
          />

          <div className={styles.actions}>
            {vStatus !== 'verified' && (
              <button className={styles.btnGreen} onClick={handleVerify}>✓ Verify Business</button>
            )}
            {vStatus !== 'rejected' && (
              <button className={styles.btnRed} onClick={handleReject}>✗ Reject</button>
            )}
            {vStatus === 'verified' && (
              <button className={styles.btnOrange} onClick={() => adminService.rejectBusiness(id, 'Marked unverified by admin')
                .then(d => setDetail(prev => ({ ...prev, business: { ...prev.business, verificationStatus: d.verificationStatus } })))}>
                Mark Unverified
              </button>
            )}
          </div>

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
      </div>
    </div>
  )
}
