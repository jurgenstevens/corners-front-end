import { useState, useEffect, useRef } from 'react'
import * as productService from '../../../services/productService'
import styles from './PatronPromotions.module.css'

export default function PatronPromotions() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [canScrollLeft, setCanScrollLeft]   = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const tabsScrollRef = useRef(null)

  async function load() {
    const data = await productService.getPatronPromotions()
    if (Array.isArray(data)) setProducts(data)
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [products])

  function checkScroll() {
    const el = tabsScrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  function scrollTabs(dir) {
    tabsScrollRef.current?.scrollBy({ left: dir * 150, behavior: 'smooth' })
    setTimeout(checkScroll, 200)
  }

  // Derive unique stores from the promotion products themselves
  const storeMap = {}
  products.forEach(p => {
    const id = (p.business?._id || p.business)?.toString()
    if (id && !storeMap[id]) storeMap[id] = p.business?.name || 'Store'
  })
  const storeTabs = Object.entries(storeMap).map(([id, name]) => ({ id, name }))

  const filtered = activeTab === 'all'
    ? products
    : products.filter(p => (p.business?._id || p.business)?.toString() === activeTab)

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Promotions & Sales</h2>

      {/* Tabs */}
      <div className={styles.tabsWrap}>
        {canScrollLeft && (
          <button className={styles.tabArrow} onClick={() => scrollTabs(-1)}>‹</button>
        )}
        <div className={styles.tabsScroll} ref={tabsScrollRef} onScroll={checkScroll}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('all')}
            >All</button>
            {storeTabs.map(t => (
              <button
                key={t.id}
                className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(t.id)}
              >{t.name}</button>
            ))}
          </div>
        </div>
        {canScrollRight && (
          <button className={styles.tabArrow} onClick={() => scrollTabs(1)}>›</button>
        )}
      </div>

      {/* Skeletons */}
      {loading && (
        <div className={styles.skeletons}>
          {[1, 2, 3].map(n => <div key={n} className={styles.skItem} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className={styles.empty}>
          <span>🏷️</span>
          <p>No promotions right now.</p>
          <p className={styles.sub}>Check back later for deals from your connected stores.</p>
        </div>
      )}

      {/* Promotion cards */}
      <div className={styles.feed}>
        {filtered.map(p => (
          <div key={p._id} className={styles.card}>
            {p.image && (
              <img src={p.image} alt={p.name} className={styles.cardImage} />
            )}
            <div className={styles.cardBody}>
              <div className={styles.cardTop}>
                <div>
                  <h3 className={styles.productName}>{p.name}</h3>
                  {p.brand && <p className={styles.brand}>{p.brand}</p>}
                  <p className={styles.storeName}>{p.business?.name}</p>
                </div>
                <span className={styles.discountBadge}>-{p.discountPercent}%</span>
              </div>

              {p.description && <p className={styles.description}>{p.description}</p>}

              <div className={styles.priceRow}>
                {p.price != null && (
                  <span className={styles.originalPrice}>${p.price}</span>
                )}
                <span className={styles.salePrice}>${p.salePrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
