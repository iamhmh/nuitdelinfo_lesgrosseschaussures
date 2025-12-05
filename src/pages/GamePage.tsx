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
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [showSnakeGame, setShowSnakeGame] = useState(false)

  // Chargement réel de 0 à 100%
  useEffect(() => {
    if (isLoading) {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 3 + 1 // Progression variable (1-4%)
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          // Afficher l'écran "Comment jouer" une fois le chargement terminé
          setTimeout(() => {
            setShowHowToPlay(true)
          }, 300)
        }
        setLoadingProgress(Math.floor(progress))
      }, 80)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  // Écouter la touche Q pour le menu pause (seulement quand le jeu est actif)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === 'q' || e.key === 'Q') && !isLoading && !showHowToPlay) {
      if (showControls) {
        setShowControls(false)
      } else {
        setIsPaused(prev => !prev)
        window.dispatchEvent(new CustomEvent('game-pause', { detail: { paused: !isPaused } }))
      }
    }
  }, [isLoading, isPaused, showHowToPlay, showControls])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleResume = () => {
    setIsPaused(false)
    setShowControls(false)
    window.dispatchEvent(new CustomEvent('game-pause', { detail: { paused: false } }))
  }

  const handleRestart = () => {
    setIsPaused(false)
    setShowControls(false)
    window.dispatchEvent(new CustomEvent('game-restart'))
  }

  const [isStarting, setIsStarting] = useState(false)

  // Gérer l'ouverture/fermeture du jeu Snake
  useEffect(() => {
    let snakeGameInstance: any = null

    if (showSnakeGame) {
      // Importer Phaser et créer une instance du jeu Snake
      import('phaser').then((Phaser) => {
        const container = document.getElementById('snake-game-container')
        if (container) {
          // Dynamiquement importer et créer le jeu
          import('../game/scenes/SnakeGameScene.ts').then(({ SnakeGameScene }) => {
            try {
              console.log('Creating SnakeGame instance...')
              snakeGameInstance = new Phaser.Game({
                type: Phaser.WEBGL,
                parent: container,
                width: window.innerWidth,
                height: window.innerHeight,
                backgroundColor: '#0f172a',
                physics: {
                  default: 'arcade',
                  arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false,
                  },
                },
                scene: [SnakeGameScene],
                scale: {
                  mode: Phaser.Scale.FIT,
                  autoCenter: Phaser.Scale.CENTER_BOTH,
                },
                render: {
                  pixelArt: true,
                  antialias: false,
                },
              })
              console.log('SnakeGame instance created successfully')
            } catch (error) {
              console.error('Erreur lors du chargement du jeu Snake:', error)
            }
          }).catch((error) => {
            console.error('Erreur lors de l\'import de SnakeGameScene:', error)
          })
        }
      }).catch((error) => {
        console.error('Erreur lors de l\'import de Phaser:', error)
      })

      // Écouter ESC pour fermer
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowSnakeGame(false)
        }
      }
      window.addEventListener('keydown', handleEsc)

      return () => {
        window.removeEventListener('keydown', handleEsc)
        // Détruire l'instance du jeu quand on ferme la modal
        if (snakeGameInstance) {
          console.log('Destroying SnakeGame instance...')
          snakeGameInstance.destroy(true)
        }
      }
    }
  }, [showSnakeGame])

  const handleStartGame = () => {
    setIsStarting(true)
    // Transition de 2 secondes avant de lancer le jeu
    setTimeout(() => {
      setShowHowToPlay(false)
      setIsLoading(false)
      setIsStarting(false)
    }, 2000)
  }

  // Composant bouton réutilisable pour le menu
  const MenuButton = ({ onClick, children, variant = 'default' }: { 
    onClick: () => void
    children: React.ReactNode
    variant?: 'primary' | 'default' | 'danger'
  }) => {
    const styles = {
      primary: {
        bg: 'linear-gradient(180deg, #166534 0%, #14532d 100%)',
        bgHover: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
        border: '#22c55e',
        shadow: 'rgba(34,197,94,0.2)',
        shadowHover: 'rgba(34,197,94,0.4)',
        color: '#fff'
      },
      default: {
        bg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        bgHover: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
        border: '#475569',
        borderHover: '#94a3b8',
        shadow: 'rgba(0,0,0,0.3)',
        color: '#e2e8f0'
      },
      danger: {
        bg: 'linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%)',
        bgHover: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)',
        border: '#dc2626',
        shadow: 'rgba(220,38,38,0.2)',
        shadowHover: 'rgba(220,38,38,0.4)',
        color: '#fecaca'
      }
    }
    const s = styles[variant]
    
    return (
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '16px 24px',
          marginBottom: '16px',
          background: s.bg,
          border: `2px solid ${s.border}`,
          borderRadius: '6px',
          color: s.color,
          fontFamily: 'monospace',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: `0 4px 12px ${s.shadow}`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = s.bgHover
          e.currentTarget.style.transform = 'translateY(-2px)'
          if ('borderHover' in s) e.currentTarget.style.borderColor = s.borderHover as string
          if ('shadowHover' in s) e.currentTarget.style.boxShadow = `0 6px 20px ${s.shadowHover}`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = s.bg
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = s.border
          e.currentTarget.style.boxShadow = `0 4px 12px ${s.shadow}`
        }}
      >
        {children}
      </button>
    )
  }

  // Composant pour afficher les contrôles
  const ControlsPanel = () => (
    <div style={{
      border: '2px solid #22c55e',
      borderRadius: '8px',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
      boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)',
      padding: '32px',
      maxWidth: '500px',
      width: '100%'
    }}>
      <h2 style={{
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#22c55e',
        textAlign: 'center',
        marginBottom: '24px',
        textShadow: '0 0 10px rgba(34,197,94,0.5)'
      }}>
        🎮 COMMANDES
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          { keys: ['↑', '←', '↓', '→'], action: 'Se déplacer', alt: 'ou W A S D' },
          { keys: ['E'], action: 'Interagir', alt: 'Collecter / Déposer' },
          { keys: ['Q'], action: 'Menu Pause', alt: '' },
        ].map((control, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'rgba(34,197,94,0.1)',
            borderRadius: '6px',
            border: '1px solid #374151'
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {control.keys.map((key, j) => (
                <span key={j} style={{
                  padding: '8px 12px',
                  background: '#1e293b',
                  border: '2px solid #475569',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  color: '#22c55e',
                  fontWeight: 'bold',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {key}
                </span>
              ))}
              {control.alt && (
                <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '12px' }}>
                  {control.alt}
                </span>
              )}
            </div>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#e2e8f0'
            }}>
              {control.action}
            </span>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => setShowControls(false)}
        style={{
          width: '100%',
          marginTop: '24px',
          padding: '14px 24px',
          background: 'linear-gradient(180deg, #166534 0%, #14532d 100%)',
          border: '2px solid #22c55e',
          borderRadius: '6px',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(180deg, #166534 0%, #14532d 100%)'
        }}
      >
        ← RETOUR
      </button>
    </div>
  )

  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 overflow-hidden">

      {/* Zone de jeu */}
      <main className="flex-1 relative">
        {/* Écran de chargement BIOS / GRUB */}
        {isLoading && !showHowToPlay && (
          <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center px-10 font-mono text-green-400">
            
            {/* Header style GRUB */}
            <div className="text-green-500 mb-10 text-lg">
              GRUB v2.06 — Recondi_Tech Bootloader
            </div>

            {/* Logs du boot - apparaissent progressivement */}
            <div className="space-y-3 text-[20px] leading-relaxed text-center">
              <div style={{ opacity: loadingProgress >= 5 ? 1 : 0.3 }}>[ {loadingProgress >= 5 ? 'OK' : '..'} ] Initializing hardware...</div>
              <div style={{ opacity: loadingProgress >= 20 ? 1 : 0.3 }}>[ {loadingProgress >= 20 ? 'OK' : '..'} ] Loading Linux kernel v6.5...</div>
              <div style={{ opacity: loadingProgress >= 40 ? 1 : 0.3 }}>[ {loadingProgress >= 40 ? 'OK' : '..'} ] Mounting NIRD filesystem...</div>
              <div style={{ opacity: loadingProgress >= 60 ? 1 : 0.3 }}>[ {loadingProgress >= 60 ? 'OK' : '..'} ] Detecting recycled hardware...</div>
              <div style={{ opacity: loadingProgress >= 80 ? 1 : 0.3 }}>[ {loadingProgress >= 80 ? 'OK' : '..'} ] Recondition modules loaded.</div>
              <div style={{ opacity: loadingProgress >= 95 ? 1 : 0.3 }}>[ {loadingProgress >= 95 ? 'OK' : '..'} ] Loading assets...</div>
            </div>

            {/* Barre de progression */}
            <div style={{
              marginTop: '40px',
              width: '400px',
              maxWidth: '90%'
            }}>
              <div style={{
                height: '24px',
                background: '#1a1a1a',
                border: '2px solid #22c55e',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${loadingProgress}%`,
                  background: 'linear-gradient(90deg, #166534, #22c55e)',
                  transition: 'width 0.1s ease',
                  boxShadow: '0 0 10px rgba(34,197,94,0.5)'
                }} />
              </div>
              <div style={{
                marginTop: '12px',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '18px'
              }}>
                <span style={{ color: '#22c55e' }}>Boot progress: </span>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{loadingProgress}%</span>
                <span className="blink" style={{ marginLeft: '8px', color: '#22c55e' }}>█</span>
              </div>
            </div>

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

        {/* Écran "Comment jouer ?" */}
        {showHowToPlay && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/95" />
            
            <div className="relative z-10" style={{
              border: '3px solid #22c55e',
              borderRadius: '12px',
              background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
              boxShadow: '0 0 60px rgba(34, 197, 94, 0.4)',
              padding: '40px',
              maxWidth: '600px',
              width: '90%'
            }}>
              <h1 style={{
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#22c55e',
                textAlign: 'center',
                marginBottom: '8px',
                textShadow: '0 0 15px rgba(34,197,94,0.6)'
              }}>
                📱 RECONDI_TECH.APK
              </h1>
              
              <p style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#4ade80',
                textAlign: 'center',
                marginBottom: '32px',
                opacity: 0.7
              }}>
                ║ COMMENT JOUER ? ║
              </p>

              {/* Contrôles */}
              <div style={{ marginBottom: '32px' }}>
                {[
                  { keys: ['↑', '←', '↓', '→'], action: 'Se déplacer', alt: 'ou W A S D' },
                  { keys: ['E'], action: 'Interagir (collecter / déposer)' },
                  { keys: ['Q'], action: 'Menu Pause' },
                ].map((control, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    marginBottom: '12px',
                    background: 'rgba(34,197,94,0.08)',
                    borderRadius: '8px',
                    border: '1px solid #374151'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {control.keys.map((key, j) => (
                        <span key={j} style={{
                          padding: '10px 14px',
                          background: '#1e293b',
                          border: '2px solid #22c55e',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          fontSize: '18px',
                          color: '#22c55e',
                          fontWeight: 'bold',
                          minWidth: '44px',
                          textAlign: 'center',
                          boxShadow: '0 2px 0 #14532d'
                        }}>
                          {key}
                        </span>
                      ))}
                      {control.alt && (
                        <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '13px', marginLeft: '8px' }}>
                          {control.alt}
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      color: '#e2e8f0'
                    }}>
                      {control.action}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mission */}
              <div style={{
                padding: '16px 20px',
                background: 'rgba(34,197,94,0.15)',
                borderRadius: '8px',
                border: '1px solid #22c55e',
                marginBottom: '32px'
              }}>
                <p style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#4ade80',
                  textAlign: 'center',
                  margin: 0
                }}>
                  🎯 <strong>Mission :</strong> Collectez les PC obsolètes → Reconditionnez-les à l'atelier NIRD → Distribuez-les aux écoles !
                </p>
              </div>

              {/* Bouton Jouer / Animation de démarrage */}
              {isStarting ? (
                <div style={{
                  width: '100%',
                  padding: '18px 24px',
                  background: 'linear-gradient(180deg, #166534 0%, #14532d 100%)',
                  border: '3px solid #22c55e',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    color: '#22c55e',
                    marginBottom: '12px',
                    animation: 'pulse 1s infinite'
                  }}>
                    ⚡ INITIALISATION...
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#0a0a0a',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                      borderRadius: '4px',
                      animation: 'loadingBar 2s linear forwards'
                    }} />
                  </div>
                  <style>
                    {`
                      @keyframes loadingBar {
                        0% { width: 0%; }
                        100% { width: 100%; }
                      }
                      @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                      }
                    `}
                  </style>
                </div>
              ) : (
                <button
                  onClick={handleStartGame}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    background: 'linear-gradient(180deg, #166534 0%, #14532d 100%)',
                    border: '3px solid #22c55e',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    boxShadow: '0 6px 20px rgba(34,197,94,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(34,197,94,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(180deg, #166534 0%, #14532d 100%)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.3)'
                  }}
                >
                  ▶ JOUER
                </button>
              )}
            </div>
          </div>
        )}

        {/* Menu Pause - Style terminal/retro */}
        {isPaused && !isLoading && !showHowToPlay && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            {/* Overlay avec effet scanline */}
            <div className="absolute inset-0 bg-black/90" />
            <div className="absolute inset-0 pointer-events-none opacity-10" 
                 style={{
                   backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                 }} 
            />
            
            {/* Affichage des contrôles ou menu principal */}
            <div className="relative z-10 w-full max-w-lg mx-6 flex justify-center">
              {showControls ? (
                <ControlsPanel />
              ) : (
                /* Menu container */
                <div style={{
                  width: '100%',
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
                    <MenuButton onClick={handleResume} variant="primary">▶ REPRENDRE</MenuButton>
                    <MenuButton onClick={handleRestart}>↻ REJOUER</MenuButton>
                    <MenuButton onClick={() => setShowControls(true)}>🎮 COMMANDES</MenuButton>
                    <MenuButton onClick={() => navigate('/a-propos')}>ℹ À PROPOS</MenuButton>
                    
                    {/* Séparateur */}
                    <div style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, #475569, transparent)',
                      margin: '24px 0'
                    }} />
                    
                    <MenuButton onClick={() => navigate('/')} variant="danger">✕ MENU PRINCIPAL</MenuButton>
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
              )}
            </div>
          </div>
        )}

        {/* Canvas du jeu */}
        <Game />
      </main>

      {/* Indicateur de pause en haut */}
      {!isLoading && !isPaused && !showHowToPlay && (
        <div className="absolute top-4 right-4 z-10" style={{ display: 'flex', gap: 8 }}>
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

          {/* Bouton Snake à droite du bouton Pause */}
          <button
            onClick={() => setShowSnakeGame(true)}
            style={{
              padding: '10px 12px',
              background: 'rgba(2,6,23,0.75)',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#94a3b8',
              fontFamily: 'monospace',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#22c55e'
              e.currentTarget.style.color = '#22c55e'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#475569'
              e.currentTarget.style.color = '#94a3b8'
            }}
            title="Ouvrir Snake (maquette)"
          >
            📱 SNAKE
          </button>
        </div>
      )}

      {/* Modal Snake Game - Nouvelle page */}
      {showSnakeGame && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            flexDirection: 'column'
          }}
        >
          {/* ID pour que Phaser puisse monter le jeu dedans */}
          <div
            id="snake-game-container"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />

          {/* Bouton fermer en overlay */}
          <button
            onClick={() => setShowSnakeGame(false)}
            style={{
              position: 'absolute',
              bottom: 30,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '12px 24px',
              background: '#22c55e',
              color: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#16a34a'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#22c55e'
            }}
          >
            [ ESC ] Retour au jeu
          </button>
        </div>
      )}
    </div>
  )
}
