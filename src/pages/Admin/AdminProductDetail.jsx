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
  const [editingProduct, setEditingProduct] = useState(false)
  const [productForm, setProductForm] = useState({})
  const [productSaving, setProductSaving] = useState(false)
  const [productFeedback, setProductFeedback] = useState('')

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

  function startEditProduct() {
    setProductForm({
      name:            product.name            || '',
      brand:           product.brand           || '',
      description:     product.description     || '',
      price:           product.price           ?? '',
      image:           product.image           || '',
      tallyGoal:       product.tallyGoal       ?? 10,
      status:          product.status          || 'pending',
      salePrice:       product.salePrice       ?? '',
      discountPercent: product.discountPercent ?? '',
      isActive:        product.isActive        !== false,
      boosted:         product.boosted         || false,
    })
    setProductFeedback('')
    setEditingProduct(true)
  }

  function cancelEditProduct() { setEditingProduct(false); setProductFeedback('') }

  async function handleUpdateProduct() {
    setProductSaving(true)
    const data = await adminService.updateProduct(id, productForm)
    setProductSaving(false)
    if (data.err) { setProductFeedback(`Error: ${data.err}`); return }
    setDetail(d => ({ ...d, product: { ...d.product, ...data } }))
    setEditingProduct(false)
    setProductFeedback('Product updated.')
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
          {/* Header: name / brand / status — edit toggles these */}
          <div className={styles.header}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingProduct
                ? <input className={styles.editInput} value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" />
                : <h2 className={styles.name}>{product.name}</h2>
              }
              {editingProduct
                ? <input className={styles.editInput} style={{ marginTop: '6px' }} value={productForm.brand} onChange={e => setProductForm(f => ({ ...f, brand: e.target.value }))} placeholder="Brand" />
                : product.brand && <p className={styles.brand}>{product.brand}</p>
              }
            </div>
            {editingProduct
              ? <select className={styles.editSelect} value={productForm.status} onChange={e => setProductForm(f => ({ ...f, status: e.target.value }))}>
                  {['pending','approved','rejected','ready_to_stock','stocked','needs_info','on_sale'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              : <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span className={`${styles.statusBadge} ${styles[statusColor]}`}>{product.status}</span>
                  <button className={styles.btnGhost} onClick={startEditProduct}>Edit</button>
                </div>
            }
          </div>

          {/* Image */}
          {editingProduct
            ? <input className={styles.editInput} style={{ marginBottom: '10px' }} value={productForm.image} onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))} placeholder="Image URL" />
            : product.image && <img src={product.image} className={styles.productImg} alt={product.name} />
          }

          {/* Description */}
          {editingProduct
            ? <textarea className={styles.editTextarea} rows={3} value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Description…" />
            : product.description && <p className={styles.description}>{product.description}</p>
          }

          {/* Meta grid — store/type/location are read-only; price/votes are editable */}
          <div className={styles.metaGrid}>
            <span className={styles.metaLabel}>Store</span>
            {business
              ? <Link to={`/dashboard/admin/stores/${business._id}`} className={styles.storeLink}>{business.displayName ?? '—'}</Link>
              : <span>—</span>
            }
            {business?.businessType && (
              <><span className={styles.metaLabel}>Type</span><span>{business.businessType}</span></>
            )}
            {business?.location?.city && (
              <><span className={styles.metaLabel}>Location</span><span>{business.location.city}, {business.location.state}</span></>
            )}
            <span className={styles.metaLabel}>Added</span>
            <span>{new Date(product.createdAt).toLocaleDateString()}</span>

            <span className={styles.metaLabel}>Price</span>
            {editingProduct
              ? <input className={styles.editInput} type="number" min="0" step="0.01" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              : <span>{product.price != null ? `$${product.price.toFixed(2)}` : '—'}</span>
            }

            <span className={styles.metaLabel}>Sale Price</span>
            {editingProduct
              ? <input className={styles.editInput} type="number" min="0" step="0.01" value={productForm.salePrice} onChange={e => setProductForm(f => ({ ...f, salePrice: e.target.value }))} placeholder="0.00" />
              : <span>{product.salePrice != null ? `$${product.salePrice.toFixed(2)}` : '—'}</span>
            }

            <span className={styles.metaLabel}>Discount</span>
            {editingProduct
              ? <input className={styles.editInput} type="number" min="0" max="100" value={productForm.discountPercent} onChange={e => setProductForm(f => ({ ...f, discountPercent: e.target.value }))} placeholder="%" />
              : <span>{product.discountPercent != null ? `${product.discountPercent}%` : '—'}</span>
            }

            <span className={styles.metaLabel}>Tally Goal</span>
            {editingProduct
              ? <input className={styles.editInput} type="number" min="1" value={productForm.tallyGoal} onChange={e => setProductForm(f => ({ ...f, tallyGoal: e.target.value }))} />
              : <span>{product.currentTally ?? 0} / {product.tallyGoal}</span>
            }
          </div>

          {editingProduct && (
            <div className={styles.editCheckRow}>
              <label className={styles.editCheckLabel}>
                <input type="checkbox" checked={productForm.isActive} onChange={e => setProductForm(f => ({ ...f, isActive: e.target.checked }))} />
                Active
              </label>
              <label className={styles.editCheckLabel}>
                <input type="checkbox" checked={productForm.boosted} onChange={e => setProductForm(f => ({ ...f, boosted: e.target.checked }))} />
                Boosted
              </label>
            </div>
          )}

          {!editingProduct && product.tallyGoal != null && (
            <div className={styles.tallyRow}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${tallyPct}%` }} />
              </div>
              <span className={styles.tallyLabel}>{Math.round(tallyPct)}%</span>
            </div>
          )}

          {(feedback || productFeedback) && (
            <p className={styles.feedback} style={{ color: productFeedback.startsWith('Error') ? '#ef4444' : '#22c55e' }}>
              {productFeedback || feedback}
            </p>
          )}

          {editingProduct && (
            <div className={styles.rowActions} style={{ marginTop: '14px' }}>
              <button className={styles.btnGreen} disabled={productSaving} onClick={handleUpdateProduct}>
                {productSaving ? 'Saving…' : 'Update'}
              </button>
              <button className={styles.btnGhost} onClick={cancelEditProduct}>Cancel</button>
            </div>
          )}

          {!editingProduct && confirmDelete && (
            <div className={styles.confirm}>
              <p>Permanently delete this product? This cannot be undone.</p>
              <div className={styles.rowActions}>
                <button className={styles.btnRed} onClick={handleDelete}>Delete Product</button>
                <button className={styles.btnGhost} onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            </div>
          )}

          {!editingProduct && (
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
          )}
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
