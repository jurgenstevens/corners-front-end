import { useState, useEffect } from 'react'
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/solid'
import * as distributorService from '../../services/distributorService'
import styles from './DistributorOrders.module.css'

const TABS = ['Pending', 'Quoted', 'Active', 'History']

const TAB_STATUSES = {
  Pending: ['pending'],
  Quoted:  ['quoted'],
  Active:  ['accepted', 'paid', 'in_transit', 'ready_for_pickup'],
  History: ['delivered', 'picked_up', 'cancelled', 'declined'],
}

const STATUS_LABELS = {
  pending:          'Pending',
  quoted:           'Quoted',
  accepted:         'Accepted',
  paid:             'Paid',
  in_transit:       'In Transit',
  ready_for_pickup: 'Ready for Pickup',
  delivered:        'Delivered',
  picked_up:        'Picked Up',
  cancelled:        'Cancelled',
  declined:         'Declined',
}

const STATUS_COLOR = {
  pending:          'statusPending',
  quoted:           'statusQuoted',
  accepted:         'statusAccepted',
  paid:             'statusAccepted',
  in_transit:       'statusActive',
  ready_for_pickup: 'statusActive',
  delivered:        'statusDone',
  picked_up:        'statusDone',
  cancelled:        'statusCancelled',
  declined:         'statusCancelled',
}

const BLANK_FORM = {
  fulfillmentType: 'delivery',
  deliveryFee: '',
  eta: '',
  pickupAddress: '',
  pickupWindow: '',
  distributorNotes: '',
}

export default function DistributorOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Pending')
  const [respondingTo, setRespondingTo] = useState(null)
  const [quoteForm, setQuoteForm] = useState(BLANK_FORM)
  const [quoteError, setQuoteError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    const data = await distributorService.getMyOrders()
    if (Array.isArray(data)) setOrders(data)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  function startResponding(orderId) {
    setRespondingTo(orderId)
    setQuoteForm(BLANK_FORM)
    setQuoteError('')
  }

  function cancelResponding() {
    setRespondingTo(null)
    setQuoteError('')
  }

  async function handleSendQuote(order) {
    setQuoteError('')
    setSubmitting(true)
    const subtotal = order.items.reduce((s, i) => s + (i.priceAtOrder || 0) * i.quantity, 0)
    const fee = Number(quoteForm.deliveryFee) || 0
    try {
      const result = await distributorService.quoteOrder(order._id, {
        estimatedTotal: subtotal + fee,
        deliveryFee: fee || undefined,
        eta: quoteForm.eta || undefined,
        fulfillmentType: quoteForm.fulfillmentType,
        pickupAddress: quoteForm.pickupAddress || undefined,
        pickupWindow: quoteForm.pickupWindow || undefined,
        distributorNotes: quoteForm.distributorNotes || undefined,
      })
      if (result.err) { setQuoteError(result.err); return }
      setRespondingTo(null)
      load()
    } catch {
      setQuoteError('Failed to send quote. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDecline(orderId) {
    setSubmitting(true)
    try {
      await distributorService.updateOrderStatus(orderId, 'declined')
      load()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusUpdate(orderId, status) {
    await distributorService.updateOrderStatus(orderId, status)
    load()
  }

  const filtered = orders.filter(o => TAB_STATUSES[tab].includes(o.status))

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Orders</h2>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => {
          const count = orders.filter(o => TAB_STATUSES[t].includes(o.status)).length
          return (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
              {count > 0 && t !== 'History' && (
                <span className={`${styles.tabCount} ${t === 'Pending' ? styles.tabCountAlert : ''}`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.empty}>No orders here.</div>
        )}

        {filtered.map(order => {
          const bizName = order.business?.name || 'Business'
          const subtotal = order.items?.reduce((s, i) => s + (i.priceAtOrder || 0) * i.quantity, 0) || 0
          const isResponding = respondingTo === order._id
          const feeNum = Number(quoteForm.deliveryFee) || 0
          const previewTotal = subtotal + (isResponding ? feeNum : 0)

          return (
            <div key={order._id} className={styles.card}>
              {/* Card header */}
              <div className={styles.cardTop}>
                <div className={styles.bizAvatar}>{bizName[0].toUpperCase()}</div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardTitleRow}>
                    <h4 className={styles.bizName}>{bizName}</h4>
                    <span className={`${styles.statusBadge} ${styles[STATUS_COLOR[order.status] || 'statusPending']}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                    {order.fulfillmentType && ` · ${order.fulfillmentType}`}
                  </p>
                </div>
              </div>

              {/* Items list */}
              <div className={styles.itemsList}>
                {order.items?.map((item, i) => (
                  <div key={i} className={styles.itemRow}>
                    <span className={styles.itemName}>{item.name}</span>
                    {item.unitSize && <span className={styles.itemUnit}>{item.unitSize}</span>}
                    <span className={styles.itemQty}>× {item.quantity}</span>
                    <span className={styles.itemPrice}>${((item.priceAtOrder || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className={styles.itemSubtotal}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery/pickup details */}
              {(order.deliveryAddress || order.preferredWindow || order.notes) && (
                <div className={styles.orderMeta}>
                  {order.deliveryAddress && <p><MapPinIcon style={{width:13,height:13,display:'inline',verticalAlign:'middle',marginRight:3}} />{order.deliveryAddress}</p>}
                  {order.preferredWindow && <p><ClockIcon style={{width:13,height:13,display:'inline',verticalAlign:'middle',marginRight:3}} />{order.preferredWindow}</p>}
                  {order.notes && <p className={styles.orderNotes}>"{order.notes}"</p>}
                </div>
              )}

              {/* Pending: quote form */}
              {order.status === 'pending' && !isResponding && (
                <div className={styles.actionRow}>
                  <button className={styles.respondBtn} onClick={() => startResponding(order._id)}>
                    Respond
                  </button>
                  <button
                    className={styles.declineBtn}
                    onClick={() => handleDecline(order._id)}
                    disabled={submitting}
                  >
                    Decline Order
                  </button>
                </div>
              )}

              {order.status === 'pending' && isResponding && (
                <div className={styles.quoteForm}>
                  <h5 className={styles.quoteFormTitle}>Send Quote</h5>

                  <div className={styles.fulfillToggle}>
                    <button
                      type="button"
                      className={`${styles.fulfillBtn} ${quoteForm.fulfillmentType === 'delivery' ? styles.fulfillActive : ''}`}
                      onClick={() => setQuoteForm(f => ({ ...f, fulfillmentType: 'delivery' }))}
                    >
                      Delivery
                    </button>
                    <button
                      type="button"
                      className={`${styles.fulfillBtn} ${quoteForm.fulfillmentType === 'pickup' ? styles.fulfillActive : ''}`}
                      onClick={() => setQuoteForm(f => ({ ...f, fulfillmentType: 'pickup' }))}
                    >
                      Pickup
                    </button>
                  </div>

                  {quoteForm.fulfillmentType === 'delivery' ? (
                    <>
                      <label className={styles.label}>
                        Delivery fee ($)
                        <input
                          className={styles.input}
                          type="number" min="0" step="0.01" placeholder="0.00"
                          value={quoteForm.deliveryFee}
                          onChange={e => setQuoteForm(f => ({ ...f, deliveryFee: e.target.value }))}
                        />
                      </label>
                      <label className={styles.label}>
                        Estimated delivery date
                        <input
                          className={styles.input}
                          type="date"
                          value={quoteForm.eta}
                          onChange={e => setQuoteForm(f => ({ ...f, eta: e.target.value }))}
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <label className={styles.label}>
                        Pickup address
                        <input
                          className={styles.input}
                          type="text" placeholder="123 Warehouse Dr…"
                          value={quoteForm.pickupAddress}
                          onChange={e => setQuoteForm(f => ({ ...f, pickupAddress: e.target.value }))}
                        />
                      </label>
                      <label className={styles.label}>
                        Pickup window
                        <input
                          className={styles.input}
                          type="text" placeholder="e.g. Monday 8am–12pm"
                          value={quoteForm.pickupWindow}
                          onChange={e => setQuoteForm(f => ({ ...f, pickupWindow: e.target.value }))}
                        />
                      </label>
                    </>
                  )}

                  <label className={styles.label}>
                    Notes to business
                    <textarea
                      className={styles.textarea}
                      rows={2}
                      placeholder="Any notes…"
                      value={quoteForm.distributorNotes}
                      onChange={e => setQuoteForm(f => ({ ...f, distributorNotes: e.target.value }))}
                    />
                  </label>

                  <div className={styles.quoteTotalPreview}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    {feeNum > 0 && <><span>Delivery fee</span><span>${feeNum.toFixed(2)}</span></>}
                    <span><strong>Total</strong></span><span><strong>${previewTotal.toFixed(2)}</strong></span>
                  </div>

                  {quoteError && <p className={styles.quoteError}>{quoteError}</p>}

                  <div className={styles.quoteFormActions}>
                    <button
                      className={styles.cancelBtn}
                      onClick={cancelResponding}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.sendQuoteBtn}
                      onClick={() => handleSendQuote(order)}
                      disabled={submitting}
                    >
                      {submitting ? 'Sending…' : 'Send Quote'}
                    </button>
                  </div>
                </div>
              )}

              {/* Accepted: next-step buttons */}
              {order.status === 'accepted' && (
                <div className={styles.actionRow}>
                  <button
                    className={styles.statusBtn}
                    onClick={() => handleStatusUpdate(order._id, 'in_transit')}
                  >
                    Mark In Transit
                  </button>
                  <button
                    className={styles.statusBtn}
                    onClick={() => handleStatusUpdate(order._id, 'ready_for_pickup')}
                  >
                    Mark Ready for Pickup
                  </button>
                </div>
              )}

              {order.status === 'in_transit' && (
                <div className={styles.actionRow}>
                  <button
                    className={styles.statusBtnSuccess}
                    onClick={() => handleStatusUpdate(order._id, 'delivered')}
                  >
                    Mark Delivered
                  </button>
                </div>
              )}

              {order.status === 'ready_for_pickup' && (
                <div className={styles.actionRow}>
                  <button
                    className={styles.statusBtnSuccess}
                    onClick={() => handleStatusUpdate(order._id, 'picked_up')}
                  >
                    Mark Picked Up
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
