import { useState, useEffect, useRef, useCallback } from 'react'

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

export default function useIdleTimeout({ timeoutMs, warningMs, onLogout }) {
  const warningDelay = timeoutMs === Infinity ? Infinity : timeoutMs - warningMs

  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(warningMs / 1000))

  const onLogoutRef     = useRef(onLogout)
  const warningTimerRef = useRef(null)
  const logoutTimerRef  = useRef(null)
  const countdownRef    = useRef(null)

  useEffect(() => { onLogoutRef.current = onLogout }, [onLogout])

  const startTimers = useCallback(() => {
    clearTimeout(warningTimerRef.current)
    clearTimeout(logoutTimerRef.current)
    clearInterval(countdownRef.current)

    setShowWarning(false)
    setSecondsLeft(Math.floor(warningMs / 1000))

    if (timeoutMs === Infinity) return

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      setSecondsLeft(Math.floor(warningMs / 1000))

      countdownRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { clearInterval(countdownRef.current); return 0 }
          return s - 1
        })
      }, 1000)
    }, warningDelay)

    logoutTimerRef.current = setTimeout(() => {
      clearInterval(countdownRef.current)
      onLogoutRef.current()
    }, timeoutMs)
  }, [timeoutMs, warningMs, warningDelay])

  const resetTimer = useCallback(() => { startTimers() }, [startTimers])

  useEffect(() => {
    startTimers()
    ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, startTimers, { passive: true }))
    return () => {
      clearTimeout(warningTimerRef.current)
      clearTimeout(logoutTimerRef.current)
      clearInterval(countdownRef.current)
      ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, startTimers))
    }
  }, [startTimers])

  return { showWarning, secondsLeft, resetTimer }
}
