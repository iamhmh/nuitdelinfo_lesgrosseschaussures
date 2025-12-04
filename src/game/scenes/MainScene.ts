/**
 * MainScene - Ville procédurale avec layout cohérent
 */
import Phaser from 'phaser'

interface Building {
  x: number
  y: number
  type: 'enterprise' | 'workshop' | 'school' | 'university' | 'house' | 'shop' | 'apartment' | 'office'
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
  baseSpeed: number // Vitesse de base (avant arrêt au feu)
  lane: number
  roadIndex: number // Index de la route sur laquelle se trouve la voiture
}

// Feu tricolore à une intersection
interface TrafficLight {
  x: number
  y: number
  roadX: number // Colonne de la route V
  roadY: number // Ligne de la route H
  spriteH: Phaser.GameObjects.Image // Feu pour la route H
  spriteV: Phaser.GameObjects.Image // Feu pour la route V
}

// État global des feux (synchronisés)
type TrafficPhase = 'h_green' | 'h_yellow' | 'v_green' | 'v_yellow'

// Dimensions des bâtiments (en pixels) - correspondent aux textures générées dans BootScene
interface BuildingSize {
  width: number
  height: number
}

// Tailles en tiles (1 tile = 64 pixels)
const TILE_SIZE = 64
const BUILDING_SIZES: Record<string, BuildingSize> = {
  enterprise: { width: 4 * TILE_SIZE, height: 6 * TILE_SIZE },  // 4x6 tiles = 256x384
  school: { width: 3 * TILE_SIZE, height: 3 * TILE_SIZE },       // 3x3 tiles = 192x192
  university: { width: 4 * TILE_SIZE, height: 4 * TILE_SIZE },   // 4x4 tiles = 256x256
  workshop: { width: 3 * TILE_SIZE, height: 3 * TILE_SIZE },     // 3x3 tiles = 192x192
  house: { width: 2 * TILE_SIZE, height: 2 * TILE_SIZE },        // 2x2 tiles = 128x128
  apartment: { width: 3 * TILE_SIZE, height: 3 * TILE_SIZE },    // 3x3 tiles = 192x192
  shop: { width: 2 * TILE_SIZE, height: 2 * TILE_SIZE },         // 2x2 tiles = 128x128
  office: { width: 3 * TILE_SIZE, height: 4 * TILE_SIZE },       // 3x4 tiles = 192x256
}

// Zone occupée par un bâtiment (pour éviter superpositions)
interface OccupiedZone {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite
  private playerSpeed: number = 180
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private interactKey!: Phaser.Input.Keyboard.Key
  
  // Map dimensions - Carte agrandie pour plus d'espace
  // 60 tiles x 45 tiles = 3840 x 2880 pixels
  private mapWidth: number = 3840
  private mapHeight: number = 2880
  private tileSize: number = 64
  
  // Layout de la ville (en tiles)
  // Moins de routes pour plus d'espace constructible
  // Routes horizontales: y = 15, 30 (2 routes au lieu de 3)
  // Routes verticales: x = 20, 40 (2 routes au lieu de 3)
  private roadTilesH = [15, 30] // Lignes de routes horizontales
  private roadTilesV = [20, 40] // Colonnes de routes verticales
  
  private buildings: Building[] = []
  private occupiedZones: OccupiedZone[] = [] // Zones occupées par les bâtiments
  private computers: CollectibleComputer[] = []
  private cars: Car[] = []
  private npcs: NPC[] = []
  
  // Groupes de collision
  private buildingColliders: Phaser.Physics.Arcade.StaticGroup | null = null
  private treeColliders: Phaser.Physics.Arcade.StaticGroup | null = null
  private carColliders: Phaser.Physics.Arcade.Group | null = null
  
  // Système de feux de circulation
  private trafficLights: TrafficLight[] = []
  private trafficPhase: TrafficPhase = 'h_green'
  private trafficTimer: number = 0
  private readonly TRAFFIC_GREEN_DURATION = 5000 // 5 secondes de vert
  private readonly TRAFFIC_YELLOW_DURATION = 1500 // 1.5 secondes d'orange
  
  private collectedCount: number = 0
  private reconditionedCount: number = 0
  private distributedCount: number = 0
  private inventory: number = 0
  private nearBuilding: Building | null = null
  private nearComputer: CollectibleComputer | null = null
  
  // Debug
  private debugText!: Phaser.GameObjects.Text
  private debugGridContainer!: Phaser.GameObjects.Container
  private debugGridVisible: boolean = true
  private toggleGridKey!: Phaser.Input.Keyboard.Key

  constructor() {
    super({ key: 'MainScene' })
  }

  create(): void {
    // Initialiser les groupes de collision
    this.buildingColliders = this.physics.add.staticGroup()
    this.treeColliders = this.physics.add.staticGroup()
    this.carColliders = this.physics.add.group()
    
    this.createTerrain()
    this.createDebugGrid() // Grille de debug (après terrain, avant tout le reste)
    this.createBuildings()
    this.createComputers()
    this.createCars()
    this.createNPCs()
    this.createVegetation()
    this.createPlayer()
    this.setupCollisions() // Configurer les collisions après création du joueur
    this.setupControls()
    this.setupCamera()
    this.createAnimations()
    this.setupEvents()
    this.createDebugUI()
    
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight)
  }
  
  /**
   * Configure les collisions entre le joueur et les obstacles
   */
  private setupCollisions(): void {
    // Collision avec les bâtiments
    if (this.buildingColliders) {
      this.physics.add.collider(this.player, this.buildingColliders)
    }
    
    // Collision avec les arbres
    if (this.treeColliders) {
      this.physics.add.collider(this.player, this.treeColliders)
    }
    
    // Collision avec les voitures
    if (this.carColliders) {
      this.physics.add.collider(this.player, this.carColliders)
    }
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
        
        // Créer les feux tricolores dynamiques pour cette intersection
        this.createTrafficLightsForIntersection(roadX, roadY)
      })
    })
  }

  /**
   * Crée les feux de circulation pour une intersection donnée
   */
  private createTrafficLightsForIntersection(roadX: number, roadY: number): void {
    // Positions des feux sur les coins de l'intersection
    // On place un feu pour les voitures H et un pour les voitures V
    
    // Feu pour route horizontale (en haut-gauche de l'intersection)
    const hLightX = (roadX - 1) * this.tileSize + 32
    const hLightY = (roadY - 1) * this.tileSize + 32
    const spriteH = this.add.image(hLightX, hLightY, 'traffic_light_green')
      .setOrigin(0.5, 1)
      .setDepth(hLightY + 50)
    
    // Feu pour route verticale (en bas-droite de l'intersection)
    const vLightX = (roadX + 2) * this.tileSize + 32
    const vLightY = (roadY + 2) * this.tileSize + 32
    const spriteV = this.add.image(vLightX, vLightY, 'traffic_light_red')
      .setOrigin(0.5, 1)
      .setDepth(vLightY + 50)
    
    this.trafficLights.push({
      x: roadX * this.tileSize,
      y: roadY * this.tileSize,
      roadX,
      roadY,
      spriteH,
      spriteV
    })
  }

  // ==================== BÂTIMENTS ====================
  
  /**
   * Calcule la zone occupée par un bâtiment (en pixels)
   * Le bâtiment a son origine en bas-centre, donc on calcule la zone autour de ce point
   * withSpacing: true pour vérifier placement (avec marge), false pour collisions exactes
   */
  private getBuildingBounds(x: number, y: number, type: Building['type'], scale: number = 1, withSpacing: boolean = true): OccupiedZone {
    const size = BUILDING_SIZES[type]
    const w = size.width * scale
    const h = size.height * scale
    const spacing = withSpacing ? this.tileSize : 0 // Espacement pour placement, pas pour debug/collision
    
    return {
      minX: x - w / 2 - spacing,
      maxX: x + w / 2 + spacing,
      minY: y - h - spacing,  // Le bâtiment s'étend vers le HAUT depuis y
      maxY: y + spacing
    }
  }
  
  /**
   * Retourne les bounds exactes du bâtiment (sans spacing) pour les collisions
   */
  private getExactBuildingBounds(x: number, y: number, type: Building['type'], scale: number = 1): OccupiedZone {
    return this.getBuildingBounds(x, y, type, scale, false)
  }
  
  /**
   * Vérifie si une zone chevauche une autre zone
   */
  private zonesOverlap(a: OccupiedZone, b: OccupiedZone): boolean {
    return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY)
  }
  
  /**
   * Vérifie si un bâtiment dépasse sur une route
   */
  private buildingOverlapsRoad(bounds: OccupiedZone): boolean {
    // Vérifier routes horizontales
    for (const roadY of this.roadTilesH) {
      const roadMinY = (roadY - 1) * this.tileSize
      const roadMaxY = (roadY + 3) * this.tileSize
      if (bounds.minY < roadMaxY && bounds.maxY > roadMinY) {
        // Le bâtiment est dans la zone Y de la route
        return true
      }
    }
    
    // Vérifier routes verticales
    for (const roadX of this.roadTilesV) {
      const roadMinX = (roadX - 1) * this.tileSize
      const roadMaxX = (roadX + 3) * this.tileSize
      if (bounds.minX < roadMaxX && bounds.maxX > roadMinX) {
        // Le bâtiment est dans la zone X de la route
        // Mais seulement si sa zone Y touche la partie route
        return true
      }
    }
    
    return false
  }
  
  /**
   * Vérifie si un bâtiment peut être placé à cette position
   */
  private canPlaceBuilding(x: number, y: number, type: Building['type'], scale: number = 1): boolean {
    const bounds = this.getBuildingBounds(x, y, type, scale)
    
    // Vérifier les limites de la carte
    if (bounds.minX < 0 || bounds.maxX > this.mapWidth || bounds.minY < 0 || bounds.maxY > this.mapHeight) {
      return false
    }
    
    // Vérifier si ça dépasse sur une route
    if (this.buildingOverlapsRoad(bounds)) {
      return false
    }
    
    // Vérifier collision avec autres bâtiments
    for (const zone of this.occupiedZones) {
      if (this.zonesOverlap(bounds, zone)) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * Place un bâtiment aligné sur les tiles et enregistre sa zone
   * tx, ty: coordonnées de la tile du coin bas-gauche du bâtiment
   * Le bâtiment occupera les tiles de (tx, ty - heightInTiles + 1) à (tx + widthInTiles - 1, ty)
   */
  private placeBuilding(tx: number, ty: number, type: Building['type'], name: string, scale: number = 1): boolean {
    const size = BUILDING_SIZES[type]
    const widthInTiles = size.width / this.tileSize
    
    // Position en pixels - alignée sur les tiles
    // Le sprite utilise setOrigin(0.5, 1) donc:
    // x = centre horizontal du bâtiment (milieu des tiles occupées)
    // y = bas du bâtiment (bord inférieur de la tile ty)
    const x = tx * this.tileSize + (widthInTiles * this.tileSize) / 2
    const y = (ty + 1) * this.tileSize  // Bas du bâtiment = bord inférieur de la tile ty
    
    if (!this.canPlaceBuilding(x, y, type, scale)) {
      console.warn(`⚠️ Impossible de placer "${name}" à tile (${tx}, ${ty})`)
      return false
    }
    
    const bounds = this.getBuildingBounds(x, y, type, scale)
    this.occupiedZones.push(bounds)
    
    this.buildings.push({ x, y, type, name })
    return true
  }
  
  private createBuildings(): void {
    /*
     * ===========================================
     * CARTE: 60 tiles (colonnes) x 45 tiles (lignes)
     * ===========================================
     * Routes H aux lignes: 15, 30 (avec trottoirs à -1 et +2)
     * Routes V aux colonnes: 20, 40 (avec trottoirs à -1 et +2)
     * 
     * ZONES CONSTRUCTIBLES (herbe):
     * - Zone A: colonnes 0-18,  lignes 0-13   (haut gauche)
     * - Zone B: colonnes 24-38, lignes 0-13   (haut droite) 
     * - Zone C: colonnes 44-59, lignes 0-13   (haut extrême droite)
     * - Zone D: colonnes 0-18,  lignes 18-28  (milieu gauche)
     * - Zone E: colonnes 24-38, lignes 18-28  (milieu centre)
     * - Zone F: colonnes 44-59, lignes 18-28  (milieu droite)
     * - Zone G: colonnes 0-18,  lignes 33-44  (bas gauche)
     * - Zone H: colonnes 24-38, lignes 33-44  (bas centre)
     * - Zone I: colonnes 44-59, lignes 33-44  (bas droite)
     * ===========================================
     */
    
    // ========== ZONE A: ENTREPRISES (haut gauche) ==========
    this.placeBuilding(4, 10, 'enterprise', '🏢 TechCorp Solutions')
    this.placeBuilding(10, 10, 'enterprise', '🏢 DataSoft Analytics')
    this.placeBuilding(16, 10, 'office', '🏢 ByteCloud Services')
    
    // ========== ZONE B: ENTREPRISES (haut centre) ==========
    this.placeBuilding(26, 10, 'enterprise', '🏢 GreenTech Inc')
    this.placeBuilding(32, 10, 'office', '🏢 EcoData Systems')
    
    // ========== ZONE C: ENTREPRISES (haut droite) ==========
    this.placeBuilding(48, 10, 'enterprise', '🏢 InfoSys Global')
    this.placeBuilding(54, 10, 'office', '🏢 Innovation Hub')
    
    // ========== ZONE D: ATELIER + RÉSIDENTIEL (milieu gauche) ==========
    this.placeBuilding(8, 24, 'workshop', '🔧 Atelier NIRD - Reconditionnement Linux')
    this.placeBuilding(3, 22, 'house', '🏠 Maison Rose')
    this.placeBuilding(15, 22, 'apartment', '🏢 Résidence du Parc')
    
    // ========== ZONE E: RÉSIDENTIEL (milieu centre) ==========
    this.placeBuilding(26, 22, 'house', '🏠 Villa Bleue')
    this.placeBuilding(30, 24, 'shop', '🏪 Boulangerie Martin')
    this.placeBuilding(35, 22, 'apartment', '🏢 Les Jardins')
    
    // ========== ZONE F: RÉSIDENTIEL (milieu droite) ==========
    this.placeBuilding(46, 22, 'shop', '🏪 Librairie Pages')
    this.placeBuilding(52, 24, 'house', '🏠 Pavillon Vert')
    this.placeBuilding(56, 22, 'shop', '🏪 Café du Centre')
    
    // ========== ZONE G: ÉCOLES (bas gauche) ==========
    this.placeBuilding(5, 40, 'school', '📚 École Primaire Jean Jaurès')
    this.placeBuilding(14, 40, 'school', '📚 Collège Victor Hugo')
    
    // ========== ZONE H: UNIVERSITÉ (bas centre) ==========
    this.placeBuilding(30, 40, 'university', '🎓 Université Pierre et Marie Curie')
    
    // ========== ZONE I: ÉCOLES (bas droite) ==========
    this.placeBuilding(46, 40, 'school', '📚 Lycée Marie Curie')
    this.placeBuilding(54, 40, 'school', '📚 École Montessori')
    
    // Créer les sprites pour tous les bâtiments placés
    this.buildings.forEach(building => {
      const textureKey = `building_${building.type}`
      building.sprite = this.add.image(building.x, building.y, textureKey)
        .setOrigin(0.5, 1)
        .setDepth(building.y)
      
      // Créer un collider invisible pour ce bâtiment
      if (this.buildingColliders) {
        const bounds = this.getExactBuildingBounds(building.x, building.y, building.type)
        const collider = this.add.rectangle(
          bounds.minX + (bounds.maxX - bounds.minX) / 2,
          bounds.minY + (bounds.maxY - bounds.minY) / 2,
          bounds.maxX - bounds.minX,
          bounds.maxY - bounds.minY
        )
        this.physics.add.existing(collider, true) // true = static
        this.buildingColliders.add(collider)
        collider.setVisible(false)
      }
    })
    
    // Debug: afficher les zones occupées
    this.drawOccupiedZonesDebug()
  }
  
  private drawOccupiedZonesDebug(): void {
    const g = this.add.graphics()
    g.lineStyle(2, 0xff00ff, 0.5)
    
    // Afficher les zones exactes des bâtiments (sans spacing)
    this.buildings.forEach(building => {
      const zone = this.getExactBuildingBounds(building.x, building.y, building.type)
      g.strokeRect(
        zone.minX,
        zone.minY,
        zone.maxX - zone.minX,
        zone.maxY - zone.minY
      )
    })
    
    g.setDepth(5001)
    this.debugGridContainer.add(g)
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
    this.roadTilesH.forEach((roadY, roadIndex) => {
      for (let i = 0; i < 2; i++) {
        const color = Phaser.Math.RND.pick(carColors)
        const laneY = (roadY + (i === 0 ? 0.3 : 1.3)) * this.tileSize + 32
        const startX = Math.random() * this.mapWidth
        const baseSpeed = 60 + Math.random() * 40
        
        const sprite = this.add.image(startX, laneY, `car_${color}`)
          .setScale(0.9)
          .setDepth(laneY + 5)
          .setRotation(i === 0 ? 0 : Math.PI)
        
        // Ajouter le collider pour cette voiture
        this.physics.add.existing(sprite)
        const body = sprite.body as Phaser.Physics.Arcade.Body
        body.setSize(40, 20) // Taille de collision de la voiture
        body.setImmovable(true)
        if (this.carColliders) {
          this.carColliders.add(sprite)
        }
        
        this.cars.push({
          sprite,
          direction: 'h',
          speed: baseSpeed * (i === 0 ? 1 : -1),
          baseSpeed: baseSpeed * (i === 0 ? 1 : -1),
          lane: i,
          roadIndex
        })
      }
    })
    
    // Voitures sur les routes verticales
    this.roadTilesV.forEach((roadX, roadIndex) => {
      for (let i = 0; i < 2; i++) {
        const color = Phaser.Math.RND.pick(carColors)
        const laneX = (roadX + (i === 0 ? 0.3 : 1.3)) * this.tileSize + 32
        const startY = Math.random() * this.mapHeight
        const baseSpeed = 60 + Math.random() * 40
        
        const sprite = this.add.image(laneX, startY, `car_${color}`)
          .setScale(0.9)
          .setDepth(startY + 5)
          .setRotation(i === 0 ? -Math.PI / 2 : Math.PI / 2)
        
        // Ajouter le collider pour cette voiture
        this.physics.add.existing(sprite)
        const body = sprite.body as Phaser.Physics.Arcade.Body
        body.setSize(20, 40) // Taille de collision de la voiture (rotated)
        body.setImmovable(true)
        if (this.carColliders) {
          this.carColliders.add(sprite)
        }
        
        this.cars.push({
          sprite,
          direction: 'v',
          speed: baseSpeed * (i === 0 ? 1 : -1),
          baseSpeed: baseSpeed * (i === 0 ? 1 : -1),
          lane: i,
          roadIndex
        })
      }
    })
  }

  // ==================== PNJs ====================
  private createNPCs(): void {
    const npcTypes: Array<'citizen' | 'woman' | 'technician'> = ['citizen', 'woman', 'technician']
    
    // PNJs fixes (sur les trottoirs des nouvelles routes)
    // Routes H: 15, 30 | Routes V: 20, 40
    const fixedNPCPositions = [
      // Trottoirs route H ligne 15
      { tx: 10, ty: 14 },
      { tx: 30, ty: 14 },
      { tx: 50, ty: 14 },
      // Trottoirs route H ligne 30
      { tx: 10, ty: 33 },
      { tx: 30, ty: 33 },
      { tx: 50, ty: 33 },
      // Trottoirs route V colonne 20
      { tx: 19, ty: 8 },
      { tx: 19, ty: 25 },
      { tx: 19, ty: 38 },
      // Trottoirs route V colonne 40
      { tx: 43, ty: 8 },
      { tx: 43, ty: 25 },
      { tx: 43, ty: 38 },
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
      { tx: 5, ty: 14, targetTx: 55 },
      { tx: 50, ty: 33, targetTx: 5 },
      { tx: 19, ty: 5, targetTx: 19 },  // Se déplace verticalement via update
      { tx: 43, ty: 40, targetTx: 43 },
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
    const tilesX = 60 // Nouvelle largeur
    const tilesY = 45 // Nouvelle hauteur
    
    // Arbres - uniquement sur l'herbe
    const treePositions: Array<{tx: number, ty: number}> = []
    
    // Bordures de la carte
    for (let tx = 0; tx < tilesX; tx += 4) {
      if (!this.isTileOnRoadOrBuilding(tx, 1)) treePositions.push({ tx, ty: 1 })
      if (!this.isTileOnRoadOrBuilding(tx, tilesY - 2)) treePositions.push({ tx, ty: tilesY - 2 })
    }
    for (let ty = 0; ty < tilesY; ty += 4) {
      if (!this.isTileOnRoadOrBuilding(1, ty)) treePositions.push({ tx: 1, ty })
      if (!this.isTileOnRoadOrBuilding(tilesX - 2, ty)) treePositions.push({ tx: tilesX - 2, ty })
    }
    
    // Arbres entre les zones (adaptés à la nouvelle carte)
    const additionalTrees = [
      // Zone haute
      { tx: 8, ty: 5 }, { tx: 14, ty: 5 }, { tx: 28, ty: 5 }, { tx: 34, ty: 5 }, { tx: 48, ty: 5 }, { tx: 54, ty: 5 },
      // Zone milieu
      { tx: 8, ty: 22 }, { tx: 14, ty: 22 }, { tx: 28, ty: 22 }, { tx: 34, ty: 22 }, { tx: 48, ty: 22 }, { tx: 54, ty: 22 },
      // Zone basse
      { tx: 8, ty: 38 }, { tx: 14, ty: 38 }, { tx: 28, ty: 38 }, { tx: 34, ty: 38 }, { tx: 48, ty: 38 }, { tx: 54, ty: 38 },
    ]
    treePositions.push(...additionalTrees.filter(p => !this.isTileOnRoadOrBuilding(p.tx, p.ty)))
    
    treePositions.forEach(pos => {
      const px = pos.tx * this.tileSize + 32
      const py = pos.ty * this.tileSize + 64
      const treeType = Math.random() > 0.4 ? 'tree' : 'tree_pine'
      const treeScale = 0.9 + Math.random() * 0.3
      
      this.add.image(px, py, treeType)
        .setOrigin(0.5, 1)
        .setDepth(py)
        .setScale(treeScale)
      
      // Ajouter un collider pour le tronc de l'arbre
      if (this.treeColliders) {
        const trunkWidth = 20
        const trunkHeight = 30
        const collider = this.add.rectangle(
          px,
          py - trunkHeight / 2,
          trunkWidth,
          trunkHeight
        )
        this.physics.add.existing(collider, true) // true = static
        this.treeColliders.add(collider)
        collider.setVisible(false)
      }
    })
    
    // Buissons - sur l'herbe uniquement
    for (let i = 0; i < 60; i++) {
      let tx: number, ty: number
      let attempts = 0
      do {
        tx = Math.floor(Math.random() * tilesX)
        ty = Math.floor(Math.random() * tilesY)
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
    for (let i = 0; i < 80; i++) {
      let tx: number, ty: number
      let attempts = 0
      do {
        tx = Math.floor(Math.random() * tilesX)
        ty = Math.floor(Math.random() * tilesY)
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
    for (let i = 0; i < 25; i++) {
      let tx: number, ty: number
      let attempts = 0
      do {
        tx = Math.floor(Math.random() * tilesX)
        ty = Math.floor(Math.random() * tilesY)
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
      for (let tx = 4; tx < 58; tx += 6) {
        if (this.isTileOnRoadOrBuilding(tx, roadY - 1)) continue
        const px = tx * this.tileSize + 32
        const py = (roadY - 1) * this.tileSize + 64
        this.add.image(px, py, 'lamppost').setOrigin(0.5, 1).setDepth(py)
      }
    })
    
    // Bancs sur les trottoirs (adaptés aux nouvelles routes)
    const benchPositions = [
      // Trottoir route H ligne 15
      { tx: 8, ty: 14 }, { tx: 28, ty: 14 }, { tx: 48, ty: 14 },
      // Trottoir route H ligne 30
      { tx: 8, ty: 33 }, { tx: 28, ty: 33 }, { tx: 48, ty: 33 },
    ]
    benchPositions.forEach(pos => {
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
    
    // Fontaines dans les espaces verts
    const fountainPositions = [
      { tx: 10, ty: 8 },   // Zone A
      { tx: 50, ty: 8 },   // Zone C
      { tx: 10, ty: 38 },  // Zone G
      { tx: 50, ty: 38 },  // Zone I
    ]
    fountainPositions.forEach(pos => {
      if (!this.isTileOnRoadOrBuilding(pos.tx, pos.ty)) {
        const px = pos.tx * this.tileSize + 32
        const py = pos.ty * this.tileSize + 64
        this.add.image(px, py, 'fountain')
          .setOrigin(0.5, 0.5)
          .setDepth(py + 40)
          .setScale(1.3)
      }
    })
    
    // Panneaux d'indication (aux intersections)
    const signPositions = [
      { tx: 19, ty: 14 },  // Intersection route V20 / H15
      { tx: 43, ty: 14 },  // Intersection route V40 / H15
      { tx: 19, ty: 33 },  // Intersection route V20 / H30
      { tx: 43, ty: 33 },  // Intersection route V40 / H30
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
    this.toggleGridKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.G)
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
    this.cameras.main.setZoom(1)
  }

  private setupEvents(): void {
    this.interactKey.on('down', () => this.handleInteraction())
    this.toggleGridKey.on('down', () => this.toggleDebugGrid())
  }

  private toggleDebugGrid(): void {
    this.debugGridVisible = !this.debugGridVisible
    this.debugGridContainer.setVisible(this.debugGridVisible)
  }

  private createDebugUI(): void {
    // Positionné en bas à gauche de l'écran
    const screenHeight = this.cameras.main.height
    this.debugText = this.add.text(10, screenHeight - 80, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 10, y: 6 }
    }).setScrollFactor(0).setDepth(9999)
  }

  private createDebugGrid(): void {
    this.debugGridContainer = this.add.container(0, 0)
    
    const tilesX = Math.ceil(this.mapWidth / this.tileSize)
    const tilesY = Math.ceil(this.mapHeight / this.tileSize)
    
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0x000000, 0.3)
    
    // Lignes verticales
    for (let tx = 0; tx <= tilesX; tx++) {
      const x = tx * this.tileSize
      graphics.lineBetween(x, 0, x, this.mapHeight)
    }
    
    // Lignes horizontales
    for (let ty = 0; ty <= tilesY; ty++) {
      const y = ty * this.tileSize
      graphics.lineBetween(0, y, this.mapWidth, y)
    }
    
    this.debugGridContainer.add(graphics)
    
    // Numéros de colonnes (en haut)
    for (let tx = 0; tx < tilesX; tx++) {
      const label = this.add.text(
        tx * this.tileSize + this.tileSize / 2,
        4,
        `${tx}`,
        { fontSize: '10px', color: '#000000', backgroundColor: '#ffffffaa' }
      ).setOrigin(0.5, 0)
      this.debugGridContainer.add(label)
    }
    
    // Numéros de lignes (à gauche)
    for (let ty = 0; ty < tilesY; ty++) {
      const label = this.add.text(
        4,
        ty * this.tileSize + this.tileSize / 2,
        `${ty}`,
        { fontSize: '10px', color: '#000000', backgroundColor: '#ffffffaa' }
      ).setOrigin(0, 0.5)
      this.debugGridContainer.add(label)
    }
    
    // Marquer les zones spéciales avec des couleurs
    const zoneGraphics = this.add.graphics()
    
    // Routes horizontales (rouge transparent)
    this.roadTilesH.forEach(roadY => {
      zoneGraphics.fillStyle(0xff0000, 0.15)
      zoneGraphics.fillRect(0, (roadY - 1) * this.tileSize, this.mapWidth, 4 * this.tileSize)
    })
    
    // Routes verticales (rouge transparent)
    this.roadTilesV.forEach(roadX => {
      zoneGraphics.fillStyle(0xff0000, 0.15)
      zoneGraphics.fillRect((roadX - 1) * this.tileSize, 0, 4 * this.tileSize, this.mapHeight)
    })
    
    // Zone A: Entreprises haut gauche (bleu)
    zoneGraphics.fillStyle(0x0066ff, 0.1)
    zoneGraphics.fillRect(0, 0, 19 * this.tileSize, 14 * this.tileSize)
    
    // Zone B: Entreprises haut centre (bleu)
    zoneGraphics.fillStyle(0x0066ff, 0.1)
    zoneGraphics.fillRect(24 * this.tileSize, 0, 15 * this.tileSize, 14 * this.tileSize)
    
    // Zone C: Entreprises haut droite (bleu)
    zoneGraphics.fillStyle(0x0066ff, 0.1)
    zoneGraphics.fillRect(44 * this.tileSize, 0, 16 * this.tileSize, 14 * this.tileSize)
    
    // Zone D, E, F: Résidentiel milieu (jaune)
    zoneGraphics.fillStyle(0xffaa00, 0.1)
    zoneGraphics.fillRect(0, 18 * this.tileSize, 19 * this.tileSize, 11 * this.tileSize)
    zoneGraphics.fillRect(24 * this.tileSize, 18 * this.tileSize, 15 * this.tileSize, 11 * this.tileSize)
    zoneGraphics.fillRect(44 * this.tileSize, 18 * this.tileSize, 16 * this.tileSize, 11 * this.tileSize)
    
    // Zone G, H, I: Écoles/Université bas (vert)
    zoneGraphics.fillStyle(0x00ff00, 0.1)
    zoneGraphics.fillRect(0, 33 * this.tileSize, 19 * this.tileSize, 12 * this.tileSize)
    zoneGraphics.fillRect(24 * this.tileSize, 33 * this.tileSize, 15 * this.tileSize, 12 * this.tileSize)
    zoneGraphics.fillRect(44 * this.tileSize, 33 * this.tileSize, 16 * this.tileSize, 12 * this.tileSize)
    
    this.debugGridContainer.add(zoneGraphics)
    this.debugGridContainer.setDepth(5000)
  }

  // ==================== UPDATE ====================
  update(_time: number, delta: number): void {
    this.handleMovement()
    this.checkProximity()
    this.updateDepth()
    this.updateTrafficLights(delta)
    this.updateCars()
    this.updateNPCs()
    this.updateDebug()
  }

  /**
   * Met à jour le cycle des feux tricolores
   */
  private updateTrafficLights(delta: number): void {
    this.trafficTimer += delta
    
    // Déterminer la durée selon la phase
    const currentDuration = (this.trafficPhase === 'h_yellow' || this.trafficPhase === 'v_yellow') 
      ? this.TRAFFIC_YELLOW_DURATION 
      : this.TRAFFIC_GREEN_DURATION
    
    if (this.trafficTimer >= currentDuration) {
      this.trafficTimer = 0
      
      // Passer à la phase suivante
      switch (this.trafficPhase) {
        case 'h_green':
          this.trafficPhase = 'h_yellow'
          break
        case 'h_yellow':
          this.trafficPhase = 'v_green'
          break
        case 'v_green':
          this.trafficPhase = 'v_yellow'
          break
        case 'v_yellow':
          this.trafficPhase = 'h_green'
          break
      }
      
      // Mettre à jour les sprites des feux
      this.updateTrafficLightSprites()
    }
  }

  /**
   * Met à jour les textures des feux selon la phase actuelle
   */
  private updateTrafficLightSprites(): void {
    this.trafficLights.forEach(light => {
      switch (this.trafficPhase) {
        case 'h_green':
          light.spriteH.setTexture('traffic_light_green')
          light.spriteV.setTexture('traffic_light_red')
          break
        case 'h_yellow':
          light.spriteH.setTexture('traffic_light_orange')
          light.spriteV.setTexture('traffic_light_red')
          break
        case 'v_green':
          light.spriteH.setTexture('traffic_light_red')
          light.spriteV.setTexture('traffic_light_green')
          break
        case 'v_yellow':
          light.spriteH.setTexture('traffic_light_red')
          light.spriteV.setTexture('traffic_light_orange')
          break
      }
    })
  }

  /**
   * Vérifie si une voiture doit s'arrêter au prochain feu rouge
   */
  private shouldCarStop(car: Car): boolean {
    const stopDistance = 80 // Distance d'arrêt avant le feu
    
    // Vérifier chaque intersection
    for (const light of this.trafficLights) {
      const intersectionMinX = (light.roadX - 1) * this.tileSize
      const intersectionMaxX = (light.roadX + 3) * this.tileSize
      const intersectionMinY = (light.roadY - 1) * this.tileSize
      const intersectionMaxY = (light.roadY + 3) * this.tileSize
      
      if (car.direction === 'h') {
        // Voiture horizontale - vérifier si on approche une intersection avec feu rouge
        const isHorizontalRed = this.trafficPhase === 'v_green' || this.trafficPhase === 'v_yellow'
        if (!isHorizontalRed) continue
        
        // Vérifier si la voiture est sur la même ligne que l'intersection
        if (car.sprite.y < intersectionMinY || car.sprite.y > intersectionMaxY) continue
        
        // Voiture allant vers la droite
        if (car.baseSpeed > 0) {
          const distanceToIntersection = intersectionMinX - car.sprite.x
          if (distanceToIntersection > 0 && distanceToIntersection < stopDistance) {
            return true
          }
        }
        // Voiture allant vers la gauche
        else {
          const distanceToIntersection = car.sprite.x - intersectionMaxX
          if (distanceToIntersection > 0 && distanceToIntersection < stopDistance) {
            return true
          }
        }
      } else {
        // Voiture verticale - vérifier si on approche une intersection avec feu rouge
        const isVerticalRed = this.trafficPhase === 'h_green' || this.trafficPhase === 'h_yellow'
        if (!isVerticalRed) continue
        
        // Vérifier si la voiture est sur la même colonne que l'intersection
        if (car.sprite.x < intersectionMinX || car.sprite.x > intersectionMaxX) continue
        
        // Voiture allant vers le bas
        if (car.baseSpeed > 0) {
          const distanceToIntersection = intersectionMinY - car.sprite.y
          if (distanceToIntersection > 0 && distanceToIntersection < stopDistance) {
            return true
          }
        }
        // Voiture allant vers le haut
        else {
          const distanceToIntersection = car.sprite.y - intersectionMaxY
          if (distanceToIntersection > 0 && distanceToIntersection < stopDistance) {
            return true
          }
        }
      }
    }
    
    return false
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
      // Vérifier si la voiture doit s'arrêter au feu rouge
      const mustStop = this.shouldCarStop(car)
      
      if (mustStop) {
        // Décélération progressive
        car.speed = Phaser.Math.Linear(car.speed, 0, 0.1)
      } else {
        // Retour progressif à la vitesse normale
        car.speed = Phaser.Math.Linear(car.speed, car.baseSpeed, 0.05)
      }
      
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
    const onRoad = this.isOnRoad(this.player.x, this.player.y) ? '✅ Route' : '❌ Herbe'
    this.debugText.setText(
      `📍 Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)}) | Tile: (${tx}, ${ty}) | ${onRoad}\n` +
      `💻 PC: ${this.inventory} | 🔧 Recond: ${this.reconditionedCount} | 🎁 Distrib: ${this.distributedCount}\n` +
      `[G] Toggle grille | Grille: ${this.debugGridVisible ? 'ON' : 'OFF'}`
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
