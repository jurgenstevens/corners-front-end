import { useRef, useState } from 'react'
import { CameraIcon } from '@heroicons/react/24/solid'
import * as uploadService from '../../services/uploadService'
import styles from './ImageUpload.module.css'

export default function ImageUpload({ value, onChange, label = 'Photo' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadService.uploadImage(file)
      onChange(url)
    } catch (err) {
      setError('Upload failed — try again')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className={styles.chooseBtn}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <span className={styles.spinner} /> : <CameraIcon style={{width:16,height:16,display:'inline',verticalAlign:'middle',marginRight:4}} />}{uploading ? 'Uploading…' : `Choose ${label}`}
      </button>
      {error && <p className={styles.error}>{error}</p>}
      {value && (
        <img src={value} alt="preview" className={styles.preview} />
      )}
    </div>
  )
}
