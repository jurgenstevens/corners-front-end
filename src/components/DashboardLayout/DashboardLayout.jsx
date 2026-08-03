import { useState, useEffect, useRef } from 'react'
import { NavLink, useOutlet, useNavigate, useLocation } from 'react-router-dom'
import useBilling from '../../hooks/useBilling'
import * as billingService from '../../services/billingService'
import styles from './DashboardLayout.module.css'

function formatDate(date) {
  if (!date) return ''
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function DashboardLayout({ Dashboard, user, homePath, navItems }) {
  const outlet   = useOutlet()
  const navigate = useNavigate()
  const location = useLocation()
  const billing  = useBilling(user)

  const isSetupLocked = location.pathname === '/dashboard/business/setup'

  function close() { if (!isSetupLocked) navigate(homePath) }

  // Welcome banner: shown once, dismissed to localStorage
  const [welcomeDismissed, setWelcomeDismissed] = useState(
    () => !!localStorage.getItem('trial_welcome_dismissed')
  )
  function dismissWelcome() {
    localStorage.setItem('trial_welcome_dismissed', '1')
    setWelcomeDismissed(true)
  }

  // Capture the trial length on first render so the welcome message is stable
  const initialDaysRef = useRef(null)
  useEffect(() => {
    if (billing.status === 'trialing' && billing.daysLeftInTrial > 0 && initialDaysRef.current === null) {
      initialDaysRef.current = billing.daysLeftInTrial
    }
  }, [billing])
  const welcomeDays = initialDaysRef.current ?? billing.daysLeftInTrial

  const isTrialing          = billing.status === 'trialing'
  const showCountdownBanner = isTrialing && billing.daysLeftInTrial <= 7
  const showWelcomeBanner   = isTrialing && billing.daysLeftInTrial > 7 && !welcomeDismissed && !billing.hasPaymentMethod

  return (
    <div className={`${styles.root} ${navItems ? styles.hasNav : ''}`}>

      {/* ── Left nav sidebar (desktop only, patron/distributor) ── */}
      {navItems && (
        <nav className={styles.leftNav}>
          {navItems.map(({ to, label, icon: NavIcon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
            >
              {NavIcon && <NavIcon className={styles.navIcon} aria-hidden="true" />}
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* ── Main dashboard ── */}
      <div className={outlet ? `${styles.main} ${styles.dimmed}` : styles.main}>

        {/* Trial countdown banner (≤ 7 days, non-dismissible; ≤ 3 days force-shown) */}
        {showCountdownBanner && (
          <div className={`${styles.trialBanner} ${styles.trialBannerWarn}`}>
            <span>
              {billing.daysLeftInTrial <= 0
                ? 'Your trial has ended — subscribe to keep full access.'
                : `Your trial ends in ${billing.daysLeftInTrial} day${billing.daysLeftInTrial === 1 ? '' : 's'}.`}
              {' '}
              <button
                className={styles.trialBannerCta}
                onClick={() => billingService.createCheckoutSession()}
              >
                Subscribe now
              </button>
            </span>
          </div>
        )}

        {/* Welcome banner (first time, > 7 days remaining) */}
        {showWelcomeBanner && (
          <div className={`${styles.trialBanner} ${styles.trialBannerAccent}`}>
            <span>
              Your {welcomeDays}-day free trial is active. Full access, no card needed.
              Add a payment method anytime — you won&apos;t be charged until{' '}
              {billing.trialEndsAt ? formatDate(billing.trialEndsAt) : 'your trial ends'}.
              {' '}
              <button
                className={styles.trialBannerCta}
                onClick={() => billingService.createCheckoutSession()}
              >
                Add payment method
              </button>
            </span>
            <button
              className={styles.trialBannerDismiss}
              onClick={dismissWelcome}
              aria-label="Dismiss welcome message"
            >
              ✕
            </button>
          </div>
        )}

        <Dashboard user={user} />
      </div>

      {/* ── Right sidebar (sub-routes) ── */}
      {outlet && (
        <>
          <div className={styles.backdrop} onClick={isSetupLocked ? undefined : close} />
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              {!isSetupLocked && (
                <button className={styles.closeBtn} onClick={close} aria-label="Close">
                  ✕
                </button>
              )}
            </div>
            <div className={styles.sidebarInner}>
              {outlet}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
