import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BuildingStorefrontIcon } from '@heroicons/react/24/solid'
import * as businessService from '../../../services/businessService'
import styles from './BusinessPendingApproval.module.css'

export default function BusinessPendingApproval() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)
  const [notYet, setNotYet] = useState(false)

  async function checkStatus() {
    setChecking(true)
    setNotYet(false)
    const data = await businessService.getMyBusiness()
    if (data?.verificationStatus === 'approved') {
      navigate('/dashboard/business')
    } else if (data?.verificationStatus === 'rejected') {
      navigate('/dashboard/business/rejected')
    } else {
      setChecking(false)
      setNotYet(true)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <BuildingStorefrontIcon className={styles.icon} aria-hidden="true" />
        </div>

        <h1 className={styles.title}>Your store is under review</h1>
        <p className={styles.body}>
          Thanks for setting up your store on Corners. We're a platform built exclusively for
          local, independent businesses — not chains, franchises, or corporations.
        </p>
        <p className={styles.body}>
          Our team will review your submission to confirm you're a real, locally-owned business.
          Once approved, you'll have full access to the platform. This typically takes 1–2 business days.
        </p>

        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <div className={`${styles.dot} ${styles.dotDone}`} />
            <div className={styles.timelineText}>
              <p className={styles.timelineTitle}>Store submitted</p>
              <p className={styles.timelineSub}>Your info is in our review queue</p>
            </div>
          </div>
          <div className={styles.timelineConnector} />
          <div className={styles.timelineItem}>
            <div className={`${styles.dot} ${styles.dotActive}`} />
            <div className={styles.timelineText}>
              <p className={styles.timelineTitle}>Admin review</p>
              <p className={styles.timelineSub}>We verify you're a local independent business</p>
            </div>
          </div>
          <div className={styles.timelineConnector} />
          <div className={styles.timelineItem}>
            <div className={`${styles.dot} ${styles.dotLocked}`} />
            <div className={styles.timelineText}>
              <p className={`${styles.timelineTitle} ${styles.locked}`}>Approved — full access</p>
              <p className={styles.timelineSub}>Start connecting with your community</p>
            </div>
          </div>
        </div>

        {notYet && (
          <p className={styles.notYet}>Still under review — check back soon.</p>
        )}

        <button className={styles.checkBtn} onClick={checkStatus} disabled={checking}>
          {checking ? 'Checking…' : 'Check Approval Status'}
        </button>
      </div>
    </div>
  )
}
