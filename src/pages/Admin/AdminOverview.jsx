import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  UsersIcon,
  FlagIcon,
  BugAntIcon,
  CubeIcon,
  UserIcon,
} from '@heroicons/react/24/solid'
import * as adminService from '../../services/adminService'
import styles from './AdminOverview.module.css'

const BASE = '/dashboard/admin'

const ROLE_LABEL = { 150: 'Patron', 250: 'Business', 500: 'Distributor' }

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats().then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className={styles.loading}>Loading…</p>
  if (!stats) return <p className={styles.error}>Failed to load stats.</p>

  const CARDS = [
    { label: 'Pending Approval',  count: stats.pendingBusinesses, icon: BuildingStorefrontIcon, to: `${BASE}/stores?status=unverified`, warn: stats.pendingBusinesses > 0 },
    { label: 'Approved Stores',   count: stats.approvedBusinesses, icon: CheckCircleIcon,       to: `${BASE}/stores?status=verified`                                     },
    { label: 'Total Patrons',     count: stats.totalPatrons,       icon: UsersIcon,             to: `${BASE}/patrons`                                                    },
    { label: 'Abuse Flags',       count: stats.abuseFlags,         icon: FlagIcon,              to: `${BASE}/patrons#abuse`, danger: stats.abuseFlags > 0               },
    { label: 'Open Bug Reports',  count: stats.openBugReports,     icon: BugAntIcon,            to: `${BASE}/bug-reports`, warn: stats.openBugReports > 0               },
    { label: 'Products Hit Tally', count: stats.tallyHits,         icon: CubeIcon,              to: `${BASE}/products`                                                  },
  ]

  return (
    <div>
      <div className={styles.grid}>
        {CARDS.map(({ label, count, icon: Icon, to, warn, danger }) => (
          <Link key={label} to={to} className={`${styles.card} ${warn ? styles.cardWarn : ''} ${danger ? styles.cardDanger : ''}`}>
            <Icon className={styles.cardIcon} aria-hidden="true" />
            <span className={styles.cardCount}>{count ?? '—'}</span>
            <span className={styles.cardLabel}>{label}</span>
          </Link>
        ))}
      </div>

      <section className={styles.activity}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityList}>
          {stats.recentVerified?.map(b => (
            <div key={b._id} className={styles.activityItem}>
              <CheckCircleIcon className={styles.activityIcon} aria-hidden="true" />
              <div>
                <p className={styles.activityText}><strong>{b.displayName || b.profile?.name}</strong> store verified</p>
                <p className={styles.activityTime}>{new Date(b.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {stats.recentSignups?.map(p => (
            <div key={p._id} className={styles.activityItem}>
              <UserIcon className={styles.activityIcon} aria-hidden="true" />
              <div>
                <p className={styles.activityText}><strong>{p.name}</strong> signed up as {ROLE_LABEL[p.authorizationLevel]}</p>
                <p className={styles.activityTime}>{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {!stats.recentVerified?.length && !stats.recentSignups?.length && (
            <p className={styles.empty}>No recent activity.</p>
          )}
        </div>
      </section>
    </div>
  )
}
