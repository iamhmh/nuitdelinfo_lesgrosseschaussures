/**
 * Scène principale du jeu - Ville procédurale détaillée
 */
import Phaser from 'phaser'

interface Building {
  x: number
  y: number
  type: 'enterprise' | 'workshop' | 'school' | 'house' | 'shop' | 'apartment' | 'office'
  name: string
  sprite?: Phaser.GameObjects.Image
  interactZone?: Phaser.GameObjects.Zone
}

interface CollectibleComputer {
  x: number
  y: number
  collected: boolean
  sprite?: Phaser.GameObjects.Image
  interactIcon?: Phaser.GameObjects.Image
}

interface Car {
  sprite: Phaser.GameObjects.Image
  direction: 'h' | 'v'
  speed: number
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite
  private playerSpeed: number = 200
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }
  private interactKey!: Phaser.Input.Keyboard.Key
  
  private mapWidth: number = 2560
  private mapHeight: number = 1920
  private tileSize: number = 64
  
  private buildings: Building[] = []
  private computers: CollectibleComputer[] = []
  private decorations: Phaser.GameObjects.Image[] = []
  private cars: Car[] = []
  
  private collectedCount: number = 0
  private reconditionedCount: number = 0
  private distributedCount: number = 0
  private inventory: number = 0
  private nearBuilding: Building | null = null
  private nearComputer: CollectibleComputer | null = null

  constructor() {
    super({ key: 'MainScene' })
  }

  create(): void {
    this.createWorld()
    this.createPlayer()
    this.setupControls()
    this.setupCamera()
    this.createAnimations()
    this.setupEvents()
  }

  private createWorld(): void {
    // Fond d'herbe
    for (let x = 0; x < this.mapWidth; x += this.tileSize) {
      for (let y = 0; y < this.mapHeight; y += this.tileSize) {
        const variation = Math.random()
        let grassType = 'grass'
        if (variation > 0.85) grassType = 'grass_dark'
        else if (variation > 0.75) grassType = 'grass_light'
        this.add.image(x + 32, y + 32, grassType)
      }
    }
    
    this.createRoadNetwork()
    this.createBuildings()
    this.createComputers()
    this.createCars()
    this.createDecorations()
    this.createStreetFurniture()
    
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight)
  }

  private createRoadNetwork(): void {
    // Routes horizontales
    const horizontalRoads = [480, 960, 1440]
    horizontalRoads.forEach(roadY => {
      for (let x = 0; x < this.mapWidth; x += this.tileSize) {
        this.add.image(x + 32, roadY, 'road_h')
        this.add.image(x + 32, roadY + 64, 'road_h')
        this.add.image(x + 32, roadY - 64, 'sidewalk_border').setDepth(1)
        this.add.image(x + 32, roadY + 128, 'sidewalk_border').setDepth(1)
      }
    })
    
    // Routes verticales
    const verticalRoads = [640, 1280, 1920]
    verticalRoads.forEach(roadX => {
      for (let y = 0; y < this.mapHeight; y += this.tileSize) {
        this.add.image(roadX, y + 32, 'road_v')
        this.add.image(roadX + 64, y + 32, 'road_v')
        this.add.image(roadX - 64, y + 32, 'sidewalk').setDepth(1)
        this.add.image(roadX + 128, y + 32, 'sidewalk').setDepth(1)
      }
    })
    
    // Intersections
    horizontalRoads.forEach(roadY => {
      verticalRoads.forEach(roadX => {
        for (let dx = 0; dx < 2; dx++) {
          for (let dy = 0; dy < 2; dy++) {
            this.add.image(roadX + dx * 64, roadY + dy * 64, 'road_cross')
          }
        }
        this.add.image(roadX - 64, roadY + 32, 'crosswalk_v').setDepth(2)
        this.add.image(roadX + 128, roadY + 32, 'crosswalk_v').setDepth(2)
        this.add.image(roadX + 32, roadY - 64, 'crosswalk_h').setDepth(2)
        this.add.image(roadX + 32, roadY + 128, 'crosswalk_h').setDepth(2)
      })
    })
    
    // Parkings
    const parkings = [
      { x: 100, y: 550, w: 4, h: 2 },
      { x: 1700, y: 200, w: 3, h: 2 },
      { x: 2200, y: 1050, w: 4, h: 2 },
    ]
    parkings.forEach(area => {
      for (let px = 0; px < area.w; px++) {
        for (let py = 0; py < area.h; py++) {
          this.add.image(area.x + px * 64, area.y + py * 64, 'parking')
        }
      }
    })
  }

  private createBuildings(): void {
    this.buildings = [
      // Nord - Entreprises
      { x: 200, y: 380, type: 'enterprise', name: 'TechCorp Solutions' },
      { x: 450, y: 350, type: 'office', name: 'Digital Services' },
      { x: 850, y: 380, type: 'enterprise', name: 'DataSoft Analytics' },
      { x: 1100, y: 350, type: 'apartment', name: 'Résidence Les Pins' },
      { x: 1500, y: 380, type: 'enterprise', name: 'InfoSys Global' },
      { x: 1750, y: 350, type: 'office', name: 'Cloud Nine Tech' },
      { x: 2150, y: 380, type: 'enterprise', name: 'ByteForge Inc' },
      { x: 2400, y: 350, type: 'shop', name: 'Café du Coin' },
      
      // Centre - Zone mixte + NIRD
      { x: 200, y: 850, type: 'house', name: 'Villa Rose' },
      { x: 400, y: 880, type: 'shop', name: 'Boulangerie' },
      { x: 850, y: 850, type: 'apartment', name: 'Immeuble Central' },
      { x: 1280, y: 800, type: 'workshop', name: '🔧 Atelier NIRD' },
      { x: 1600, y: 850, type: 'shop', name: 'Librairie' },
      { x: 1850, y: 880, type: 'house', name: 'Maison Bleue' },
      { x: 2150, y: 850, type: 'apartment', name: 'Les Terrasses' },
      { x: 2400, y: 880, type: 'shop', name: 'Pharmacie' },
      
      // Sud - Écoles
      { x: 200, y: 1340, type: 'school', name: '📚 École Jean Jaurès' },
      { x: 500, y: 1380, type: 'house', name: 'Maison Verte' },
      { x: 850, y: 1340, type: 'school', name: '📚 Collège Victor Hugo' },
      { x: 1100, y: 1380, type: 'house', name: 'Le Pavillon' },
      { x: 1500, y: 1340, type: 'school', name: '📚 Lycée Marie Curie' },
      { x: 1750, y: 1380, type: 'apartment', name: 'Résidence Sud' },
      { x: 2100, y: 1340, type: 'school', name: '📚 École Montessori' },
      { x: 2400, y: 1380, type: 'house', name: 'Le Chalet' },
      
      // Parc sud
      { x: 150, y: 1780, type: 'house', name: 'Maison du Gardien' },
      { x: 2450, y: 1780, type: 'shop', name: 'Kiosque du Parc' },
    ]
    
    this.buildings.forEach(building => {
      const textureKey = building.type === 'office' ? 'building_office' : `building_${building.type}`
      
      building.sprite = this.add.image(building.x, building.y, textureKey)
        .setOrigin(0.5, 1)
        .setDepth(building.y)
      
      const zoneWidth = building.type === 'workshop' ? 200 : 150
      building.interactZone = this.add.zone(building.x, building.y + 20, zoneWidth, 100)
      this.physics.add.existing(building.interactZone, true)
    })
  }

  private createComputers(): void {
    const techBuildings = this.buildings.filter(b => 
      b.type === 'enterprise' || b.type === 'office'
    )
    
    techBuildings.forEach(building => {
      const numComputers = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < numComputers; i++) {
        const offsetX = (Math.random() - 0.5) * 150
        const offsetY = 60 + Math.random() * 50
        this.computers.push({
          x: building.x + offsetX,
          y: building.y + offsetY,
          collected: false,
        })
      }
    })
    
    this.computers.forEach(computer => {
      computer.sprite = this.add.image(computer.x, computer.y, 'computer_old')
        .setDepth(computer.y)
        .setScale(1.5)
      
      computer.interactIcon = this.add.image(computer.x, computer.y - 35, 'interact_icon')
        .setDepth(computer.y + 100)
        .setScale(0.8)
        .setVisible(false)
      
      this.tweens.add({
        targets: computer.interactIcon,
        y: computer.y - 45,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    })
  }

  private createCars(): void {
    const carColors = ['red', 'blue', 'green', 'yellow', 'white', 'black', 'silver']
    
    // Voitures garées
    const parkingSpots = [
      { x: 120, y: 570 }, { x: 180, y: 570 }, { x: 240, y: 570 },
      { x: 1720, y: 220 }, { x: 1780, y: 220 },
      { x: 2220, y: 1070 }, { x: 2280, y: 1070 },
    ]
    
    parkingSpots.forEach(pos => {
      const color = Phaser.Math.RND.pick(carColors)
      this.add.image(pos.x, pos.y, `car_${color}`)
        .setDepth(pos.y)
        .setRotation(Math.PI / 2)
    })
    
    // Voitures en mouvement
    const movingCars = [
      { x: 100, y: 485, dir: 'h' as const },
      { x: 500, y: 1025, dir: 'h' as const },
      { x: 670, y: 200, dir: 'v' as const },
      { x: 1310, y: 600, dir: 'v' as const },
    ]
    
    movingCars.forEach(carInfo => {
      const color = Phaser.Math.RND.pick(carColors)
      const sprite = this.add.image(carInfo.x, carInfo.y, `car_${color}`)
        .setDepth(carInfo.y + 10)
        .setRotation(carInfo.dir === 'h' ? Math.PI : Math.PI / 2)
      
      this.cars.push({
        sprite,
        direction: carInfo.dir,
        speed: 40 + Math.random() * 40,
      })
    })
  }

  private createDecorations(): void {
    // Arbres
    const treePositions = [
      { x: 100, y: 150 }, { x: 300, y: 120 }, { x: 500, y: 150 },
      { x: 1000, y: 130 }, { x: 1500, y: 150 }, { x: 2000, y: 120 },
      { x: 400, y: 1700 }, { x: 600, y: 1750 }, { x: 800, y: 1680 },
      { x: 1000, y: 1720 }, { x: 1200, y: 1760 }, { x: 1400, y: 1700 },
      { x: 1600, y: 1740 }, { x: 1800, y: 1680 }, { x: 2000, y: 1720 },
      { x: 550, y: 400 }, { x: 1200, y: 400 }, { x: 1900, y: 400 },
      { x: 600, y: 900 }, { x: 1000, y: 900 }, { x: 1900, y: 900 },
    ]
    
    treePositions.forEach(pos => {
      const treeType = Math.random() > 0.3 ? 'tree' : 'tree_pine'
      this.add.image(pos.x, pos.y, treeType)
        .setOrigin(0.5, 1)
        .setDepth(pos.y)
        .setScale(0.9 + Math.random() * 0.3)
    })
    
    // Buissons
    for (let i = 0; i < 35; i++) {
      let x: number, y: number
      do {
        x = 50 + Math.random() * (this.mapWidth - 100)
        y = 50 + Math.random() * (this.mapHeight - 100)
      } while (this.isOnRoad(x, y))
      
      this.add.image(x, y, Math.random() > 0.5 ? 'bush' : 'bush_round')
        .setOrigin(0.5, 1)
        .setDepth(y)
        .setScale(0.7 + Math.random() * 0.5)
    }
    
    // Fleurs
    for (let i = 0; i < 50; i++) {
      let x: number, y: number
      do {
        x = 50 + Math.random() * (this.mapWidth - 100)
        y = 50 + Math.random() * (this.mapHeight - 100)
      } while (this.isOnRoad(x, y))
      
      const flowerType = Phaser.Math.RND.pick(['flower', 'flower_yellow', 'flower_tulip'])
      this.add.image(x, y, flowerType)
        .setOrigin(0.5, 1)
        .setDepth(y - 10)
        .setScale(0.5 + Math.random() * 0.5)
    }
    
    // Rochers
    for (let i = 0; i < 10; i++) {
      let x: number, y: number
      do {
        x = 50 + Math.random() * (this.mapWidth - 100)
        y = 50 + Math.random() * (this.mapHeight - 100)
      } while (this.isOnRoad(x, y))
      
      this.add.image(x, y, 'rock')
        .setOrigin(0.5, 1)
        .setDepth(y)
        .setScale(0.6 + Math.random() * 0.6)
    }
    
    // Fontaine dans le parc
    this.add.image(1280, 1700, 'fountain')
      .setOrigin(0.5, 0.5)
      .setDepth(1700)
      .setScale(1.5)
  }

  private createStreetFurniture(): void {
    // Lampadaires
    const lampPositions = [
      { x: 576, y: 420 }, { x: 576, y: 900 }, { x: 576, y: 1380 },
      { x: 704, y: 420 }, { x: 704, y: 900 }, { x: 704, y: 1380 },
      { x: 1216, y: 420 }, { x: 1216, y: 900 }, { x: 1216, y: 1380 },
      { x: 1344, y: 420 }, { x: 1344, y: 900 }, { x: 1344, y: 1380 },
    ]
    lampPositions.forEach(pos => {
      this.add.image(pos.x, pos.y, 'lamppost')
        .setOrigin(0.5, 1)
        .setDepth(pos.y)
    })
    
    // Feux tricolores
    const trafficLights = [
      { x: 580, y: 520 }, { x: 700, y: 440 },
      { x: 1220, y: 520 }, { x: 1340, y: 440 },
      { x: 580, y: 1000 }, { x: 700, y: 920 },
    ]
    trafficLights.forEach(pos => {
      this.add.image(pos.x, pos.y, 'traffic_light')
        .setOrigin(0.5, 1)
        .setDepth(pos.y)
    })
    
    // Bancs
    const benchPositions = [
      { x: 1200, y: 1720 }, { x: 1360, y: 1720 },
      { x: 300, y: 1720 }, { x: 2260, y: 1720 },
    ]
    benchPositions.forEach(pos => {
      this.add.image(pos.x, pos.y, 'bench')
        .setOrigin(0.5, 1)
        .setDepth(pos.y)
    })
    
    // Poubelles
    const trashPositions = [
      { x: 590, y: 500 }, { x: 710, y: 500 },
      { x: 1230, y: 500 }, { x: 1280, y: 1680 },
    ]
    trashPositions.forEach(pos => {
      this.add.image(pos.x, pos.y, 'trashcan')
        .setOrigin(0.5, 1)
        .setDepth(pos.y)
    })
    
    // Arrêts de bus
    const busStops = [
      { x: 560, y: 550 }, { x: 1200, y: 550 },
    ]
    busStops.forEach(pos => {
      this.add.image(pos.x, pos.y, 'bus_stop')
        .setOrigin(0.5, 1)
        .setDepth(pos.y)
    })
    
    // Panneaux
    const signs = [
      { x: 1350, y: 750 }, { x: 700, y: 1300 }, { x: 700, y: 350 },
    ]
    signs.forEach(pos => {
      this.add.image(pos.x, pos.y, 'sign')
        .setOrigin(0.5, 1)
        .setDepth(pos.y)
    })
    
    // Boîtes aux lettres devant les maisons
    this.buildings.filter(b => b.type === 'house').forEach(house => {
      this.add.image(house.x + 40, house.y + 10, 'mailbox')
        .setOrigin(0.5, 1)
        .setDepth(house.y + 15)
    })
  }

  private isOnRoad(x: number, y: number): boolean {
    const horizontalRoads = [480, 960, 1440]
    for (const roadY of horizontalRoads) {
      if (y > roadY - 80 && y < roadY + 144) return true
    }
    
    const verticalRoads = [640, 1280, 1920]
    for (const roadX of verticalRoads) {
      if (x > roadX - 80 && x < roadX + 144) return true
    }
    
    return false
  }

  private createPlayer(): void {
    this.player = this.add.sprite(1280, 1000, 'player_idle')
      .setOrigin(0.5, 1)
      .setScale(1.5)
    
    this.physics.add.existing(this.player)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)
    playerBody.setSize(20, 16)
    playerBody.setOffset(6, 32)
  }

  private createAnimations(): void {
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: [
          { key: 'player_walk_0' },
          { key: 'player_walk_1' },
          { key: 'player_walk_2' },
          { key: 'player_walk_3' },
        ],
        frameRate: 10,
        repeat: -1,
      })
    }
  }

  private setupControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E)
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(1)
  }

  private setupEvents(): void {
    this.interactKey.on('down', () => {
      this.handleInteraction()
    })
  }

  update(): void {
    this.handleMovement()
    this.checkProximity()
    this.updateDepth()
    this.updateCars()
  }

  private handleMovement(): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setVelocity(0)
    
    let isMoving = false
    
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      playerBody.setVelocityX(-this.playerSpeed)
      this.player.setFlipX(true)
      isMoving = true
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      playerBody.setVelocityX(this.playerSpeed)
      this.player.setFlipX(false)
      isMoving = true
    }
    
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      playerBody.setVelocityY(-this.playerSpeed)
      isMoving = true
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      playerBody.setVelocityY(this.playerSpeed)
      isMoving = true
    }
    
    const velocity = playerBody.velocity
    if (velocity.x !== 0 && velocity.y !== 0) {
      playerBody.setVelocity(velocity.x * 0.707, velocity.y * 0.707)
    }
    
    if (isMoving) {
      this.player.play('walk', true)
    } else {
      this.player.setTexture('player_idle')
    }
  }

  private checkProximity(): void {
    this.nearBuilding = null
    this.nearComputer = null
    
    this.computers.forEach(c => {
      if (c.interactIcon && !c.collected) {
        c.interactIcon.setVisible(false)
      }
    })
    
    for (const building of this.buildings) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        building.x, building.y
      )
      
      if (distance < 120) {
        this.nearBuilding = building
        this.events.emit('nearBuilding', building)
        break
      }
    }
    
    if (!this.nearBuilding) {
      this.events.emit('nearBuilding', null)
    }
    
    for (const computer of this.computers) {
      if (computer.collected) continue
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        computer.x, computer.y
      )
      
      if (distance < 60) {
        this.nearComputer = computer
        if (computer.interactIcon) {
          computer.interactIcon.setVisible(true)
        }
        break
      }
    }
  }

  private updateDepth(): void {
    this.player.setDepth(this.player.y)
  }

  private updateCars(): void {
    const delta = this.game.loop.delta / 1000
    
    this.cars.forEach(car => {
      if (car.direction === 'h') {
        car.sprite.x += car.speed * delta
        if (car.sprite.x > this.mapWidth + 50) {
          car.sprite.x = -50
        }
      } else {
        car.sprite.y += car.speed * delta
        if (car.sprite.y > this.mapHeight + 50) {
          car.sprite.y = -50
        }
      }
      car.sprite.setDepth(car.sprite.y + 10)
    })
  }

  private handleInteraction(): void {
    if (this.nearComputer && !this.nearComputer.collected) {
      this.collectComputer(this.nearComputer)
      return
    }
    
    if (this.nearBuilding) {
      this.interactWithBuilding(this.nearBuilding)
    }
  }

  private collectComputer(computer: CollectibleComputer): void {
    computer.collected = true
    this.collectedCount++
    this.inventory++
    
    this.tweens.add({
      targets: computer.sprite,
      y: computer.y - 50,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      onComplete: () => {
        computer.sprite?.destroy()
        computer.interactIcon?.destroy()
      }
    })
    
    const collectText = this.add.text(computer.x, computer.y - 30, '+1 PC 💻', {
      fontSize: '20px',
      color: '#22c55e',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(9999)
    
    this.tweens.add({
      targets: collectText,
      y: computer.y - 80,
      alpha: 0,
      duration: 800,
      onComplete: () => collectText.destroy()
    })
    
    this.events.emit('updateStats', {
      collected: this.collectedCount,
      reconditioned: this.reconditionedCount,
      distributed: this.distributedCount,
      inventory: this.inventory,
    })
    
    this.events.emit('showMessage', `PC obsolète collecté ! (${this.inventory} en inventaire)`)
  }

  private interactWithBuilding(building: Building): void {
    switch (building.type) {
      case 'enterprise':
      case 'office':
        this.events.emit('showMessage', `${building.name}: "Prenez ces vieux PC..."`)
        break
        
      case 'workshop':
        if (this.inventory > 0) {
          this.reconditionComputers()
        } else {
          this.events.emit('showMessage', '🔧 Atelier NIRD: "Apportez-nous des PC à reconditionner !"')
        }
        break
        
      case 'school':
        if (this.reconditionedCount > this.distributedCount) {
          this.distributeComputer(building)
        } else {
          this.events.emit('showMessage', `${building.name}: "Nous attendons des PC !"`)
        }
        break
        
      case 'house':
        this.events.emit('showMessage', '"Merci pour votre action écologique ! 🌱"')
        break
        
      case 'shop':
        this.events.emit('showMessage', `${building.name}: "Bonne journée !"`)
        break
        
      case 'apartment':
        this.events.emit('showMessage', '"L\'économie circulaire, c\'est l\'avenir !"')
        break
    }
  }

  private reconditionComputers(): void {
    const toRecondition = this.inventory
    this.inventory = 0
    this.reconditionedCount += toRecondition
    
    const workshop = this.buildings.find(b => b.type === 'workshop')
    if (workshop) {
      const text = this.add.text(workshop.x, workshop.y - 60, `+${toRecondition} PC Linux ! 🐧`, {
        fontSize: '24px',
        color: '#22c55e',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(9999)
      
      this.tweens.add({
        targets: text,
        y: workshop.y - 120,
        alpha: 0,
        duration: 1500,
        onComplete: () => text.destroy()
      })
    }
    
    this.events.emit('updateStats', {
      collected: this.collectedCount,
      reconditioned: this.reconditionedCount,
      distributed: this.distributedCount,
      inventory: this.inventory,
    })
    
    this.events.emit('showMessage', `🎉 ${toRecondition} PC reconditionnés ! Distribuez-les aux écoles.`)
  }

  private distributeComputer(school: Building): void {
    this.distributedCount++
    
    const newPc = this.add.image(
      school.x + (Math.random() - 0.5) * 80,
      school.y + 50,
      'computer_new'
    ).setScale(0).setDepth(school.y + 60)
    
    this.tweens.add({
      targets: newPc,
      scale: 1.2,
      duration: 300,
      ease: 'Back.easeOut'
    })
    
    const text = this.add.text(school.x, school.y - 30, '🎉 +1 PC distribué !', {
      fontSize: '20px',
      color: '#ec4899',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(9999)
    
    this.tweens.add({
      targets: text,
      y: school.y - 80,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    })
    
    this.events.emit('updateStats', {
      collected: this.collectedCount,
      reconditioned: this.reconditionedCount,
      distributed: this.distributedCount,
      inventory: this.inventory,
    })
    
    this.events.emit('showMessage', `PC offert à ${school.name} ! 🐧`)
    
    if (this.distributedCount >= 8) {
      this.events.emit('victory')
    }
  }
}
