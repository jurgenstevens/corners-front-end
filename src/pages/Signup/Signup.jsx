import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
  const [searchParams] = useSearchParams()
  const initialRole = ['Patron', 'Business', 'Distributor'].includes(searchParams.get('role'))
    ? searchParams.get('role')
    : 'Patron'
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', photo: '',
    role: initialRole,
    zip: '', city: '', state: '',
    businessType: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (formData.password !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    if (formData.role === 'Patron' && !formData.zip) {
      return setError('Zip code is required for patrons.')
    }
    if (formData.role === 'Patron' && !formData.state) {
      return setError('State is required.')
    }
    if (formData.role === 'Business' && !formData.businessType) {
      return setError('Business type is required.')
    }
    try {
      const user = await authService.signup(formData)
      if (user.err) return setError(user.err)
      handleAuthEvt(user)
      if (formData.role === 'Business') {
        navigate('/dashboard/business/setup')
      } else {
        redirectByRole(user, navigate)
      }
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
          <div className={styles.passwordWrap}>
            <input
              type={showPw ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPw(p => !p)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <label className={styles.fieldLabel}>Confirm Password
          <div className={styles.passwordWrap}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={styles.input}
              placeholder="Re-enter password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowConfirm(p => !p)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? 'Hide' : 'Show'}
            </button>
          </div>
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
            <label className={styles.fieldLabel}>State *
              <select name="state" value={formData.state} onChange={handleChange} required className={styles.input}>
                <option value="">Select state…</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </>
        )}

        {formData.role === 'Business' && (
          <label className={styles.fieldLabel}>Business Type *
            <select name="businessType" value={formData.businessType} onChange={handleChange} required className={styles.input}>
              <option value="">Select a type…</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        )}

        <button type="submit" className={styles.submitBtn}>Sign Up</button>
      </form>

      <p className={styles.loginLink}>
        Already have an account? <Link to="/auth/login">Log in</Link>
      </p>
    </div>
  )
}