import styles from './PatronPromotions.module.css'

export default function PatronPromotions() {
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <span>🏷️</span>
        <h2>Promotions & Sales</h2>
        <p>This is Promotions!</p>
        <p className={styles.sub}>Deals and sales from your connected stores will appear here.</p>
      </div>
    </div>
  )
}
