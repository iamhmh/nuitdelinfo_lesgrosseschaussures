/**
 * Page du jeu - Interface immersive
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Game from '../game/Game.tsx'

export default function GamePage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler le temps de chargement du jeu
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Header minimaliste */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="glass-dark px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-all flex items-center gap-2 hover:bg-white/10"
        >
          <span>←</span>
          <span className="hidden sm:inline">Retour</span>
        </button>
        
        <div className="glass-dark px-4 py-2 rounded-lg">
          <h1 className="text-lg font-bold gradient-text">
            🌿 Village Numérique Résistant
          </h1>
        </div>

        <button
          onClick={() => navigate('/a-propos')}
          className="glass-dark px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-all hover:bg-white/10"
        >
          <span className="hidden sm:inline">À propos</span>
          <span className="sm:hidden">?</span>
        </button>
      </header>

      {/* Zone de jeu */}
      <main className="flex-1 relative">
        {/* Écran de chargement */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-slate-900 flex flex-col items-center justify-center">
            <div className="text-6xl mb-6 animate-bounce">🌿</div>
            <div className="text-2xl font-bold gradient-text mb-4">
              Chargement du Village...
            </div>
            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse rounded-full" 
                   style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Canvas du jeu */}
        <Game />
      </main>

      {/* Mini tutoriel au démarrage */}
      {!isLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="glass-dark rounded-xl px-6 py-3 text-center animate-fade-in">
            <p className="text-slate-400 text-sm">
              <span className="text-green-400 font-bold">Mission :</span> Collectez les PC obsolètes → 
              Reconditionnez-les à l'atelier → Distribuez-les aux écoles
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
