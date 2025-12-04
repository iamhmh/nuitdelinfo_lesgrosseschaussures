import { useNavigate } from 'react-router-dom'
import './About.css'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="about-page">
      {/* Header */}
      <header className="about-header">
        <div className="about-header-inner">
          <button onClick={() => navigate('/')} className="about-logo">
            <div className="about-logo-icon">🌿</div>
            <span className="about-logo-text">Village Numérique</span>
          </button>

          <nav className="about-nav">
            <button onClick={() => navigate('/')} className="about-nav-link">
              Accueil
            </button>
            <button onClick={() => navigate('/game')} className="about-nav-btn">
              Jouer
            </button>
          </nav>
        </div>
      </header>

      <main className="about-main">
        {/* Hero */}
        <section className="about-hero">
          <p className="about-hero-label">La Nuit de l'Info 2025</p>
          <h1 className="about-hero-title">
            La démarche <span>NIRD</span>
          </h1>
          <p className="about-hero-subtitle">
            Pour un numérique plus inclusif, responsable et durable.
          </p>
        </section>

        {/* NIRD Cards */}
        <section className="about-nird-section">
          <div className="about-nird-grid">
            <div className="about-nird-card">
              <div className="about-nird-icon">💻</div>
              <div className="about-nird-title">
                <span className="about-nird-letter blue">N</span>
                <span className="about-nird-word">Numérique</span>
              </div>
              <p className="about-nird-desc">Des outils technologiques au service de tous</p>
            </div>

            <div className="about-nird-card">
              <div className="about-nird-icon">🌍</div>
              <div className="about-nird-title">
                <span className="about-nird-letter purple">I</span>
                <span className="about-nird-word">Inclusif</span>
              </div>
              <p className="about-nird-desc">Accessible à chacun, sans discrimination</p>
            </div>

            <div className="about-nird-card">
              <div className="about-nird-icon">⚖️</div>
              <div className="about-nird-title">
                <span className="about-nird-letter orange">R</span>
                <span className="about-nird-word">Responsable</span>
              </div>
              <p className="about-nird-desc">Éthique, sobre et respectueux des données</p>
            </div>

            <div className="about-nird-card">
              <div className="about-nird-icon">♻️</div>
              <div className="about-nird-title">
                <span className="about-nird-letter green">D</span>
                <span className="about-nird-word">Durable</span>
              </div>
              <p className="about-nird-desc">Pérenne, réparable et réemployable</p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="about-steps-section">
          <h2 className="about-steps-title">Comment jouer ?</h2>
          <div className="about-steps-grid">
            <div className="about-step-card">
              <div className="about-step-number">1</div>
              <div className="about-step-icon">💻</div>
              <h3 className="about-step-name">Collectez</h3>
              <p className="about-step-desc">Récupérez les PC obsolètes dans les entreprises</p>
            </div>

            <div className="about-step-card">
              <div className="about-step-number">2</div>
              <div className="about-step-icon">🐧</div>
              <h3 className="about-step-name">Reconditionnez</h3>
              <p className="about-step-desc">Installez Linux à l'atelier NIRD</p>
            </div>

            <div className="about-step-card">
              <div className="about-step-number">3</div>
              <div className="about-step-icon">🏫</div>
              <h3 className="about-step-name">Redistribuez</h3>
              <p className="about-step-desc">Donnez les PC aux écoles du village</p>
            </div>
          </div>
        </section>

        {/* Linux */}
        <section className="about-linux-section">
          <div className="about-linux-box">
            <div className="about-linux-header">
              <span className="about-linux-icon">🐧</span>
              <div>
                <h2 className="about-linux-title">Pourquoi Linux ?</h2>
                <p className="about-linux-subtitle">Le système idéal pour le réemploi</p>
              </div>
            </div>
            <div className="about-linux-grid">
              <div className="about-linux-feature">
                <span className="about-linux-feature-icon">💰</span>
                <span className="about-linux-feature-text">Gratuit et libre</span>
              </div>
              <div className="about-linux-feature">
                <span className="about-linux-feature-icon">🪶</span>
                <span className="about-linux-feature-text">Léger et rapide</span>
              </div>
              <div className="about-linux-feature">
                <span className="about-linux-feature-icon">🛡️</span>
                <span className="about-linux-feature-text">Sécurisé</span>
              </div>
              <div className="about-linux-feature">
                <span className="about-linux-feature-icon">📚</span>
                <span className="about-linux-feature-text">Éducatif</span>
              </div>
              <div className="about-linux-feature">
                <span className="about-linux-feature-icon">🌐</span>
                <span className="about-linux-feature-text">Communautaire</span>
              </div>
              <div className="about-linux-feature">
                <span className="about-linux-feature-icon">🔧</span>
                <span className="about-linux-feature-text">Personnalisable</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta-section">
          <h2 className="about-cta-title">Prêt à jouer ?</h2>
          <p className="about-cta-subtitle">Aidez le village à passer au numérique responsable</p>
          <button onClick={() => navigate('/game')} className="about-cta-btn">
            Lancer le jeu
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="about-footer">
        <div className="about-footer-inner">
          <div className="about-footer-brand">
            <span className="about-footer-brand-icon">🌿</span>
            <span className="about-footer-brand-text">Village Numérique Résistant</span>
          </div>
          <p className="about-footer-copy">© 2025 Les Grosses Chaussures · La Nuit de l'Info</p>
        </div>
      </footer>
    </div>
  )
}
