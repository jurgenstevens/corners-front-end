import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authService from '../../services/authService'
import styles from './Signup.module.css'
import { redirectByRole } from '../../utils/redirectByRole'

export default function Signup({ setUser }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', photo: '',
    role: 'patron',
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
    if (formData.role === 'patron' && !formData.zip) {
      return setError('Zip code is required for patrons.')
    }
    if (formData.role === 'business' && !formData.businessType) {
      return setError('Business type is required.')
    }
    try {
      const user = await authService.signup(formData)
      setUser(user)
      navigate(redirectByRole(user))
    } catch (err) {
      setError(err.message || 'Signup failed')
    }
  }

  return (
    <div className={styles.container}>
      <h2>Create Account</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Role
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="patron">Patron</option>
            <option value="business">Business Owner</option>
          </select>
        </label>
        <label>Name
          <input name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label>Email
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <label>Password
          <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
        </label>
        <label>Photo URL (optional)
          <input name="photo" value={formData.photo} onChange={handleChange} />
        </label>

        {formData.role === 'patron' && (
          <>
            <label>Zip Code *
              <input name="zip" value={formData.zip} onChange={handleChange} maxLength={10} required />
            </label>
            <label>City
              <input name="city" value={formData.city} onChange={handleChange} />
            </label>
            <label>State
              <input name="state" value={formData.state} onChange={handleChange} maxLength={2} />
            </label>
          </>
        )}

        {formData.role === 'business' && (
          <>
            <label>Business Type *
              <select name="businessType" value={formData.businessType} onChange={handleChange} required>
                <option value="">Select a type…</option>
                {['Convenience Store','Mini Mart','Hardware Store','Pharmacy','Grocery','Skate Shop',
                  'Clothing Boutique','Coffee Shop','Bakery','Auto Parts','Electronics','Pet Store',
                  'Book Store','Toy Store','Sporting Goods'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>Visibility
              <select name="visibility" value={formData.visibility} onChange={handleChange}>
                <option value="public">Public (auto-approve patrons)</option>
                <option value="private">Private (approve manually)</option>
              </select>
            </label>
          </>
        )}

        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/auth/login">Log in</Link></p>
    </div>
  )
}
