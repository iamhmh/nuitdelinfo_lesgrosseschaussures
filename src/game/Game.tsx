/**
 * Composant React qui monte l'instance Phaser
 */
import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createPhaserConfig } from './phaserConfig'

export default function Game() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    if (gameContainerRef.current && !gameRef.current) {
      const config = createPhaserConfig(gameContainerRef.current)
      gameRef.current = new Phaser.Game(config)
    }

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
      className="w-full h-full flex items-center justify-center"
      id="phaser-game"
    />
  )
}
