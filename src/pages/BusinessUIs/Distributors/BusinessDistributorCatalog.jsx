import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as distributorService from '../../../services/distributorService'
import * as orderService from '../../../services/orderService'
import styles from './BusinessDistributorCatalog.module.css'

export default function BusinessDistributorCatalog() {
  const { distributorId } = useParams()
  const navigate = useNavigate()

  const [distributor, setDistributor] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [orderItems, setOrderItems] = useState({})
  const [activeCategory, setActiveCategory] = useState('All')
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [fulfillmentType, setFulfillmentType] = useState('delivery')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [preferredWindow, setPreferredWindow] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    distributorService.getDistributorById(distributorId)
      .then(data => {
        if (data.err) return
        setDistributor(data)
        distributorService.getDistributorCatalog(data.profile._id)
          .then(products => { if (Array.isArray(products)) setCatalog(products) })
      })
      .finally(() => setLoading(false))
  }, [distributorId])

  const categories = ['All', ...new Set(catalog.map(p => p.category))]

  const filtered = activeCategory === 'All'
    ? catalog
    : catalog.filter(p => p.category === activeCategory)

  const selectedItems = Object.entries(orderItems).filter(([, qty]) => qty > 0)
  const itemCount = selectedItems.length
  const subtotal = selectedItems.reduce((sum, [id, qty]) => {
    const p = catalog.find(p => p._id === id)
    return sum + (p?.pricePerCase || 0) * qty
  }, 0)

  function setQty(productId, qty) {
    const clamped = Math.max(0, Math.min(999, qty))
    setOrderItems(prev => ({ ...prev, [productId]: clamped }))
  }

  async function handleSubmit() {
    setSubmitError('')
    setSubmitting(true)
    try {
      const result = await orderService.createOrder({
        distributorId: distributor._id,
        items: selectedItems.map(([productId, quantity]) => ({ productId, quantity })),
        fulfillmentType,
        deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress : undefined,
        preferredWindow: preferredWindow || undefined,
        notes: notes || undefined,
      })
      if (result.err) {
        setSubmitError(result.err)
        return
      }
      setSubmitSuccess(true)
      setOrderItems({})
      setTimeout(() => navigate('/dashboard/business/distributors/orders'), 2000)
    } catch {
      setSubmitError('Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className={styles.loading}>Loading…</div>
  if (!distributor) return <div className={styles.loading}>Distributor not found.</div>

  const distName = distributor.companyName || distributor.profile?.name

  return (
    <div className={styles.page}>

      {/* Distributor header */}
      <div className={styles.distributorHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>‹ Back</button>
        <h2>{distName}</h2>
        {distributor.categories?.length > 0 && (
          <div className={styles.categoryBadges}>
            {distributor.categories.map(cat => (
              <span key={cat} className={styles.categoryBadge}>{cat}</span>
            ))}
          </div>
        )}
        {distributor.description && (
          <p className={styles.distributorDesc}>{distributor.description}</p>
        )}
      </div>

      {/* Category filter pills */}
      {categories.length > 1 && (
        <div className={styles.categoryFilter}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      <div className={styles.productGrid}>
        {filtered.length === 0 && (
          <p className={styles.empty}>No products in this category.</p>
        )}
        {filtered.map(product => {
          const qty = orderItems[product._id] || 0
          return (
            <div
              key={product._id}
              className={`${styles.productCard} ${qty > 0 ? styles.selected : ''}`}
            >
              <div className={styles.productInfo}>
                <h4 className={styles.productName}>{product.name}</h4>
                {product.brand && <p className={styles.productBrand}>{product.brand}</p>}
                <span className={styles.catBadge}>{product.category}</span>
                {product.unitSize && <p className={styles.unitSize}>{product.unitSize}</p>}
                <p className={styles.price}>
                  {product.pricePerCase != null
                    ? `$${product.pricePerCase.toFixed(2)} / case`
                    : 'Price on request'}
                </p>
                {product.minOrderQty > 1 && (
                  <p className={styles.minQty}>Min. {product.minOrderQty}</p>
                )}
              </div>
              <div className={styles.qtyControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty(product._id, qty - 1)}
                  disabled={qty === 0}
                >
                  −
                </button>
                <span className={styles.qtyValue}>{qty}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQty(product._id, qty + 1)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky bottom bar */}
      {itemCount > 0 && !showOrderSummary && (
        <div className={styles.stickyBar}>
          <span className={styles.barSummary}>
            {itemCount} item{itemCount !== 1 ? 's' : ''} · Est. ${subtotal.toFixed(2)}
          </span>
          <button className={styles.reviewBtn} onClick={() => setShowOrderSummary(true)}>
            Review Order →
          </button>
        </div>
      )}

      {/* Order summary panel */}
      {showOrderSummary && (
        <div
          className={styles.overlay}
          onClick={() => { if (!submitting && !submitSuccess) setShowOrderSummary(false) }}
        >
          <div className={styles.summaryPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.summaryHeader}>
              <h3>Review Order</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowOrderSummary(false)}
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className={styles.successMsg}>
                <span className={styles.successIcon}>✓</span>
                <p>Order submitted! Redirecting to your orders…</p>
              </div>
            ) : (
              <>
                <div className={styles.summaryItems}>
                  {selectedItems.map(([productId, qty]) => {
                    const p = catalog.find(p => p._id === productId)
                    if (!p) return null
                    const lineTotal = (p.pricePerCase || 0) * qty
                    return (
                      <div key={productId} className={styles.summaryItem}>
                        <div className={styles.summaryItemInfo}>
                          <span className={styles.summaryItemName}>{p.name}</span>
                          <span className={styles.summaryItemUnit}>× {qty}</span>
                        </div>
                        <span className={styles.summaryItemTotal}>${lineTotal.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>

                <div className={styles.subtotalRow}>
                  <span>Subtotal</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>

                <div className={styles.fulfillmentToggle}>
                  <button
                    type="button"
                    className={`${styles.fulfillBtn} ${fulfillmentType === 'delivery' ? styles.fulfillActive : ''}`}
                    onClick={() => setFulfillmentType('delivery')}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    className={`${styles.fulfillBtn} ${fulfillmentType === 'pickup' ? styles.fulfillActive : ''}`}
                    onClick={() => setFulfillmentType('pickup')}
                  >
                    Pickup
                  </button>
                </div>

                {fulfillmentType === 'delivery' && (
                  <input
                    className={styles.formInput}
                    placeholder="Delivery address"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                  />
                )}

                <input
                  className={styles.formInput}
                  placeholder="Preferred window (e.g. Tuesday morning before noon)"
                  value={preferredWindow}
                  onChange={e => setPreferredWindow(e.target.value)}
                />

                <textarea
                  className={styles.formTextarea}
                  placeholder="Notes for distributor…"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />

                {submitError && <p className={styles.submitError}>{submitError}</p>}

                <div className={styles.summaryActions}>
                  <button
                    className={styles.backCatalogBtn}
                    onClick={() => setShowOrderSummary(false)}
                    disabled={submitting}
                  >
                    Back to Catalog
                  </button>
                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Submit Order Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
