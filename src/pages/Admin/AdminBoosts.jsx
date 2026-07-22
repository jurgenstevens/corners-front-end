import { useState, useEffect } from 'react'
import * as adminService from '../../services/adminService'
import styles from './AdminBoosts.module.css'

const now30 = () => {
  const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 16)
}

const EMPTY_FORM = {
  productId: '',
  boostPlan: 'standard',
  boostStartsAt: new Date().toISOString().slice(0, 16),
  boostEndsAt: now30(),
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

function planLabel(plan) {
  return plan === 'premium' ? 'Premium $19' : 'Standard $9'
}

export default function AdminBoosts() {
  const [boosts, setBoosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  async function refresh() {
    const data = await adminService.getBoosts()
    if (Array.isArray(data)) setBoosts(data)
  }

  useEffect(() => { refresh().finally(() => setLoading(false)) }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    const data = await adminService.createBoost(form)
    if (data?.err) {
      setFormError(data.err)
    } else {
      setForm({ ...EMPTY_FORM, boostStartsAt: new Date().toISOString().slice(0, 16), boostEndsAt: now30() })
      refresh()
    }
  }

  async function handlePause(id) {
    await adminService.pauseBoost(id)
    refresh()
  }

  async function handleResume(id) {
    await adminService.resumeBoost(id)
    refresh()
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this boost?')) return
    await adminService.cancelBoost(id)
    refresh()
  }

  function startEdit(p) {
    setEditingId(p._id)
    setEditForm({
      boostStartsAt: p.boostStartsAt ? new Date(p.boostStartsAt).toISOString().slice(0, 16) : '',
      boostEndsAt: p.boostEndsAt ? new Date(p.boostEndsAt).toISOString().slice(0, 16) : '',
      boostPlan: p.boostPlan || 'standard',
    })
  }

  async function handleUpdate(e, id) {
    e.preventDefault()
    await adminService.updateBoost(id, editForm)
    setEditingId(null)
    refresh()
  }

  const now = new Date()

  const live = boosts.filter(p =>
    p.boosted &&
    new Date(p.boostStartsAt) <= now &&
    new Date(p.boostEndsAt) >= now &&
    !p.boostPausedAt
  )

  const scheduled = boosts
    .filter(p => p.boosted && new Date(p.boostStartsAt) > now && !p.boostPausedAt)
    .sort((a, b) => new Date(a.boostStartsAt) - new Date(b.boostStartsAt))

  const paused = boosts.filter(p => p.boostPausedAt)

  function bizName(p) {
    return p.business?.displayName || p.business?.name || '—'
  }

  return (
    <div className={styles.page}>

      {/* Add new boost */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Add New Boost</h2>
        <div className={styles.card}>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>
                Product ID
                <input
                  className={styles.input}
                  value={form.productId}
                  onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                  placeholder="MongoDB _id"
                  required
                />
              </label>
              <label className={styles.formLabel}>
                Plan
                <select
                  className={styles.input}
                  value={form.boostPlan}
                  onChange={e => setForm(f => ({ ...f, boostPlan: e.target.value }))}
                >
                  <option value="standard">Standard ($9/mo)</option>
                  <option value="premium">Premium ($19/mo)</option>
                </select>
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>
                Start date
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={form.boostStartsAt}
                  onChange={e => setForm(f => ({ ...f, boostStartsAt: e.target.value }))}
                  required
                />
              </label>
              <label className={styles.formLabel}>
                End date
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={form.boostEndsAt}
                  onChange={e => setForm(f => ({ ...f, boostEndsAt: e.target.value }))}
                  required
                />
              </label>
            </div>
            {formError && <p className={styles.error}>{formError}</p>}
            <button type="submit" className={styles.btnGreen}>Schedule boost</button>
          </form>
        </div>
      </section>

      {/* Live now */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Live Now</h2>
        {loading && <p className={styles.empty}>Loading…</p>}
        {!loading && live.length === 0 && <p className={styles.empty}>No live boosts</p>}
        {live.map(p => (
          <div key={p._id} className={styles.card}>
            <div className={styles.cardRow}>
              <div>
                <p className={styles.productName}>{p.name}</p>
                {p.brand && <p className={styles.meta}>{p.brand}</p>}
                <p className={styles.meta}>{bizName(p)}</p>
                <p className={styles.dateMeta}>{fmtDate(p.boostStartsAt)} → {fmtDate(p.boostEndsAt)}</p>
              </div>
              <div className={styles.cardRowRight}>
                <span className={`${styles.statusBadge} ${styles.success}`}>{planLabel(p.boostPlan)}</span>
                <span className={`${styles.statusBadge} ${styles.success}`}>
                  <span className={styles.liveDot} /> Live now
                </span>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.btnGhost} onClick={() => handlePause(p._id)}>Pause</button>
              <button className={styles.btnRed} onClick={() => handleCancel(p._id)}>Cancel</button>
            </div>
          </div>
        ))}
      </section>

      {/* Scheduled */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Scheduled</h2>
        {!loading && scheduled.length === 0 && <p className={styles.empty}>No scheduled boosts</p>}
        {scheduled.map(p => {
          const daysUntil = Math.ceil((new Date(p.boostStartsAt) - new Date()) / 86400000)
          const isEditing = editingId === p._id
          return (
            <div key={p._id} className={styles.card}>
              <div className={styles.cardRow}>
                <div>
                  <p className={styles.productName}>{p.name}</p>
                  {p.brand && <p className={styles.meta}>{p.brand}</p>}
                  <p className={styles.meta}>{bizName(p)}</p>
                  <p className={styles.dateMeta}>{fmtDate(p.boostStartsAt)} → {fmtDate(p.boostEndsAt)}</p>
                  <p className={styles.dateMeta}>Starts in {daysUntil} days</p>
                </div>
                <div className={styles.cardRowRight}>
                  <span className={`${styles.statusBadge} ${styles.warn}`}>{planLabel(p.boostPlan)}</span>
                </div>
              </div>
              {isEditing ? (
                <form onSubmit={e => handleUpdate(e, p._id)} className={styles.editForm}>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>
                      Start date
                      <input
                        className={styles.input}
                        type="datetime-local"
                        value={editForm.boostStartsAt}
                        onChange={e => setEditForm(f => ({ ...f, boostStartsAt: e.target.value }))}
                      />
                    </label>
                    <label className={styles.formLabel}>
                      End date
                      <input
                        className={styles.input}
                        type="datetime-local"
                        value={editForm.boostEndsAt}
                        onChange={e => setEditForm(f => ({ ...f, boostEndsAt: e.target.value }))}
                      />
                    </label>
                    <label className={styles.formLabel}>
                      Plan
                      <select
                        className={styles.input}
                        value={editForm.boostPlan}
                        onChange={e => setEditForm(f => ({ ...f, boostPlan: e.target.value }))}
                      >
                        <option value="standard">Standard ($9/mo)</option>
                        <option value="premium">Premium ($19/mo)</option>
                      </select>
                    </label>
                  </div>
                  <div className={styles.actions}>
                    <button type="submit" className={styles.btnGreen}>Save</button>
                    <button type="button" className={styles.btnGhost} onClick={() => setEditingId(null)}>Cancel edit</button>
                  </div>
                </form>
              ) : (
                <div className={styles.actions}>
                  <button className={styles.btnGhost} onClick={() => startEdit(p)}>Edit</button>
                  <button className={styles.btnRed} onClick={() => handleCancel(p._id)}>Cancel boost</button>
                </div>
              )}
            </div>
          )
        })}
      </section>

      {/* Paused */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Paused</h2>
        {!loading && paused.length === 0 && <p className={styles.empty}>No paused boosts</p>}
        {paused.map(p => (
          <div key={p._id} className={`${styles.card} ${styles.cardPaused}`}>
            <div className={styles.cardRow}>
              <div>
                <p className={styles.productName}>{p.name}</p>
                {p.brand && <p className={styles.meta}>{p.brand}</p>}
                <p className={styles.meta}>{bizName(p)}</p>
                <p className={styles.dateMeta}>{fmtDate(p.boostStartsAt)} → {fmtDate(p.boostEndsAt)}</p>
              </div>
              <div className={styles.cardRowRight}>
                <span className={`${styles.statusBadge} ${styles.warn}`}>{planLabel(p.boostPlan)}</span>
                <span className={`${styles.statusBadge} ${styles.danger}`}>Paused</span>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.btnGreen} onClick={() => handleResume(p._id)}>Resume</button>
              <button className={styles.btnRed} onClick={() => handleCancel(p._id)}>Cancel</button>
            </div>
          </div>
        ))}
      </section>

    </div>
  )
}
