import { useState, useEffect } from 'react'
import styles from './PatronProducts.module.css'
import * as productService from '../../../services/productService'
import * as requestService from '../../../services/requestService'

const PatronProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requestedIds, setRequestedIds] = useState(new Set())
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customForm, setCustomForm] = useState({ productName: '', brand: '' })
  const [submitMsg, setSubmitMsg] = useState('')

  useEffect(() => {
    productService.getAllProducts()
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleRequest(product) {
    if (requestedIds.has(product._id)) return
    try {
      await requestService.createRequest({
        productName: product.name,
        brand: product.brand,
        business: product.business?._id || product.business,
      })
      setRequestedIds(prev => new Set([...prev, product._id]))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCustomRequest(e) {
    e.preventDefault()
    try {
      await requestService.createRequest(customForm)
      setSubmitMsg('Request submitted!')
      setCustomForm({ productName: '', brand: '' })
      setShowCustomForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading products...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2>Browse Products</h2>
          <button className={styles.customBtn} onClick={() => setShowCustomForm(!showCustomForm)}>
            + Request
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {submitMsg && <p className={styles.success}>{submitMsg}</p>}

        {showCustomForm && (
          <form className={styles.form} onSubmit={handleCustomRequest}>
            <h4>Can't find what you're looking for?</h4>
            <input
              placeholder="Product name *"
              value={customForm.productName}
              onChange={e => setCustomForm({ ...customForm, productName: e.target.value })}
              required
            />
            <input
              placeholder="Brand (optional)"
              value={customForm.brand}
              onChange={e => setCustomForm({ ...customForm, brand: e.target.value })}
            />
            <button type="submit">Submit Request</button>
          </form>
        )}

        {products.length === 0
          ? <p className={styles.empty}>No products available yet.</p>
          : (
            <div className={styles.list}>
              {products.map(product => (
                <div key={product._id} className={styles.card}>
                  {product.image
                    ? <img src={product.image} alt={product.name} className={styles.productImage} />
                    : <div className={styles.imagePlaceholder} />
                  }
                  <div className={styles.info}>
                    <h4>{product.name}</h4>
                    {product.brand && <p className={styles.brand}>{product.brand}</p>}
                    <p className={styles.price}>${Number(product.price).toFixed(2)}</p>
                    {product.business?.name && <p className={styles.store}>@ {product.business.name}</p>}
                  </div>
                  <button
                    className={`${styles.requestBtn} ${requestedIds.has(product._id) ? styles.requested : ''}`}
                    onClick={() => handleRequest(product)}
                    disabled={requestedIds.has(product._id)}
                  >
                    {requestedIds.has(product._id) ? 'Requested ✓' : 'Request'}
                  </button>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

export default PatronProducts