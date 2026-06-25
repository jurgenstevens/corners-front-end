import { useState, useEffect } from 'react'
import * as messageService from '../../services/messageService'
import styles from './MessageInbox.module.css'

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return 'just now'
}

export default function MessageInbox({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeThread, setActiveThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)

  async function loadThreads() {
    if (!user) return
    try {
      const data = await messageService.getMyThreads()
      const arr = Array.isArray(data) ? data : []
      setThreads(arr)
      setTotalUnread(arr.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0))
    } catch {
      // fail silently — inbox is supplementary
    }
  }

  useEffect(() => {
    if (!user) return
    loadThreads()
    const interval = setInterval(loadThreads, 60000)
    return () => clearInterval(interval)
  }, [user])

  async function openThread(thread) {
    setLoading(true)
    try {
      const data = await messageService.getThread(thread._id)
      setActiveThread(data.thread ?? thread)
      setMessages(data.messages ?? [])
      // optimistically clear unread for this thread
      setTotalUnread(prev => Math.max(0, prev - (thread.unreadCount ?? 0)))
      setThreads(ts => ts.map(t => t._id === thread._id ? { ...t, unreadCount: 0 } : t))
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!replyText.trim() || !activeThread) return
    setSending(true)
    const body = replyText.trim()
    setReplyText('')
    // optimistic append
    setMessages(prev => [...prev, {
      _id: `opt_${Date.now()}`,
      sender: { name: user.name },
      body,
      createdAt: new Date().toISOString(),
      isSystemMessage: false,
    }])
    try {
      await messageService.sendReply(activeThread._id, body)
    } catch {
      // revert on failure could go here — skipping for simplicity
    } finally {
      setSending(false)
    }
  }

  function handleClose() {
    setIsOpen(false)
    setActiveThread(null)
    setMessages([])
    setReplyText('')
  }

  return (
    <>
      <button
        className={styles.toggleBtn}
        onClick={() => setIsOpen(true)}
        aria-label="Messages"
        title="Messages from Corners Admin"
      >
        ✉️
        {totalUnread > 0 && <span className={styles.toggleBadge}>{totalUnread > 9 ? '9+' : totalUnread}</span>}
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.panel} onClick={e => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              {activeThread ? (
                <>
                  <button className={styles.backBtn} onClick={() => { setActiveThread(null); setMessages([]) }}>← Back</button>
                  <p className={styles.panelTitle}>{activeThread.subject || 'Message'}</p>
                </>
              ) : (
                <p className={styles.panelTitle}>Messages</p>
              )}
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">✕</button>
            </div>

            <div className={styles.panelBody}>
              {loading && <p className={styles.loading}>Loading…</p>}

              {/* Thread list */}
              {!loading && !activeThread && (
                threads.length === 0
                  ? (
                    <div className={styles.empty}>
                      <p className={styles.emptyIcon}>✉️</p>
                      <p>No messages yet.</p>
                    </div>
                  )
                  : threads.map(t => (
                    <div
                      key={t._id}
                      className={styles.threadRow}
                      onClick={() => openThread(t)}
                    >
                      <div className={styles.threadMeta}>
                        <p className={styles.threadSubject}>{t.subject || '(No subject)'}</p>
                        <p className={styles.threadPreview}>{t.lastMessagePreview}</p>
                      </div>
                      <div className={styles.threadRight}>
                        {t.lastMessage && <p className={styles.threadDate}>{timeAgo(t.lastMessage)}</p>}
                        {t.unreadCount > 0 && <span className={styles.unreadDot} />}
                      </div>
                    </div>
                  ))
              )}

              {/* Message view */}
              {!loading && activeThread && (
                <div className={styles.messageView}>
                  <div className={styles.messageList}>
                    {messages.map(m => (
                      <div
                        key={m._id}
                        className={`${styles.message} ${m.isSystemMessage ? styles.sysMessage : ''}`}
                      >
                        {!m.isSystemMessage && (
                          <div className={styles.msgHeader}>
                            {m.sender?.name === 'Corners Admin' || activeThread.isAdminThread && messages.indexOf(m) === 0 ? (
                              <span className={styles.adminBadge}>Corners Admin</span>
                            ) : (
                              <span className={styles.senderName}>{m.sender?.name ?? 'You'}</span>
                            )}
                            <span className={styles.msgTime}>{timeAgo(m.createdAt)}</span>
                          </div>
                        )}
                        <p className={`${styles.msgBody} ${m.isSystemMessage ? styles.sysBody : ''}`}>{m.body}</p>
                      </div>
                    ))}
                  </div>

                  {activeThread.status === 'closed' ? (
                    <div className={styles.closedBanner}>This conversation has been closed.</div>
                  ) : (
                    <div className={styles.replyBox}>
                      <textarea
                        className={styles.replyInput}
                        placeholder="Reply…"
                        rows={2}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                      />
                      <button
                        className={styles.sendBtn}
                        onClick={handleSend}
                        disabled={!replyText.trim() || sending}
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
