import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBilling from '../../hooks/useBilling'
import * as billingService from '../../services/billingService'
import styles from './Upgrade.module.css'

function getHeading(status) {
  if (status === 'past_due')  return 'Your payment failed'
  if (status === 'cancelled') return 'Resubscribe to Corners'
  if (status === 'none')      return 'Start your subscription'
  return 'Your free trial has ended'
}

function getSubtext(status) {
  if (status === 'past_due')  return 'Please update your payment method to restore full access to your store.'
  if (status === 'cancelled') return 'Your account is paused. Resubscribe to restore full access to your store dashboard.'
  if (status === 'none')      return 'Get full access to your store dashboard, QR code, analytics, and more.'
  return 'Your trial period has ended. Subscribe to keep your store active on Corners.'
}

export default function Upgrade({ user }) {
  const navigate = useNavigate()
  const billing = useBilling(user)
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    try {
      await billingService.createCheckoutSession()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>{getHeading(billing.status)}</h1>
        <p className={styles.subtext}>{getSubtext(billing.status)}</p>
        <button className={styles.cta} onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Redirecting…' : 'Subscribe — $29/month'}
        </button>
        <button className={styles.back} onClick={() => navigate(-1)}>← Go back</button>
      </div>
    </div>
  )
}
