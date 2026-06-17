import { useState, useEffect } from 'react'
import * as orderService from '../../../services/orderService'
import styles from './BusinessDistributorOrders.module.css'

const TABS = ['All', 'Pending', 'Quoted', 'Active', 'History']

const TAB_STATUSES = {
  All:     null,
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

export default function BusinessDistributorOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [expanded, setExpanded] = useState({})

  async function load() {
    const data = await orderService.getMyOrders()
    if (Array.isArray(data)) setOrders(data)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleAccept(orderId) {
    const result = await orderService.acceptOrder(orderId)
    if (!result.err) load()
  }

  async function handleCancel(orderId) {
    const result = await orderService.cancelOrder(orderId)
    if (!result.err) load()
  }

  const quotedCount = orders.filter(o => o.status === 'quoted').length
  const filtered = TAB_STATUSES[tab]
    ? orders.filter(o => TAB_STATUSES[tab].includes(o.status))
    : orders

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Orders</h2>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Quoted' && quotedCount > 0 && (
              <span className={styles.badge}>{quotedCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 && (
          <div className={styles.empty}>No orders here yet.</div>
        )}
        {filtered.map(order => {
          const distName = order.distributor?.name || order.distributor?.profile?.name || 'Distributor'
          const itemNames = order.items?.slice(0, 2).map(i => i.name).filter(Boolean) || []
          const moreCount = Math.max(0, (order.items?.length || 0) - 2)
          const colorClass = STATUS_COLOR[order.status] || 'statusPending'

          return (
            <div key={order._id} className={styles.card}>
              <div className={styles.cardMain}>
                <div className={styles.cardLeft}>
                  <div className={styles.distAvatar}>{distName[0].toUpperCase()}</div>
                  <div className={styles.cardInfo}>
                    <h4 className={styles.distName}>{distName}</h4>
                    <p className={styles.itemSummary}>
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      {itemNames.length > 0
                        ? `: ${itemNames.join(', ')}${moreCount > 0 ? ` +${moreCount} more` : ''}`
                        : ''}
                    </p>
                    {(order.eta || order.preferredWindow) && (
                      <p className={styles.eta}>
                        {order.eta ? `ETA: ${new Date(order.eta).toLocaleDateString()}` : `Window: ${order.preferredWindow}`}
                      </p>
                    )}
                    {order.distributorNotes && (
                      <p className={styles.distNotes}>"{order.distributorNotes}"</p>
                    )}
                  </div>
                </div>

                <div className={styles.cardRight}>
                  <span className={`${styles.statusBadge} ${styles[colorClass]}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  {['quoted', 'accepted', 'paid'].includes(order.status) && order.estimatedTotal != null && (
                    <span className={styles.total}>${order.estimatedTotal.toFixed(2)}</span>
                  )}
                  {order.status === 'quoted' && (
                    <button
                      className={styles.reviewQuoteBtn}
                      onClick={() => toggleExpand(order._id)}
                    >
                      {expanded[order._id] ? 'Collapse' : 'Review Quote'}
                    </button>
                  )}
                </div>
              </div>

              {/* Quote review expansion */}
              {order.status === 'quoted' && expanded[order._id] && (
                <div className={styles.quoteExpansion}>
                  {order.items?.length > 0 && (
                    <div className={styles.quoteItems}>
                      {order.items.map((item, i) => {
                        const lineTotal = (item.priceAtOrder ?? 0) * (item.quantity ?? 0)
                        return (
                          <div key={i} className={styles.quoteItem}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>${lineTotal.toFixed(2)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {order.deliveryFee != null && (
                    <div className={styles.quoteLine}>
                      <span>Delivery fee</span>
                      <span>${order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}

                  {order.estimatedTotal != null && (
                    <div className={`${styles.quoteLine} ${styles.quoteTotal}`}>
                      <strong>Total</strong>
                      <strong>${order.estimatedTotal.toFixed(2)}</strong>
                    </div>
                  )}

                  {order.eta && (
                    <p className={styles.quoteDetail}>ETA: {new Date(order.eta).toLocaleDateString()}</p>
                  )}
                  {order.pickupAddress && (
                    <p className={styles.quoteDetail}>Pickup: {order.pickupAddress}</p>
                  )}
                  {order.pickupWindow && (
                    <p className={styles.quoteDetail}>Pickup window: {order.pickupWindow}</p>
                  )}
                  {order.distributorNotes && (
                    <p className={styles.quoteNote}>"{order.distributorNotes}"</p>
                  )}

                  <div className={styles.quoteActions}>
                    <button className={styles.declineBtn} onClick={() => handleCancel(order._id)}>
                      Decline
                    </button>
                    <button className={styles.acceptBtn} onClick={() => handleAccept(order._id)}>
                      Accept Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
