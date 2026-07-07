import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as businessService from '../../services/businessService'
import BugReportModal from '../../components/BugReportModal/BugReportModal'
import MessageInbox from '../../components/MessageInbox/MessageInbox'
import styles from './BusinessDashboard.module.css'
import productsImg  from '../assets/products.png'
import patronsImg   from '../assets/patrons.jpg'
import analyticsImg from '../assets/analytics.png'
import settingsImg  from '../assets/settings.png'

const NAV_CARDS = [
  { to: '/dashboard/business/products',        icon: productsImg,  label: 'Products',        sub: 'Manage your catalog'              },
  { to: '/dashboard/business/patron-requests', icon: patronsImg,   label: 'Patron Requests', sub: 'Approve or deny patrons'          },
  // { to: '/dashboard/business/distributors', icon: null, emoji: '🚛', label: 'Distributors', sub: 'Order from nearby distributors' }, // Hidden until distributor launch
  { to: '/dashboard/business/analytics',       icon: analyticsImg, label: 'Analytics',       sub: 'View your business stats'         },
  { to: '/dashboard/business/setup',           icon: settingsImg,  label: 'Settings',        sub: 'Update your business info'        },
]

export default function BusinessDashboard({ user }) {
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [showBugReport, setShowBugReport] = useState(false)

  useEffect(() => {
    businessService.getMyBusiness()
      .then(data => {
        if (data?.err || !data?.businessType || !data?.location?.zip) {
          navigate('/dashboard/business/setup')
          return
        }
        if (data.verificationStatus === 'pending') {
          navigate('/dashboard/business/pending-approval')
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
        <h1>Welcome back{business?.displayName ? `, ${business.displayName}` : ''}.</h1>
        {business?.businessType && <p>{business.businessType}</p>}
      </header>

      <section className={styles.cardGrid}>
        {NAV_CARDS.map(({ to, icon, emoji, label, sub }) => (
          <Link key={to} to={to} className={styles.card}>
            <div className={styles.iconWrapper}>
              {icon
                ? <img src={icon} alt={label} />
                : <span className={styles.cardEmoji}>{emoji}</span>
              }
            </div>
            <div>
              <h3 className={styles.cardLabel}>{label}</h3>
              <p className={styles.cardSub}>{sub}</p>
            </div>
            <span className={styles.cardArrow}>›</span>
          </Link>
        ))}
      </section>

      <footer className={styles.footer}>
        <button className={styles.bugLink} onClick={() => setShowBugReport(true)}>
          Found a bug? Report it →
        </button>
      </footer>

      <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} user={user} />
      <MessageInbox user={user} />
    </div>
  )
}
