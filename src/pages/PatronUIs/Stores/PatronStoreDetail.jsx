import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as businessService from '../../../services/businessService'
import * as productService from '../../../services/productService'
import styles from './PatronStoreDetail.module.css'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

export default function PatronStoreDetail({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState(null)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [reqForm, setReqForm] = useState({ name:'', brand:'', description:'' })
  const [submitting, setSubmitting] = useState(false)
  const [myVotes, setMyVotes] = useState({})

  useEffect(() => {
    businessService.getBusinessById(id).then(data => { if (!data.err) setBusiness(data) })
    productService.getPatronProducts().then(data => { if (Array.isArray(data)) setProducts(data.filter(Boolean)) })
  }, [id])

  const photos = business?.photos?.length ? business.photos : []

  async function handleRequest(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await productService.requestProduct(id, reqForm)
      setReqForm({ name:'', brand:'', description:'' })
      setActiveTab(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVote(productId) {
    const updated = await productService.voteForProduct(productId)
    if (!updated.err) {
      setMyVotes(prev => ({ ...prev, [productId]: true }))
      setProducts(prev => prev.map(p => p._id === productId ? updated : p))
    }
  }

  if (!business) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.page}>
      <div className={styles.carousel}>
        {photos.length > 0 ? (
          <>
            <img src={photos[photoIdx]} alt={business.displayName} className={styles.photo} />
            {photos.length > 1 && (
              <>
                <button className={styles.prev} onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}>‹</button>
                <button className={styles.next} onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}>›</button>
                <div className={styles.dots}>
                  {photos.map((_, i) => <span key={i} className={i === photoIdx ? styles.dotActive : styles.dot} />)}
                </div>
              </>
            )}
          </>
        ) : (
          <div className={styles.photoPlaceholder}>🏪</div>
        )}
        <button className={styles.backBtn} onClick={() => navigate(-1)}>‹ Back</button>
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h1>{business.displayName || business.profile?.name}</h1>
          <span className={styles.registered}>Registered ✓</span>
        </div>

        {business.businessType && <p className={styles.bizType}>{business.businessType}</p>}

        <div className={styles.metaRow}>
          {business.rating > 0 && <span>{'★'.repeat(Math.round(business.rating))} {business.rating.toFixed(1)}</span>}
          {business.priceTier && <span className={styles.price}>{business.priceTier}</span>}
        </div>

        <hr className={styles.divider} />

        {business.address && (
          <div className={styles.infoRow}><span>📍</span><span>{business.address}, {business.location?.city}, {business.location?.state} {business.location?.zip}</span></div>
        )}
        {business.phone && (
          <div className={styles.infoRow}><span>📞</span><a href={`tel:${business.phone}`}>{business.phone}</a></div>
        )}
        {DAYS.some(d => business.hours?.[d]) && (
          <div className={styles.hours}>
            <span>🕐</span>
            <div>
              {DAYS.filter(d => business.hours?.[d]).map(d => (
                <div key={d} className={styles.hourRow}>
                  <span>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                  <span>{business.hours[d]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {business.description && <p className={styles.description}>{business.description}</p>}

        <div className={styles.pillBtns}>
          <button className={`${styles.pill} ${activeTab === 'sales' ? styles.pillActive : ''}`} onClick={() => setActiveTab(t => t === 'sales' ? null : 'sales')}>
            Sales/Specials
          </button>
          <button className={`${styles.pill} ${activeTab === 'request' ? styles.pillActive : ''}`} onClick={() => setActiveTab(t => t === 'request' ? null : 'request')}>
            Request An Item
          </button>
          <button className={`${styles.pill} ${activeTab === 'requests' ? styles.pillActive : ''}`} onClick={() => setActiveTab(t => t === 'requests' ? null : 'requests')}>
            Requests
          </button>
        </div>

        {activeTab === 'request' && (
          <form className={styles.reqForm} onSubmit={handleRequest}>
            <h3>Request a Product</h3>
            <input placeholder="Product name *" value={reqForm.name} onChange={e => setReqForm(p => ({...p, name: e.target.value}))} required />
            <input placeholder="Brand" value={reqForm.brand} onChange={e => setReqForm(p => ({...p, brand: e.target.value}))} />
            <textarea placeholder="Description / notes" rows={2} value={reqForm.description} onChange={e => setReqForm(p => ({...p, description: e.target.value}))} />
            <button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
          </form>
        )}

        {activeTab === 'requests' && (
          <div className={styles.requestList}>
            <h3>Product Requests</h3>
            {products.length === 0 && <p className={styles.empty}>No requests yet.</p>}
            {products.map(p => (
              <div key={p._id} className={styles.reqCard}>
                <div className={styles.reqInfo}>
                  <h4>{p.name}</h4>
                  {p.brand && <span className={styles.reqBrand}>{p.brand}</span>}
                  <span className={`${styles.status} ${styles[p.status]}`}>{p.status.replace(/_/g,' ')}</span>
                </div>
                <div className={styles.miniTally}>
                  <span className={styles.tallyNums}>{p.currentTally}/{p.tallyGoal}</span>
                  <div className={styles.miniBar}>
                    <div className={styles.miniFill} style={{ width: `${Math.min(100,(p.currentTally/p.tallyGoal)*100)}%` }} />
                  </div>
                  {!myVotes[p._id] && p.status === 'approved' && (
                    <button className={styles.voteBtn} onClick={() => handleVote(p._id)}>+1 Vote</button>
                  )}
                  {myVotes[p._id] && <span className={styles.voted}>✓ Voted</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className={styles.salesPlaceholder}>
            <p>No active sales or specials right now. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
