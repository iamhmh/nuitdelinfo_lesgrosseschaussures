/**
 * Composant React qui monte l'instance Phaser
 * Gère le cycle de vie du jeu dans le contexte React
 */
import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createPhaserConfig } from './phaserConfig'

export default function Game() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    // Créer le jeu Phaser au montage du composant
    if (gameContainerRef.current && !gameRef.current) {
      const config = createPhaserConfig(gameContainerRef.current)
      gameRef.current = new Phaser.Game(config)
    }

    // Nettoyer le jeu au démontage du composant
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={gameContainerRef}
      className="w-full h-full flex items-center justify-center bg-slate-900"
      id="phaser-game"
    />
  )
}
