import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SidePanel.module.css'

export default function SidePanel({ children, backTo = '/dashboard/patron' }) {
  const navigate = useNavigate()

  // Lock body scroll on desktop when panel is open
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)')
    if (mq.matches) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function close() { navigate(backTo) }

  return (
    <>
      {/* Desktop: backdrop + slide-in panel */}
      <div className={styles.backdrop} onClick={close} aria-hidden />
      <div className={styles.panel} role="dialog" aria-modal="true">
        <button className={styles.closeBtn} onClick={close} aria-label="Close panel">✕</button>
        <div className={styles.content}>{children}</div>
      </div>

      {/* Mobile: full-page (panel/backdrop are hidden via CSS) */}
      <div className={styles.mobilePage}>{children}</div>
    </>
  )
}
