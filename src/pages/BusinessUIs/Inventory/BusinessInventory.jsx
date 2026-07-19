import { useState, useEffect } from 'react'
import * as productService from '../../../services/productService'
import styles from './BusinessInventory.module.css'

const STATUS_LABEL = {
  pending:  'Pending',
  approved: 'Approved',
  stocked:  'In Store',
  on_sale:  'On Sale',
  rejected: 'Rejected',
}

const STATUS_CLASS = {
  pending:  'badgePending',
  approved: 'badgeApproved',
  stocked:  'badgeStocked',
  on_sale:  'badgeSale',
  rejected: 'badgeRejected',
}

export default function BusinessInventory() {
  const [products, setProducts]             = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [search, setSearch]                 = useState('')
  const [tab, setTab]                       = useState('all')
  const [saleFormId, setSaleFormId]         = useState(null)
  const [salePrice, setSalePrice]           = useState('')
  const [saleSubmitting, setSaleSubmitting] = useState(false)

  useEffect(() => {
    productService.getBusinessProducts()
      .then(data => {
        if (Array.isArray(data)) setProducts(data)
        else setError('Failed to load inventory.')
      })
      .catch(() => setError('Failed to load inventory.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleMarkInStore(id) {
    await productService.updateProductStatus(id, 'stocked')
    setProducts(prev => prev.map(p => p._id === id ? { ...p, status: 'stocked' } : p))
  }

  async function handleEndSale(id) {
    await productService.updateProductStatus(id, 'stocked')
    setProducts(prev => prev.map(p => p._id === id ? { ...p, status: 'stocked' } : p))
  }

  async function handleRemove(id) {
    if (!window.confirm('Remove this product from your store? It will be hidden from patrons.')) return
    await productService.updateProduct(id, { isActive: false })
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  async function handleSaleConfirm(id) {
    const price = parseFloat(salePrice)
    if (isNaN(price) || price <= 0) return
    setSaleSubmitting(true)
    try {
      await productService.promoteProduct(id, { salePrice: price })
      setProducts(prev => prev.map(p => p._id === id ? { ...p, status: 'on_sale', salePrice: price } : p))
      setSaleFormId(null)
      setSalePrice('')
    } finally {
      setSaleSubmitting(false)
    }
  }

  const visible = products.filter(p => {
    if (tab === 'stocked' && p.status !== 'stocked') return false
    if (tab === 'on_sale' && p.status !== 'on_sale') return false
    const q = search.toLowerCase()
    if (!q) return true
    return (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q)
  })

  if (loading) return <div className={styles.loading}><span className={styles.spinner} /></div>

  return (
    <div className={styles.container}>
      <div className={styles.header}><h2>Inventory</h2></div>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          className={styles.searchInput}
          placeholder="Search by name or brand…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
      </div>

      <div className={styles.tabs}>
        {[['all', 'All'], ['stocked', 'In Store'], ['on_sale', 'On Sale']].map(([val, label]) => (
          <button
            key={val}
            className={`${styles.tab} ${tab === val ? styles.tabActive : ''}`}
            onClick={() => setTab(val)}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>
          {products.length === 0
            ? 'No products yet. Approve patron requests in Products to start building your inventory.'
            : 'No products match your current filter.'}
        </p>
      ) : (
        <div className={styles.list}>
          {visible.map(p => (
            <div key={p._id}>
              <div className={styles.row}>
                {p.image
                  ? <img src={p.image} alt={p.name} className={styles.thumb} onError={e => e.target.style.display = 'none'} />
                  : <div className={styles.thumbPlaceholder}><span>{(p.name || '?')[0].toUpperCase()}</span></div>
                }
                <div className={styles.info}>
                  <span className={styles.name}>{p.name}</span>
                  {p.brand && <span className={styles.brand}>{p.brand}</span>}
                </div>
                <div className={styles.priceCol}>
                  {p.status === 'on_sale' && p.salePrice != null ? (
                    <>
                      {p.price > 0 && <span className={styles.origPrice}>${Number(p.price).toFixed(2)}</span>}
                      <span className={styles.saleAmt}>${Number(p.salePrice).toFixed(2)}</span>
                    </>
                  ) : p.price > 0 ? `$${Number(p.price).toFixed(2)}` : '—'}
                </div>
                <div className={styles.badgeCol}>
                  <span className={`${styles.badge} ${styles[STATUS_CLASS[p.status] || 'badgePending']}`}>
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                </div>
                <div className={styles.actions}>
                  {p.status === 'stocked' && (
                    <>
                      <button
                        className={styles.onSaleBtn}
                        onClick={() => { setSaleFormId(saleFormId === p._id ? null : p._id); setSalePrice('') }}
                      >
                        Mark On Sale
                      </button>
                      <button className={styles.removeBtn} onClick={() => handleRemove(p._id)}>
                        Remove
                      </button>
                    </>
                  )}
                  {p.status === 'on_sale' && (
                    <>
                      <button className={styles.endSaleBtn} onClick={() => handleEndSale(p._id)}>
                        End Sale
                      </button>
                      <button className={styles.removeBtn} onClick={() => handleRemove(p._id)}>
                        Remove
                      </button>
                    </>
                  )}
                  {p.status === 'approved' && (
                    <button className={styles.inStoreBtn} onClick={() => handleMarkInStore(p._id)}>
                      Mark In Store
                    </button>
                  )}
                </div>
              </div>

              {saleFormId === p._id && (
                <div className={styles.saleForm}>
                  <input
                    type="number"
                    className={styles.saleInput}
                    placeholder="Sale price"
                    value={salePrice}
                    min="0"
                    step="0.01"
                    onChange={e => setSalePrice(e.target.value)}
                    autoFocus
                  />
                  <button
                    className={styles.saleConfirmBtn}
                    onClick={() => handleSaleConfirm(p._id)}
                    disabled={saleSubmitting || !salePrice}
                  >
                    {saleSubmitting ? 'Saving…' : 'Confirm'}
                  </button>
                  <button
                    className={styles.saleCancelBtn}
                    onClick={() => { setSaleFormId(null); setSalePrice('') }}
                    disabled={saleSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
