import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as businessService from '../../../services/businessService'
import * as productService from '../../../services/productService'
import * as connectionService from '../../../services/connectionService'
import styles from './PatronStoreDetail.module.css'

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

export default function PatronStoreDetail({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('info')
  const [photoIdx, setPhotoIdx] = useState(0)
  const [reqForm, setReqForm] = useState({ type:'', name:'', brand:'', description:'' })
  const [submitting, setSubmitting] = useState(false)
  const [myVotes, setMyVotes] = useState({})
  const [disconnecting, setDisconnecting] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [reqError, setReqError] = useState('')
  const [reqSuccess, setReqSuccess] = useState(false)

  useEffect(() => {
  businessService.getBusinessById(id).then(data => { if (!data.err) setBusiness(data) })
  productService.getProductsByBusiness(id).then(data => {
    if (Array.isArray(data)) {
      const filtered = data.filter(Boolean)
      setProducts(filtered)
      if (user?.profileId) {
        const votes = {}
        filtered.forEach(p => {
          if (p.votedBy?.some(v => v.toString() === user.profileId.toString())) votes[p._id] = true
        })
        setMyVotes(votes)
      }
    }
  })
  }, [id])

  const photos = business?.photos?.length ? business.photos : []

  async function handleRequest(e) {
    e.preventDefault()
    setReqError('')
    setSubmitting(true)
    try {
      const newProduct = await productService.requestProduct(id, reqForm)
      if (newProduct.err) {
        setReqError(newProduct.err)
        return
      }
      setProducts(prev => [newProduct, ...prev])
      setMyVotes(prev => ({ ...prev, [newProduct._id]: true }))
      setReqForm({ type:'', name:'', brand:'', description:'' })
      setActiveTab('requests')
      setReqSuccess(true)
    } catch {
      setReqError('Failed to submit request. Please try again.')
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

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await connectionService.disconnectFromBusiness(id)
      navigate('/dashboard/patron/stores')
    } finally {
      setDisconnecting(false)
      setShowDisconnectModal(false)
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

        <div className={styles.pillBtns}>
          <button className={`${styles.pill} ${activeTab === 'info' ? styles.pillActive : ''}`} onClick={() => setActiveTab('info')}>
            Info
          </button>
          <button className={`${styles.pill} ${activeTab === 'request' ? styles.pillActive : ''}`} onClick={() => setActiveTab(t => t === 'request' ? 'info' : 'request')}>
            + Request An Item
          </button>
          <button className={`${styles.pill} ${activeTab === 'requests' ? styles.pillActive : ''}`} onClick={() => setActiveTab(t => t === 'requests' ? 'info' : 'requests')}>
            Requests
          </button>
          <button className={`${styles.pill} ${activeTab === 'inventory' ? styles.pillActive : ''}`} onClick={() => setActiveTab(t => t === 'inventory' ? 'info' : 'inventory')}>
            Inventory
          </button>
          <button className={`${styles.pill} ${activeTab === 'sales' ? styles.pillActive : ''}`} onClick={() => setActiveTab(t => t === 'sales' ? 'info' : 'sales')}>
            Sales/Specials
          </button>
        </div>

        {activeTab === 'info' && (
          <>
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
          </>
        )}

        {/* success toast — shown after a request is submitted successfully */}
        {reqSuccess && (
          <div className={styles.toast}>
            <span className={styles.toastIcon}>✓</span>
            Item Request Submitted
            <button className={styles.toastClose} onClick={() => setReqSuccess(false)}>✕</button>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className={styles.inventoryList}>
            <h3>In-Store Products</h3>
            {products.filter(p => p.status === 'stocked' || p.status === 'on_sale').length === 0 && (
              <p className={styles.empty}>No products in store yet.</p>
            )}
            {products.filter(p => p.status === 'stocked' || p.status === 'on_sale').map(p => (
              <div key={p._id} className={styles.invCard}>
                {p.image && <img src={p.image} alt={p.name} className={styles.invImg} onError={e => e.target.style.display='none'} />}
                <div className={styles.invInfo}>
                  <h4>{p.name}</h4>
                  {p.brand && <span className={styles.reqBrand}>{p.brand}</span>}
                  {p.description && <p className={styles.invDesc}>{p.description}</p>}
                  {p.status === 'on_sale' ? (
                    <div className={styles.invPriceRow}>
                      {p.price != null && <span className={styles.invOrigPrice}>${p.price}</span>}
                      {p.salePrice != null && <span className={styles.invSalePrice}>${p.salePrice}</span>}
                      {p.discountPercent != null && <span className={styles.invDiscount}>-{p.discountPercent}%</span>}
                    </div>
                  ) : (
                    p.price != null && <span className={styles.invPrice}>${p.price}</span>
                  )}
                </div>
                {p.status === 'on_sale' && <span className={styles.saleTag}>On Sale</span>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'request' && (
          <form className={styles.reqForm} onSubmit={handleRequest}>
            <h3>Request a Product</h3>
            {/* show API error inline so the patron knows if the request failed */}
            {reqError && <p className={styles.reqError}>{reqError}</p>}
            <select value={reqForm.type} onChange={e => setReqForm(p => ({...p, type: e.target.value}))}>
              <option value="">Select a type (optional)</option>
              <option value="Food">Food</option>
              <option value="Beverage">Beverage</option>
              <option value="Snack">Snack</option>
              <option value="Household">Household</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Baby & Kids">Baby & Kids</option>
              <option value="Pet">Pet</option>
              <option value="Tobacco">Tobacco</option>
              <option value="Lottery & Gaming">Lottery & Gaming</option>
              <option value="Other">Other</option>
            </select>
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
                  {/* hide vote button if patron already voted or if they are the one who requested this product */}
                  {!myVotes[p._id]
                    && p.status === 'approved'
                    && p.requestedBy?.toString() !== user?.profileId?.toString()
                    && (
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

        <div className={styles.dangerZone}>
          <button
            className={styles.disconnectBtn}
            onClick={() => setShowDisconnectModal(true)}
            disabled={disconnecting}
          >
            Disconnect from Store
          </button>
        </div>

        {/* confirmation modal — shown when patron clicks Disconnect from Store */}
        {showDisconnectModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <p className={styles.modalMsg}>
                Are you sure you want to disconnect from this store? You will need to re-register to access it again.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.modalCancel}
                  onClick={() => setShowDisconnectModal(false)}
                  disabled={disconnecting}
                >
                  Cancel
                </button>
                <button
                  className={styles.modalDisconnect}
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}