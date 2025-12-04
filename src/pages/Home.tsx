import { useNavigate } from 'react-router-dom'
import Computer3D from '../components/Computer3D'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* 3D Computer */}
      <div className="home-canvas">
        <Computer3D onEnterGame={() => navigate('/game')} />
      </div>

      {/* Header */}
      <header className="home-header">
        <div className="home-header-inner">
          <a href="/" className="home-logo">
            <div className="home-logo-icon">🌿</div>
            <div className="home-logo-text">
              <span className="home-logo-title">Village Numérique</span>
              <span className="home-logo-subtitle">Résistant</span>
            </div>
          </a>

          <nav className="home-nav">
            <button onClick={() => navigate('/a-propos')} className="home-nav-link">
              À propos
            </button>
            <button onClick={() => navigate('/game')} className="home-nav-btn">
              Jouer
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="home-hero">
        <p className="home-hero-label">La Nuit de l'Info 2025</p>
        <h1 className="home-hero-title">
          Numérique <span>Responsable</span>
        </h1>
      </div>

      {/* Scroll indicator */}
      <div className="home-scroll">
        <div className="home-scroll-box">
          <div className="home-scroll-mouse">
            <div className="home-scroll-dot"></div>
          </div>
          <span className="home-scroll-text">Cliquez sur l'écran pour jouer</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p className="home-footer-text">© 2025 Les Grosses Chaussures · Thème NIRD</p>
      </footer>
    </div>
  )
}
