import { useState, useEffect } from 'react'
import * as billingService from '../services/billingService'

export default function useBilling(user) {
  const [billing, setBilling] = useState({
    status: null,
    plan: null,
    trialEndsAt: null,
    daysLeftInTrial: 0,
    hasPaymentMethod: false,
    loading: true,
  })

  useEffect(() => {
    if (!user || user.authorizationLevel < 250 || user.authorizationLevel >= 500) {
      setBilling(b => ({ ...b, loading: false }))
      return
    }
    billingService.getStatus()
      .then(data => {
        const trialEndsAt = data.trialEndsAt ? new Date(data.trialEndsAt) : null
        const msLeft = trialEndsAt ? trialEndsAt - Date.now() : 0
        const daysLeftInTrial = Math.max(0, Math.ceil(msLeft / 86400000))
        setBilling({ status: data.status, plan: data.plan, trialEndsAt, daysLeftInTrial, hasPaymentMethod: !!data.hasPaymentMethod, loading: false })
      })
      .catch(() => setBilling(b => ({ ...b, loading: false })))
  }, [user])

  return billing
}
