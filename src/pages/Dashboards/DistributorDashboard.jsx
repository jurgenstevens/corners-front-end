import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CubeIcon,
  BookOpenIcon,
  DocumentArrowUpIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid'
import * as distributorService from '../../services/distributorService'
import styles from './DistributorDashboard.module.css'

export default function DistributorDashboard() {
  const [orders, setOrders] = useState([])
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      distributorService.getMyOrders(),
      distributorService.getMyCatalog(),
    ]).then(([orderData, catalogData]) => {
      if (Array.isArray(orderData)) setOrders(orderData)
      if (Array.isArray(catalogData)) setProductCount(catalogData.length)
    }).finally(() => setLoading(false))
  }, [])

  const pendingCount = orders.filter(o => o.status === 'pending').length

  const now = new Date()
  const thisMonthOrders = orders.filter(o => {
    const d = new Date(o.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  const NAV_CARDS = [
    {
      to: '/dashboard/distributor/orders',
      icon: CubeIcon,
      label: 'Orders',
      sub: pendingCount > 0 ? `${pendingCount} pending response${pendingCount !== 1 ? 's' : ''}` : 'Manage incoming orders',
      badge: pendingCount || null,
    },
    {
      to: '/dashboard/distributor/catalog',
      icon: BookOpenIcon,
      label: 'My Catalog',
      sub: productCount > 0 ? `${productCount} product${productCount !== 1 ? 's' : ''}` : 'Manage your products',
    },
    {
      to: '/dashboard/distributor/catalog',
      icon: DocumentArrowUpIcon,
      label: 'Upload PDF',
      sub: 'Import products from a price sheet',
    },
    {
      to: '/dashboard/distributor/settings',
      icon: Cog6ToothIcon,
      label: 'Settings',
      sub: 'Update service regions & categories',
    },
  ]

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.page}>
      <header className={styles.greeting}>
        <h1>Distributor Dashboard</h1>
        <p>Manage your orders and product catalog.</p>
      </header>

      <section className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{thisMonthOrders}</span>
          <span className={styles.statLabel}>Orders this month</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${pendingCount > 0 ? styles.statAlert : ''}`}>{pendingCount}</span>
          <span className={styles.statLabel}>Pending responses</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{productCount}</span>
          <span className={styles.statLabel}>Active products</span>
        </div>
      </section>

      <section className={styles.cardGrid}>
        {NAV_CARDS.map(({ to, icon: Icon, label, sub, badge }) => (
          <Link key={label} to={to} className={styles.card}>
            <div className={styles.iconWrapper}>
              <Icon className={styles.cardIcon} aria-hidden="true" />
              {badge ? <span className={styles.cardBadge}>{badge}</span> : null}
            </div>
            <div className={styles.cardText}>
              <h3 className={styles.cardLabel}>{label}</h3>
              <p className={styles.cardSub}>{sub}</p>
            </div>
            <span className={styles.cardArrow}>›</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
