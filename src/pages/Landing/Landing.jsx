import styles from './Landing.module.css'

const Landing = ({ onPatronSignUp, onBusinessSignUp, onLogin }) => {
  return (
    <main className={styles.container}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.header}>CORNERS</h1>
        <p className={styles.tagline}>
          Discover local products. Support real businesses.  
          Build stronger communities.
        </p>

        <div className={styles.heroButtons}>
          <button className={styles.primaryButton} onClick={onPatronSignUp}>
            Join as a Patron
          </button>
          <button className={styles.secondaryButton} onClick={onBusinessSignUp}>
            List Your Business
          </button>
        </div>

        <button className={styles.linkButton} onClick={onLogin}>
          Already have an account? Log in →
        </button>
      </section>

      {/* Value Props */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <h3>Find What You Actually Want</h3>
          <p>
            Request hard-to-find products from local shops instead of searching endlessly online.
          </p>
        </div>

        <div className={styles.featureCard}>
          <h3>Support Local Businesses</h3>
          <p>
            Keep your money in your community and build relationships with real owners and makers.
          </p>
        </div>

        <div className={styles.featureCard}>
          <h3>Direct Supply Connections</h3>
          <p>
            Distributors and businesses connect directly to fulfill real demand faster and smarter.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2>How Corners Works</h2>
        <ol>
          <li>Create an account as a Patron, Business, or Distributor.</li>
          <li>Patrons request products they’re looking for.</li>
          <li>Businesses and distributors fulfill those requests.</li>
          <li>Everyone wins — faster discovery, stronger local commerce.</li>
        </ol>
      </section>

      {/* Social Proof */}
      <section className={styles.socialProof}>
        <h2>Built for Real Communities</h2>
        <p>
          Corners is designed to strengthen local economies and make discovering products easier than ever.
        </p>
        <p className={styles.comingSoon}>
          🚀 Early access launching soon — join the first wave.
        </p>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Ready to join your local marketplace?</h2>
        <button className={styles.primaryButton} onClick={onPatronSignUp}>
          Get Started
        </button>
      </section>
    </main>
  )
}

export default Landing
