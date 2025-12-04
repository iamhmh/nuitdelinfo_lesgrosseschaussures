/**
 * Scène de chargement - Charge les tiles individuels découpés en 16x16
 */
import Phaser from 'phaser'

// Import des tiles individuels
import tile_56 from '../../assets/assets_city/tiles_16x16_annotated/tile_0056.png'
import tile_57 from '../../assets/assets_city/tiles_16x16_annotated/tile_0057.png'
import tile_93 from '../../assets/assets_city/tiles_16x16_annotated/tile_0093.png'
import tile_94 from '../../assets/assets_city/tiles_16x16_annotated/tile_0094.png'

// Arbres
import tile_429 from '../../assets/assets_city/tiles_16x16_annotated/tile_0429.png'
import tile_430 from '../../assets/assets_city/tiles_16x16_annotated/tile_0430.png'
import tile_466 from '../../assets/assets_city/tiles_16x16_annotated/tile_0466.png'
import tile_467 from '../../assets/assets_city/tiles_16x16_annotated/tile_0467.png'
import tile_503 from '../../assets/assets_city/tiles_16x16_annotated/tile_0503.png'
import tile_504 from '../../assets/assets_city/tiles_16x16_annotated/tile_0504.png'

// Buissons
import tile_395 from '../../assets/assets_city/tiles_16x16_annotated/tile_0395.png'
import tile_396 from '../../assets/assets_city/tiles_16x16_annotated/tile_0396.png'

// Route
import tile_666 from '../../assets/assets_city/tiles_16x16_annotated/tile_0666.png'
import tile_667 from '../../assets/assets_city/tiles_16x16_annotated/tile_0667.png'
import tile_703 from '../../assets/assets_city/tiles_16x16_annotated/tile_0703.png'
import tile_704 from '../../assets/assets_city/tiles_16x16_annotated/tile_0704.png'

// Bâtiments - Immeuble gris
import tile_116 from '../../assets/assets_city/tiles_16x16_annotated/tile_0116.png'
import tile_117 from '../../assets/assets_city/tiles_16x16_annotated/tile_0117.png'
import tile_118 from '../../assets/assets_city/tiles_16x16_annotated/tile_0118.png'
import tile_153 from '../../assets/assets_city/tiles_16x16_annotated/tile_0153.png'
import tile_154 from '../../assets/assets_city/tiles_16x16_annotated/tile_0154.png'
import tile_155 from '../../assets/assets_city/tiles_16x16_annotated/tile_0155.png'
import tile_190 from '../../assets/assets_city/tiles_16x16_annotated/tile_0190.png'
import tile_191 from '../../assets/assets_city/tiles_16x16_annotated/tile_0191.png'
import tile_192 from '../../assets/assets_city/tiles_16x16_annotated/tile_0192.png'

// Maison avec toit
import tile_348 from '../../assets/assets_city/tiles_16x16_annotated/tile_0348.png'
import tile_349 from '../../assets/assets_city/tiles_16x16_annotated/tile_0349.png'
import tile_385 from '../../assets/assets_city/tiles_16x16_annotated/tile_0385.png'
import tile_386 from '../../assets/assets_city/tiles_16x16_annotated/tile_0386.png'
import tile_422 from '../../assets/assets_city/tiles_16x16_annotated/tile_0422.png'
import tile_423 from '../../assets/assets_city/tiles_16x16_annotated/tile_0423.png'

// Fleur
import tile_359 from '../../assets/assets_city/tiles_16x16_annotated/tile_0359.png'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    
    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x1e293b, 0.8)
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Chargement du Village...', {
      fontSize: '20px',
      color: '#22c55e',
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0x22c55e, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
    })

    // Charger les tiles individuels
    // Herbe
    this.load.image('tile_56', tile_56)
    this.load.image('tile_57', tile_57)
    this.load.image('tile_93', tile_93)
    this.load.image('tile_94', tile_94)
    
    // Arbres
    this.load.image('tile_429', tile_429)
    this.load.image('tile_430', tile_430)
    this.load.image('tile_466', tile_466)
    this.load.image('tile_467', tile_467)
    this.load.image('tile_503', tile_503)
    this.load.image('tile_504', tile_504)
    
    // Buissons
    this.load.image('tile_395', tile_395)
    this.load.image('tile_396', tile_396)
    
    // Route
    this.load.image('tile_666', tile_666)
    this.load.image('tile_667', tile_667)
    this.load.image('tile_703', tile_703)
    this.load.image('tile_704', tile_704)
    
    // Bâtiments
    this.load.image('tile_116', tile_116)
    this.load.image('tile_117', tile_117)
    this.load.image('tile_118', tile_118)
    this.load.image('tile_153', tile_153)
    this.load.image('tile_154', tile_154)
    this.load.image('tile_155', tile_155)
    this.load.image('tile_190', tile_190)
    this.load.image('tile_191', tile_191)
    this.load.image('tile_192', tile_192)
    
    // Maison
    this.load.image('tile_348', tile_348)
    this.load.image('tile_349', tile_349)
    this.load.image('tile_385', tile_385)
    this.load.image('tile_386', tile_386)
    this.load.image('tile_422', tile_422)
    this.load.image('tile_423', tile_423)
    
    // Fleur
    this.load.image('tile_359', tile_359)
  }

  create(): void {
    // Assembler les textures composées à partir des tiles
    this.createComposedTextures()
    
    // Créer les textures additionnelles (personnage, objets)
    this.createAdditionalTextures()
    
    // Lancer les scènes
    this.scene.start('MainScene')
    this.scene.launch('UIScene')
  }

  /**
   * Assemble plusieurs tiles 16x16 en textures plus grandes
   */
  private createComposedTextures(): void {
    // === HERBE (2x2 tiles = 32x32, puis scale x2 = 64x64) ===
    this.composeTiles('grass', [
      ['tile_56', 'tile_57'],
      ['tile_93', 'tile_94']
    ], 2)
    
    // Herbe foncée (variante)
    this.composeTiles('grass_dark', [
      ['tile_57', 'tile_56'],
      ['tile_94', 'tile_93']
    ], 2)
    
    // === ROUTE (2x2 tiles) ===
    this.composeTiles('path', [
      ['tile_666', 'tile_667'],
      ['tile_703', 'tile_704']
    ], 2)
    
    // === ARBRE (2x3 tiles) ===
    this.composeTiles('tree', [
      ['tile_429', 'tile_430'],
      ['tile_466', 'tile_467'],
      ['tile_503', 'tile_504']
    ], 2)
    
    // === BUISSON (2x1 tiles) ===
    this.composeTiles('bush', [
      ['tile_395', 'tile_396']
    ], 2)
    
    // === IMMEUBLE (3x3 tiles) ===
    this.composeTiles('building_enterprise', [
      ['tile_116', 'tile_117', 'tile_118'],
      ['tile_153', 'tile_154', 'tile_155'],
      ['tile_190', 'tile_191', 'tile_192']
    ], 3)
    
    // === MAISON (2x3 tiles) ===
    this.composeTiles('building_house', [
      ['tile_348', 'tile_349'],
      ['tile_385', 'tile_386'],
      ['tile_422', 'tile_423']
    ], 3)
    
    // === ATELIER (réutilise immeuble pour l'instant) ===
    this.composeTiles('building_workshop', [
      ['tile_116', 'tile_117', 'tile_118'],
      ['tile_153', 'tile_154', 'tile_155'],
      ['tile_190', 'tile_191', 'tile_192']
    ], 3)
    
    // === ÉCOLE (réutilise immeuble pour l'instant) ===
    this.composeTiles('building_school', [
      ['tile_116', 'tile_117', 'tile_118'],
      ['tile_153', 'tile_154', 'tile_155'],
      ['tile_190', 'tile_191', 'tile_192']
    ], 3)
    
    // === FLEUR (1x1 tile) ===
    this.composeTiles('flower', [
      ['tile_359']
    ], 2)
    
    // === PANNEAU (1x1 tile placeholder) ===
    this.composeTiles('sign', [
      ['tile_359']
    ], 2)
    
    // === ROCHER (placeholder) ===
    this.composeTiles('rock', [
      ['tile_395']
    ], 2)
  }

  /**
   * Compose plusieurs tiles en une seule texture
   */
  private composeTiles(name: string, tileGrid: string[][], scale: number): void {
    const tileSize = 16
    const rows = tileGrid.length
    const cols = tileGrid[0].length
    
    const canvas = document.createElement('canvas')
    canvas.width = cols * tileSize * scale
    canvas.height = rows * tileSize * scale
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileKey = tileGrid[row][col]
        if (this.textures.exists(tileKey)) {
          const img = this.textures.get(tileKey).getSourceImage() as HTMLImageElement
          ctx.drawImage(
            img,
            0, 0, tileSize, tileSize,
            col * tileSize * scale, row * tileSize * scale,
            tileSize * scale, tileSize * scale
          )
        }
      }
    }
    
    this.textures.addCanvas(name, canvas)
  }

  /**
   * Crée les textures additionnelles (personnage, objets interactifs)
   * qui ne sont pas dans le tileset
   */
  private createAdditionalTextures(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 })
    
    // === ORDINATEUR OBSOLÈTE ===
    graphics.clear()
    // Moniteur CRT beige
    graphics.fillStyle(0xd4c4a4)
    graphics.fillRect(6, 2, 20, 16)
    // Écran bleu (BSOD)
    graphics.fillStyle(0x0000aa)
    graphics.fillRect(8, 4, 16, 12)
    graphics.fillStyle(0xffffff)
    graphics.fillRect(10, 6, 10, 2)
    graphics.fillRect(10, 10, 8, 2)
    // Base
    graphics.fillStyle(0xc4b494)
    graphics.fillRect(10, 18, 12, 4)
    // Tour
    graphics.fillStyle(0xd4c4a4)
    graphics.fillRect(0, 6, 8, 16)
    // X rouge
    graphics.lineStyle(2, 0xff0000)
    graphics.lineBetween(4, 2, 28, 22)
    graphics.lineBetween(28, 2, 4, 22)
    graphics.generateTexture('computer_old', 32, 28)
    
    // === ORDINATEUR RECONDITIONNÉ ===
    graphics.clear()
    graphics.fillStyle(0x2a2a2a)
    graphics.fillRect(4, 0, 24, 18)
    graphics.fillStyle(0x1a3a1a)
    graphics.fillRect(6, 2, 20, 14)
    graphics.fillStyle(0x22c55e)
    graphics.fillRect(8, 4, 12, 2)
    graphics.fillRect(8, 8, 16, 2)
    graphics.fillRect(8, 12, 8, 2)
    graphics.fillStyle(0x3a3a3a)
    graphics.fillRect(12, 18, 8, 3)
    graphics.fillRect(8, 21, 16, 2)
    graphics.fillStyle(0x22c55e)
    graphics.fillCircle(28, 20, 4)
    graphics.generateTexture('computer_new', 32, 28)
    
    // === ICÔNE INTERACTION ===
    graphics.clear()
    graphics.fillStyle(0xffd700)
    graphics.beginPath()
    graphics.moveTo(16, 2)
    graphics.lineTo(19, 10)
    graphics.lineTo(28, 12)
    graphics.lineTo(21, 18)
    graphics.lineTo(24, 26)
    graphics.lineTo(16, 21)
    graphics.lineTo(8, 26)
    graphics.lineTo(11, 18)
    graphics.lineTo(4, 12)
    graphics.lineTo(13, 10)
    graphics.closePath()
    graphics.fillPath()
    graphics.generateTexture('interact_icon', 32, 28)
    
    // === PERSONNAGE ===
    // Idle
    graphics.clear()
    graphics.fillStyle(0x22c55e) // T-shirt vert
    graphics.fillRect(10, 18, 12, 16)
    graphics.fillStyle(0xffdbac) // Tête
    graphics.fillRect(10, 6, 12, 12)
    graphics.fillStyle(0x4a3728) // Cheveux
    graphics.fillRect(10, 4, 12, 6)
    graphics.fillStyle(0x000000) // Yeux
    graphics.fillRect(12, 10, 2, 2)
    graphics.fillRect(18, 10, 2, 2)
    graphics.fillStyle(0x3b82f6) // Jean
    graphics.fillRect(11, 34, 4, 10)
    graphics.fillRect(17, 34, 4, 10)
    graphics.fillStyle(0x2a2a2a) // Chaussures
    graphics.fillRect(10, 42, 5, 4)
    graphics.fillRect(17, 42, 5, 4)
    graphics.generateTexture('player_idle', 32, 48)
    
    // Walk frames
    for (let i = 0; i < 4; i++) {
      graphics.clear()
      const legOffset = Math.sin(i * Math.PI / 2) * 3
      
      graphics.fillStyle(0x22c55e)
      graphics.fillRect(10, 18, 12, 16)
      graphics.fillStyle(0xffdbac)
      graphics.fillRect(10, 6, 12, 12)
      graphics.fillStyle(0x4a3728)
      graphics.fillRect(10, 4, 12, 6)
      graphics.fillStyle(0x000000)
      graphics.fillRect(12, 10, 2, 2)
      graphics.fillRect(18, 10, 2, 2)
      graphics.fillStyle(0x3b82f6)
      graphics.fillRect(11, 34 + legOffset, 4, 10)
      graphics.fillRect(17, 34 - legOffset, 4, 10)
      graphics.fillStyle(0x2a2a2a)
      graphics.fillRect(10, 42 + legOffset, 5, 4)
      graphics.fillRect(17, 42 - legOffset, 5, 4)
      
      graphics.generateTexture(`player_walk_${i}`, 32, 48)
    }
    
    graphics.destroy()
  }
}