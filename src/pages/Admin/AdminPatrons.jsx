import { useState, useEffect } from 'react'
import * as adminService from '../../services/adminService'
import styles from './AdminPatrons.module.css'

const FLAG_LABELS = {
  rapid_voting: f => `Voted ${f.votesInWindow} times in ${f.windowMinutes} minutes`,
  new_account_burst: f => `New account, ${f.votesInWindow} votes in ${Math.round(f.windowMinutes / 1440)} days`,
  single_store_focus: f => `${f.votesInWindow} of their votes go to one store`,
  coordinated_pattern: () => 'Manually flagged by admin',
}

export default function AdminPatrons() {
  const [tab, setTab] = useState('flags')
  const [flags, setFlags] = useState([])
  const [banned, setBanned] = useState([])
  const [allPatrons, setAllPatrons] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmBan, setConfirmBan] = useState(null)

  useEffect(() => {
    setLoading(true)
    if (tab === 'flags') {
      adminService.getVoteAbuseFlags().then(data => { setFlags(Array.isArray(data) ? data : []); setLoading(false) })
    } else if (tab === 'banned') {
      adminService.getBannedUsers().then(data => { setBanned(Array.isArray(data) ? data : []); setLoading(false) })
    } else {
      adminService.getAllPatrons().then(data => { setAllPatrons(Array.isArray(data) ? data : []); setLoading(false) })
    }
  }, [tab])

  async function handleDismiss(flagId) {
    await adminService.dismissAbuseFlag(flagId)
    setFlags(f => f.filter(x => x._id !== flagId))
  }

  async function handleSuspend(profileId, flagId) {
    await adminService.suspendUser(profileId, 'Vote manipulation', 7)
    await adminService.dismissAbuseFlag(flagId)
    setFlags(f => f.filter(x => x._id !== flagId))
  }

  async function handleBan(profileId, flagId) {
    await adminService.banUser(profileId, 'Vote abuse')
    await adminService.dismissAbuseFlag(flagId)
    setFlags(f => f.filter(x => x._id !== flagId))
    setConfirmBan(null)
  }

  async function handleLiftBan(profileId) {
    await adminService.liftBan(profileId)
    setBanned(b => b.filter(u => u._id !== profileId))
  }

  return (
    <div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`} onClick={() => setTab('all')}>
          All Patrons
        </button>
        <button className={`${styles.tab} ${tab === 'flags' ? styles.tabActive : ''}`} onClick={() => setTab('flags')}>
          Abuse Flags {flags.length > 0 && <span className={styles.tabBadge}>{flags.length}</span>}
        </button>
        <button className={`${styles.tab} ${tab === 'banned' ? styles.tabActive : ''}`} onClick={() => setTab('banned')}>
          Banned Users
        </button>
      </div>

      {loading && <p className={styles.loading}>Loading…</p>}

      {!loading && tab === 'flags' && (
        flags.length === 0
          ? <p className={styles.empty}>No active abuse flags.</p>
          : flags.map(flag => (
            <div key={flag._id} className={styles.flagCard}>
              <div className={styles.flagHeader}>
                <div>
                  <p className={styles.patronName}>{flag.patron?.name ?? 'Unknown'}</p>
                  <p className={styles.patronEmail}>{flag.patron?.email}</p>
                </div>
                <span className={styles.reasonBadge}>{flag.reason}</span>
              </div>
              <p className={styles.flagDescription}>
                {FLAG_LABELS[flag.reason]?.(flag) ?? flag.reason}
              </p>
              <div className={styles.actions}>
                <button className={styles.btnGreen} onClick={() => handleDismiss(flag._id)}>Dismiss Flag</button>
                <button className={styles.btnOrange} onClick={() => handleSuspend(flag.patron?._id, flag._id)}>Suspend 7 Days</button>
                <button className={styles.btnRed} onClick={() => setConfirmBan({ profileId: flag.patron?._id, flagId: flag._id })}>
                  Ban Account
                </button>
              </div>
              {confirmBan?.flagId === flag._id && (
                <div className={styles.confirm}>
                  <p>Are you sure you want to permanently ban this account?</p>
                  <div className={styles.actions}>
                    <button className={styles.btnRed} onClick={() => handleBan(confirmBan.profileId, confirmBan.flagId)}>
                      Confirm Ban
                    </button>
                    <button className={styles.btnGhost} onClick={() => setConfirmBan(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))
      )}

      {!loading && tab === 'banned' && (
        banned.length === 0
          ? <p className={styles.empty}>No banned users.</p>
          : banned.map(u => (
            <div key={u._id} className={styles.bannedRow}>
              <div>
                <p className={styles.patronName}>{u.name}</p>
                <p className={styles.patronEmail}>{u.email}</p>
                <p className={styles.banMeta}>
                  Reason: {u.banReason ?? 'Not specified'} &nbsp;·&nbsp;
                  {u.bannedAt ? new Date(u.bannedAt).toLocaleDateString() : ''}
                </p>
              </div>
              <button className={styles.btnGreen} onClick={() => handleLiftBan(u._id)}>Lift Ban</button>
            </div>
          ))
      )}

      {!loading && tab === 'all' && (
        allPatrons.length === 0
          ? <p className={styles.empty}>No patrons found.</p>
          : allPatrons.map(u => {
            const status = u.isBanned ? 'banned' : u.isSuspended ? 'suspended' : 'active'
            return (
              <div key={u._id} className={styles.bannedRow}>
                <div>
                  <p className={styles.patronName}>{u.name}</p>
                  <p className={styles.patronEmail}>{u.email}</p>
                  <p className={styles.banMeta}>Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>{status}</span>
              </div>
            )
          })
      )}
    </div>
  )
}
