import { useState, useEffect } from 'react'
import * as productService from '../../../services/productService'
import styles from './BusinessInventory.module.css'

export default function BusinessInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await productService.getBusinessProducts()
      if (Array.isArray(data)) {
        setProducts(data.filter(p => p.status === 'stocked' || p.status === 'on_sale'))
      } else {
        setError('Failed to load inventory.')
      }
    } catch {
      setError('Failed to load inventory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleMarkUnavailable(id) {
    if (!window.confirm('Mark this product as unavailable? It will be hidden from patrons.')) return
    await productService.updateProduct(id, { isActive: false })
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  async function handlePromote(id) {
    await productService.updateProductStatus(id, 'on_sale')
    setProducts(prev => prev.map(p => p._id === id ? { ...p, status: 'on_sale' } : p))
  }

  if (loading) return <div className={styles.loading}><span className={styles.spinner} /></div>

  return (
    <div className={styles.container}>
      <div className={styles.header}><h2>Inventory</h2></div>
      {error && <p className={styles.error}>{error}</p>}

      {products.length === 0 ? (
        <p className={styles.empty}>No products in stock yet. Approve patron requests in Products to start building your inventory.</p>
      ) : (
        <div className={styles.list}>
          {products.map(p => (
            <div key={p._id} className={styles.row}>
              {p.image
                ? <img src={p.image} alt={p.name} className={styles.thumb} />
                : <div className={styles.thumbPlaceholder} />
              }
              <div className={styles.info}>
                <span className={styles.name}>{p.name}</span>
                {p.brand && <span className={styles.brand}>{p.brand}</span>}
              </div>
              <div className={styles.priceCol}>
                {p.price != null ? `$${Number(p.price).toFixed(2)}` : '—'}
              </div>
              <div className={styles.badgeCol}>
                {p.status === 'on_sale'
                  ? <span className={styles.saleBadge}>On Sale</span>
                  : <span className={styles.inStoreBadge}>In Store</span>
                }
              </div>
              <div className={styles.actions}>
                {p.status === 'stocked' && (
                  <button className={styles.promoteBtn} onClick={() => handlePromote(p._id)}>Promote</button>
                )}
                <button className={styles.unavailBtn} onClick={() => handleMarkUnavailable(p._id)}>
                  Mark unavailable
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
