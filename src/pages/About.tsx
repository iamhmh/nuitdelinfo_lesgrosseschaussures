/**
 * Page À propos - Design premium
 * Explique la démarche NIRD avec un design moderne
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Composant pour les cartes NIRD
function NirdCard({ 
  icon, 
  title, 
  description, 
  color, 
  delay 
}: { 
  icon: string
  title: string
  description: string
  color: string
  delay: number 
}) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className={`glass rounded-2xl p-6 transform transition-all duration-700 hover:scale-105 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ borderColor: color, borderWidth: '1px' }}
    >
      <div 
        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

// Composant pour les étapes du gameplay
function GameplayStep({ 
  number, 
  title, 
  description, 
  icon 
}: { 
  number: number
  title: string
  description: string
  icon: string 
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-400 font-bold shrink-0">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h4>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
  )
}

export default function About() {
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const nirdCards = [
    {
      icon: '🌍',
      title: 'Inclusif',
      description: 'Rendre le numérique accessible à tous, lutter contre la fracture numérique et offrir des équipements aux publics défavorisés.',
      color: '#3b82f6',
    },
    {
      icon: '⚖️',
      title: 'Responsable',
      description: 'Adopter des pratiques éthiques : protection des données, sobriété numérique, promotion des logiciels libres.',
      color: '#8b5cf6',
    },
    {
      icon: '♻️',
      title: 'Durable',
      description: 'Prolonger la durée de vie des équipements, réduire les déchets électroniques et minimiser l\'empreinte carbone.',
      color: '#22c55e',
    },
    {
      icon: '🔄',
      title: 'Réemploi',
      description: 'Reconditionner les équipements obsolètes, leur donner une seconde vie avec des systèmes légers comme Linux.',
      color: '#f59e0b',
    },
  ]

  return (
    <div className="w-full min-h-screen bg-slate-900 overflow-x-hidden">
      {/* Fond décoratif */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className={`relative z-10 p-6 flex justify-between items-center transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
            🌿
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Village Numérique</h1>
            <p className="text-xs text-green-400">Résistant</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-slate-300 hover:text-green-400 transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => navigate('/game')}
            className="btn-primary px-6 py-2 rounded-lg font-bold"
          >
            🎮 Jouer
          </button>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Hero section */}
        <section className={`text-center mb-20 transition-all duration-1000 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block glass-dark rounded-full px-6 py-2 mb-6">
            <span className="text-green-400">📚 À propos du projet</span>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6">
            La démarche <span className="gradient-text">NIRD</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Numérique Inclusif, Responsable, Durable et de Réemploi. 
            Une approche pour un numérique plus éthique et écologique.
          </p>
        </section>

        {/* Cartes NIRD */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {nirdCards.map((card, index) => (
            <NirdCard
              key={card.title}
              {...card}
              delay={300 + index * 150}
            />
          ))}
        </section>

        {/* Section Gameplay */}
        <section className={`mb-20 transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="glass rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              🎮 Comment jouer ?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <GameplayStep
                number={1}
                icon="💻"
                title="Collectez"
                description="Parcourez le village et récupérez les ordinateurs obsolètes dans les entreprises qui s'en débarrassent."
              />
              <GameplayStep
                number={2}
                icon="🐧"
                title="Reconditionnez"
                description="Apportez les PC à l'atelier NIRD pour les reconditionner sous Linux, leur donnant une nouvelle vie."
              />
              <GameplayStep
                number={3}
                icon="🏫"
                title="Redistribuez"
                description="Offrez les ordinateurs reconditionnés aux écoles pour que les élèves découvrent l'informatique libre."
              />
            </div>
          </div>
        </section>

        {/* Section Pourquoi Linux */}
        <section className={`mb-20 transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="glass rounded-2xl p-8 border border-green-500/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">🐧</div>
              <div>
                <h2 className="text-3xl font-bold text-white">Pourquoi Linux ?</h2>
                <p className="text-slate-400">Le système d'exploitation idéal pour le réemploi</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '💰', text: 'Gratuit et libre - pas de coûts de licence' },
                { icon: '🪶', text: 'Léger - fonctionne sur du matériel ancien' },
                { icon: '🛡️', text: 'Sécurisé - moins vulnérable aux virus' },
                { icon: '📚', text: 'Éducatif - encourage la compréhension' },
                { icon: '🌐', text: 'Communautaire - soutien mondial' },
                { icon: '🔧', text: 'Personnalisable - adapté aux besoins' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-4">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Équipe */}
        <section className={`text-center transition-all duration-1000 delay-900 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="glass rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">👥 L'équipe</h2>
            <p className="text-xl text-slate-300 mb-2">
              Projet réalisé lors de <span className="text-cyan-400 font-bold">La Nuit de l'Info 2024</span>
            </p>
            <p className="text-2xl font-bold gradient-text mb-4">
              Les Grosses Chaussures
            </p>
            <p className="text-slate-400">
              4 développeurs passionnés • 14 heures de code intensif • 
              Une mission : sensibiliser au numérique responsable
            </p>
            
            <div className="mt-8">
              <button
                onClick={() => navigate('/game')}
                className="btn-primary px-8 py-4 rounded-xl font-bold text-xl"
              >
                🎮 Jouer maintenant
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center border-t border-slate-800">
        <p className="text-slate-500">
          La Nuit de l'Info 2024 • Les Grosses Chaussures • 
          Fait avec <span className="text-red-500">❤️</span> pour un numérique plus responsable
        </p>
      </footer>
    </div>
  )
}
