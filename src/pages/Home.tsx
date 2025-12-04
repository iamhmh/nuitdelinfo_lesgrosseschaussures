/**
 * Page d'accueil - Version premium
 * Design moderne avec animations et effets visuels
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Computer3D from '../components/Computer3D'

// Composant pour les particules flottantes
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 10,
    size: 4 + Math.random() * 8,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

// Composant pour le texte qui s'anime
function AnimatedText() {
  const words = ['Récupérez', 'Reconditionnez', 'Redistribuez', 'Résistez']
  const [currentWord, setCurrentWord] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="inline-block min-w-[200px]">
      <span 
        key={currentWord}
        className="inline-block animate-pulse gradient-text font-bold"
      >
        {words[currentWord]}
      </span>
    </span>
  )
}

// Stats animées
function StatsCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center transform hover:scale-105 transition-all duration-300">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold gradient-text">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden relative">
      {/* Fond avec gradient animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />
      
      {/* Grille de fond */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Particules */}
      <FloatingParticles />

      {/* Header avec effet glass */}
      <header className={`relative z-10 p-6 flex justify-between items-center transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg shadow-green-500/30">
            🌿
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Village Numérique</h1>
            <p className="text-xs text-green-400">Résistant</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-6">
          <button
            onClick={() => navigate('/a-propos')}
            className="text-slate-300 hover:text-green-400 transition-colors font-medium"
          >
            À propos
          </button>
          <button
            onClick={() => navigate('/game')}
            className="glass px-4 py-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-all"
          >
            🎮 Jouer
          </button>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex relative z-10">
        {/* Section gauche - Texte */}
        <div className={`w-1/2 flex flex-col justify-center px-12 transition-all duration-1000 delay-300 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          <div className="space-y-6">
            <div className="inline-block glass-dark rounded-full px-4 py-2 text-sm text-green-400">
              🎮 La Nuit de l'Info 2024
            </div>
            
            <h2 className="text-5xl font-bold text-white leading-tight">
              <AnimatedText />
              <br />
              <span className="text-slate-400">le numérique.</span>
            </h2>
            
            <p className="text-lg text-slate-400 max-w-md">
              Plongez dans une aventure éducative où vous donnez une seconde vie 
              aux ordinateurs obsolètes. Collectez, reconditionnez sous Linux, 
              et redistribuez dans les écoles.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <StatsCard icon="💻" value="∞" label="PC à sauver" />
              <StatsCard icon="🐧" value="Linux" label="Open Source" />
              <StatsCard icon="🏫" value="100%" label="Réemploi" />
            </div>

            {/* CTA secondaire */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => navigate('/a-propos')}
                className="glass px-6 py-3 rounded-xl text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                📖 En savoir plus
              </button>
            </div>
          </div>
        </div>

        {/* Section droite - 3D */}
        <div className={`w-1/2 relative transition-all duration-1000 delay-500 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
          {/* Halo lumineux */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl" />
          
          <Computer3D />
          
          {/* Indication de clic */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="glass-dark rounded-full px-6 py-3 text-green-400 flex items-center gap-2">
              <span className="animate-pulse">👆</span>
              Cliquez sur l'écran pour entrer
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 p-4 text-center transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="glass-dark rounded-full inline-block px-6 py-2">
          <p className="text-slate-400 text-sm">
            Équipe <span className="text-green-400 font-semibold">Les Grosses Chaussures</span> • 
            Thème <span className="text-cyan-400">NIRD</span> • 
            Fait avec 💚
          </p>
        </div>
      </footer>
    </div>
  )
}
