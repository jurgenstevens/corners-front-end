import styles from './PatronPromotions.module.css'
import BackButton from '../../../components/BackButton/BackButton'

export default function PatronPromotions() {
  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.placeholder}>
        <span>🏷️</span>
        <h2>Promotions & Sales</h2>
        <p>This is Promotions!</p>
        <p className={styles.sub}>Deals and sales from your connected stores will appear here.</p>
      </div>
    </div>
  )
}
