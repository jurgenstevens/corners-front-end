import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as adminService from '../../services/adminService'
import styles from './AdminProductDetail.module.css'

const STATUS_COLORS = {
  stocked: 'success', approved: 'success',
  pending: 'warn', needs_info: 'warn', ready_to_stock: 'warn', on_sale: 'warn',
  rejected: 'danger',
}

export default function AdminProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    adminService.getProductDetail(id).then(data => {
      setDetail(data)
      setLoading(false)
    })
  }, [id])

  async function handleApprove() {
    const data = await adminService.approveProduct(id)
    if (data?._id) {
      setDetail(d => ({ ...d, product: { ...d.product, status: data.status } }))
      setFeedback('Product approved.')
    }
  }

  async function handleRestore() {
    const data = await adminService.restoreProduct(id)
    if (data?._id) {
      setDetail(d => ({ ...d, product: { ...d.product, status: data.status } }))
      setFeedback('Product restored to pending.')
    }
  }

  async function handleDelete() {
    await adminService.hardDeleteProduct(id)
    navigate('/dashboard/admin/products')
  }

  if (loading) return <p className={styles.loading}>Loading…</p>
  if (!detail?.product) return <p className={styles.error}>Product not found.</p>

  const { product, business } = detail
  const requestors = Array.isArray(product.votedBy) ? product.votedBy : []
  const statusColor = STATUS_COLORS[product.status] ?? 'warn'

  const tallyPct = product.tallyGoal
    ? Math.min(100, ((product.currentTally ?? 0) / product.tallyGoal) * 100)
    : 0

  return (
    <div className={styles.layout}>
      {/* LEFT — Product info + actions */}
      <div className={styles.col}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard/admin/products')}>
          ← Back to Products
        </button>

        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.name}>{product.name}</h2>
              {product.brand && <p className={styles.brand}>{product.brand}</p>}
            </div>
            <span className={`${styles.statusBadge} ${styles[statusColor]}`}>{product.status}</span>
          </div>

          {product.image && (
            <img src={product.image} className={styles.productImg} alt={product.name} />
          )}

          {product.description && <p className={styles.description}>{product.description}</p>}

          <div className={styles.metaGrid}>
            <span className={styles.metaLabel}>Store</span>
            {business
              ? <Link to={`/dashboard/admin/stores/${business._id}`} className={styles.storeLink}>{business.displayName ?? '—'}</Link>
              : <span>—</span>
            }
            {business?.businessType && (
              <>
                <span className={styles.metaLabel}>Type</span>
                <span>{business.businessType}</span>
              </>
            )}
            {business?.location?.city && (
              <>
                <span className={styles.metaLabel}>Location</span>
                <span>{business.location.city}, {business.location.state}</span>
              </>
            )}
            <span className={styles.metaLabel}>Added</span>
            <span>{new Date(product.createdAt).toLocaleDateString()}</span>
            {product.price != null && (
              <>
                <span className={styles.metaLabel}>Price</span>
                <span>${product.price.toFixed(2)}</span>
              </>
            )}
            {product.tallyGoal != null && (
              <>
                <span className={styles.metaLabel}>Votes</span>
                <span>{product.currentTally ?? 0} / {product.tallyGoal}</span>
              </>
            )}
          </div>

          {product.tallyGoal != null && (
            <div className={styles.tallyRow}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${tallyPct}%` }} />
              </div>
              <span className={styles.tallyLabel}>{Math.round(tallyPct)}%</span>
            </div>
          )}

          {feedback && <p className={styles.feedback}>{feedback}</p>}

          {confirmDelete && (
            <div className={styles.confirm}>
              <p>Permanently delete this product? This cannot be undone.</p>
              <div className={styles.rowActions}>
                <button className={styles.btnRed} onClick={handleDelete}>Delete Product</button>
                <button className={styles.btnGhost} onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className={styles.rowActions} style={{ marginTop: '16px' }}>
            {product.status !== 'approved' && product.status !== 'stocked' && (
              <button className={styles.btnGreen} onClick={handleApprove}>Approve Product</button>
            )}
            {product.status === 'rejected' && (
              <button className={styles.btnOrange} onClick={handleRestore}>Restore to Pending</button>
            )}
            {!confirmDelete && (
              <button className={styles.btnRed} onClick={() => setConfirmDelete(true)}>Delete Product</button>
            )}
          </div>
        </div>

        {product.requestedBy && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Originally Requested By</h3>
            <Link to={`/dashboard/admin/patrons/${product.requestedBy._id}`} className={styles.itemRow}>
              <p className={styles.patronName}>{product.requestedBy.name}</p>
              <p className={styles.patronEmail}>{product.requestedBy.email}</p>
            </Link>
          </div>
        )}
      </div>

      {/* RIGHT — Requestors (voters) */}
      <div className={styles.col}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Voted For This ({requestors.length})</h3>
          {requestors.length === 0
            ? <p className={styles.empty}>No patrons have voted for this product yet.</p>
            : requestors.map(r => (
              <Link key={r._id} to={`/dashboard/admin/patrons/${r._id}`} className={styles.itemRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {r.photo && <img src={r.photo} className={styles.miniAvatar} alt="" />}
                  <div>
                    <p className={styles.patronName}>{r.name}</p>
                    <p className={styles.patronEmail}>{r.email}</p>
                  </div>
                </div>
                <span className={styles.arrowHint}>→</span>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  )
}
