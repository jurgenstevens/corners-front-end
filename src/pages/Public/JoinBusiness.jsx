import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as connectionService from '../../services/connectionService'
import * as authService from '../../services/authService'
import styles from './JoinBusiness.module.css'

const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

export default function JoinBusiness() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const user = authService.getUser()

  const [business, setBusiness] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/api/businesses/join/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.err) setNotFound(true)
        else { setBusiness(data.business); setProfile(data.profile) }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  async function handleFollow() {
    setFollowing(true)
    const result = await connectionService.requestConnection(business._id)
    setFollowing(false)
    if (!result?.err) setFollowed(true)
  }

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>

  if (notFound) return (
    <div className={styles.center}>
      <h2>Store not found</h2>
      <p>This QR code may no longer be active.</p>
    </div>
  )

  const name = business.displayName || profile?.name || 'This store'
  const photo = profile?.photo || business.photos?.[0] || null
  const city = business.location?.city || ''

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {photo
          ? <img src={photo} alt={name} className={styles.photo} />
          : <div className={styles.photoPlaceholder}>{name[0]?.toUpperCase()}</div>
        }

        <h1 className={styles.name}>{name}</h1>
        {city && <p className={styles.city}>{city}</p>}
        {business.description && <p className={styles.description}>{business.description}</p>}

        {!user ? (
          <div className={styles.actions}>
            <h2 className={styles.cta}>Are you signing up as a patron or a business?</h2>
            <button
              className={styles.primaryBtn}
              onClick={() => navigate(`/auth/signup?role=Patron&businessSlug=${slug}`)}
            >
              Patron
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate('/auth/signup?role=Business')}
            >
              Business
            </button>
            <Link to={`/auth/login?businessSlug=${slug}`} className={styles.secondaryLink}>
              Already have an account? Log in
            </Link>
          </div>
        ) : user.authorizationLevel === 150 ? (
          <div className={styles.actions}>
            {followed ? (
              <p className={styles.success}>You're now following {name}!</p>
            ) : (
              <button className={styles.primaryBtn} onClick={handleFollow} disabled={following}>
                {following ? 'Connecting…' : 'Follow Store'}
              </button>
            )}
          </div>
        ) : (
          <div className={styles.actions}>
            <p className={styles.wrongRole}>This page is for patrons. Go to your dashboard.</p>
            <button className={styles.primaryBtn} onClick={() => navigate('/dashboard/business')}>
              Go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
