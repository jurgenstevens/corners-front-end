import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as businessService from '../../services/businessService'
import styles from './BusinessDashboard.module.css'
import productsImg  from '../assets/products.png'
import patronsImg   from '../assets/patrons.jpg'
import analyticsImg from '../assets/analytics.png'
import settingsImg  from '../assets/settings.png'

const NAV_CARDS = [
  { to: '/dashboard/business/products',        icon: productsImg,  label: 'Products',        sub: 'Manage your catalog'       },
  { to: '/dashboard/business/patron-requests', icon: patronsImg,   label: 'Patron Requests', sub: 'Approve or deny patrons'   },
  { to: '/dashboard/business/analytics',       icon: analyticsImg, label: 'Analytics',       sub: 'View your business stats'  },
  { to: '/dashboard/business/setup',           icon: settingsImg,  label: 'Settings',        sub: 'Update your business info' },
]

export default function BusinessDashboard({ user }) {
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    businessService.getMyBusiness()
      .then(data => {
        if (data?.err || !data?.businessType || !data?.location?.zip) {
          navigate('/dashboard/business/setup')
          return
        }
        setBusiness(data)
      })
      .catch(() => navigate('/dashboard/business/setup'))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.page}>
      <header className={styles.greeting}>
        <h1>Welcome back{business?.displayName ? `, ${business.displayName}` : ''} 👋</h1>
        {business?.businessType && <p>{business.businessType}</p>}
      </header>

      <section className={styles.cardGrid}>
        {NAV_CARDS.map(({ to, icon, label, sub }) => (
          <Link key={to} to={to} className={styles.card}>
            <div className={styles.iconWrapper}><img src={icon} alt={label} /></div>
            <div>
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
