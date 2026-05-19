import { Link } from 'react-router-dom'
import styles from './PatronDashboard.module.css'
import storesImg     from '../assets/stores.png'
import productsImg   from '../assets/products.png'
import requestsImg   from '../assets/requests.png'
import promotionsImg from '../assets/promotions.png'

const QUICK_LINKS = [
  { to: '/patron/stores',      icon: storesImg,     label: 'My Stores',    sub: 'Browse & discover businesses'  },
  { to: '/patron/products',    icon: productsImg,   label: 'Products',     sub: 'Browse & vote on items'        },
  { to: '/patron/requests',    icon: requestsImg,   label: 'My Requests',  sub: 'Track what you\'ve asked for'  },
  { to: '/patron/promotions',  icon: promotionsImg, label: 'Promotions',   sub: 'Deals & sales near you'        },
]

export default function PatronDashboard({ user }) {
  return (
    <div className={styles.page}>
      <header className={styles.greeting}>
        <h1>Hey, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening around you.</p>
      </header>

      <section className={styles.cardGrid}>
        {QUICK_LINKS.map(({ to, icon, label, sub }) => (
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
