import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  TruckIcon,
  StarIcon,
  BugAntIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/solid'
import * as adminService from '../../services/adminService'
import styles from './AdminDashboard.module.css'

const BASE = '/dashboard/admin'

const NAV = [
  { section: 'OVERVIEW', items: [{ label: 'Dashboard', icon: HomeIcon, to: BASE }] },
  {
    section: 'USERS',
    items: [
      { label: 'Patrons', icon: UsersIcon,              to: `${BASE}/patrons` },
      { label: 'Stores',  icon: BuildingStorefrontIcon, to: `${BASE}/stores`  },
    ],
  },
  {
    section: 'CATALOG',
    items: [
      { label: 'Products',      icon: ShoppingBagIcon, to: `${BASE}/products`     },
      { label: 'Distribution',  icon: TruckIcon,       to: `${BASE}/distribution` },
      { label: 'Sponsored',     icon: StarIcon,        to: `${BASE}/sponsored`    },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { label: 'Bug Reports', icon: BugAntIcon,  to: `${BASE}/bug-reports`, badge: true },
      { label: 'Analytics',   icon: ChartBarIcon, to: `${BASE}/analytics`               },
    ],
  },
]

const SECTION_TITLES = {
  [BASE]: 'Overview',
  [`${BASE}/patrons`]: 'Patrons',
  [`${BASE}/stores`]: 'Stores',
  [`${BASE}/products`]: 'Products',
  [`${BASE}/distribution`]: 'Distribution',
  [`${BASE}/sponsored`]: 'Sponsored',
  [`${BASE}/bug-reports`]: 'Bug Reports',
  [`${BASE}/analytics`]: 'Analytics',
}

export default function AdminDashboard({ user }) {
  const location = useLocation()
  const [openBugCount, setOpenBugCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    adminService.getStats().then(data => {
      if (data?.openBugReports != null) setOpenBugCount(data.openBugReports)
    })
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    window.location.href = '/admin/login'
  }

  const sectionTitle = Object.entries(SECTION_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'Admin'

  const isExactBase = location.pathname === BASE || location.pathname === `${BASE}/`

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoMark}>C</span>
          <span className={styles.logoText}>Corners Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ section, items }) => (
            <div key={section} className={styles.navSection}>
              <p className={styles.navSectionLabel}>{section}</p>
              {items.map(({ label, icon: Icon, to, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === BASE}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={styles.navIcon} aria-hidden="true" />
                  <span>{label}</span>
                  {badge && openBugCount > 0 && (
                    <span className={styles.badge}>{openBugCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <NavLink
            to={`${BASE}/settings`}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Cog6ToothIcon className={styles.navIcon} aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            <ArrowRightStartOnRectangleIcon className={styles.navIcon} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.hamburger}
              onClick={() => setSidebarOpen(p => !p)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <h1 className={styles.pageTitle}>{sectionTitle}</h1>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.adminBadge}>Admin</span>
            <span className={styles.userName}>{user?.name}</span>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
