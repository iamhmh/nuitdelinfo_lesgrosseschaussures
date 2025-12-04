/**
 * Scène principale du jeu - Vue isométrique style Zelda
 */
import Phaser from 'phaser'

// Types pour la map
interface Building {
  x: number
  y: number
  type: 'enterprise' | 'workshop' | 'school' | 'house'
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

export class MainScene extends Phaser.Scene {
  // Joueur
  private player!: Phaser.GameObjects.Sprite
  private playerSpeed: number = 200
  
  // Contrôles
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private interactKey!: Phaser.Input.Keyboard.Key
  
  // Map
  private mapWidth: number = 2560
  private mapHeight: number = 1920
  private tileSize: number = 64
  
  // Éléments du monde
  private buildings: Building[] = []
  private computers: CollectibleComputer[] = []
  private decorations: Phaser.GameObjects.Image[] = []
  
  // État du jeu
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
    // Créer le monde
    this.createWorld()
    
    // Créer le joueur
    this.createPlayer()
    
    // Configurer les contrôles
    this.setupControls()
    
    // Configurer la caméra
    this.setupCamera()
    
    // Créer les animations
    this.createAnimations()
    
    // Événements
    this.setupEvents()
  }

  private createWorld(): void {
    // === FOND (herbe) ===
    for (let x = 0; x < this.mapWidth; x += this.tileSize) {
      for (let y = 0; y < this.mapHeight; y += this.tileSize) {
        const tileType = Math.random() > 0.15 ? 'grass' : 'grass_dark'
        this.add.image(x + 32, y + 32, tileType)
      }
    }
    
    // === CHEMINS ===
    // Chemin horizontal principal
    for (let x = 0; x < this.mapWidth; x += this.tileSize) {
      this.add.image(x + 32, 960, 'path')
    }
    // Chemin vertical
    for (let y = 400; y < 1500; y += this.tileSize) {
      this.add.image(1280, y + 32, 'path')
    }
    
    // === BÂTIMENTS ===
    this.buildings = [
      // Entreprises (haut de la map)
      { x: 300, y: 400, type: 'enterprise', name: 'TechCorp' },
      { x: 600, y: 300, type: 'enterprise', name: 'DataSoft' },
      { x: 1800, y: 350, type: 'enterprise', name: 'InfoSys' },
      { x: 2100, y: 450, type: 'enterprise', name: 'ByteInc' },
      
      // Atelier NIRD (centre)
      { x: 1200, y: 750, type: 'workshop', name: 'Atelier NIRD' },
      
      // Écoles (bas de la map)
      { x: 350, y: 1400, type: 'school', name: 'École Primaire' },
      { x: 800, y: 1500, type: 'school', name: 'Collège Victor Hugo' },
      { x: 1600, y: 1450, type: 'school', name: 'Lycée Marie Curie' },
      { x: 2000, y: 1350, type: 'school', name: 'École Montessori' },
      
      // Maisons décoratives
      { x: 950, y: 500, type: 'house', name: 'Maison' },
      { x: 1500, y: 550, type: 'house', name: 'Maison' },
      { x: 500, y: 1100, type: 'house', name: 'Maison' },
      { x: 1900, y: 1100, type: 'house', name: 'Maison' },
    ]
    
    // Créer les sprites des bâtiments
    this.buildings.forEach(building => {
      const textureKey = `building_${building.type}`
      building.sprite = this.add.image(building.x, building.y, textureKey)
        .setOrigin(0.5, 1)
        .setDepth(building.y)
      
      // Zone d'interaction
      const zoneWidth = building.type === 'workshop' ? 180 : 150
      building.interactZone = this.add.zone(building.x, building.y + 20, zoneWidth, 80)
      this.physics.add.existing(building.interactZone, true)
    })
    
    // === ORDINATEURS À COLLECTER (près des entreprises) ===
    const enterpriseBuildings = this.buildings.filter(b => b.type === 'enterprise')
    enterpriseBuildings.forEach(enterprise => {
      // 2-3 ordinateurs par entreprise
      const numComputers = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < numComputers; i++) {
        const offsetX = (Math.random() - 0.5) * 150
        const offsetY = 50 + Math.random() * 60
        this.computers.push({
          x: enterprise.x + offsetX,
          y: enterprise.y + offsetY,
          collected: false,
        })
      }
    })
    
    // Créer les sprites des ordinateurs
    this.computers.forEach(computer => {
      computer.sprite = this.add.image(computer.x, computer.y, 'computer_old')
        .setDepth(computer.y)
        .setScale(1.5)
      
      computer.interactIcon = this.add.image(computer.x, computer.y - 30, 'interact_icon')
        .setDepth(computer.y + 100)
        .setScale(0.8)
        .setVisible(false)
      
      // Animation de l'icône
      this.tweens.add({
        targets: computer.interactIcon,
        y: computer.y - 40,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    })
    
    // === DÉCORATIONS ===
    // Arbres
    const treePositions = [
      { x: 100, y: 300 }, { x: 150, y: 700 }, { x: 80, y: 1200 },
      { x: 2400, y: 350 }, { x: 2450, y: 800 }, { x: 2380, y: 1300 },
      { x: 1000, y: 200 }, { x: 1400, y: 180 }, { x: 1100, y: 1700 },
      { x: 700, y: 750 }, { x: 1800, y: 900 }, { x: 2200, y: 1600 },
    ]
    treePositions.forEach(pos => {
      const tree = this.add.image(pos.x, pos.y, 'tree')
        .setOrigin(0.5, 1)
        .setDepth(pos.y)
      this.decorations.push(tree)
    })
    
    // Buissons
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.mapWidth
      const y = Math.random() * this.mapHeight
      const bush = this.add.image(x, y, 'bush')
        .setOrigin(0.5, 1)
        .setDepth(y)
        .setScale(0.8 + Math.random() * 0.4)
      this.decorations.push(bush)
    }
    
    // Fleurs
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.mapWidth
      const y = Math.random() * this.mapHeight
      this.add.image(x, y, 'flower')
        .setOrigin(0.5, 1)
        .setDepth(y - 10)
        .setScale(0.6 + Math.random() * 0.4)
    }
    
    // Rochers
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * this.mapWidth
      const y = Math.random() * this.mapHeight
      this.add.image(x, y, 'rock')
        .setOrigin(0.5, 1)
        .setDepth(y)
        .setScale(0.7 + Math.random() * 0.6)
    }
    
    // Panneaux indicateurs
    const signPositions = [
      { x: 1280, y: 650, text: '← Entreprises' },
      { x: 1280, y: 1100, text: '↓ Écoles' },
      { x: 1050, y: 960, text: '→ Atelier NIRD' },
    ]
    signPositions.forEach(pos => {
      this.add.image(pos.x, pos.y, 'sign')
        .setOrigin(0.5, 1)
        .setDepth(pos.y)
    })
    
    // Limites du monde
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight)
  }

  private createPlayer(): void {
    // Position de départ (centre de la map, près de l'atelier)
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
    // Animation de marche
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
    // Interaction avec E
    this.interactKey.on('down', () => {
      this.handleInteraction()
    })
  }

  update(): void {
    this.handleMovement()
    this.checkProximity()
    this.updateDepth()
  }

  private handleMovement(): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setVelocity(0)
    
    let isMoving = false
    
    // Mouvement horizontal
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      playerBody.setVelocityX(-this.playerSpeed)
      this.player.setFlipX(true)
      isMoving = true
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      playerBody.setVelocityX(this.playerSpeed)
      this.player.setFlipX(false)
      isMoving = true
    }
    
    // Mouvement vertical
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      playerBody.setVelocityY(-this.playerSpeed)
      isMoving = true
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      playerBody.setVelocityY(this.playerSpeed)
      isMoving = true
    }
    
    // Normaliser la diagonale
    const velocity = playerBody.velocity
    if (velocity.x !== 0 && velocity.y !== 0) {
      playerBody.setVelocity(velocity.x * 0.707, velocity.y * 0.707)
    }
    
    // Animation
    if (isMoving) {
      this.player.play('walk', true)
    } else {
      this.player.setTexture('player_idle')
    }
  }

  private checkProximity(): void {
    // Réinitialiser
    this.nearBuilding = null
    this.nearComputer = null
    
    // Cacher toutes les icônes d'interaction des ordinateurs
    this.computers.forEach(c => {
      if (c.interactIcon && !c.collected) {
        c.interactIcon.setVisible(false)
      }
    })
    
    // Vérifier la proximité des bâtiments
    for (const building of this.buildings) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        building.x, building.y
      )
      
      if (distance < 100) {
        this.nearBuilding = building
        // Émettre un événement pour l'UI
        this.events.emit('nearBuilding', building)
        break
      }
    }
    
    if (!this.nearBuilding) {
      this.events.emit('nearBuilding', null)
    }
    
    // Vérifier la proximité des ordinateurs
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
    // Le joueur doit être rendu devant ou derrière les objets selon sa position Y
    this.player.setDepth(this.player.y)
  }

  private handleInteraction(): void {
    // Collecter un ordinateur
    if (this.nearComputer && !this.nearComputer.collected) {
      this.collectComputer(this.nearComputer)
      return
    }
    
    // Interagir avec un bâtiment
    if (this.nearBuilding) {
      this.interactWithBuilding(this.nearBuilding)
    }
  }

  private collectComputer(computer: CollectibleComputer): void {
    computer.collected = true
    this.collectedCount++
    this.inventory++
    
    // Animation de collecte
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
    
    // Effet sonore visuel
    const collectText = this.add.text(computer.x, computer.y - 30, '+1 PC', {
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
    
    // Mettre à jour l'UI
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
        this.events.emit('showMessage', `${building.name}: "Prenez ces vieux PC, on les jette de toute façon..."`)
        break
        
      case 'workshop':
        if (this.inventory > 0) {
          this.reconditionComputers()
        } else {
          this.events.emit('showMessage', 'Atelier NIRD: "Apportez-nous des PC à reconditionner !"')
        }
        break
        
      case 'school':
        if (this.reconditionedCount > this.distributedCount) {
          this.distributeComputer(building)
        } else {
          this.events.emit('showMessage', `${building.name}: "Nous attendons des ordinateurs reconditionnés !"`)
        }
        break
        
      case 'house':
        this.events.emit('showMessage', '"Merci de rendre le numérique plus responsable !"')
        break
    }
  }

  private reconditionComputers(): void {
    const toRecondition = this.inventory
    this.inventory = 0
    this.reconditionedCount += toRecondition
    
    // Animation à l'atelier
    const workshop = this.buildings.find(b => b.type === 'workshop')
    if (workshop) {
      // Effet visuel
      const recondText = this.add.text(workshop.x, workshop.y - 50, `+${toRecondition} PC sous Linux !`, {
        fontSize: '24px',
        color: '#22c55e',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(9999)
      
      this.tweens.add({
        targets: recondText,
        y: workshop.y - 100,
        alpha: 0,
        duration: 1500,
        onComplete: () => recondText.destroy()
      })
    }
    
    this.events.emit('updateStats', {
      collected: this.collectedCount,
      reconditioned: this.reconditionedCount,
      distributed: this.distributedCount,
      inventory: this.inventory,
    })
    
    this.events.emit('showMessage', `${toRecondition} PC reconditionnés sous Linux ! Distribuez-les aux écoles.`)
  }

  private distributeComputer(school: Building): void {
    this.distributedCount++
    
    // Créer un PC reconditionné devant l'école
    const newPc = this.add.image(
      school.x + (Math.random() - 0.5) * 80,
      school.y + 40,
      'computer_new'
    ).setScale(1.2).setDepth(school.y + 50)
    
    // Animation d'apparition
    newPc.setScale(0)
    this.tweens.add({
      targets: newPc,
      scale: 1.2,
      duration: 300,
      ease: 'Back.easeOut'
    })
    
    // Texte de félicitation
    const distributeText = this.add.text(school.x, school.y - 30, '🎉 +1 PC distribué !', {
      fontSize: '20px',
      color: '#ec4899',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(9999)
    
    this.tweens.add({
      targets: distributeText,
      y: school.y - 80,
      alpha: 0,
      duration: 1000,
      onComplete: () => distributeText.destroy()
    })
    
    this.events.emit('updateStats', {
      collected: this.collectedCount,
      reconditioned: this.reconditionedCount,
      distributed: this.distributedCount,
      inventory: this.inventory,
    })
    
    this.events.emit('showMessage', `PC offert à ${school.name} ! Les élèves découvrent Linux.`)
    
    // Vérifier victoire
    if (this.distributedCount >= 8) {
      this.events.emit('victory')
    }
  }
}
