/**
 * Configuration Phaser 3
 * Définit les paramètres du jeu isométrique
 */
import Phaser from 'phaser'
import { MainScene } from './MainScene.ts'

// Configuration du jeu Phaser
export const createPhaserConfig = (parent: HTMLElement): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO, // WebGL automatique avec fallback Canvas
  parent: parent,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Pas de gravité pour un jeu top-down/isométrique
      debug: false, // Mettre à true pour voir les hitboxes
    },
  },
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true, // Pour un rendu pixel art net
    antialias: false,
  },
})
