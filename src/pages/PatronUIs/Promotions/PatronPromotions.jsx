import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as productService from '../../../services/productService'
import * as connectionService from '../../../services/connectionService'
import styles from './PatronPromotions.module.css'

export default function PatronPromotions() {
  const [products, setProducts] = useState([])
  const [storeMap, setStoreMap] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const [prods, stores] = await Promise.all([
        productService.getPatronProducts(),
        connectionService.getMyStores(),
      ])
      if (Array.isArray(prods)) {
        setProducts(prods.filter(p => p.status === 'on_sale'))
      }
      if (Array.isArray(stores)) {
        const map = {}
        stores.forEach(s => {
          const pid = (s.profile?._id || s.profile)?.toString()
          if (pid) map[pid] = { id: s._id, name: s.displayName || s.profile?.name || 'Store' }
        })
        setStoreMap(map)
      }
      setLoading(false)
    }
    load()
  }, [])

  function getStore(p) {
    const bizId = (p.business?._id || p.business)?.toString()
    return storeMap[bizId] || null
  }

  if (loading) return <div className={styles.loading}><span className={styles.spinner} /></div>

  return (
    <div className={styles.container}>
      <div className={styles.header}><h2>Promotions</h2></div>

      {products.length === 0 ? (
        <p className={styles.empty}>No promotions in your area right now. Check back soon.</p>
      ) : (
        <div className={styles.grid}>
          {products.map(p => {
            const store = getStore(p)
            return (
              <div key={p._id} className={styles.card}>
                {p.image
                  ? <img src={p.image} alt={p.name} className={styles.cardImg} />
                  : <div className={styles.imgPlaceholder} />
                }
                <div className={styles.cardBody}>
                  <h4 className={styles.cardName}>{p.name}</h4>
                  {store && <p className={styles.storeName}>{store.name}</p>}
                  <div className={styles.priceRow}>
                    {p.price != null && (
                      <span className={styles.originalPrice}>${Number(p.price).toFixed(2)}</span>
                    )}
                    {p.salePrice != null
                      ? <span className={styles.salePrice}>${Number(p.salePrice).toFixed(2)}</span>
                      : p.price != null && <span className={styles.salePrice}>${Number(p.price).toFixed(2)}</span>
                    }
                  </div>
                  {store && (
                    <button
                      className={styles.viewBtn}
                      onClick={() => navigate(`/dashboard/patron/stores/${store.id}`)}
                    >
                      View store
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
