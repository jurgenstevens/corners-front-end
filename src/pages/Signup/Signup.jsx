import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authService from '../../services/authService'
import styles from './Signup.module.css'

const ROLE_OPTIONS = ['Patron', 'Business', 'Distributor']

const Signup = ({ handleAuthEvt }) => {
  const navigate = useNavigate()
  const imgInputRef = useRef(null)

  const [message, setMessage] = useState('')
  const [role, setRole] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConf: '',
    businessName: '',
    distributorCompany: '',
  })

  const [photoData, setPhotoData] = useState({ photo: null })

  const handleChange = evt => {
    setMessage('')
    setFormData({ ...formData, [evt.target.name]: evt.target.value })
  }

  const handleRoleSelect = selectedRole => {
    setRole(selectedRole)
  }

  const handleChangePhoto = evt => {
    const file = evt.target.files[0]
    if (!file) return

    const validFormats = ['gif', 'jpeg', 'jpg', 'png', 'svg', 'webp']
    const photoFormat = file.name.split('.').at(-1)

    if (file.size >= 10485760) {
      setMessage('Image must be smaller than 10.4MB')
      imgInputRef.current.value = null
      return
    }

    if (!validFormats.includes(photoFormat)) {
      setMessage('Invalid image format')
      imgInputRef.current.value = null
      return
    }

    setPhotoData({ photo: file })
  }

  const handleSubmit = async evt => {
    evt.preventDefault()
    try {
      setIsSubmitted(true)

      await authService.signup(
        { ...formData, role },
        photoData.photo
      )

      handleAuthEvt()
      navigate('/')
    } catch (err) {
      console.log(err)
      setMessage(err.message)
      setIsSubmitted(false)
    }
  }

  const {
    name,
    email,
    password,
    passwordConf,
    businessName,
    distributorCompany,
  } = formData

  const isFormInvalid = () => {
    if (!(name && email && password && password === passwordConf && role)) {
      return true
    }

    if (role === 'business' && !businessName) return true
    if (role === 'distributor' && !distributorCompany) return true

    return false
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.header}>Sign Up</h1>

      {message && <p className={styles.message}>{message}</p>}

      {!role && (
        <div className={styles.rolePicker}>
          {ROLE_OPTIONS.map(r => (
            <button
              key={r}
              className={styles.roleButton}
              onClick={() => handleRoleSelect(r)}
            >
              Sign Up As {r}
            </button>
          ))}
        </div>
      )}

      {role && (
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          <p className={styles.roleLabel}>
            Role: <strong>{role}</strong>
          </p>

          <input
            className={styles.input}
            placeholder="Full Name"
            name="name"
            value={name}
            onChange={handleChange}
          />

          <input
            className={styles.input}
            placeholder="Email"
            name="email"
            value={email}
            onChange={handleChange}
          />

          <input
            className={styles.input}
            placeholder="Password"
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
          />

          <input
            className={styles.input}
            placeholder="Confirm Password"
            type="password"
            name="passwordConf"
            value={passwordConf}
            onChange={handleChange}
          />

          {/* Role-specific fields */}
          {role === 'business' && (
            <input
              className={styles.input}
              placeholder="Business Name"
              name="businessName"
              value={businessName}
              onChange={handleChange}
            />
          )}

          {role === 'distributor' && (
            <input
              className={styles.input}
              placeholder="Distributor Company"
              name="distributorCompany"
              value={distributorCompany}
              onChange={handleChange}
            />
          )}

          <input
            ref={imgInputRef}
            className={styles.fileInput}
            type="file"
            name="photo"
            onChange={handleChangePhoto}
          />

          <button
            className={styles.button}
            disabled={isFormInvalid() || isSubmitted}
          >
            {!isSubmitted ? 'Create Account' : '🚀 Sending...'}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setRole(null)}
          >
            Change Role
          </button>

          <Link to="/" className={styles.link}>
            Cancel
          </Link>
        </form>
      )}
    </main>
  )
}

export default Signup
