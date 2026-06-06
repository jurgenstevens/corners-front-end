import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authService from '../../services/authService'
import styles from './Signup.module.css'
import { redirectByRole } from '../../utils/redirectByRole'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

const BUSINESS_TYPES = [
  'Convenience Store','Mini Mart','Hardware Store','Pharmacy','Grocery',
  'Skate Shop','Clothing Boutique','Coffee Shop','Bakery','Auto Parts',
  'Electronics','Pet Store','Book Store','Toy Store','Sporting Goods'
]

export default function Signup({ handleAuthEvt }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', photo: '',
    role: 'Patron',
    zip: '', city: '', state: '',
    businessType: '', visibility: 'public',
  })
  const [error, setError] = useState('')

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (formData.role === 'Patron' && !formData.zip) {
      return setError('Zip code is required for patrons.')
    }
    if (formData.role === 'Business' && !formData.businessType) {
      return setError('Business type is required.')
    }
    try {
      const user = await authService.signup(formData)
      if (user.err) return setError(user.err)
      handleAuthEvt(user)
      navigate(redirectByRole(user))
    } catch (err) {
      setError(err.message || 'Signup failed')
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Create Account</h2>

      {error && <p className={styles.message}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.fieldLabel}>Role
          <select name="role" value={formData.role} onChange={handleChange} className={styles.input}>
            <option value="Patron">Patron</option>
            <option value="Business">Business Owner</option>
            <option value="Distributor">Distributor</option>
          </select>
        </label>

        <label className={styles.fieldLabel}>Name
          <input name="name" value={formData.name} onChange={handleChange} required className={styles.input} />
        </label>

        <label className={styles.fieldLabel}>Email
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className={styles.input} />
        </label>

        <label className={styles.fieldLabel}>Password
          <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className={styles.input} />
        </label>

        <label className={styles.fieldLabel}>Photo URL <span className={styles.optional}>(optional)</span>
          <input name="photo" value={formData.photo} onChange={handleChange} className={styles.input} />
        </label>

        {formData.role === 'Patron' && (
          <>
            <label className={styles.fieldLabel}>Zip Code *
              <input name="zip" value={formData.zip} onChange={handleChange} maxLength={10} required className={styles.input} />
            </label>
            <label className={styles.fieldLabel}>City
              <input name="city" value={formData.city} onChange={handleChange} className={styles.input} />
            </label>
            <label className={styles.fieldLabel}>State
              <select name="state" value={formData.state} onChange={handleChange} className={styles.input}>
                <option value="">Select state…</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </>
        )}

        {formData.role === 'Business' && (
          <>
            <label className={styles.fieldLabel}>Business Type *
              <select name="businessType" value={formData.businessType} onChange={handleChange} required className={styles.input}>
                <option value="">Select a type…</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className={styles.fieldLabel}>Visibility
              <select name="visibility" value={formData.visibility} onChange={handleChange} className={styles.input}>
                <option value="public">Public (auto-approve patrons)</option>
                <option value="private">Private (approve manually)</option>
              </select>
            </label>
          </>
        )}

        <button type="submit" className={styles.submitBtn}>Sign Up</button>
      </form>

      <p className={styles.loginLink}>
        Already have an account? <Link to="/auth/login">Log in</Link>
      </p>
    </div>
  )
}
