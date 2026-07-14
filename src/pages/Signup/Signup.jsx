import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import * as authService from '../../services/authService'
import * as distributorService from '../../services/distributorService'
import ImageUpload from '../../components/ImageUpload/ImageUpload'
import styles from './Signup.module.css'
import { redirectByRole } from '../../utils/redirectByRole'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

const CATEGORIES = ['Beverages', 'Snacks', 'Dairy', 'Bakery', 'Meat', 'Produce', 'Frozen', 'Dry Goods', 'Tobacco', 'Alcohol', 'Other']

const BUSINESS_TYPES = [
  'Convenience Store','Mini Mart','Hardware Store','Pharmacy','Grocery',
  'Skate Shop','Clothing Boutique','Coffee Shop','Bakery','Auto Parts',
  'Electronics','Pet Store','Book Store','Toy Store','Sporting Goods'
]

const TERMS_TEXT = `CORNERS — TERMS AND CONDITIONS
Last updated: June 2026

Please read these Terms and Conditions ("Terms") carefully before creating an account on the Corners platform ("Service"). By checking the box and creating an account, you agree to be bound by these Terms.

1. ACCEPTANCE OF TERMS
By registering for and using the Service, you confirm that you are at least 18 years of age and that you have read, understood, and agree to these Terms in full.

2. DATA COLLECTION AND USE
By using the Service, you acknowledge and agree that:

a. Corners collects information you provide during registration and through your use of the platform, including but not limited to your name, email address, location data, product preferences, votes, and purchase-related activity.

b. This data may be shared with and used by connected store owners and businesses on the platform for the purposes of inventory planning, product demand analysis, customer preference research, and business analytics.

c. Aggregated and anonymized usage data may be used by Corners internally to improve the platform, develop new features, and generate market insights.

d. You grant Corners and its affiliated businesses a non-exclusive, royalty-free license to use your submitted data for the purposes described above.

3. ACCOUNT TERMINATION AND DATA DELETION
Corners reserves the right, at its sole discretion, to:

a. Suspend or permanently terminate your account at any time, with or without notice, for conduct that Corners believes violates these Terms, is harmful to other users, businesses, or third parties, or for any other reason Corners deems appropriate.

b. Delete your account and all associated data from our systems upon termination, whether initiated by you or by Corners.

c. Remove any content, product requests, votes, or other submissions you have made to the platform.

You may request deletion of your account at any time by contacting Corners through the platform settings. Upon verified request, your personal data will be deleted within 30 days, except where retention is required by applicable law.

4. USER CONDUCT
You agree not to use the Service to submit false, misleading, or fraudulent information; to harass, abuse, or harm other users or businesses; or to violate any applicable local, state, or federal law.

5. INTELLECTUAL PROPERTY
All content, design, and software comprising the Corners platform is the property of Corners and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.

6. DISCLAIMER OF WARRANTIES
The Service is provided "as is" without warranties of any kind, express or implied. Corners does not warrant that the Service will be uninterrupted, error-free, or free of harmful components.

7. LIMITATION OF LIABILITY
To the fullest extent permitted by law, Corners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service.

8. CHANGES TO TERMS
Corners reserves the right to modify these Terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms.

9. GOVERNING LAW
These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.

10. CONTACT
For questions about these Terms, please contact us through the platform.`

const PRIVACY_TEXT = `PRIVACY POLICY — CORNERS

Effective date: July 2026
Last updated: July 2026

Corners ("we", "our", or "us") operates a neighborhood marketplace platform connecting patrons, local businesses, and distributors. This Privacy Policy explains what information we collect, how we use it, who we share it with, and your rights regarding your data.

1. INFORMATION WE COLLECT

Account information: When you create an account we collect your name, email address, and password (stored as a bcrypt hash — we never store your plain-text password).

Location information: Patrons provide a zip code, city, and state at signup. Businesses provide a full address including street, city, state, and zip code. This information is used to match patrons with nearby businesses.

Profile photo: If you upload a profile or product photo, it is stored with Cloudinary, Inc. (cloudinary.com). We store the URL of your photo, not the file itself.

Product requests and votes: When you submit a product request or vote on a product, we store the content of that request and your vote, associated with your account.

Messages: Messages sent between patrons and businesses are stored in our database and visible to both parties in the conversation.

Usage data: We collect standard server logs including IP address, browser type, and pages visited. We use this for security and debugging purposes only.

Payment information: We do not store your credit or debit card information. Payments are processed by Stripe, Inc. (stripe.com). Stripe's privacy policy governs how your payment data is handled.

2. HOW WE USE YOUR INFORMATION

We use your information to:
- Create and manage your account
- Match patrons with nearby businesses based on zip code
- Send you notifications about product requests, approvals, and store activity
- Send weekly email digests (you may opt out at any time in your settings)
- Detect and prevent fraud, abuse, and spam
- Improve the platform

We do not sell your personal information to third parties. We do not use your data for advertising by external companies.

3. WHO WE SHARE YOUR INFORMATION WITH

Service providers who process data on our behalf:
- MongoDB Atlas (database hosting) — mongodb.com
- Cloudinary, Inc. (image storage) — cloudinary.com
- Stripe, Inc. (payment processing) — stripe.com
- Render (backend hosting) — render.com
- Netlify (frontend hosting) — netlify.com
- Anthropic, PBC (AI-powered PDF parsing for distributors) — anthropic.com
- Resend or SendGrid (email delivery)

We share only the minimum information necessary for each provider to perform their service. We do not share your data with data brokers, advertisers, or marketing companies.

Business visibility: When a patron connects to a business, the patron's name and profile photo are visible to that business. Businesses' names, addresses, and product catalogs are visible to connected patrons.

Legal requirements: We may disclose your information if required by law, court order, or to protect the rights and safety of Corners users.

4. DATA RETENTION

Notifications are automatically deleted after 14 days. Account data is retained until you request deletion. Billing records are retained per Stripe's data retention policy. Product requests and votes are retained as long as your account is active.

5. YOUR RIGHTS

You have the right to:
- Access the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your account and associated data
- Opt out of email communications at any time

To exercise any of these rights, contact us through the platform or at the email address on file with your account.

6. CHILDREN

Corners is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, please contact us and we will delete it promptly.

7. CALIFORNIA RESIDENTS (CCPA)

If you are a California resident, you have additional rights under the California Consumer Privacy Act, including the right to know what personal information we collect, the right to delete it, and the right to opt out of its sale. We do not sell personal information. To exercise your CCPA rights, contact us through the platform.

8. SECURITY

We use industry-standard security practices including HTTPS encryption, bcrypt password hashing, and JWT-based authentication. No method of transmission over the Internet is 100% secure. In the event of a data breach that affects your personal information, we will notify you as required by applicable law.

9. CHANGES TO THIS POLICY

We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top and, for material changes, notify you via email or an in-app notice.

10. CONTACT

For questions about this Privacy Policy or your personal data, contact us through the Corners platform.`

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
    ownerName: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [distributorCompanyName, setDistributorCompanyName] = useState('')
  const [distributorRegions, setDistributorRegions] = useState('')
  const [distributorCategories, setDistributorCategories] = useState([])
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [error, setError] = useState('')

  function toggleDistributorCategory(cat) {
    setDistributorCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function validatePasswordComplexity(pw) {
    if (pw.length < 8) return 'Password must be at least 8 characters.'
    if (!/[A-Z]/.test(pw)) return 'Password must include at least one uppercase letter.'
    if (!/[0-9]/.test(pw)) return 'Password must include at least one number.'
    if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must include at least one special character (e.g. !@#$%).'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!agreedToTerms) {
      return setError('You must agree to the Terms and Conditions and Privacy Policy to create an account.')
    }
    if (formData.password !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    const pwErr = validatePasswordComplexity(formData.password)
    if (pwErr) return setError(pwErr)
    if (formData.role === 'Patron' && !formData.zip) {
      return setError('Zip code is required for patrons.')
    }
    if (formData.role === 'Patron' && !formData.state) {
      return setError('State is required.')
    }
    if (formData.role === 'Business' && !formData.ownerName.trim()) {
      return setError('Business owner name is required.')
    }
    if (formData.role === 'Business' && !formData.businessType) {
      return setError('Business type is required.')
    }
    if (formData.role === 'Distributor' && !distributorCompanyName.trim()) {
      return setError('Company name is required for distributors.')
    }
    try {
      const user = await authService.signup(formData)
      if (user.err) return setError(user.err)
      handleAuthEvt(user)
      if (formData.role === 'Distributor') {
        const serviceRegions = distributorRegions.split(',').map(s => s.trim()).filter(Boolean)
        await distributorService.updateDistributor({
          companyName: distributorCompanyName.trim(),
          serviceRegions,
          categories: distributorCategories,
        })
        redirectByRole(user, navigate)
      } else if (formData.role === 'Business') {
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
            {/* <option value="Distributor">Distributor</option> — hidden until distributor launch */}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          {formData.role === 'Business' ? 'Business Name' : 'Name'}
          <input name="name" value={formData.name} onChange={handleChange} required className={styles.input} />
        </label>

        {formData.role === 'Business' && (
          <label className={styles.fieldLabel}>Business Owner Name
            <input
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
              placeholder="Your full name"
              className={styles.input}
            />
          </label>
        )}

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
              minLength={8}
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
          <ul className={styles.requirementsList}>
            <li className={formData.password.length >= 8 ? styles.requirementMet : styles.requirement}>Min 8 characters</li>
            <li className={/[A-Z]/.test(formData.password) ? styles.requirementMet : styles.requirement}>1 uppercase letter</li>
            <li className={/[0-9]/.test(formData.password) ? styles.requirementMet : styles.requirement}>1 number</li>
            <li className={/[^A-Za-z0-9]/.test(formData.password) ? styles.requirementMet : styles.requirement}>1 special character</li>
          </ul>
        </label>

        <label className={styles.fieldLabel}>Confirm Password
          <div className={styles.passwordWrap}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={8}
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

        <ImageUpload
          value={formData.photo}
          onChange={(url) => setFormData(d => ({ ...d, photo: url }))}
          label="Profile photo (optional)"
        />

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

        {formData.role === 'Distributor' && (
          <>
            <label className={styles.fieldLabel}>Company Name *
              <input
                className={styles.input}
                type="text"
                value={distributorCompanyName}
                onChange={e => setDistributorCompanyName(e.target.value)}
                placeholder="Your company name"
              />
            </label>
            <label className={styles.fieldLabel}>
              Service Zip Codes <span className={styles.optional}>(comma-separated)</span>
              <input
                className={styles.input}
                type="text"
                value={distributorRegions}
                onChange={e => setDistributorRegions(e.target.value)}
                placeholder="60609, 60616, 60632…"
              />
            </label>
            <div className={styles.catSection}>
              <p className={styles.catLabel}>Categories You Carry</p>
              <div className={styles.catGrid}>
                {CATEGORIES.map(cat => (
                  <label key={cat} className={styles.catRow}>
                    <input
                      type="checkbox"
                      className={styles.catCheckboxInput}
                      checked={distributorCategories.includes(cat)}
                      onChange={() => toggleDistributorCategory(cat)}
                    />
                    <span className={styles.catCheckboxCustom} />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <div className={styles.termsRow}>
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className={styles.termsCheckbox}
          />
          <span onClick={() => setAgreedToTerms(t => !t)}>
            I agree to the{' '}
            <button
              type="button"
              className={styles.termsLink}
              onClick={e => { e.stopPropagation(); setShowTerms(true) }}
            >
              Terms and Conditions
            </button>
            {' '}and{' '}
            <button
              type="button"
              className={styles.termsLink}
              onClick={e => { e.stopPropagation(); setShowPrivacy(true) }}
            >
              Privacy Policy
            </button>
          </span>
        </div>

        <button type="submit" className={styles.submitBtn}>Sign Up</button>
      </form>

      <p className={styles.loginLink}>
        Already have an account? <Link to="/auth/login">Log in</Link>
      </p>

      {/* ── Terms modal ── */}
      {showTerms && (
        <div className={styles.overlay} onClick={() => setShowTerms(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Terms and Conditions</h3>
              <button className={styles.closeBtn} onClick={() => setShowTerms(false)}>✕</button>
            </div>
            <pre className={styles.termsBody}>{TERMS_TEXT}</pre>
            <div className={styles.modalFooter}>
              <button
                className={styles.agreeBtn}
                onClick={() => { setAgreedToTerms(true); setShowTerms(false) }}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Policy modal ── */}
      {showPrivacy && (
        <div className={styles.overlay} onClick={() => setShowPrivacy(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Privacy Policy</h3>
              <button className={styles.closeBtn} onClick={() => setShowPrivacy(false)}>✕</button>
            </div>
            <pre className={styles.termsBody}>{PRIVACY_TEXT}</pre>
            <div className={styles.modalFooter}>
              <button
                className={styles.agreeBtn}
                onClick={() => { setAgreedToTerms(true); setShowPrivacy(false) }}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

