import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UsersIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  CheckIcon,
} from '@heroicons/react/24/solid'
import styles from './Landing.module.css'

const TAB_BULLETS = {
  patrons: [
    "Request products your store doesn't carry yet",
    'Vote with neighbors — when the tally fills, the store stocks it',
    "Scan a store's QR code to connect instantly",
  ],
  stores: [
    'A live queue of what locals actually want',
    'Approve a request and it becomes a stocked product',
    'Boost products to the top of the neighborhood feed',
  ],
  distributors: [
    'See demand across every store you serve',
    'Manage catalog and orders in one dashboard',
    'Grow route density block by block',
  ],
}

function DistributorsMock() {
  const dotClasses = [styles.mockDotSuccess, styles.mockDotAccent, styles.mockDotMuted]
  return (
    <div className={styles.mock}>
      <div className={styles.mockHeader}>Orders</div>
      {[0, 1, 2].map(i => (
        <div key={i} className={styles.mockRow}>
          <div className={styles.mockTexts}>
            <div className={`${styles.mockBar} ${styles.mockBarWide}`} />
            <div className={`${styles.mockBar} ${styles.mockBarNarrow}`} />
          </div>
          <div className={`${styles.mockDot} ${dotClasses[i]}`} />
        </div>
      ))}
      <div className={styles.mockFooter}>12 stores connected</div>
    </div>
  )
}

const Landing = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('patrons')

  return (
    <div className={styles.page}>

      {/* ── 1. NAV ── */}
      <nav className={styles.landingNav}>
        <img src="/corners-logo-transparent.png" alt="Corners" className={styles.navLogo} />
        <button className={styles.navLogin} onClick={() => navigate('/auth/login')}>Log in</button>
      </nav>

      {/* ── 2. HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroHeadline}>Your corner store, connected.</h1>
          <p className={styles.heroSub}>
            Corners links neighbors, corner stores, and distributors in one local marketplace.
            Request the products you want, stock what your neighborhood actually asks for,
            and fulfill real demand.
          </p>
        </div>
        <div className={styles.roleDoors}>
          <div className={styles.roleCard}>
            <UsersIcon className={styles.roleIcon} aria-hidden="true" />
            <p className={styles.roleType}>I shop local</p>
            <p className={styles.roleSub}>Request products at stores near you. Free forever.</p>
            <button className={styles.btnPrimary} onClick={() => navigate('/auth/signup?role=Patron')}>
              Join as a Patron
            </button>
          </div>
          <div className={styles.roleCard}>
            <BuildingStorefrontIcon className={styles.roleIcon} aria-hidden="true" />
            <p className={styles.roleType}>I own a store</p>
            <p className={styles.roleSub}>See what your neighborhood wants before you stock it.</p>
            <button className={styles.btnPrimary} onClick={() => navigate('/auth/signup?role=Business')}>
              List your store
            </button>
          </div>
          <div className={styles.roleCard}>
            <TruckIcon className={styles.roleIcon} aria-hidden="true" />
            <p className={styles.roleType}>I distribute products</p>
            <p className={styles.roleSub}>Turn store demand into orders on one dashboard.</p>
            <button className={styles.btnOutline} onClick={() => navigate('/auth/signup?role=Distributor')}>
              Partner with us
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. SHOWCASE ── */}
      <section className={styles.showcase}>
        <div className={styles.showcaseInner}>
          <h2 className={styles.sectionTitle}>One app, three sides of the corner.</h2>
          <div className={styles.tabs}>
            {['patrons', 'stores', 'distributors'].map(tab => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.showcaseBody}>
            <div className={styles.phoneFrame}>
              {activeTab === 'patrons' && (
                <img
                  src="/patronhomepage.PNG"
                  alt="Patron browsing local store products on Corners"
                  className={`${styles.screenshotImg} ${styles.screenshotPatron}`}
                  loading="lazy"
                />
              )}
              {activeTab === 'stores' && (
                <img
                  src="/businessproductspage.PNG"
                  alt="Store owner viewing product vote tallies on Corners"
                  className={`${styles.screenshotImg} ${styles.screenshotStores}`}
                  loading="lazy"
                />
              )}
              {activeTab === 'distributors' && <DistributorsMock />}
            </div>
            <ul className={styles.bulletList}>
              {TAB_BULLETS[activeTab].map((b, i) => (
                <li key={i} className={styles.bulletItem}>
                  <CheckIcon className={styles.checkIcon} aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3b. BUSINESS TOOLKIT ── */}
      <section className={styles.toolkit}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>The business toolkit</h2>
          <p className={styles.toolkitSub}>
            Live stats, demand analytics, and a QR code that turns your counter into a signup page.
          </p>
          <div className={styles.toolkitGrid}>
            {[
              { src: '/businesshomepage.PNG',      alt: 'Business dashboard showing store stats at a glance',   caption: 'Your store at a glance' },
              { src: '/businessanalyticspage.PNG', alt: 'Analytics page showing top-voted products by patrons', caption: 'See what the block votes for' },
              { src: '/businesssettingspage.PNG',  alt: 'Settings page with QR code for patron sign-ups',       caption: 'One QR code, endless patrons' },
            ].map(({ src, alt, caption }) => (
              <div key={src} className={styles.toolkitCard}>
                <div className={styles.toolkitImgBox}>
                  <img src={src} alt={alt} className={styles.toolkitImg} loading="lazy" />
                </div>
                <p className={styles.toolkitCaption}>{caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How the loop works</h2>
          <div className={styles.steps}>
            {[
              { n: '1', title: 'A neighbor requests',   desc: 'Patrons ask their corner store for a product and neighbors add votes.' },
              { n: '2', title: 'The tally fills',        desc: 'The store sees real demand — names and numbers, not guesses.' },
              { n: '3', title: 'The store stocks it',    desc: 'One approval turns a request into a product on the shelf.' },
              { n: '4', title: 'Distributors deliver',   desc: 'Suppliers see the order and fulfill it. The whole block wins.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className={styles.step}>
                <div className={styles.stepNum}>{n}</div>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PRICING ── */}
      <section className={styles.pricing}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
          <div className={styles.pricingGrid}>
            <div className={styles.priceCard}>
              <p className={styles.priceTier}>Patron</p>
              <p className={styles.priceAmount}>$0</p>
              <p className={styles.priceNote}>Free forever</p>
              <ul className={styles.priceList}>
                {['Unlimited requests', 'Connect to any store', 'No card required'].map(b => (
                  <li key={b} className={styles.priceItem}>
                    <CheckIcon className={styles.checkIcon} aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
              <button className={styles.btnPrimary} onClick={() => navigate('/auth/signup?role=Patron')}>
                Join free
              </button>
            </div>

            <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
              <div className={styles.popularPill}>Most popular</div>
              <p className={styles.priceTier}>Business</p>
              <p className={styles.priceAmount}>$29<span className={styles.pricePer}>/mo</span></p>
              <p className={styles.priceNote}>30-day free trial</p>
              <ul className={styles.priceList}>
                {[
                  'Request queue + product management',
                  'QR code for your counter',
                  'Product Boost ads',
                  'Cancel anytime',
                ].map(b => (
                  <li key={b} className={styles.priceItem}>
                    <CheckIcon className={styles.checkIcon} aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
              <button className={styles.btnPrimary} onClick={() => navigate('/auth/signup?role=Business')}>
                Start free trial
              </button>
            </div>

            <div className={styles.priceCard}>
              <p className={styles.priceTier}>Distributor</p>
              <p className={styles.priceAmount}>$99<span className={styles.pricePer}>/mo</span></p>
              <p className={styles.priceNote}>+ $9 per store · 30-day free trial</p>
              <ul className={styles.priceList}>
                {['Unlimited catalog', 'Order management', 'Store network tools'].map(b => (
                  <li key={b} className={styles.priceItem}>
                    <CheckIcon className={styles.checkIcon} aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
              <button className={styles.btnOutline} onClick={() => navigate('/auth/signup?role=Distributor')}>
                Start free trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. TRUST STRIP ── */}
      <div className={styles.trust}>
        <span className={styles.trustItem}>
          <LockClosedIcon className={styles.trustIcon} aria-hidden="true" />
          Payments secured by Stripe
        </span>
        <span className={styles.trustDot} aria-hidden="true">·</span>
        <span className={styles.trustItem}>
          <DevicePhoneMobileIcon className={styles.trustIcon} aria-hidden="true" />
          Works on any phone — no app store needed
        </span>
        <span className={styles.trustDot} aria-hidden="true">·</span>
        <span className={styles.trustItem}>
          <MapPinIcon className={styles.trustIcon} aria-hidden="true" />
          Built in Chicago
        </span>
      </div>

      {/* ── 7. FINAL CTA ── */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalCtaTitle}>Ready to put your corner on the map?</h2>
        <button className={styles.btnPrimary} onClick={() => navigate('/auth/signup?role=Patron')}>
          Get started
        </button>
        <button className={styles.ghostLink} onClick={() => navigate('/auth/signup?role=Business')}>
          Or list your store →
        </button>
      </section>

      {/* ── 8. FOOTER ── */}
      <footer className={styles.footer}>
        <img src="/corners-logo-transparent.png" alt="Corners" className={styles.footerLogo} />
        <div className={styles.footerLinks}>
          <span className={styles.footerLink}>Privacy Policy</span>
          <span className={styles.footerLink}>Terms</span>
        </div>
        <p className={styles.footerCopy}>© 2026 Corners</p>
      </footer>

    </div>
  )
}

export default Landing
