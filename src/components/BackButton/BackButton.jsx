import { useNavigate } from 'react-router-dom'
import styles from './BackButton.module.css'

export default function BackButton({ to }) {
  const navigate = useNavigate()
  return (
    <button
      className={styles.btn}
      onClick={() => to ? navigate(to) : navigate(-1)}
      aria-label="Go back"
    >
      ← Back
    </button>
  )
}
