/**
 * Configuration Phaser 3 - Jeu isométrique style Zelda
 */
import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { MainScene } from './scenes/MainScene'
import { UIScene } from './scenes/UIScene'

// Configuration du jeu Phaser
export const createPhaserConfig = (parent: HTMLElement): Phaser.Types.Core.GameConfig => ({
  type: Phaser.WEBGL,
  parent: parent,
  width: 1280,
  height: 720,
  backgroundColor: '#0f172a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MainScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
})
