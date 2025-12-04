/**
 * Page du jeu - Interface immersive
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Game from '../game/Game.tsx'

export default function GamePage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simuler le temps de chargement du jeu
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
  if (isLoading) {
    const interval = setInterval(() => {
      setLoadingProgress((p) => Math.min(p + 1, 100)); // Lent et smooth
    }, 150); // Plus lent que 120ms
    return () => clearInterval(interval);
  }
}, [isLoading]);



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
  {/* Écran de chargement BIOS / GRUB */}
  {isLoading && (
    <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center px-10 font-mono text-green-400">
      
      {/* Header style GRUB */}
      <div className="text-green-500 mb-10 text-lg">
        GRUB v2.06 — Recondi_Tech Bootloader
      </div>

      {/* Logs du boot */}
      <div className="space-y-3 text-[20px] leading-relaxed text-center">
        <div>[ OK ] Initializing hardware...</div>
        <div>[ OK ] Loading Linux kernel v6.5...</div>
        <div>[ OK ] Mounting NIRD filesystem...</div>
        <div>[ OK ] Detecting recycled hardware...</div>
        <div>[ OK ] Recondition modules loaded.</div>
        <div>[ .. ] Loading assets...</div>
      </div>

      {/* Progression façon BIOS */}
      <div className="mt-10 flex items-center gap-2 text-[20px]">
        <span className="text-green-500">Boot progress:</span>
        <span className="text-green-300">{loadingProgress}%</span>
        <span className="text-green-400 blink">█</span>
      </div>

      {/* Animation CSS du curseur */}
      <style>
        {`
          .blink {
            animation: blinkCursor 0.9s steps(1) infinite;
          }

          @keyframes blinkCursor {
            50% { opacity: 0; }
          }
        `}
      </style>
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
