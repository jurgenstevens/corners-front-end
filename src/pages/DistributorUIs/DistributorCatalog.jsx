import { useState, useEffect, useRef } from 'react'
import * as distributorService from '../../services/distributorService'
import styles from './DistributorCatalog.module.css'

const CATEGORIES = ['Beverages', 'Snacks', 'Dairy', 'Bakery', 'Meat', 'Produce', 'Frozen', 'Dry Goods', 'Tobacco', 'Alcohol', 'Other']

const BLANK_FORM = { name: '', brand: '', category: 'Other', description: '', unitSize: '', pricePerCase: '', minOrderQty: 1 }

export default function DistributorCatalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  const [pdfFile, setPdfFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const fileInputRef = useRef(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState(BLANK_FORM)
  const [addError, setAddError] = useState('')
  const [addSaving, setAddSaving] = useState(false)

  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState(BLANK_FORM)
  const [editError, setEditError] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  async function load() {
    const data = await distributorService.getMyCatalog()
    if (Array.isArray(data)) setProducts(data)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function handleUpload() {
    if (!pdfFile) return
    setUploading(true)
    setUploadResult(null)
    try {
      const result = await distributorService.uploadCatalogPDF(pdfFile)
      if (result.err) {
        setUploadResult({ err: result.err })
      } else {
        setUploadResult({ count: result.products?.length || 0 })
        setPdfFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        load()
      }
    } catch {
      setUploadResult({ err: 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  function startEdit(p) {
    setEditId(p._id)
    setEditForm({
      name: p.name || '',
      brand: p.brand || '',
      category: p.category || 'Other',
      description: p.description || '',
      unitSize: p.unitSize || '',
      pricePerCase: p.pricePerCase ?? '',
      minOrderQty: p.minOrderQty ?? 1,
    })
    setEditError('')
    setShowAddForm(false)
  }

  async function handleSaveEdit(productId) {
    setEditError('')
    setEditSaving(true)
    try {
      const result = await distributorService.updateProduct(productId, {
        ...editForm,
        pricePerCase: editForm.pricePerCase !== '' ? Number(editForm.pricePerCase) : undefined,
        minOrderQty: Number(editForm.minOrderQty) || 1,
      })
      if (result.err) { setEditError(result.err); return }
      setEditId(null)
      load()
    } catch {
      setEditError('Save failed. Please try again.')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDeactivate(productId) {
    await distributorService.deleteProduct(productId)
    setProducts(prev => prev.filter(p => p._id !== productId))
  }

  async function handleAddProduct() {
    setAddError('')
    if (!addForm.name.trim()) { setAddError('Name is required.'); return }
    if (addForm.pricePerCase === '' || isNaN(Number(addForm.pricePerCase))) {
      setAddError('Price per case is required.')
      return
    }
    setAddSaving(true)
    try {
      const result = await distributorService.createProduct({
        ...addForm,
        pricePerCase: Number(addForm.pricePerCase),
        minOrderQty: Number(addForm.minOrderQty) || 1,
      })
      if (result.err) { setAddError(result.err); return }
      setShowAddForm(false)
      setAddForm(BLANK_FORM)
      load()
    } catch {
      setAddError('Failed to add product.')
    } finally {
      setAddSaving(false)
    }
  }

  const categories = ['All', ...new Set(products.map(p => p.category))]
  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)

  return (
    <div className={styles.container}>

      {/* ── PDF Upload ── */}
      <section className={styles.uploadSection}>
        <h3 className={styles.sectionTitle}>Upload Catalog PDF</h3>
        <p className={styles.sectionSub}>Upload a distributor price sheet PDF. Our AI will extract your products automatically.</p>
        <div className={styles.dropZone}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className={styles.fileInput}
            id="pdfUpload"
            onChange={e => { setPdfFile(e.target.files[0] || null); setUploadResult(null) }}
          />
          <label htmlFor="pdfUpload" className={styles.fileLabel}>
            {pdfFile ? pdfFile.name : 'Choose a PDF file…'}
          </label>
          <button
            className={styles.uploadBtn}
            onClick={handleUpload}
            disabled={!pdfFile || uploading}
          >
            {uploading ? 'Parsing with AI…' : 'Upload & Parse'}
          </button>
        </div>
        {uploading && <p className={styles.uploadingMsg}>⏳ Parsing catalog with AI…</p>}
        {uploadResult?.count != null && (
          <p className={styles.uploadSuccess}>✓ Imported {uploadResult.count} product{uploadResult.count !== 1 ? 's' : ''}</p>
        )}
        {uploadResult?.err && <p className={styles.uploadError}>{uploadResult.err}</p>}
      </section>

      {/* ── Catalog List ── */}
      <section className={styles.catalogSection}>
        <div className={styles.catalogHeader}>
          <h3 className={styles.sectionTitle}>My Products ({products.length})</h3>
          <button
            className={styles.addBtn}
            onClick={() => { setShowAddForm(s => !s); setAddForm(BLANK_FORM); setAddError(''); setEditId(null) }}
          >
            {showAddForm ? 'Cancel' : '+ Add Manually'}
          </button>
        </div>

        {showAddForm && (
          <div className={styles.inlineForm}>
            <h4 className={styles.formTitle}>New Product</h4>
            <div className={styles.formGrid}>
              <input className={styles.input} placeholder="Name *" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
              <input className={styles.input} placeholder="Brand" value={addForm.brand} onChange={e => setAddForm(f => ({ ...f, brand: e.target.value }))} />
              <select className={styles.input} value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className={styles.input} placeholder="Unit size (e.g. 12 × 16oz)" value={addForm.unitSize} onChange={e => setAddForm(f => ({ ...f, unitSize: e.target.value }))} />
              <input className={styles.input} type="number" placeholder="Price per case *" min="0" step="0.01" value={addForm.pricePerCase} onChange={e => setAddForm(f => ({ ...f, pricePerCase: e.target.value }))} />
              <input className={styles.input} type="number" placeholder="Min order qty" min="1" value={addForm.minOrderQty} onChange={e => setAddForm(f => ({ ...f, minOrderQty: e.target.value }))} />
            </div>
            <input className={styles.input} placeholder="Description" value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
            {addError && <p className={styles.formError}>{addError}</p>}
            <button className={styles.saveBtn} onClick={handleAddProduct} disabled={addSaving}>
              {addSaving ? 'Saving…' : 'Add Product'}
            </button>
          </div>
        )}

        {categories.length > 1 && (
          <div className={styles.categoryFilter}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading && <p className={styles.loadingMsg}>Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>No products yet. Upload a PDF or add products manually.</p>
        )}

        <div className={styles.productList}>
          {filtered.map(p => (
            <div key={p._id} className={styles.productRow}>
              {editId === p._id ? (
                <div className={styles.inlineForm}>
                  <div className={styles.formGrid}>
                    <input className={styles.input} placeholder="Name *" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                    <input className={styles.input} placeholder="Brand" value={editForm.brand} onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))} />
                    <select className={styles.input} value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input className={styles.input} placeholder="Unit size" value={editForm.unitSize} onChange={e => setEditForm(f => ({ ...f, unitSize: e.target.value }))} />
                    <input className={styles.input} type="number" placeholder="Price per case" min="0" step="0.01" value={editForm.pricePerCase} onChange={e => setEditForm(f => ({ ...f, pricePerCase: e.target.value }))} />
                    <input className={styles.input} type="number" placeholder="Min order qty" min="1" value={editForm.minOrderQty} onChange={e => setEditForm(f => ({ ...f, minOrderQty: e.target.value }))} />
                  </div>
                  <input className={styles.input} placeholder="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                  {editError && <p className={styles.formError}>{editError}</p>}
                  <div className={styles.formActions}>
                    <button className={styles.cancelSmBtn} onClick={() => setEditId(null)} disabled={editSaving}>Cancel</button>
                    <button className={styles.saveBtn} onClick={() => handleSaveEdit(p._id)} disabled={editSaving}>
                      {editSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.productInfo}>
                  <div className={styles.productMain}>
                    <span className={styles.productName}>{p.name}</span>
                    {p.brand && <span className={styles.productBrand}>{p.brand}</span>}
                    <span className={styles.catChip}>{p.category}</span>
                  </div>
                  <div className={styles.productMeta}>
                    {p.unitSize && <span>{p.unitSize}</span>}
                    {p.pricePerCase != null && <span className={styles.productPrice}>${p.pricePerCase.toFixed(2)}/case</span>}
                    {p.minOrderQty > 1 && <span className={styles.minQty}>min {p.minOrderQty}</span>}
                  </div>
                  <div className={styles.productActions}>
                    <button className={styles.editSmBtn} onClick={() => startEdit(p)}>Edit</button>
                    <button className={styles.deactivateBtn} onClick={() => handleDeactivate(p._id)}>Deactivate</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
