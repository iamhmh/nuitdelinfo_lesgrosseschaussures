/**
 * Page du jeu
 * Contient le composant Phaser et l'interface de jeu
 */
import { useNavigate } from 'react-router-dom'
import Game from '../game/Game'
import { useGameStore } from '../store/gameState'

export default function GamePage() {
  const navigate = useNavigate()
  const { computersCollected, computersReconditioned, computersDistributed } = useGameStore()

  return (
    <div className="w-full h-screen flex flex-col bg-slate-900">
      {/* Barre de navigation / HUD */}
      <header className="p-3 flex justify-between items-center bg-slate-800/80 backdrop-blur">
        <button
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Retour à l'accueil
        </button>
        
        <h1 className="text-xl font-bold text-green-400">
          🌿 Village Numérique Résistant
        </h1>

        {/* Statistiques du jeu */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">💻</span>
            <span className="text-white">{computersCollected}</span>
            <span className="text-slate-400">collectés</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🔧</span>
            <span className="text-white">{computersReconditioned}</span>
            <span className="text-slate-400">reconditionnés</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">🏫</span>
            <span className="text-white">{computersDistributed}</span>
            <span className="text-slate-400">distribués</span>
          </div>
        </div>
      </header>

      {/* Zone de jeu Phaser */}
      <main className="flex-1 relative">
        <Game />
      </main>

      {/* Barre d'informations en bas */}
      <footer className="p-2 bg-slate-800/80 backdrop-blur text-center text-slate-400 text-sm">
        <p>
          💡 Collectez les PC obsolètes → Amenez-les à l'atelier NIRD → Redistribuez-les aux écoles
        </p>
      </footer>
    </div>
  )
}
