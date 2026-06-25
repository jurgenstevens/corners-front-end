import { useState, useEffect } from 'react'
import * as adminService from '../../services/adminService'
import styles from './AdminBugReports.module.css'

const SEVERITY_CLASS = { low: 'muted', medium: 'info', high: 'warn', critical: 'danger' }
const CATEGORY_LABELS = {
  ui_bug: 'UI Bug', incorrect_data: 'Incorrect Data', payment_issue: 'Payment',
  account_issue: 'Account', abuse_report: 'Abuse', feature_request: 'Feature Request', other: 'Other',
}

export default function AdminBugReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', severity: '', category: '' })
  const [expanded, setExpanded] = useState(null)
  const [editState, setEditState] = useState({})
  const [summary, setSummary] = useState({ open: 0, critical: 0, inProgress: 0 })

  function fetchReports(f = filters) {
    setLoading(true)
    const params = {}
    if (f.status) params.status = f.status
    if (f.severity) params.severity = f.severity
    if (f.category) params.category = f.category
    adminService.getBugReports(params).then(data => {
      const arr = Array.isArray(data) ? data : []
      setReports(arr)
      setSummary({
        open: arr.filter(r => r.status === 'open').length,
        critical: arr.filter(r => r.severity === 'critical').length,
        inProgress: arr.filter(r => r.status === 'in_progress').length,
      })
      setLoading(false)
    })
  }

  useEffect(() => { fetchReports() }, [])

  function setFilter(key, val) {
    const next = { ...filters, [key]: val }
    setFilters(next)
    fetchReports(next)
  }

  async function handleUpdate(id) {
    const { status, adminNotes } = editState[id] ?? {}
    await adminService.updateBugReport(id, { status, adminNotes })
    fetchReports()
    setExpanded(null)
  }

  return (
    <div>
      <div className={styles.summary}>
        <div className={styles.summaryItem}><span className={styles.summaryCount}>{summary.open}</span><span className={styles.summaryLabel}>Open</span></div>
        <div className={styles.summaryItem}><span className={`${styles.summaryCount} ${styles.danger}`}>{summary.critical}</span><span className={styles.summaryLabel}>Critical</span></div>
        <div className={styles.summaryItem}><span className={`${styles.summaryCount} ${styles.warn}`}>{summary.inProgress}</span><span className={styles.summaryLabel}>In Progress</span></div>
      </div>

      <div className={styles.filterBar}>
        {[
          { key: 'status', opts: ['', 'open', 'in_progress', 'resolved', 'wont_fix', 'duplicate'] },
          { key: 'severity', opts: ['', 'low', 'medium', 'high', 'critical'] },
          { key: 'category', opts: ['', ...Object.keys(CATEGORY_LABELS)] },
        ].map(({ key, opts }) => (
          <select key={key} className={styles.select} value={filters[key]} onChange={e => setFilter(key, e.target.value)}>
            {opts.map(o => <option key={o} value={o}>{o ? (CATEGORY_LABELS[o] ?? o) : `All ${key}s`}</option>)}
          </select>
        ))}
      </div>

      {loading && <p className={styles.loading}>Loading…</p>}
      {!loading && reports.length === 0 && <p className={styles.empty}>No reports match the current filters.</p>}

      {!loading && reports.map(r => (
        <div key={r._id} className={styles.card} onClick={() => setExpanded(e => e === r._id ? null : r._id)}>
          <div className={styles.cardHeader}>
            <div className={styles.titleRow}>
              <p className={styles.title}>{r.title}</p>
              <div className={styles.badges}>
                <span className={`${styles.badge} ${styles[SEVERITY_CLASS[r.severity]]}`}>{r.severity}</span>
                <span className={`${styles.badge} ${styles.cat}`}>{CATEGORY_LABELS[r.category] ?? r.category}</span>
              </div>
            </div>
            <div className={styles.meta}>
              <span>{r.reporter?.name} ({r.reporterRole})</span>
              <span>·</span>
              <span className={`${styles.statusLabel} ${r.status === 'open' ? styles.danger : r.status === 'resolved' ? styles.success : styles.warn}`}>
                {r.status}
              </span>
              <span>·</span>
              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <p className={styles.description}>{expanded === r._id ? r.description : r.description?.slice(0, 120) + (r.description?.length > 120 ? '…' : '')}</p>

          {expanded === r._id && (
            <div className={styles.expandedArea} onClick={e => e.stopPropagation()}>
              {r.stepsToReproduce && (
                <div className={styles.steps}>
                  <p className={styles.stepsLabel}>Steps to Reproduce</p>
                  <p className={styles.stepsText}>{r.stepsToReproduce}</p>
                </div>
              )}
              <div className={styles.updateForm}>
                <select
                  className={styles.select}
                  value={editState[r._id]?.status ?? r.status}
                  onChange={e => setEditState(s => ({ ...s, [r._id]: { ...s[r._id], status: e.target.value } }))}
                >
                  {['open', 'in_progress', 'resolved', 'wont_fix', 'duplicate'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <textarea
                  className={styles.textarea}
                  placeholder="Admin notes…"
                  rows={2}
                  value={editState[r._id]?.adminNotes ?? r.adminNotes ?? ''}
                  onChange={e => setEditState(s => ({ ...s, [r._id]: { ...s[r._id], adminNotes: e.target.value } }))}
                />
                <button className={styles.btnAccent} onClick={() => handleUpdate(r._id)}>Update</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
