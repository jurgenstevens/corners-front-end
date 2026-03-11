import styles from './BusinessDashboard.module.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import productsIcon from '../assets/products.png'
import promotionsIcon from '../assets/promotions.png'
import inventoryIcon from '../assets/inventory.png'
import analyticsIcon from '../assets/analytics.png'
import settingsIcon from '../assets/settings.png'
import requestsIcon from '../assets/requests.svg'

import BusinessProducts from '../Products/BusinessProducts'

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
  const isDesktop = window.innerWidth >= 900
  const [activePanel, setActivePanel] = useState(null)

  return (
    <div className={styles.dashboardLayout}>

      {/* LEFT SIDE DASHBOARD */}
      <div className={styles.container}>

        <h2 className={styles.welcome}>
          Welcome, {businessName}!
        </h2>

        <div className={styles.grid}>

          <DashboardCard
            title="Products"
            icon={productsIcon}
            onClick={() =>
              isDesktop
                ? setActivePanel("products")
                : navigate("/dashboard/business/products")
            }
          />

          <DashboardCard
            title="Promotions"
            icon={promotionsIcon}
            onClick={() =>
              isDesktop
                ? setActivePanel("promotions")
                : navigate("/dashboard/business/promotions")
            }
          />

          <DashboardCard
            title="Inventory"
            icon={inventoryIcon}
            onClick={() =>
              isDesktop
                ? setActivePanel("inventory")
                : navigate("/dashboard/business/inventory")
            }
          />

          <DashboardCard
            title="Analytics"
            icon={analyticsIcon}
            onClick={() =>
              isDesktop
                ? setActivePanel("analytics")
                : navigate("/dashboard/business/analytics")
            }
          />

          <DashboardCard
            title="Settings"
            icon={settingsIcon}
            onClick={() =>
              isDesktop
                ? setActivePanel("settings")
                : navigate("/dashboard/business/settings")
            }
          />

          <DashboardCard
            title="Requests"
            icon={requestsIcon}
            onClick={() =>
              isDesktop
                ? setActivePanel("requests")
                : navigate("/dashboard/business/requests")
            }
          />

        </div>

        {/* Neighborhood Updates */}
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


      {/* RIGHT SIDE PANEL (MUST BE OUTSIDE container) */}
      {activePanel && isDesktop && (
        <div className={styles.panelArea}>

          <button
            className={styles.closePanel}
            onClick={() => setActivePanel(null)}
          >
            ×
          </button>

          {activePanel === "products" && <BusinessProducts />}
          {/* {activePanel === "promotions" && <BusinessPromotions />} */}
          {/* {activePanel === "inventory" && <BusinessInventory />} */}
          {/* {activePanel === "analytics" && <BusinessAnalytics />} */}
          {/* {activePanel === "requests" && <BusinessRequests />} */}
          {/* {activePanel === "settings" && <BusinessSettings />} */}

        </div>
      )}

    </div>
  )
}

export default BusinessDashboard