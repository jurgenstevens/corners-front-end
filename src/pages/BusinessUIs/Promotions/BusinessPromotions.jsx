import { useState, useEffect } from 'react'
import * as productService from '../../../services/productService'
import styles from './BusinessPromotions.module.css'

export default function BusinessPromotions() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    try {
      const data = await productService.getBusinessProducts()
      if (Array.isArray(data)) {
        setProducts(data.filter(p => p.status === 'on_sale'))
      } else {
        setError('Failed to load promotions.')
      }
    } catch {
      setError('Failed to load promotions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleRemove(id) {
    await productService.updateProductStatus(id, 'stocked')
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  if (loading) return <div className={styles.loading}><span className={styles.spinner} /></div>

  return (
    <div className={styles.container}>
      <div className={styles.header}><h2>Promotions</h2></div>
      {error && <p className={styles.error}>{error}</p>}

      {products.length === 0 ? (
        <p className={styles.empty}>No active promotions. Go to Products and promote a stocked item to run a sale.</p>
      ) : (
        <div className={styles.grid}>
          {products.map(p => {
            const discountPct = p.price != null && p.salePrice != null
              ? Math.round((1 - p.salePrice / p.price) * 100)
              : p.discountPercent ?? null

            return (
              <div key={p._id} className={styles.card}>
                {p.image
                  ? <img src={p.image} alt={p.name} className={styles.cardImg} />
                  : <div className={styles.imgPlaceholder} />
                }
                <div className={styles.cardBody}>
                  <div className={styles.topRow}>
                    <h4 className={styles.cardName}>{p.name}</h4>
                    {discountPct != null && (
                      <span className={styles.discountBadge}>-{discountPct}%</span>
                    )}
                  </div>
                  <div className={styles.priceRow}>
                    {p.price != null && (
                      <span className={styles.originalPrice}>${Number(p.price).toFixed(2)}</span>
                    )}
                    {p.salePrice != null && (
                      <span className={styles.salePrice}>${Number(p.salePrice).toFixed(2)}</span>
                    )}
                  </div>
                  <button className={styles.removeBtn} onClick={() => handleRemove(p._id)}>
                    Remove promotion
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
