/**
 * Scène de chargement - Extrait les sprites du tileset Lo_bit_city_set.png
 * Tileset: 960x540 pixels, tiles de 16x16
 */
import Phaser from 'phaser'
import cityTileset from '../../assets/assets_city/Lo_bit_city_set.png'

export class BootScene extends Phaser.Scene {
  private tileSize = 16
  
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

    // Charger le tileset comme spritesheet (16x16 tiles)
    this.load.spritesheet('tileset', cityTileset, {
      frameWidth: 16,
      frameHeight: 16
    })
  }

  create(): void {
    // Extraire les textures du tileset
    this.extractTexturesFromTileset()
    
    // Créer les textures additionnelles (personnage, objets)
    this.createAdditionalTextures()
    
    // Lancer les scènes
    this.scene.start('MainScene')
    this.scene.launch('UIScene')
  }
  
  /**
   * Extrait une région du tileset et crée une texture
   */
  private extractRegion(name: string, startCol: number, startRow: number, widthTiles: number, heightTiles: number, scale: number = 4): void {
    const x = startCol * this.tileSize
    const y = startRow * this.tileSize
    const w = widthTiles * this.tileSize
    const h = heightTiles * this.tileSize
    
    // Créer un canvas pour extraire la région
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    
    const sourceImage = this.textures.get('tileset').getSourceImage() as HTMLImageElement
    ctx.drawImage(sourceImage, x, y, w, h, 0, 0, w * scale, h * scale)
    
    this.textures.addCanvas(name, canvas)
  }

  /**
   * Extrait toutes les textures depuis le tileset Lo_bit_city_set.png
   * Le tileset fait 960x540 = 60 colonnes × 33 lignes de tiles 16x16
   */
  private extractTexturesFromTileset(): void {
    // === TERRAIN ===
    // Herbe (plusieurs variantes dans le tileset)
    this.extractRegion('grass', 0, 7, 4, 4, 4)          // Zone d'herbe
    this.extractRegion('grass_dark', 4, 7, 4, 4, 4)     // Herbe foncée
    
    // Chemin/Route
    this.extractRegion('path', 0, 11, 4, 4, 4)          // Chemin de terre
    
    // === BÂTIMENTS ===
    // Maison avec toit rouge (visible dans le tileset)
    this.extractRegion('building_house', 0, 17, 5, 5, 4)
    
    // Immeuble/Enterprise (bâtiment plus grand)
    this.extractRegion('building_enterprise', 32, 0, 8, 8, 4)
    
    // Atelier (bâtiment style industriel/bois)
    this.extractRegion('building_workshop', 12, 17, 10, 5, 4)
    
    // École (grand bâtiment)
    this.extractRegion('building_school', 40, 0, 10, 8, 4)
    
    // === VÉGÉTATION ===
    // Arbres
    this.extractRegion('tree', 24, 8, 3, 5, 4)
    
    // Buissons
    this.extractRegion('bush', 28, 10, 2, 2, 4)
    
    // Fleurs
    this.extractRegion('flower', 30, 10, 1, 1, 4)
    
    // === OBJETS ===
    // Panneau
    this.extractRegion('sign', 22, 17, 2, 3, 4)
    
    // Rocher
    this.extractRegion('rock', 30, 8, 2, 2, 4)
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