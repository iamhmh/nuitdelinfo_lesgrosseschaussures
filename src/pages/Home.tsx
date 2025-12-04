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
              <span className="home-logo-title">Recondi_Tech.apk</span>
            </div>
          </a>

          <nav className="home-nav">
            <button onClick={() => navigate('/a-propos')} className="home-nav-link">
              À propos
            </button>
          </nav>
        </div>
      </header>


      {/* Footer */}
      <footer className="home-footer">
        <p className="home-footer-text">© 2025 Les Grosses Chaussures · Thème NIRD</p>
      </footer>
    </div>
  )
}
