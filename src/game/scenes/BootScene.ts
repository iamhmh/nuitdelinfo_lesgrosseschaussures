/**
 * Scène de chargement - Génère toutes les textures procéduralement
 * Ville détaillée avec bâtiments, routes, voitures, végétation
 */
import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    
    // Écran de chargement style terminal
    this.cameras.main.setBackgroundColor('#0a0a0a')
    
    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x1a1a2e, 0.9)
    progressBox.fillRect(width / 2 - 200, height / 2 - 30, 400, 60)
    progressBox.lineStyle(2, 0x22c55e)
    progressBox.strokeRect(width / 2 - 200, height / 2 - 30, 400, 60)

    const header = this.add.text(width / 2, height / 2 - 80, '🖥️ NIRD OS v2.0 - Chargement...', {
      fontSize: '24px',
      color: '#22c55e',
      fontFamily: 'monospace'
    }).setOrigin(0.5)

    const loadingText = this.add.text(width / 2, height / 2 + 50, 'Initialisation des textures...', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'monospace'
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0x22c55e, 1)
      progressBar.fillRect(width / 2 - 190, height / 2 - 20, 380 * value, 40)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      header.destroy()
      loadingText.destroy()
    })

    // Charger une image placeholder pour déclencher le chargement
    this.load.image('placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
  }

  create(): void {
    // Générer toutes les textures
    this.generateAllTextures()
    
    // Lancer les scènes
    this.scene.start('MainScene')
    this.scene.launch('UIScene')
  }

  private generateAllTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 })
    
    // === TERRAIN ===
    this.generateGrass(g)
    this.generateRoads(g)
    this.generateSidewalks(g)
    this.generateParking(g)
    
    // === BÂTIMENTS ===
    this.generateModernBuilding(g)
    this.generateOfficeBuilding(g)
    this.generateSchool(g)
    this.generateWorkshop(g)
    this.generateHouse(g)
    this.generateApartment(g)
    this.generateShop(g)
    
    // === VÉHICULES ===
    this.generateCars(g)
    
    // === VÉGÉTATION ===
    this.generateTrees(g)
    this.generateBushes(g)
    this.generateFlowers(g)
    
    // === MOBILIER URBAIN ===
    this.generateStreetFurniture(g)
    
    // === OBJETS DU JEU ===
    this.generateGameObjects(g)
    
    // === PERSONNAGE ===
    this.generatePlayer(g)
    
    g.destroy()
  }

  // ==================== TERRAIN ====================
  
  private generateGrass(g: Phaser.GameObjects.Graphics): void {
    // Herbe normale
    g.clear()
    g.fillStyle(0x4a7c59)
    g.fillRect(0, 0, 64, 64)
    // Détails d'herbe
    for (let i = 0; i < 40; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x3d6b4a, 0x5a8c69, 0x4a7c59, 0x3a5a40]))
      g.fillRect(Math.random() * 60, Math.random() * 60, 2 + Math.random() * 3, 3 + Math.random() * 5)
    }
    g.generateTexture('grass', 64, 64)
    
    // Herbe foncée
    g.clear()
    g.fillStyle(0x3a5a40)
    g.fillRect(0, 0, 64, 64)
    for (let i = 0; i < 35; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x2d4a35, 0x4a6a50, 0x3a5a40]))
      g.fillRect(Math.random() * 60, Math.random() * 60, 2 + Math.random() * 3, 3 + Math.random() * 5)
    }
    g.generateTexture('grass_dark', 64, 64)
    
    // Herbe claire (parc)
    g.clear()
    g.fillStyle(0x5a9c69)
    g.fillRect(0, 0, 64, 64)
    for (let i = 0; i < 45; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x4a8c59, 0x6aac79, 0x5a9c69]))
      g.fillRect(Math.random() * 60, Math.random() * 60, 2 + Math.random() * 3, 3 + Math.random() * 5)
    }
    g.generateTexture('grass_light', 64, 64)
  }

  private generateRoads(g: Phaser.GameObjects.Graphics): void {
    // Route asphalt de base
    g.clear()
    g.fillStyle(0x3a3a3a)
    g.fillRect(0, 0, 64, 64)
    // Texture asphalte
    for (let i = 0; i < 100; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x333333, 0x404040, 0x4a4a4a, 0x2a2a2a]))
      g.fillRect(Math.random() * 62, Math.random() * 62, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
    g.generateTexture('road', 64, 64)
    
    // Route horizontale avec ligne centrale
    g.clear()
    g.fillStyle(0x3a3a3a)
    g.fillRect(0, 0, 64, 64)
    for (let i = 0; i < 80; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x333333, 0x404040, 0x2a2a2a]))
      g.fillRect(Math.random() * 62, Math.random() * 62, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
    // Ligne jaune horizontale
    g.fillStyle(0xf4c430)
    g.fillRect(0, 30, 64, 4)
    g.generateTexture('road_h', 64, 64)
    
    // Route verticale avec ligne centrale
    g.clear()
    g.fillStyle(0x3a3a3a)
    g.fillRect(0, 0, 64, 64)
    for (let i = 0; i < 80; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x333333, 0x404040, 0x2a2a2a]))
      g.fillRect(Math.random() * 62, Math.random() * 62, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
    // Ligne jaune verticale
    g.fillStyle(0xf4c430)
    g.fillRect(30, 0, 4, 64)
    g.generateTexture('road_v', 64, 64)
    
    // Intersection
    g.clear()
    g.fillStyle(0x3a3a3a)
    g.fillRect(0, 0, 64, 64)
    for (let i = 0; i < 80; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x333333, 0x404040, 0x2a2a2a]))
      g.fillRect(Math.random() * 62, Math.random() * 62, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
    g.generateTexture('road_cross', 64, 64)
    
    // Passage piéton horizontal
    g.clear()
    g.fillStyle(0x3a3a3a)
    g.fillRect(0, 0, 64, 64)
    g.fillStyle(0xffffff)
    for (let i = 0; i < 5; i++) {
      g.fillRect(4 + i * 12, 0, 8, 64)
    }
    g.generateTexture('crosswalk_h', 64, 64)
    
    // Passage piéton vertical
    g.clear()
    g.fillStyle(0x3a3a3a)
    g.fillRect(0, 0, 64, 64)
    g.fillStyle(0xffffff)
    for (let i = 0; i < 5; i++) {
      g.fillRect(0, 4 + i * 12, 64, 8)
    }
    g.generateTexture('crosswalk_v', 64, 64)
  }

  private generateSidewalks(g: Phaser.GameObjects.Graphics): void {
    // Trottoir clair
    g.clear()
    g.fillStyle(0xb8b8b8)
    g.fillRect(0, 0, 64, 64)
    // Joints
    g.lineStyle(1, 0x999999)
    g.lineBetween(0, 32, 64, 32)
    g.lineBetween(32, 0, 32, 64)
    // Texture
    for (let i = 0; i < 30; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0xa8a8a8, 0xc8c8c8, 0xb0b0b0]))
      g.fillRect(Math.random() * 60, Math.random() * 60, 2, 2)
    }
    g.generateTexture('sidewalk', 64, 64)
    g.generateTexture('path', 64, 64)
    
    // Trottoir avec bordure
    g.clear()
    g.fillStyle(0xb8b8b8)
    g.fillRect(0, 0, 64, 64)
    g.lineStyle(1, 0x999999)
    g.lineBetween(0, 32, 64, 32)
    g.lineBetween(32, 0, 32, 64)
    g.fillStyle(0x888888)
    g.fillRect(0, 58, 64, 6)
    g.generateTexture('sidewalk_border', 64, 64)
  }

  private generateParking(g: Phaser.GameObjects.Graphics): void {
    // Place de parking
    g.clear()
    g.fillStyle(0x4a4a4a)
    g.fillRect(0, 0, 64, 64)
    for (let i = 0; i < 60; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x3a3a3a, 0x5a5a5a]))
      g.fillRect(Math.random() * 62, Math.random() * 62, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
    // Lignes blanches
    g.lineStyle(2, 0xffffff)
    g.lineBetween(0, 0, 0, 64)
    g.lineBetween(63, 0, 63, 64)
    g.generateTexture('parking', 64, 64)
  }

  // ==================== BÂTIMENTS ====================

  private generateModernBuilding(g: Phaser.GameObjects.Graphics): void {
    const w = 160, h = 200
    g.clear()
    
    // Structure principale - Verre bleuté
    g.fillStyle(0x1a3a4a)
    g.fillRect(0, 30, w, h - 30)
    
    // Façade vitrée
    g.fillStyle(0x2a5a7a)
    g.fillRect(5, 35, w - 10, h - 45)
    
    // Fenêtres en grille
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 5; col++) {
        // Cadre fenêtre
        g.fillStyle(0x1a3a4a)
        g.fillRect(10 + col * 30, 40 + row * 20, 26, 16)
        // Vitre avec reflet
        if (Math.random() > 0.3) {
          g.fillStyle(0x87ceeb)
        } else {
          g.fillStyle(0xffd700) // Lumière allumée
        }
        g.fillRect(11 + col * 30, 41 + row * 20, 24, 14)
        // Reflet
        g.fillStyle(0xadd8e6)
        g.fillRect(12 + col * 30, 42 + row * 20, 8, 5)
      }
    }
    
    // Toit
    g.fillStyle(0x2a4a5a)
    g.fillRect(0, 25, w, 10)
    g.fillStyle(0x1a3a4a)
    g.fillRect(10, 20, w - 20, 10)
    
    // Antennes sur le toit
    g.fillStyle(0x666666)
    g.fillRect(30, 5, 3, 20)
    g.fillRect(120, 8, 3, 17)
    g.fillStyle(0xff0000)
    g.fillCircle(31, 5, 3)
    
    // Entrée
    g.fillStyle(0x0a1a2a)
    g.fillRect(60, h - 35, 40, 35)
    g.fillStyle(0x87ceeb)
    g.fillRect(65, h - 30, 30, 25)
    // Marquise
    g.fillStyle(0x3a6a8a)
    g.fillRect(55, h - 40, 50, 8)
    
    // Logo entreprise
    g.fillStyle(0x22c55e)
    g.fillRect(70, 50, 20, 15)
    
    g.generateTexture('building_enterprise', w, h)
  }

  private generateOfficeBuilding(g: Phaser.GameObjects.Graphics): void {
    const w = 140, h = 180
    g.clear()
    
    // Structure béton
    g.fillStyle(0x6a6a7a)
    g.fillRect(0, 20, w, h - 20)
    
    // Étages
    for (let floor = 0; floor < 6; floor++) {
      const y = 25 + floor * 25
      g.fillStyle(0x5a5a6a)
      g.fillRect(5, y, w - 10, 22)
      
      // Fenêtres
      for (let win = 0; win < 4; win++) {
        g.fillStyle(0x1a2a3a)
        g.fillRect(12 + win * 32, y + 3, 26, 16)
        g.fillStyle(Math.random() > 0.4 ? 0x87ceeb : 0xffeaa7)
        g.fillRect(14 + win * 32, y + 5, 22, 12)
      }
    }
    
    // Toit
    g.fillStyle(0x4a4a5a)
    g.fillRect(0, 15, w, 8)
    
    // Porte
    g.fillStyle(0x2a2a3a)
    g.fillRect(55, h - 30, 30, 30)
    g.fillStyle(0x4a4a5a)
    g.fillRect(58, h - 28, 24, 25)
    
    g.generateTexture('building_office', w, h)
  }

  private generateSchool(g: Phaser.GameObjects.Graphics): void {
    const w = 200, h = 150
    g.clear()
    
    // Bâtiment principal - Brique rouge
    g.fillStyle(0xa54a4a)
    g.fillRect(20, 40, w - 40, h - 40)
    
    // Motif briques
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 10; col++) {
        const offset = row % 2 === 0 ? 0 : 8
        g.fillStyle(Phaser.Math.RND.pick([0x954040, 0xb55050, 0xa54a4a]))
        g.fillRect(22 + offset + col * 16, 42 + row * 9, 14, 7)
      }
    }
    
    // Grandes fenêtres
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0x3a3a3a)
      g.fillRect(30 + i * 32, 55, 26, 35)
      g.fillStyle(0x87ceeb)
      g.fillRect(32 + i * 32, 57, 22, 31)
      // Croisillons
      g.fillStyle(0xffffff)
      g.fillRect(42 + i * 32, 57, 2, 31)
      g.fillRect(32 + i * 32, 71, 22, 2)
    }
    
    // Entrée principale avec colonnes
    g.fillStyle(0xe8e8e8)
    g.fillRect(75, 30, 50, h - 30)
    g.fillStyle(0xd8d8d8)
    g.fillRect(80, 35, 40, h - 40)
    
    // Colonnes
    g.fillStyle(0xf0f0f0)
    g.fillRect(78, 35, 8, h - 45)
    g.fillRect(114, 35, 8, h - 45)
    
    // Porte double
    g.fillStyle(0x4a2a2a)
    g.fillRect(85, h - 40, 30, 40)
    g.fillStyle(0x5a3a3a)
    g.fillRect(87, h - 38, 12, 35)
    g.fillRect(101, h - 38, 12, 35)
    
    // Fronton triangulaire
    g.fillStyle(0xd0d0d0)
    g.beginPath()
    g.moveTo(70, 30)
    g.lineTo(100, 10)
    g.lineTo(130, 30)
    g.closePath()
    g.fillPath()
    
    // Horloge
    g.fillStyle(0xffffff)
    g.fillCircle(100, 20, 8)
    g.fillStyle(0x000000)
    g.fillCircle(100, 20, 6)
    g.fillStyle(0xffffff)
    g.fillCircle(100, 20, 5)
    g.lineStyle(1, 0x000000)
    g.lineBetween(100, 20, 100, 16)
    g.lineBetween(100, 20, 103, 20)
    
    // Panneau "ÉCOLE"
    g.fillStyle(0x2a5a2a)
    g.fillRect(85, 45, 30, 12)
    
    // Drapeau
    g.fillStyle(0x666666)
    g.fillRect(185, 10, 3, 35)
    g.fillStyle(0x0055a4)
    g.fillRect(188, 12, 5, 10)
    g.fillStyle(0xffffff)
    g.fillRect(193, 12, 5, 10)
    g.fillStyle(0xef4135)
    g.fillRect(198, 12, 5, 10)
    
    g.generateTexture('building_school', w, h)
  }

  private generateWorkshop(g: Phaser.GameObjects.Graphics): void {
    const w = 180, h = 130
    g.clear()
    
    // Hangar en bois
    g.fillStyle(0xb8956a)
    g.fillRect(0, 30, w, h - 30)
    
    // Planches horizontales
    for (let i = 0; i < 10; i++) {
      g.fillStyle(i % 2 === 0 ? 0xa88550 : 0xc8a57a)
      g.fillRect(0, 30 + i * 10, w, 9)
    }
    
    // Toit vert éco avec panneaux solaires
    g.fillStyle(0x4a8a4a)
    g.beginPath()
    g.moveTo(0, 30)
    g.lineTo(w/2, 5)
    g.lineTo(w, 30)
    g.closePath()
    g.fillPath()
    
    // Panneaux solaires
    g.fillStyle(0x1a2a4a)
    g.fillRect(30, 15, 40, 12)
    g.fillRect(110, 15, 40, 12)
    g.fillStyle(0x2a3a5a)
    g.lineStyle(1, 0x3a4a6a)
    for (let i = 0; i < 4; i++) {
      g.lineBetween(30 + i * 10, 15, 30 + i * 10, 27)
      g.lineBetween(110 + i * 10, 15, 110 + i * 10, 27)
    }
    
    // Grande porte atelier
    g.fillStyle(0x5a4a3a)
    g.fillRect(20, 50, 60, h - 50)
    g.fillStyle(0x6a5a4a)
    g.fillRect(25, 55, 50, h - 60)
    // Fenêtres porte
    g.fillStyle(0x87ceeb)
    g.fillRect(30, 60, 18, 20)
    g.fillRect(52, 60, 18, 20)
    
    // Porte bureau
    g.fillStyle(0x5a4a3a)
    g.fillRect(120, 70, 35, h - 70)
    g.fillStyle(0x87ceeb)
    g.fillRect(125, 75, 25, 30)
    
    // Enseigne NIRD
    g.fillStyle(0x1a4a1a)
    g.fillRect(85, 40, 50, 20)
    g.fillStyle(0x22c55e)
    g.fillRect(88, 43, 44, 14)
    
    // Logo Linux/Tux stylisé
    g.fillStyle(0xffa500)
    g.fillCircle(165, 55, 12)
    g.fillStyle(0x000000)
    g.fillCircle(165, 55, 10)
    g.fillStyle(0xffa500)
    g.fillCircle(165, 55, 7)
    g.fillStyle(0x000000)
    g.fillCircle(162, 53, 2)
    g.fillCircle(168, 53, 2)
    g.fillStyle(0xffa500)
    g.fillEllipse(165, 59, 4, 2)
    
    g.generateTexture('building_workshop', w, h)
  }

  private generateHouse(g: Phaser.GameObjects.Graphics): void {
    const w = 100, h = 90
    g.clear()
    
    // Mur
    g.fillStyle(0xe8d8b8)
    g.fillRect(10, 35, w - 20, h - 35)
    
    // Toit
    g.fillStyle(0xc84a3a)
    g.beginPath()
    g.moveTo(5, 38)
    g.lineTo(w/2, 8)
    g.lineTo(w - 5, 38)
    g.closePath()
    g.fillPath()
    
    // Tuiles
    for (let row = 0; row < 3; row++) {
      const y = 20 + row * 7
      for (let i = 0; i < 8; i++) {
        g.fillStyle(row % 2 === 0 ? 0xb83a2a : 0xd85a4a)
        const x = 15 + i * 10 + (row % 2) * 5
        g.fillRect(x, y, 9, 6)
      }
    }
    
    // Cheminée
    g.fillStyle(0xa54040)
    g.fillRect(70, 12, 12, 20)
    
    // Fenêtre
    g.fillStyle(0x3a3a3a)
    g.fillRect(20, 45, 28, 28)
    g.fillStyle(0x87ceeb)
    g.fillRect(22, 47, 24, 24)
    g.fillStyle(0xffffff)
    g.fillRect(33, 47, 2, 24)
    g.fillRect(22, 58, 24, 2)
    
    // Porte
    g.fillStyle(0x5a3a2a)
    g.fillRect(58, 52, 24, h - 52)
    g.fillStyle(0xffd700)
    g.fillCircle(76, 75, 3)
    
    // Buissons devant
    g.fillStyle(0x3a7a3a)
    g.fillCircle(25, h - 5, 8)
    g.fillCircle(75, h - 5, 8)
    
    g.generateTexture('building_house', w, h)
  }

  private generateApartment(g: Phaser.GameObjects.Graphics): void {
    const w = 120, h = 160
    g.clear()
    
    // Structure
    g.fillStyle(0xd8c8a8)
    g.fillRect(0, 20, w, h - 20)
    
    // Balcons et fenêtres
    for (let floor = 0; floor < 5; floor++) {
      const y = 25 + floor * 28
      
      for (let apt = 0; apt < 3; apt++) {
        const x = 8 + apt * 38
        
        // Fenêtre
        g.fillStyle(0x2a2a2a)
        g.fillRect(x, y, 32, 22)
        g.fillStyle(Math.random() > 0.4 ? 0x87ceeb : 0xffeaa7)
        g.fillRect(x + 2, y + 2, 28, 18)
        
        // Balcon (sauf RDC)
        if (floor < 4) {
          g.fillStyle(0x888888)
          g.fillRect(x - 2, y + 24, 36, 3)
          // Rambarde
          g.lineStyle(1, 0x666666)
          g.lineBetween(x, y + 24, x, y + 28)
          g.lineBetween(x + 30, y + 24, x + 30, y + 28)
        }
      }
    }
    
    // Toit
    g.fillStyle(0x8a8a8a)
    g.fillRect(0, 15, w, 8)
    
    // Entrée
    g.fillStyle(0x4a4a4a)
    g.fillRect(45, h - 35, 30, 35)
    g.fillStyle(0x87ceeb)
    g.fillRect(50, h - 30, 20, 25)
    
    // Numéro
    g.fillStyle(0x2a4a6a)
    g.fillRect(52, h - 45, 16, 12)
    
    g.generateTexture('building_apartment', w, h)
  }

  private generateShop(g: Phaser.GameObjects.Graphics): void {
    const w = 90, h = 80
    g.clear()
    
    // Structure
    g.fillStyle(0xe0d0b0)
    g.fillRect(0, 20, w, h - 20)
    
    // Vitrine
    g.fillStyle(0x2a3a4a)
    g.fillRect(8, 35, w - 16, 35)
    g.fillStyle(0xadd8e6)
    g.fillRect(10, 37, w - 20, 31)
    
    // Auvent rayé
    for (let i = 0; i < 9; i++) {
      g.fillStyle(i % 2 === 0 ? 0xe74c3c : 0xffffff)
      g.beginPath()
      g.moveTo(i * 10, 20)
      g.lineTo(i * 10 + 10, 20)
      g.lineTo(i * 10 + 10, 35)
      g.lineTo(i * 10, 30)
      g.closePath()
      g.fillPath()
    }
    
    // Porte
    g.fillStyle(0x4a3a2a)
    g.fillRect(35, 50, 20, h - 50)
    g.fillStyle(0x87ceeb)
    g.fillRect(38, 53, 14, 20)
    
    // Enseigne
    g.fillStyle(0x2a5a2a)
    g.fillRect(15, 22, 60, 12)
    
    g.generateTexture('building_shop', w, h)
  }

  // ==================== VÉHICULES ====================

  private generateCars(g: Phaser.GameObjects.Graphics): void {
    const carColors = [
      { name: 'red', color: 0xc0392b },
      { name: 'blue', color: 0x2980b9 },
      { name: 'green', color: 0x27ae60 },
      { name: 'yellow', color: 0xf1c40f },
      { name: 'white', color: 0xecf0f1 },
      { name: 'black', color: 0x2c3e50 },
      { name: 'silver', color: 0x95a5a6 },
    ]
    
    carColors.forEach(car => {
      // Vue de dessus
      g.clear()
      
      // Ombre
      g.fillStyle(0x000000)
      g.setAlpha(0.3)
      g.fillEllipse(24, 38, 40, 16)
      g.setAlpha(1)
      
      // Corps
      g.fillStyle(car.color)
      g.fillRoundedRect(4, 10, 40, 25, 5)
      
      // Toit/vitres
      g.fillStyle(0x2c3e50)
      g.fillRoundedRect(12, 14, 24, 17, 3)
      
      // Vitres
      g.fillStyle(0x87ceeb)
      g.fillRect(14, 16, 20, 6)  // Avant
      g.fillRect(14, 24, 20, 5)  // Arrière
      
      // Phares
      g.fillStyle(0xf5f5dc)
      g.fillCircle(8, 14, 3)
      g.fillCircle(8, 31, 3)
      
      // Feux arrière
      g.fillStyle(0xff0000)
      g.fillRect(40, 13, 4, 4)
      g.fillRect(40, 28, 4, 4)
      
      // Roues
      g.fillStyle(0x1a1a1a)
      g.fillCircle(14, 8, 5)
      g.fillCircle(34, 8, 5)
      g.fillCircle(14, 37, 5)
      g.fillCircle(34, 37, 5)
      
      // Jantes
      g.fillStyle(0x888888)
      g.fillCircle(14, 8, 2)
      g.fillCircle(34, 8, 2)
      g.fillCircle(14, 37, 2)
      g.fillCircle(34, 37, 2)
      
      g.generateTexture(`car_${car.name}`, 48, 45)
    })
  }

  // ==================== VÉGÉTATION ====================

  private generateTrees(g: Phaser.GameObjects.Graphics): void {
    // Arbre feuillu grand
    g.clear()
    // Tronc
    g.fillStyle(0x5a3a1a)
    g.fillRect(22, 55, 12, 35)
    g.fillStyle(0x4a2a0a)
    g.fillRect(22, 55, 4, 35)
    
    // Feuillage multicouche
    g.fillStyle(0x2a5a2a)
    g.fillCircle(28, 40, 26)
    g.fillStyle(0x3a7a3a)
    g.fillCircle(20, 35, 18)
    g.fillCircle(36, 35, 18)
    g.fillStyle(0x4a8a4a)
    g.fillCircle(28, 25, 20)
    g.fillStyle(0x5a9a5a)
    g.fillCircle(28, 20, 12)
    
    // Détails feuilles
    for (let i = 0; i < 15; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x3a7a3a, 0x4a8a4a, 0x2a6a2a]))
      g.fillCircle(12 + Math.random() * 32, 15 + Math.random() * 35, 3 + Math.random() * 4)
    }
    
    g.generateTexture('tree', 56, 90)
    
    // Arbre moyen
    g.clear()
    g.fillStyle(0x5a3a1a)
    g.fillRect(16, 40, 8, 25)
    g.fillStyle(0x3a7a3a)
    g.fillCircle(20, 28, 18)
    g.fillStyle(0x4a8a4a)
    g.fillCircle(20, 22, 14)
    g.fillStyle(0x5a9a5a)
    g.fillCircle(20, 18, 8)
    g.generateTexture('tree_small', 40, 65)
    
    // Sapin
    g.clear()
    g.fillStyle(0x4a2a0a)
    g.fillRect(18, 70, 8, 20)
    
    g.fillStyle(0x1a4a2a)
    g.beginPath()
    g.moveTo(22, 5)
    g.lineTo(42, 35)
    g.lineTo(2, 35)
    g.closePath()
    g.fillPath()
    
    g.fillStyle(0x2a5a3a)
    g.beginPath()
    g.moveTo(22, 20)
    g.lineTo(45, 55)
    g.lineTo(-1, 55)
    g.closePath()
    g.fillPath()
    
    g.fillStyle(0x3a6a4a)
    g.beginPath()
    g.moveTo(22, 40)
    g.lineTo(48, 75)
    g.lineTo(-4, 75)
    g.closePath()
    g.fillPath()
    
    g.generateTexture('tree_pine', 52, 90)
    
    // Palmier (bonus exotique)
    g.clear()
    g.fillStyle(0x8b4513)
    g.fillRect(18, 30, 8, 50)
    g.fillStyle(0x6b3510)
    for (let i = 0; i < 5; i++) {
      g.fillRect(18, 35 + i * 10, 8, 4)
    }
    // Feuilles de palmier
    g.fillStyle(0x228b22)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      g.beginPath()
      g.moveTo(22, 30)
      g.lineTo(22 + Math.cos(angle) * 25, 25 + Math.sin(angle) * 20)
      g.lineTo(22 + Math.cos(angle + 0.2) * 20, 22 + Math.sin(angle + 0.2) * 18)
      g.closePath()
      g.fillPath()
    }
    g.generateTexture('tree_palm', 50, 85)
  }

  private generateBushes(g: Phaser.GameObjects.Graphics): void {
    // Buisson normal
    g.clear()
    g.fillStyle(0x2a5a2a)
    g.fillCircle(16, 22, 16)
    g.fillStyle(0x3a7a3a)
    g.fillCircle(10, 18, 12)
    g.fillCircle(22, 18, 12)
    g.fillStyle(0x4a8a4a)
    g.fillCircle(16, 12, 10)
    
    // Petites fleurs
    g.fillStyle(0xff69b4)
    g.fillCircle(8, 14, 2)
    g.fillCircle(24, 16, 2)
    g.fillStyle(0xffff00)
    g.fillCircle(16, 10, 2)
    
    g.generateTexture('bush', 32, 32)
    
    // Buisson rond
    g.clear()
    g.fillStyle(0x2a5a2a)
    g.fillCircle(16, 16, 14)
    g.fillStyle(0x3a7a3a)
    g.fillCircle(16, 14, 10)
    g.fillStyle(0x4a8a4a)
    g.fillCircle(16, 12, 6)
    g.generateTexture('bush_round', 32, 32)
    
    // Haie
    g.clear()
    g.fillStyle(0x2a5a2a)
    g.fillRect(0, 8, 64, 24)
    g.fillStyle(0x3a7a3a)
    for (let i = 0; i < 8; i++) {
      g.fillCircle(4 + i * 8, 12, 6)
    }
    g.generateTexture('hedge', 64, 32)
  }

  private generateFlowers(g: Phaser.GameObjects.Graphics): void {
    // Fleur rose
    g.clear()
    g.fillStyle(0x3a7a3a)
    g.fillRect(7, 14, 2, 14)
    g.fillStyle(0xff69b4)
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5
      g.fillCircle(8 + Math.cos(angle) * 4, 8 + Math.sin(angle) * 4, 3)
    }
    g.fillStyle(0xffff00)
    g.fillCircle(8, 8, 3)
    g.generateTexture('flower', 16, 28)
    
    // Fleur jaune
    g.clear()
    g.fillStyle(0x3a7a3a)
    g.fillRect(7, 12, 2, 12)
    g.fillStyle(0xffd700)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6
      g.fillEllipse(8 + Math.cos(angle) * 4, 7 + Math.sin(angle) * 4, 4, 6)
    }
    g.fillStyle(0x8b4513)
    g.fillCircle(8, 7, 3)
    g.generateTexture('flower_yellow', 16, 24)
    
    // Tulipe rouge
    g.clear()
    g.fillStyle(0x3a7a3a)
    g.fillRect(6, 12, 2, 14)
    g.fillStyle(0xff4444)
    g.beginPath()
    g.moveTo(7, 4)
    g.lineTo(12, 14)
    g.lineTo(2, 14)
    g.closePath()
    g.fillPath()
    g.generateTexture('flower_tulip', 14, 26)
  }

  // ==================== MOBILIER URBAIN ====================

  private generateStreetFurniture(g: Phaser.GameObjects.Graphics): void {
    // Lampadaire moderne
    g.clear()
    g.fillStyle(0x3a3a3a)
    g.fillRect(6, 20, 4, 60)
    g.fillStyle(0x2a2a2a)
    g.fillRect(2, 5, 12, 18)
    g.fillStyle(0xfffacd)
    g.fillRect(4, 8, 8, 12)
    // Halo de lumière
    g.fillStyle(0xfffff0)
    g.setAlpha(0.3)
    g.fillCircle(8, 14, 10)
    g.setAlpha(1)
    g.generateTexture('lamppost', 16, 80)
    
    // Banc en bois
    g.clear()
    g.fillStyle(0x5a3a1a)
    g.fillRect(0, 12, 40, 6)
    g.fillRect(0, 20, 40, 4)
    g.fillStyle(0x3a3a3a)
    g.fillRect(4, 18, 4, 14)
    g.fillRect(32, 18, 4, 14)
    g.generateTexture('bench', 40, 32)
    
    // Poubelle verte
    g.clear()
    g.fillStyle(0x2a5a2a)
    g.fillRect(4, 8, 16, 24)
    g.fillStyle(0x1a4a1a)
    g.fillRect(2, 6, 20, 4)
    // Symbole recyclage
    g.fillStyle(0xffffff)
    g.fillCircle(12, 20, 5)
    g.fillStyle(0x2a5a2a)
    g.fillCircle(12, 20, 3)
    g.generateTexture('trashcan', 24, 32)
    
    // Panneau de signalisation
    g.clear()
    g.fillStyle(0x4a4a4a)
    g.fillRect(10, 20, 4, 40)
    g.fillStyle(0x2a5a8a)
    g.fillRoundedRect(0, 2, 24, 20, 3)
    g.fillStyle(0xffffff)
    g.fillRect(4, 8, 16, 2)
    g.fillRect(4, 12, 12, 2)
    g.generateTexture('sign', 24, 60)
    
    // Boîte aux lettres jaune
    g.clear()
    g.fillStyle(0xf1c40f)
    g.fillRoundedRect(2, 10, 20, 25, 3)
    g.fillStyle(0xe67e22)
    g.fillRect(6, 18, 12, 3)
    g.fillStyle(0x3a3a3a)
    g.fillRect(10, 35, 4, 15)
    g.generateTexture('mailbox', 24, 50)
    
    // Feu tricolore
    g.clear()
    g.fillStyle(0x2a2a2a)
    g.fillRect(8, 30, 4, 40)
    g.fillStyle(0x1a1a1a)
    g.fillRoundedRect(4, 5, 12, 28, 2)
    g.fillStyle(0xff0000)
    g.fillCircle(10, 10, 4)
    g.fillStyle(0x4a4a00)
    g.fillCircle(10, 19, 4)
    g.fillStyle(0x004a00)
    g.fillCircle(10, 28, 4)
    g.generateTexture('traffic_light', 20, 70)
    
    // Horodateur
    g.clear()
    g.fillStyle(0x5a5a5a)
    g.fillRect(6, 25, 4, 25)
    g.fillStyle(0x4a4a4a)
    g.fillRoundedRect(2, 8, 12, 20, 3)
    g.fillStyle(0x87ceeb)
    g.fillRect(4, 10, 8, 8)
    g.generateTexture('parking_meter', 16, 50)
    
    // Rocher décoratif
    g.clear()
    g.fillStyle(0x6a6a6a)
    g.fillCircle(16, 20, 14)
    g.fillStyle(0x8a8a8a)
    g.fillCircle(12, 16, 10)
    g.fillStyle(0x9a9a9a)
    g.fillCircle(10, 12, 5)
    g.fillStyle(0x5a5a5a)
    g.fillCircle(20, 22, 6)
    g.generateTexture('rock', 32, 32)
    
    // Fontaine
    g.clear()
    g.fillStyle(0x888888)
    g.fillCircle(32, 32, 28)
    g.fillStyle(0x666666)
    g.fillCircle(32, 32, 24)
    g.fillStyle(0x5588aa)
    g.fillCircle(32, 32, 20)
    // Centre
    g.fillStyle(0x777777)
    g.fillCircle(32, 32, 8)
    g.fillStyle(0x666666)
    g.fillRect(30, 20, 4, 12)
    // Jets d'eau
    g.fillStyle(0x88ccff)
    g.setAlpha(0.6)
    g.fillCircle(32, 16, 4)
    g.fillCircle(26, 20, 3)
    g.fillCircle(38, 20, 3)
    g.setAlpha(1)
    g.generateTexture('fountain', 64, 64)
    
    // Arrêt de bus
    g.clear()
    g.fillStyle(0x3a3a3a)
    g.fillRect(4, 30, 4, 50)
    g.fillRect(32, 30, 4, 50)
    // Toit
    g.fillStyle(0x2a5a8a)
    g.fillRect(0, 25, 40, 8)
    // Panneau
    g.fillStyle(0x4a4a4a)
    g.fillRect(6, 33, 28, 15)
    g.fillStyle(0x2a5a8a)
    g.fillRect(8, 35, 24, 11)
    g.generateTexture('bus_stop', 40, 80)
  }

  // ==================== OBJETS DU JEU ====================

  private generateGameObjects(g: Phaser.GameObjects.Graphics): void {
    // Ordinateur obsolète (à recycler)
    g.clear()
    // Moniteur CRT
    g.fillStyle(0xc4b494)
    g.fillRoundedRect(6, 2, 24, 20, 2)
    g.fillStyle(0x1a1a4a)
    g.fillRect(9, 5, 18, 14)
    // Écran bleu de la mort
    g.fillStyle(0x0000aa)
    g.fillRect(10, 6, 16, 12)
    g.fillStyle(0xffffff)
    g.fillRect(11, 8, 10, 2)
    g.fillRect(11, 12, 8, 2)
    // Unité centrale
    g.fillStyle(0xc4b494)
    g.fillRect(0, 8, 8, 18)
    // Voyant erreur
    g.fillStyle(0xff0000)
    g.fillCircle(4, 12, 2)
    // X rouge
    g.lineStyle(2, 0xff0000)
    g.lineBetween(6, 2, 28, 22)
    g.lineBetween(28, 2, 6, 22)
    g.generateTexture('computer_old', 36, 28)
    
    // Ordinateur reconditionné Linux
    g.clear()
    // Écran plat moderne
    g.fillStyle(0x1a1a1a)
    g.fillRoundedRect(4, 0, 28, 20, 2)
    g.fillStyle(0x0a2a0a)
    g.fillRect(6, 2, 24, 16)
    // Terminal Linux
    g.fillStyle(0x22c55e)
    g.fillRect(8, 4, 12, 2)
    g.fillRect(8, 8, 18, 2)
    g.fillRect(8, 12, 8, 2)
    // Pied
    g.fillStyle(0x2a2a2a)
    g.fillRect(14, 20, 8, 4)
    g.fillRect(10, 23, 16, 3)
    // Check vert
    g.fillStyle(0x22c55e)
    g.fillCircle(30, 22, 5)
    g.lineStyle(2, 0xffffff)
    g.lineBetween(27, 22, 29, 24)
    g.lineBetween(29, 24, 33, 19)
    g.generateTexture('computer_new', 36, 28)
    
    // Icône interaction (étoile)
    g.clear()
    g.fillStyle(0xffd700)
    g.beginPath()
    g.moveTo(16, 2)
    g.lineTo(19, 10)
    g.lineTo(28, 12)
    g.lineTo(21, 18)
    g.lineTo(24, 26)
    g.lineTo(16, 21)
    g.lineTo(8, 26)
    g.lineTo(11, 18)
    g.lineTo(4, 12)
    g.lineTo(13, 10)
    g.closePath()
    g.fillPath()
    g.lineStyle(1, 0xffa500)
    g.strokePath()
    g.generateTexture('interact_icon', 32, 28)
    
    // Clé USB
    g.clear()
    g.fillStyle(0x333333)
    g.fillRoundedRect(2, 4, 20, 8, 2)
    g.fillStyle(0xc0c0c0)
    g.fillRect(18, 5, 8, 6)
    g.fillStyle(0x22c55e)
    g.fillCircle(8, 8, 2)
    g.generateTexture('usb_drive', 28, 16)
    
    // Câble
    g.clear()
    // Câble ondulé avec des segments
    g.fillStyle(0x333333)
    g.fillRect(4, 7, 6, 3)
    g.fillRect(10, 5, 6, 3)
    g.fillRect(16, 9, 6, 3)
    g.fillRect(22, 7, 6, 3)
    // Connecteurs
    g.fillStyle(0xc0c0c0)
    g.fillRect(0, 5, 6, 6)
    g.fillRect(26, 5, 6, 6)
    g.generateTexture('cable', 32, 16)
  }

  // ==================== PERSONNAGE ====================

  private generatePlayer(g: Phaser.GameObjects.Graphics): void {
    // Idle
    g.clear()
    
    // Ombre
    g.fillStyle(0x000000)
    g.setAlpha(0.3)
    g.fillEllipse(16, 46, 20, 8)
    g.setAlpha(1)
    
    // Corps (T-shirt vert NIRD)
    g.fillStyle(0x22c55e)
    g.fillRoundedRect(8, 18, 16, 18, 3)
    
    // Logo petit sur le t-shirt
    g.fillStyle(0x166534)
    g.fillRect(12, 22, 8, 6)
    
    // Bras
    g.fillStyle(0xffdbac)
    g.fillRect(4, 20, 6, 12)
    g.fillRect(22, 20, 6, 12)
    
    // Tête
    g.fillStyle(0xffdbac)
    g.fillRoundedRect(8, 4, 16, 16, 4)
    
    // Cheveux
    g.fillStyle(0x4a3728)
    g.fillRoundedRect(8, 2, 16, 10, 4)
    g.fillRect(8, 8, 16, 4)
    
    // Yeux
    g.fillStyle(0x000000)
    g.fillCircle(12, 12, 2)
    g.fillCircle(20, 12, 2)
    g.fillStyle(0xffffff)
    g.fillCircle(11, 11, 1)
    g.fillCircle(19, 11, 1)
    
    // Sourire
    g.lineStyle(1, 0x8b4513)
    g.beginPath()
    g.arc(16, 14, 4, 0.2, Math.PI - 0.2)
    g.strokePath()
    
    // Jean
    g.fillStyle(0x3b82f6)
    g.fillRect(9, 34, 6, 12)
    g.fillRect(17, 34, 6, 12)
    
    // Chaussures
    g.fillStyle(0x1a1a1a)
    g.fillRoundedRect(8, 44, 7, 5, 2)
    g.fillRoundedRect(17, 44, 7, 5, 2)
    
    g.generateTexture('player_idle', 32, 50)
    
    // Animation de marche
    for (let i = 0; i < 4; i++) {
      g.clear()
      const legOffset = Math.sin(i * Math.PI / 2) * 4
      const armOffset = Math.sin(i * Math.PI / 2) * 3
      const bobOffset = Math.abs(Math.sin(i * Math.PI / 2)) * 2
      
      // Ombre
      g.fillStyle(0x000000)
      g.setAlpha(0.3)
      g.fillEllipse(16, 46, 20, 8)
      g.setAlpha(1)
      
      // Corps
      g.fillStyle(0x22c55e)
      g.fillRoundedRect(8, 18 - bobOffset, 16, 18, 3)
      g.fillStyle(0x166534)
      g.fillRect(12, 22 - bobOffset, 8, 6)
      
      // Bras (balancement)
      g.fillStyle(0xffdbac)
      g.fillRect(4, 20 - armOffset - bobOffset, 6, 12)
      g.fillRect(22, 20 + armOffset - bobOffset, 6, 12)
      
      // Tête
      g.fillStyle(0xffdbac)
      g.fillRoundedRect(8, 4 - bobOffset, 16, 16, 4)
      g.fillStyle(0x4a3728)
      g.fillRoundedRect(8, 2 - bobOffset, 16, 10, 4)
      g.fillRect(8, 8 - bobOffset, 16, 4)
      g.fillStyle(0x000000)
      g.fillCircle(12, 12 - bobOffset, 2)
      g.fillCircle(20, 12 - bobOffset, 2)
      
      // Jambes (marche)
      g.fillStyle(0x3b82f6)
      g.fillRect(9, 34 + legOffset, 6, 12 - legOffset)
      g.fillRect(17, 34 - legOffset, 6, 12 + legOffset)
      
      // Chaussures
      g.fillStyle(0x1a1a1a)
      g.fillRoundedRect(8, 44 + legOffset, 7, 5, 2)
      g.fillRoundedRect(17, 44 - legOffset, 7, 5, 2)
      
      g.generateTexture(`player_walk_${i}`, 32, 50)
    }
  }
}
