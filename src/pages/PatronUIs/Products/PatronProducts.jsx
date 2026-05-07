import { useState, useEffect } from 'react'
import * as productService from '../../../services/productService'
import styles from './PatronProducts.module.css'

const TABS = ['All', 'My Requests', 'Approved']

export default function PatronProducts({ user }) {
  const [products, setProducts] = useState([])
  const [tab, setTab] = useState('All')
  const [myVotes, setMyVotes] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getPatronProducts()
      .then(data => { if (Array.isArray(data)) setProducts(data) })
      .finally(() => setLoading(false))
  }, [])

  async function handleVote(id) {
    const updated = await productService.voteForProduct(id)
    if (!updated.err) {
      setMyVotes(prev => ({ ...prev, [id]: true }))
      setProducts(prev => prev.map(p => p._id === id ? updated : p))
    }
  }

  const filtered = products.filter(p => {
    if (tab === 'My Requests') return p.requestedBy === user?._id || p.requestedBy?._id === user?._id
    if (tab === 'Approved') return p.status === 'approved' || p.status === 'ready_to_stock'
    return true
  })

  return (
    <div className={styles.container}>
      <h2>Products</h2>
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.active : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {loading && <p>Loading…</p>}
      <div className={styles.list}>
        {!loading && filtered.length === 0 && <p className={styles.empty}>No products here.</p>}
        {filtered.map(p => (
          <div key={p._id} className={styles.card}>
            <div className={styles.info}>
              <h4>{p.name}</h4>
              {p.brand && <span className={styles.brand}>{p.brand}</span>}
              {p.description && <p className={styles.desc}>{p.description}</p>}
            </div>
            <div className={styles.right}>
              <span className={`${styles.badge} ${styles[p.status]}`}>{p.status.replace(/_/g,' ')}</span>
              <div className={styles.tally}>
                <span>{p.currentTally}/{p.tallyGoal}</span>
                <div className={styles.bar}><div className={styles.fill} style={{ width:`${Math.min(100,(p.currentTally/p.tallyGoal)*100)}%` }} /></div>
              </div>
              {!myVotes[p._id] && (p.status === 'approved' || p.status === 'ready_to_stock') && (
                <button className={styles.voteBtn} onClick={() => handleVote(p._id)}>+1 Vote</button>
              )}
              {myVotes[p._id] && <span className={styles.voted}>✓ Voted</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
