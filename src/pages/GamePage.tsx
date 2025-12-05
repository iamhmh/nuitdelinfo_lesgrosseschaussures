/**
 * Page du jeu - Interface immersive
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Game from '../game/Game.tsx'

export default function GamePage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    // Simuler le temps de chargement du jeu
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((p) => Math.min(p + 1, 100))
      }, 150)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  // Écouter la touche Q pour le menu pause
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === 'q' || e.key === 'Q') && !isLoading) {
      setIsPaused(prev => !prev)
      // Notifier Phaser de la pause
      window.dispatchEvent(new CustomEvent('game-pause', { detail: { paused: !isPaused } }))
    }
  }, [isLoading, isPaused])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleResume = () => {
    setIsPaused(false)
    window.dispatchEvent(new CustomEvent('game-pause', { detail: { paused: false } }))
  }

  const handleRestart = () => {
    setIsPaused(false)
    window.dispatchEvent(new CustomEvent('game-restart'))
  }

  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 overflow-hidden">

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

        {/* Menu Pause - Style terminal/retro */}
        {isPaused && !isLoading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            {/* Overlay avec effet scanline */}
            <div className="absolute inset-0 bg-black/90" />
            <div className="absolute inset-0 pointer-events-none opacity-10" 
                 style={{
                   backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                 }} 
            />
            
            {/* Menu container */}
            <div className="relative z-10 w-full max-w-lg mx-6">
              {/* Bordure style terminal */}
              <div style={{
                border: '3px solid #22c55e',
                borderRadius: '8px',
                background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
                boxShadow: '0 0 40px rgba(34, 197, 94, 0.3), inset 0 0 60px rgba(0,0,0,0.5)'
              }}>
                
                {/* Header du menu */}
                <div style={{
                  borderBottom: '2px solid #22c55e',
                  padding: '20px 24px',
                  background: 'linear-gradient(90deg, rgba(34,197,94,0.1) 0%, transparent 100%)'
                }}>
                  <h1 style={{
                    fontFamily: 'monospace',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#22c55e',
                    textShadow: '0 0 10px rgba(34,197,94,0.5)',
                    margin: 0,
                    letterSpacing: '2px'
                  }}>
                    📱 RECONDI_TECH.APK
                  </h1>
                  <p style={{
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#4ade80',
                    marginTop: '8px',
                    opacity: 0.7
                  }}>
                    ║ SYSTEM PAUSED ║
                  </p>
                </div>
                
                {/* Boutons */}
                <div style={{ padding: '32px 24px' }}>
                  
                  {/* Bouton Reprendre */}
                  <button
                    onClick={handleResume}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      marginBottom: '16px',
                      background: 'linear-gradient(180deg, #166534 0%, #14532d 100%)',
                      border: '2px solid #22c55e',
                      borderRadius: '6px',
                      color: '#fff',
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      boxShadow: '0 4px 12px rgba(34,197,94,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #166534 0%, #14532d 100%)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.2)'
                    }}
                  >
                    ▶ REPRENDRE
                  </button>
                  
                  {/* Bouton Rejouer */}
                  <button
                    onClick={handleRestart}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      marginBottom: '16px',
                      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                      border: '2px solid #475569',
                      borderRadius: '6px',
                      color: '#e2e8f0',
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #334155 0%, #1e293b 100%)'
                      e.currentTarget.style.borderColor = '#94a3b8'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
                      e.currentTarget.style.borderColor = '#475569'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    ↻ REJOUER
                  </button>
                  
                  {/* Bouton À propos */}
                  <button
                    onClick={() => navigate('/a-propos')}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      marginBottom: '16px',
                      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                      border: '2px solid #475569',
                      borderRadius: '6px',
                      color: '#e2e8f0',
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #334155 0%, #1e293b 100%)'
                      e.currentTarget.style.borderColor = '#94a3b8'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
                      e.currentTarget.style.borderColor = '#475569'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    ℹ À PROPOS
                  </button>
                  
                  {/* Séparateur */}
                  <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, #475569, transparent)',
                    margin: '24px 0'
                  }} />
                  
                  {/* Bouton Quitter */}
                  <button
                    onClick={() => navigate('/')}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      background: 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)',
                      border: '2px solid #dc2626',
                      borderRadius: '6px',
                      color: '#fecaca',
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(220,38,38,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(220,38,38,0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,0.2)'
                    }}
                  >
                    ✕ MENU PRINCIPAL
                  </button>
                </div>
                
                {/* Footer */}
                <div style={{
                  borderTop: '1px solid #374151',
                  padding: '16px 24px',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Appuyez sur <span style={{ color: '#22c55e', fontWeight: 'bold' }}>[Q]</span> pour reprendre
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Canvas du jeu */}
        <Game />
      </main>

      {/* Indicateur de pause en haut */}
      {!isLoading && !isPaused && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsPaused(true)}
            style={{
              padding: '10px 16px',
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#94a3b8',
              fontFamily: 'monospace',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(4px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#22c55e'
              e.currentTarget.style.color = '#22c55e'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#475569'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            ⏸ PAUSE [Q]
          </button>
        </div>
      )}
    </div>
  )
}
