import styles from './PatronDashboard.module.css'
import { useNavigate } from 'react-router-dom'

// Temporary placeholder images
import storesIcon from '../assets/stores.png'
import productsIcon from '../assets/products.png'
import promotionsIcon from '../assets/promotions.png'
import requestsIcon from '../assets/requests.png'
import favoritesIcon from '../assets/favorites.png'
import settingsIcon from '../assets/settings.png'

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

const PatronDashboard = ({ user }) => {
  const navigate = useNavigate()

  const patronName = user?.name || 'Patron'

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <h2 className={styles.welcome}>
        Welcome, {patronName}!
      </h2>

      {/* Dashboard Grid */}
      <div className={styles.grid}>
        <DashboardCard
          title="My Stores"
          icon={storesIcon}
          onClick={() => navigate('/patron/stores')}
        />
        <DashboardCard
          title="Products"
          icon={productsIcon}
          onClick={() => navigate('/patron/products')}
        />
        <DashboardCard
          title="Promotions / Sales"
          icon={promotionsIcon}
          onClick={() => navigate('/patron/promotions')}
        />
        <DashboardCard
          title="Requests"
          icon={requestsIcon}
          onClick={() => navigate('/patron/requests')}
        />
        <DashboardCard
          title="Favorites"
          icon={favoritesIcon}
          onClick={() => navigate('/patron/favorites')}
        />
        <DashboardCard
          title="Settings"
          icon={settingsIcon}
          onClick={() => navigate('/patron/settings')}
        />
      </div>

      {/* Bottom Section */}
      <div className={styles.feedSection}>
        <h4>Neighborhood Updates</h4>
        <div className={styles.feedCard}>
          <p>
            Discover new stores in your area, seasonal promotions,
            local events, and community announcements. Soon, this
            section will also highlight trending products and
            personalized recommendations near you.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PatronDashboard
