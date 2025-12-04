/**
 * Page d'accueil
 * Affiche l'ordinateur 3D animé et le bouton pour entrer dans le jeu
 */
import { useNavigate } from 'react-router-dom'
import Computer3D from '../components/Computer3D'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="w-full h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400">
          🌿 Village Numérique Résistant
        </h1>
        <nav className="space-x-4">
          <button
            onClick={() => navigate('/a-propos')}
            className="text-slate-300 hover:text-green-400 transition-colors"
          >
            À propos
          </button>
        </nav>
      </header>

      {/* Zone 3D principale */}
      <main className="flex-1 relative">
        <Computer3D />
        
        {/* Overlay avec texte et bouton */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none">
          <div className="text-center pointer-events-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              Reconditionnez. Redistribuez. Résistez.
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Rejoignez le mouvement NIRD et donnez une seconde vie aux ordinateurs obsolètes.
              Collectez, reconditionnez sous Linux, et redistribuez dans les écoles.
            </p>
            <button
              onClick={() => navigate('/game')}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-green-500/30"
            >
              🎮 Entrer dans le Village Numérique Résistant
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-slate-500 text-sm">
        <p>La Nuit de l'Info 2024 - Équipe Les Grosses Chaussures</p>
        <p className="mt-1">
          Thème : Numérique Inclusif, Responsable, Durable et de Réemploi (NIRD)
        </p>
      </footer>
    </div>
  )
}
