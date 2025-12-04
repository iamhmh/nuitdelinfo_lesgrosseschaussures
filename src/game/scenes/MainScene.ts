/**
 * MainScene - Ville procédurale avec layout cohérent
 */
import Phaser from 'phaser'

interface Building {
  x: number
  y: number
  type: 'enterprise' | 'workshop' | 'school' | 'house' | 'shop' | 'apartment' | 'office'
  name: string
  sprite?: Phaser.GameObjects.Image
}

interface CollectibleComputer {
  x: number
  y: number
  collected: boolean
  sprite?: Phaser.GameObjects.Image
  interactIcon?: Phaser.GameObjects.Image
}

interface NPC {
  sprite: Phaser.GameObjects.Sprite
  type: 'citizen' | 'woman' | 'technician'
  isMoving: boolean
  targetX?: number
  targetY?: number
  speed: number
  direction: 'left' | 'right'
}

interface Car {
  sprite: Phaser.GameObjects.Image
  direction: 'h' | 'v'
  speed: number
  lane: number
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite
  private playerSpeed: number = 180
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private interactKey!: Phaser.Input.Keyboard.Key
  
  // Map dimensions - Grille bien définie
  private mapWidth: number = 2560
  private mapHeight: number = 1920
  private tileSize: number = 64
  
  // Layout de la ville (en tiles)
  // Routes horizontales: y = 7, 15, 23 (en tiles, donc * 64 = pixels)
  // Routes verticales: x = 10, 20, 30 (en tiles)
  private roadTilesH = [7, 15, 23] // Lignes de routes horizontales
  private roadTilesV = [10, 20, 30] // Colonnes de routes verticales
  
  private buildings: Building[] = []
  private computers: CollectibleComputer[] = []
  private cars: Car[] = []
  private npcs: NPC[] = []
  
  private collectedCount: number = 0
  private reconditionedCount: number = 0
  private distributedCount: number = 0
  private inventory: number = 0
  private nearBuilding: Building | null = null
  private nearComputer: CollectibleComputer | null = null
  
  // Debug
  private debugText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'MainScene' })
  }

  create(): void {
    this.createTerrain()
    this.createBuildings()
    this.createComputers()
    this.createCars()
    this.createNPCs()
    this.createVegetation()
    this.createPlayer()
    this.setupControls()
    this.setupCamera()
    this.createAnimations()
    this.setupEvents()
    this.createDebugUI()
    
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight)
  }

  // ==================== TERRAIN ====================
  private createTerrain(): void {
    const tilesX = Math.ceil(this.mapWidth / this.tileSize)
    const tilesY = Math.ceil(this.mapHeight / this.tileSize)
    
    // Dessiner l'herbe partout d'abord
    for (let tx = 0; tx < tilesX; tx++) {
      for (let ty = 0; ty < tilesY; ty++) {
        const px = tx * this.tileSize + 32
        const py = ty * this.tileSize + 32
        const grassType = Math.random() > 0.85 ? 'grass_dark' : 'grass'
        this.add.image(px, py, grassType).setDepth(0)
      }
    }
    
    // Dessiner les routes et trottoirs
    this.createRoads()
  }

  private createRoads(): void {
    const tilesX = Math.ceil(this.mapWidth / this.tileSize)
    const tilesY = Math.ceil(this.mapHeight / this.tileSize)
    
    // Routes horizontales (2 tiles de large chacune)
    this.roadTilesH.forEach(roadY => {
      for (let tx = 0; tx < tilesX; tx++) {
        const px = tx * this.tileSize + 32
        // Trottoir haut
        this.add.image(px, (roadY - 1) * this.tileSize + 32, 'sidewalk').setDepth(1)
        // Route (2 voies)
        this.add.image(px, roadY * this.tileSize + 32, 'road_h').setDepth(1)
        this.add.image(px, (roadY + 1) * this.tileSize + 32, 'road').setDepth(1)
        // Trottoir bas
        this.add.image(px, (roadY + 2) * this.tileSize + 32, 'sidewalk').setDepth(1)
      }
    })
    
    // Routes verticales (2 tiles de large chacune)
    this.roadTilesV.forEach(roadX => {
      for (let ty = 0; ty < tilesY; ty++) {
        const py = ty * this.tileSize + 32
        
        // Ne pas dessiner sur les intersections (déjà fait par routes H)
        const isHRoad = this.roadTilesH.some(h => ty >= h - 1 && ty <= h + 2)
        if (isHRoad) continue
        
        // Trottoir gauche
        this.add.image((roadX - 1) * this.tileSize + 32, py, 'sidewalk').setDepth(1)
        // Route (2 voies)
        this.add.image(roadX * this.tileSize + 32, py, 'road_v').setDepth(1)
        this.add.image((roadX + 1) * this.tileSize + 32, py, 'road').setDepth(1)
        // Trottoir droit
        this.add.image((roadX + 2) * this.tileSize + 32, py, 'sidewalk').setDepth(1)
      }
    })
    
    // Intersections
    this.roadTilesH.forEach(roadY => {
      this.roadTilesV.forEach(roadX => {
        // Centre intersection
        for (let dx = 0; dx < 2; dx++) {
          for (let dy = 0; dy < 2; dy++) {
            const px = (roadX + dx) * this.tileSize + 32
            const py = (roadY + dy) * this.tileSize + 32
            this.add.image(px, py, 'road_cross').setDepth(1)
          }
        }
        
        // Passages piétons
        this.add.image((roadX - 1) * this.tileSize + 32, roadY * this.tileSize + 32, 'crosswalk_v').setDepth(2)
        this.add.image((roadX - 1) * this.tileSize + 32, (roadY + 1) * this.tileSize + 32, 'crosswalk_v').setDepth(2)
        this.add.image((roadX + 2) * this.tileSize + 32, roadY * this.tileSize + 32, 'crosswalk_v').setDepth(2)
        this.add.image((roadX + 2) * this.tileSize + 32, (roadY + 1) * this.tileSize + 32, 'crosswalk_v').setDepth(2)
        
        // Feux tricolores sur les trottoirs des intersections
        const trafficLightPositions = [
          { x: roadX - 1, y: roadY - 1 },
          { x: roadX + 2, y: roadY - 1 },
          { x: roadX - 1, y: roadY + 2 },
          { x: roadX + 2, y: roadY + 2 },
        ]
        trafficLightPositions.forEach(pos => {
          const px = pos.x * this.tileSize + 32
          const py = pos.y * this.tileSize + 32
          this.add.image(px, py, 'traffic_light').setOrigin(0.5, 1).setDepth(py + 50)
        })
      })
    })
  }

  // ==================== BÂTIMENTS ====================
  private createBuildings(): void {
    // ZONE ENTREPRISES - Haut de la carte, groupées ensemble (aspect rigide)
    // Entre les routes y=7 et y=0, et autour de x=10-30
    this.addBuildingsInZone([
      { tx: 2, ty: 3, type: 'enterprise', name: 'TechCorp Solutions' },
      { tx: 5, ty: 2, type: 'enterprise', name: 'DataSoft Analytics' },
      { tx: 5, ty: 4, type: 'office', name: 'ByteCloud Services' },
      { tx: 8, ty: 3, type: 'enterprise', name: 'InfoSys Global' },
    ])
    
    // Deuxième zone entreprises (droite)
    this.addBuildingsInZone([
      { tx: 23, ty: 2, type: 'enterprise', name: 'GreenTech Inc' },
      { tx: 26, ty: 3, type: 'enterprise', name: 'EcoData Systems' },
      { tx: 23, ty: 4, type: 'office', name: 'Digital Factory' },
      { tx: 26, ty: 5, type: 'office', name: 'Innovation Hub' },
    ])
    
    // ATELIER NIRD - Centre de la carte (entre routes)
    this.buildings.push({
      x: 15 * this.tileSize,
      y: 12 * this.tileSize,
      type: 'workshop',
      name: '🔧 Atelier NIRD - Reconditionnement Linux'
    })
    
    // ÉCOLES - Bas de la carte, espacées
    this.addBuildingsInZone([
      { tx: 3, ty: 26, type: 'school', name: '📚 École Primaire Jean Jaurès' },
      { tx: 14, ty: 27, type: 'school', name: '📚 Collège Victor Hugo' },
      { tx: 25, ty: 26, type: 'school', name: '📚 Lycée Marie Curie' },
      { tx: 36, ty: 27, type: 'school', name: '📚 École Montessori' },
    ])
    
    // BÂTIMENTS NEUTRES - Remplissage de l'espace
    // Zone résidentielle gauche
    this.addBuildingsInZone([
      { tx: 2, ty: 10, type: 'house', name: 'Maison Rose' },
      { tx: 5, ty: 11, type: 'apartment', name: 'Résidence du Parc' },
      { tx: 8, ty: 10, type: 'shop', name: 'Boulangerie Martin' },
      { tx: 2, ty: 18, type: 'house', name: 'Villa Bleue' },
      { tx: 5, ty: 19, type: 'shop', name: 'Café du Centre' },
      { tx: 8, ty: 18, type: 'apartment', name: 'Les Jardins' },
    ])
    
    // Zone résidentielle centre
    this.addBuildingsInZone([
      { tx: 13, ty: 10, type: 'shop', name: 'Librairie Pages' },
      { tx: 17, ty: 11, type: 'apartment', name: 'Immeuble Central' },
      { tx: 13, ty: 18, type: 'house', name: 'Pavillon Vert' },
      { tx: 17, ty: 19, type: 'shop', name: 'Pharmacie Santé' },
    ])
    
    // Zone résidentielle droite
    this.addBuildingsInZone([
      { tx: 33, ty: 10, type: 'apartment', name: 'Les Terrasses' },
      { tx: 36, ty: 11, type: 'house', name: 'Maison du Lac' },
      { tx: 33, ty: 18, type: 'shop', name: 'Épicerie Bio' },
      { tx: 36, ty: 19, type: 'house', name: 'Chalet Moderne' },
    ])
    
    // Créer les sprites
    this.buildings.forEach(building => {
      const textureKey = `building_${building.type}`
      building.sprite = this.add.image(building.x, building.y, textureKey)
        .setOrigin(0.5, 1)
        .setDepth(building.y)
        .setScale(1.2) // Bâtiments plus grands
    })
  }

  private addBuildingsInZone(defs: Array<{tx: number, ty: number, type: Building['type'], name: string}>): void {
    defs.forEach(def => {
      this.buildings.push({
        x: def.tx * this.tileSize + this.tileSize / 2,
        y: def.ty * this.tileSize + this.tileSize,
        type: def.type,
        name: def.name
      })
    })
  }

  // ==================== ORDINATEURS ====================
  private createComputers(): void {
    const techBuildings = this.buildings.filter(b => 
      b.type === 'enterprise' || b.type === 'office'
    )
    
    techBuildings.forEach(building => {
      const numComputers = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < numComputers; i++) {
        // Position devant le bâtiment (sur l'herbe)
        const offsetX = (Math.random() - 0.5) * 100
        const offsetY = 40 + Math.random() * 40
        
        const compX = building.x + offsetX
        const compY = building.y + offsetY
        
        // Vérifier qu'on n'est pas sur la route
        if (!this.isOnRoad(compX, compY)) {
          this.computers.push({
            x: compX,
            y: compY,
            collected: false,
          })
        }
      }
    })
    
    this.computers.forEach(computer => {
      computer.sprite = this.add.image(computer.x, computer.y, 'computer_old')
        .setDepth(computer.y)
        .setScale(1.2)
      
      computer.interactIcon = this.add.image(computer.x, computer.y - 30, 'interact_icon')
        .setDepth(computer.y + 100)
        .setScale(0.8)
        .setVisible(false)
      
      this.tweens.add({
        targets: computer.interactIcon,
        y: computer.y - 40,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    })
  }

  // ==================== VOITURES ====================
  private createCars(): void {
    const carColors = ['red', 'blue', 'green', 'yellow', 'white', 'black']
    
    // Voitures sur les routes horizontales
    this.roadTilesH.forEach((roadY) => {
      for (let i = 0; i < 2; i++) {
        const color = Phaser.Math.RND.pick(carColors)
        const laneY = (roadY + (i === 0 ? 0.3 : 1.3)) * this.tileSize + 32
        const startX = Math.random() * this.mapWidth
        
        const sprite = this.add.image(startX, laneY, `car_${color}`)
          .setScale(0.9) // Voitures plus grandes
          .setDepth(laneY + 5)
          .setRotation(i === 0 ? 0 : Math.PI) // Direction opposée par voie
        
        this.cars.push({
          sprite,
          direction: 'h',
          speed: (60 + Math.random() * 40) * (i === 0 ? 1 : -1),
          lane: i
        })
      }
    })
    
    // Voitures sur les routes verticales
    this.roadTilesV.forEach((roadX) => {
      for (let i = 0; i < 2; i++) {
        const color = Phaser.Math.RND.pick(carColors)
        const laneX = (roadX + (i === 0 ? 0.3 : 1.3)) * this.tileSize + 32
        const startY = Math.random() * this.mapHeight
        
        const sprite = this.add.image(laneX, startY, `car_${color}`)
          .setScale(0.9)
          .setDepth(startY + 5)
          .setRotation(i === 0 ? -Math.PI / 2 : Math.PI / 2)
        
        this.cars.push({
          sprite,
          direction: 'v',
          speed: (60 + Math.random() * 40) * (i === 0 ? 1 : -1),
          lane: i
        })
      }
    })
  }

  // ==================== PNJs ====================
  private createNPCs(): void {
    const npcTypes: Array<'citizen' | 'woman' | 'technician'> = ['citizen', 'woman', 'technician']
    
    // PNJs fixes (sur les trottoirs)
    const fixedNPCPositions = [
      { tx: 9, ty: 6 },  // Trottoir près d'une intersection
      { tx: 19, ty: 6 },
      { tx: 9, ty: 14 },
      { tx: 21, ty: 14 },
      { tx: 9, ty: 22 },
      { tx: 19, ty: 22 },
      { tx: 31, ty: 6 },
      { tx: 31, ty: 22 },
    ]
    
    fixedNPCPositions.forEach(pos => {
      const type = Phaser.Math.RND.pick(npcTypes)
      const sprite = this.add.sprite(
        pos.tx * this.tileSize + 32,
        pos.ty * this.tileSize + 32,
        `npc_${type}`
      ).setOrigin(0.5, 1).setScale(1.1).setDepth(pos.ty * this.tileSize + 100)
      
      this.npcs.push({
        sprite,
        type,
        isMoving: false,
        speed: 0,
        direction: Math.random() > 0.5 ? 'left' : 'right'
      })
    })
    
    // PNJs en mouvement (sur les trottoirs)
    const movingNPCPositions = [
      { tx: 5, ty: 6, targetTx: 30 },
      { tx: 28, ty: 14, targetTx: 5 },
      { tx: 10, ty: 22, targetTx: 35 },
      { tx: 15, ty: 6, targetTx: 25 },
      { tx: 32, ty: 14, targetTx: 12 },
    ]
    
    movingNPCPositions.forEach(pos => {
      const type = Phaser.Math.RND.pick(npcTypes)
      const startX = pos.tx * this.tileSize + 32
      const startY = pos.ty * this.tileSize + 32
      
      const sprite = this.add.sprite(startX, startY, `npc_${type}`)
        .setOrigin(0.5, 1)
        .setScale(1.1)
        .setDepth(startY + 100)
      
      const targetX = pos.targetTx * this.tileSize + 32
      const direction = targetX > startX ? 'right' : 'left'
      sprite.setFlipX(direction === 'left')
      
      this.npcs.push({
        sprite,
        type,
        isMoving: true,
        targetX,
        targetY: startY,
        speed: 30 + Math.random() * 20,
        direction
      })
    })
    
    // Techniciens près de l'atelier NIRD
    const workshop = this.buildings.find(b => b.type === 'workshop')
    if (workshop) {
      for (let i = 0; i < 2; i++) {
        const sprite = this.add.sprite(
          workshop.x + (i === 0 ? -60 : 60),
          workshop.y + 20,
          'npc_technician'
        ).setOrigin(0.5, 1).setScale(1.1).setDepth(workshop.y + 100)
        
        this.npcs.push({
          sprite,
          type: 'technician',
          isMoving: false,
          speed: 0,
          direction: i === 0 ? 'right' : 'left'
        })
      }
    }
  }

  // ==================== VÉGÉTATION ====================
  private createVegetation(): void {
    // Arbres - uniquement sur l'herbe
    const treePositions: Array<{tx: number, ty: number}> = []
    
    // Bordures de la carte
    for (let tx = 0; tx < 40; tx += 3) {
      if (!this.isTileOnRoadOrBuilding(tx, 0)) treePositions.push({ tx, ty: 1 })
      if (!this.isTileOnRoadOrBuilding(tx, 29)) treePositions.push({ tx, ty: 28 })
    }
    for (let ty = 0; ty < 30; ty += 3) {
      if (!this.isTileOnRoadOrBuilding(0, ty)) treePositions.push({ tx: 1, ty })
      if (!this.isTileOnRoadOrBuilding(39, ty)) treePositions.push({ tx: 38, ty })
    }
    
    // Arbres entre les zones
    const additionalTrees = [
      { tx: 12, ty: 4 }, { tx: 18, ty: 4 }, { tx: 22, ty: 4 },
      { tx: 12, ty: 12 }, { tx: 18, ty: 12 },
      { tx: 12, ty: 20 }, { tx: 18, ty: 20 }, { tx: 28, ty: 20 },
      { tx: 6, ty: 25 }, { tx: 20, ty: 25 }, { tx: 32, ty: 25 },
    ]
    treePositions.push(...additionalTrees.filter(p => !this.isTileOnRoadOrBuilding(p.tx, p.ty)))
    
    treePositions.forEach(pos => {
      const px = pos.tx * this.tileSize + 32
      const py = pos.ty * this.tileSize + 64
      const treeType = Math.random() > 0.4 ? 'tree' : 'tree_pine'
      this.add.image(px, py, treeType)
        .setOrigin(0.5, 1)
        .setDepth(py)
        .setScale(0.9 + Math.random() * 0.3)
    })
    
    // Buissons - sur l'herbe uniquement
    for (let i = 0; i < 40; i++) {
      let tx: number, ty: number
      let attempts = 0
      do {
        tx = Math.floor(Math.random() * 40)
        ty = Math.floor(Math.random() * 30)
        attempts++
      } while (this.isTileOnRoadOrBuilding(tx, ty) && attempts < 20)
      
      if (attempts < 20) {
        const px = tx * this.tileSize + 32 + (Math.random() - 0.5) * 30
        const py = ty * this.tileSize + 48
        this.add.image(px, py, 'bush')
          .setOrigin(0.5, 1)
          .setDepth(py)
          .setScale(0.6 + Math.random() * 0.4)
      }
    }
    
    // Fleurs - sur l'herbe uniquement
    for (let i = 0; i < 60; i++) {
      let tx: number, ty: number
      let attempts = 0
      do {
        tx = Math.floor(Math.random() * 40)
        ty = Math.floor(Math.random() * 30)
        attempts++
      } while (this.isTileOnRoadOrBuilding(tx, ty) && attempts < 20)
      
      if (attempts < 20) {
        const px = tx * this.tileSize + 32 + (Math.random() - 0.5) * 40
        const py = ty * this.tileSize + 40
        const flowerType = Math.random() > 0.5 ? 'flower' : 'flower_yellow'
        this.add.image(px, py, flowerType)
          .setOrigin(0.5, 1)
          .setDepth(py - 10)
          .setScale(0.5 + Math.random() * 0.4)
      }
    }
    
    // Rochers
    for (let i = 0; i < 15; i++) {
      let tx: number, ty: number
      let attempts = 0
      do {
        tx = Math.floor(Math.random() * 40)
        ty = Math.floor(Math.random() * 30)
        attempts++
      } while (this.isTileOnRoadOrBuilding(tx, ty) && attempts < 20)
      
      if (attempts < 20) {
        const px = tx * this.tileSize + 32
        const py = ty * this.tileSize + 48
        this.add.image(px, py, 'rock')
          .setOrigin(0.5, 1)
          .setDepth(py)
          .setScale(0.5 + Math.random() * 0.5)
      }
    }
    
    // Mobilier urbain - sur les trottoirs
    this.createStreetFurniture()
  }

  private createStreetFurniture(): void {
    // Lampadaires le long des routes
    this.roadTilesH.forEach(roadY => {
      for (let tx = 4; tx < 38; tx += 5) {
        if (this.isTileOnRoadOrBuilding(tx, roadY - 1)) continue
        const px = tx * this.tileSize + 32
        const py = (roadY - 1) * this.tileSize + 64
        this.add.image(px, py, 'lamppost').setOrigin(0.5, 1).setDepth(py)
      }
    })
    
    // Bancs sur les trottoirs
    const benchPositions = [
      { tx: 5, ty: 6 }, { tx: 15, ty: 6 }, { tx: 25, ty: 6 },
      { tx: 10, ty: 14 }, { tx: 25, ty: 14 },
      { tx: 5, ty: 22 }, { tx: 15, ty: 22 }, { tx: 30, ty: 22 },
    ]
    benchPositions.forEach(pos => {
      if (!this.isTileOnRoadOrBuilding(pos.tx, pos.ty)) return
      const px = pos.tx * this.tileSize + 32
      const py = pos.ty * this.tileSize + 48
      this.add.image(px, py, 'bench').setOrigin(0.5, 1).setDepth(py)
    })
    
    // Poubelles près des bancs
    benchPositions.forEach(pos => {
      const px = pos.tx * this.tileSize + 60
      const py = pos.ty * this.tileSize + 48
      this.add.image(px, py, 'trashcan').setOrigin(0.5, 1).setDepth(py)
    })
    
    // Fontaine dans un espace vert (pas sur la route!)
    const fountainTx = 15
    const fountainTy = 25
    if (!this.isTileOnRoadOrBuilding(fountainTx, fountainTy)) {
      const px = fountainTx * this.tileSize + 32
      const py = fountainTy * this.tileSize + 64
      this.add.image(px, py, 'fountain')
        .setOrigin(0.5, 0.5)
        .setDepth(py + 40)
        .setScale(1.3)
    }
    
    // Panneaux d'indication
    const signPositions = [
      { tx: 9, ty: 6 },
      { tx: 19, ty: 14 },
      { tx: 29, ty: 22 },
    ]
    signPositions.forEach(pos => {
      const px = pos.tx * this.tileSize + 48
      const py = pos.ty * this.tileSize + 64
      this.add.image(px, py, 'sign').setOrigin(0.5, 1).setDepth(py)
    })
  }

  // ==================== UTILITAIRES ====================
  private isTileOnRoadOrBuilding(tx: number, ty: number): boolean {
    // Check routes horizontales
    for (const roadY of this.roadTilesH) {
      if (ty >= roadY - 1 && ty <= roadY + 2) return true
    }
    // Check routes verticales
    for (const roadX of this.roadTilesV) {
      if (tx >= roadX - 1 && tx <= roadX + 2) return true
    }
    return false
  }

  private isOnRoad(x: number, y: number): boolean {
    const tx = Math.floor(x / this.tileSize)
    const ty = Math.floor(y / this.tileSize)
    return this.isTileOnRoadOrBuilding(tx, ty)
  }

  // ==================== JOUEUR ====================
  private createPlayer(): void {
    // Spawn près de l'atelier NIRD
    const workshop = this.buildings.find(b => b.type === 'workshop')
    const startX = workshop ? workshop.x + 100 : this.mapWidth / 2
    const startY = workshop ? workshop.y + 50 : this.mapHeight / 2
    
    this.player = this.add.sprite(startX, startY, 'player_idle')
      .setOrigin(0.5, 1)
      .setScale(1.3) // Personnage plus grand
    
    this.physics.add.existing(this.player)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(20, 16)
    body.setOffset(10, 48)
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
    
    // Animations PNJ
    const npcTypes = ['citizen', 'woman', 'technician']
    npcTypes.forEach(type => {
      if (!this.anims.exists(`npc_${type}_walk`)) {
        this.anims.create({
          key: `npc_${type}_walk`,
          frames: [
            { key: `npc_${type}_walk_0` },
            { key: `npc_${type}_walk_1` },
            { key: `npc_${type}_walk_2` },
            { key: `npc_${type}_walk_3` },
          ],
          frameRate: 8,
          repeat: -1,
        })
      }
    })
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
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
    this.cameras.main.setZoom(1)
  }

  private setupEvents(): void {
    this.interactKey.on('down', () => this.handleInteraction())
  }

  private createDebugUI(): void {
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(9999)
  }

  // ==================== UPDATE ====================
  update(): void {
    this.handleMovement()
    this.checkProximity()
    this.updateDepth()
    this.updateCars()
    this.updateNPCs()
    this.updateDebug()
  }

  private handleMovement(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0)
    
    let isMoving = false
    
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setVelocityX(-this.playerSpeed)
      this.player.setFlipX(true)
      isMoving = true
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setVelocityX(this.playerSpeed)
      this.player.setFlipX(false)
      isMoving = true
    }
    
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      body.setVelocityY(-this.playerSpeed)
      isMoving = true
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      body.setVelocityY(this.playerSpeed)
      isMoving = true
    }
    
    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      body.velocity.normalize().scale(this.playerSpeed)
    }
    
    if (isMoving) {
      this.player.play('walk', true)
    } else {
      this.player.stop()
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
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, building.x, building.y)
      if (dist < 120) {
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
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, computer.x, computer.y)
      if (dist < 50) {
        this.nearComputer = computer
        if (computer.interactIcon) computer.interactIcon.setVisible(true)
        break
      }
    }
  }

  private updateDepth(): void {
    this.player.setDepth(this.player.y + 10)
  }

  private updateCars(): void {
    const delta = this.game.loop.delta / 1000
    
    this.cars.forEach(car => {
      if (car.direction === 'h') {
        car.sprite.x += car.speed * delta
        if (car.sprite.x > this.mapWidth + 100) car.sprite.x = -100
        if (car.sprite.x < -100) car.sprite.x = this.mapWidth + 100
      } else {
        car.sprite.y += car.speed * delta
        if (car.sprite.y > this.mapHeight + 100) car.sprite.y = -100
        if (car.sprite.y < -100) car.sprite.y = this.mapHeight + 100
      }
      car.sprite.setDepth(car.sprite.y + 5)
    })
  }

  private updateNPCs(): void {
    const delta = this.game.loop.delta / 1000
    
    this.npcs.forEach(npc => {
      if (npc.isMoving && npc.targetX !== undefined) {
        const dx = npc.targetX - npc.sprite.x
        
        if (Math.abs(dx) > 5) {
          npc.sprite.x += npc.speed * delta * Math.sign(dx)
          npc.sprite.setFlipX(dx < 0)
          npc.sprite.play(`npc_${npc.type}_walk`, true)
        } else {
          // Arrivé à destination, retourner dans l'autre sens
          npc.targetX = npc.sprite.x + (npc.direction === 'right' ? -1000 : 1000)
          npc.direction = npc.direction === 'right' ? 'left' : 'right'
        }
        
        npc.sprite.setDepth(npc.sprite.y + 10)
      }
    })
  }

  private updateDebug(): void {
    const tx = Math.floor(this.player.x / this.tileSize)
    const ty = Math.floor(this.player.y / this.tileSize)
    this.debugText.setText(
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Tile: (${tx}, ${ty})\n` +
      `PC: ${this.inventory} | Recond: ${this.reconditionedCount} | Distrib: ${this.distributedCount}`
    )
  }

  // ==================== INTERACTIONS ====================
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
    
    const text = this.add.text(computer.x, computer.y - 30, '+1 PC 💻', {
      fontSize: '18px',
      color: '#22c55e',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(9999)
    
    this.tweens.add({
      targets: text,
      y: computer.y - 70,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
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
        this.events.emit('showMessage', `${building.name}: "Prenez ces vieux PC, on allait les jeter..."`)
        break
        
      case 'workshop':
        if (this.inventory > 0) {
          this.reconditionComputers()
        } else {
          this.events.emit('showMessage', '🔧 Atelier NIRD: "Apportez-nous des PC à reconditionner sous Linux !"')
        }
        break
        
      case 'school':
        if (this.reconditionedCount > this.distributedCount) {
          this.distributeComputer(building)
        } else {
          this.events.emit('showMessage', `${building.name}: "Nous attendons des ordinateurs !"`)
        }
        break
        
      default:
        this.events.emit('showMessage', `${building.name}`)
        break
    }
  }

  private reconditionComputers(): void {
    const count = this.inventory
    this.inventory = 0
    this.reconditionedCount += count
    
    const workshop = this.buildings.find(b => b.type === 'workshop')
    if (workshop) {
      const text = this.add.text(workshop.x, workshop.y - 80, `+${count} PC Linux ! 🐧`, {
        fontSize: '22px',
        color: '#22c55e',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(9999)
      
      this.tweens.add({
        targets: text,
        y: workshop.y - 140,
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
    
    this.events.emit('showMessage', `🎉 ${count} PC reconditionnés ! Distribuez-les aux écoles.`)
  }

  private distributeComputer(school: Building): void {
    this.distributedCount++
    
    const pc = this.add.image(
      school.x + (Math.random() - 0.5) * 60,
      school.y + 40,
      'computer_new'
    ).setScale(0).setDepth(school.y + 50)
    
    this.tweens.add({
      targets: pc,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    })
    
    const text = this.add.text(school.x, school.y - 40, '🎉 +1 PC distribué !', {
      fontSize: '18px',
      color: '#ec4899',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(9999)
    
    this.tweens.add({
      targets: text,
      y: school.y - 90,
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
