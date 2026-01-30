import styles from './BusinessDashboard.module.css'
import { useNavigate } from 'react-router-dom'

// Temporary placeholder icons (replace with real images later)
import productsIcon from '../assets/products.png'
import promotionsIcon from '../assets/promotions.png'
import inventoryIcon from '../assets/inventory.png'
import analyticsIcon from '../assets/analytics.png'
import settingsIcon from '../assets/settings.png'
import requestsIcon from '../assets/requests.svg'

const DashboardCard = ({ title, icon, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardHeader}>
        <h6>{title}</h6>
        <div className={styles.caretCircle}>
          <span className={styles.caret}>&gt;</span>
        </div>
      </div>

      <div className={styles.iconWrapper}>
        <img src={icon} alt={title} />
      </div>
    </div>
  )
}

const BusinessDashboard = ({ user }) => {
  const navigate = useNavigate()

  const businessName = user?.name || 'Business'

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <h2 className={styles.welcome}>
        Welcome, {businessName}!
      </h2>

      {/* Dashboard Grid */}
      <div className={styles.grid}>
        <DashboardCard
          title="Products"
          icon={productsIcon}
          onClick={() => navigate('/business/products')}
        />
        <DashboardCard
          title="Promotions"
          icon={promotionsIcon}
          onClick={() => navigate('/business/promotions')}
        />
        <DashboardCard
          title="Inventory"
          icon={inventoryIcon}
          onClick={() => navigate('/business/inventory')}
        />
        <DashboardCard
          title="Analytics"
          icon={analyticsIcon}
          onClick={() => navigate('/business/analytics')}
        />
        <DashboardCard
          title="Settings"
          icon={settingsIcon}
          onClick={() => navigate('/business/settings')}
        />
        <DashboardCard
          title="Requests"
          icon={requestsIcon}
          onClick={() => navigate('/business/requests')}
        />
      </div>

      {/* Bottom Section */}
      <div className={styles.feedSection}>
        <h4>Neighborhood Updates</h4>
        <div className={styles.feedCard}>
          <p>
            Stay informed about local grants, city business programs,
            seasonal events, and health department updates. This area
            will evolve into real-time business insights and activity.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard
