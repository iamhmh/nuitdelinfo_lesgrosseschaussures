/**
 * WorkshopScene - Intérieur de l'atelier NIRD
 * Scène dédiée à la réparation et au reconditionnement des PC
 */
import Phaser from 'phaser'

interface RepairTable {
  sprite: Phaser.GameObjects.Container
  x: number
  y: number
  occupied: boolean
  pcSprite?: Phaser.GameObjects.Image
  isRepairing: boolean
  progress: number
}

interface WorkshopData {
  pcCount: number
  collectedCount: number
  reconditionedCount: number
  distributedCount: number
}

export class WorkshopScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite
  private playerSpeed: number = 150
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private interactKey!: Phaser.Input.Keyboard.Key
  
  private repairTables: RepairTable[] = []
  private nearTable: RepairTable | null = null
  private pcsToRepair: number = 0
  private pcsRepaired: number = 0
  
  private exitZone!: Phaser.GameObjects.Zone
  private canExit: boolean = false
  
  private infoText!: Phaser.GameObjects.Text
  private interactHint!: Phaser.GameObjects.Text
  
  // Données reçues de MainScene
  private workshopData: WorkshopData = {
    pcCount: 0,
    collectedCount: 0,
    reconditionedCount: 0,
    distributedCount: 0
  }

  constructor() {
    super({ key: 'WorkshopScene' })
  }

  init(data: WorkshopData): void {
    this.workshopData = data
    this.pcsToRepair = data.pcCount
    this.pcsRepaired = 0
    this.nearTable = null
    this.canExit = false
    this.repairTables = []
  }

  create(): void {
    // Générer les textures de l'atelier
    this.generateWorkshopTextures()
    
    // Créer l'environnement
    this.createEnvironment()
    this.createRepairTables()
    this.createPlayer()
    this.createExitZone()
    this.createUI()
    this.setupControls()
    
    // Distribuer les PC sur les tables
    this.distributePCsToTables()
    
    // Message d'entrée
    this.showMessage('🔧 Bienvenue dans l\'atelier NIRD ! Approchez-vous des tables pour réparer les PC.')
  }

  private generateWorkshopTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 })
    
    // Sol de l'atelier (carrelage)
    g.clear()
    g.fillStyle(0x505050)
    g.fillRect(0, 0, 64, 64)
    g.fillStyle(0x606060)
    g.fillRect(0, 0, 32, 32)
    g.fillRect(32, 32, 32, 32)
    g.lineStyle(1, 0x404040)
    g.lineBetween(32, 0, 32, 64)
    g.lineBetween(0, 32, 64, 32)
    g.generateTexture('workshop_floor', 64, 64)
    
    // Mur de l'atelier
    g.clear()
    g.fillStyle(0x8b7355)
    g.fillRect(0, 0, 64, 64)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillStyle(row % 2 === 0 ? 0x7a6245 : 0x9c8465)
        g.fillRect(col * 16 + (row % 2) * 8, row * 16, 14, 14)
      }
    }
    g.generateTexture('workshop_wall', 64, 64)
    
    // Table de réparation
    g.clear()
    // Plateau
    g.fillStyle(0x8b4513)
    g.fillRect(0, 20, 120, 60)
    // Surface de travail
    g.fillStyle(0xa0522d)
    g.fillRect(5, 25, 110, 50)
    // Pieds
    g.fillStyle(0x654321)
    g.fillRect(10, 75, 10, 20)
    g.fillRect(100, 75, 10, 20)
    // Outils sur la table
    g.fillStyle(0x333333)
    g.fillRect(85, 35, 20, 8) // Tournevis
    g.fillStyle(0xc0c0c0)
    g.fillRect(90, 32, 10, 3) // Tête tournevis
    g.generateTexture('repair_table', 120, 95)
    
    // Étagère avec matériel
    g.clear()
    g.fillStyle(0x654321)
    g.fillRect(0, 0, 80, 100)
    g.fillStyle(0x8b4513)
    g.fillRect(5, 20, 70, 5)
    g.fillRect(5, 50, 70, 5)
    g.fillRect(5, 80, 70, 5)
    // Objets sur étagères
    g.fillStyle(0x333333)
    g.fillRect(15, 10, 20, 10)
    g.fillRect(45, 10, 15, 10)
    g.fillStyle(0x22c55e)
    g.fillRect(10, 40, 25, 10)
    g.fillStyle(0x444444)
    g.fillRect(50, 60, 20, 20)
    g.generateTexture('shelf', 80, 100)
    
    // Affiche Linux
    g.clear()
    g.fillStyle(0xffffff)
    g.fillRect(0, 0, 60, 80)
    g.fillStyle(0x000000)
    g.fillRect(2, 2, 56, 76)
    // Tux simplifié
    g.fillStyle(0xffa500) // Bec
    g.fillCircle(30, 25, 8)
    g.fillStyle(0x000000) // Corps
    g.fillEllipse(30, 45, 30, 35)
    g.fillStyle(0xffffff) // Ventre
    g.fillEllipse(30, 50, 18, 22)
    g.generateTexture('linux_poster', 60, 80)
    
    // Zone de sortie
    g.clear()
    g.fillStyle(0x22c55e)
    g.setAlpha(0.3)
    g.fillRect(0, 0, 80, 20)
    g.setAlpha(1)
    g.fillStyle(0x22c55e)
    g.fillRect(0, 0, 80, 3)
    g.generateTexture('exit_zone', 80, 20)
    
    g.destroy()
  }

  private createEnvironment(): void {
    const width = 800
    const height = 600
    
    // Sol
    for (let x = 0; x < width; x += 64) {
      for (let y = 100; y < height; y += 64) {
        this.add.image(x + 32, y + 32, 'workshop_floor')
      }
    }
    
    // Mur du fond
    for (let x = 0; x < width; x += 64) {
      this.add.image(x + 32, 50, 'workshop_wall')
      this.add.image(x + 32, 100, 'workshop_wall')
    }
    
    // Étagères sur le mur
    this.add.image(100, 85, 'shelf').setOrigin(0.5, 1).setDepth(90)
    this.add.image(350, 85, 'shelf').setOrigin(0.5, 1).setDepth(90)
    this.add.image(700, 85, 'shelf').setOrigin(0.5, 1).setDepth(90)
    
    // Affiches Linux
    this.add.image(200, 70, 'linux_poster').setOrigin(0.5, 1).setDepth(85)
    this.add.image(500, 70, 'linux_poster').setOrigin(0.5, 1).setDepth(85)
    
    // Titre de l'atelier
    this.add.text(width / 2, 30, '🔧 ATELIER NIRD - Reconditionnement Linux 🐧', {
      fontSize: '28px',
      color: '#22c55e',
      fontStyle: 'bold',
      backgroundColor: '#1a1a1a',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(100)
  }

  private createRepairTables(): void {
    const tablePositions = [
      { x: 150, y: 280 },
      { x: 400, y: 280 },
      { x: 650, y: 280 },
      { x: 150, y: 450 },
      { x: 400, y: 450 },
      { x: 650, y: 450 },
    ]
    
    tablePositions.forEach((pos, index) => {
      const container = this.add.container(pos.x, pos.y)
      
      // Table
      const table = this.add.image(0, 0, 'repair_table').setOrigin(0.5, 0.5)
      container.add(table)
      
      // Numéro de table
      const label = this.add.text(-50, -35, `Table ${index + 1}`, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 4, y: 2 }
      })
      container.add(label)
      
      container.setDepth(pos.y)
      
      this.repairTables.push({
        sprite: container,
        x: pos.x,
        y: pos.y,
        occupied: false,
        isRepairing: false,
        progress: 0
      })
    })
  }

  private distributePCsToTables(): void {
    const count = Math.min(this.pcsToRepair, this.repairTables.length)
    
    for (let i = 0; i < count; i++) {
      const table = this.repairTables[i]
      table.occupied = true
      
      // Ajouter le PC sur la table
      const pc = this.add.image(table.x + 10, table.y - 15, 'computer_old')
        .setScale(1.2)
        .setDepth(table.y + 10)
      table.pcSprite = pc
    }
  }

  private createPlayer(): void {
    // Spawn en bas de l'atelier (près de la sortie)
    this.player = this.add.sprite(400, 550, 'player_idle')
      .setOrigin(0.5, 1)
      .setScale(1.3)
      .setDepth(1000)
    
    this.physics.add.existing(this.player)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(20, 16)
    body.setOffset(10, 48)
    
    // Limiter le mouvement à l'intérieur de l'atelier
    this.physics.world.setBounds(50, 150, 700, 430)
  }

  private createExitZone(): void {
    // Zone de sortie en bas
    this.add.image(400, 590, 'exit_zone').setDepth(50)
    
    this.add.text(400, 585, '🚪 SORTIE', {
      fontSize: '14px',
      color: '#22c55e',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(51)
    
    this.exitZone = this.add.zone(400, 580, 100, 30)
    this.physics.add.existing(this.exitZone, true)
  }

  private createUI(): void {
    // Info en haut
    this.infoText = this.add.text(400, 120, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(100)
    
    this.updateInfoText()
    
    // Indication d'interaction
    this.interactHint = this.add.text(400, 520, '', {
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
      backgroundColor: '#000000cc',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(100).setVisible(false)
  }

  private updateInfoText(): void {
    const remaining = this.pcsToRepair - this.pcsRepaired
    this.infoText.setText(
      `💻 PC à réparer: ${remaining} | ✅ PC réparés: ${this.pcsRepaired} / ${this.pcsToRepair}`
    )
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
    
    this.interactKey.on('down', () => this.handleInteraction())
  }

  private handleInteraction(): void {
    // Vérifier si on peut sortir
    if (this.canExit && this.pcsRepaired >= this.pcsToRepair) {
      this.exitWorkshop()
      return
    }
    
    // Vérifier si on est près d'une table avec un PC à réparer
    if (this.nearTable && this.nearTable.occupied && !this.nearTable.isRepairing) {
      this.startRepair(this.nearTable)
    }
  }

  private startRepair(table: RepairTable): void {
    table.isRepairing = true
    
    // Créer la barre de progression
    const progressBg = this.add.rectangle(table.x, table.y - 60, 100, 15, 0x333333)
      .setDepth(table.y + 100)
    const progressBar = this.add.rectangle(table.x - 48, table.y - 60, 0, 11, 0x22c55e)
      .setOrigin(0, 0.5)
      .setDepth(table.y + 101)
    
    // Texte de progression
    const progressText = this.add.text(table.x, table.y - 80, 'Installation Linux...', {
      fontSize: '12px',
      color: '#22c55e'
    }).setOrigin(0.5).setDepth(table.y + 102)
    
    // Animation de réparation
    this.tweens.add({
      targets: progressBar,
      width: 96,
      duration: 3000,
      onUpdate: () => {
        const percent = Math.floor((progressBar.width / 96) * 100)
        progressText.setText(`Installation Linux... ${percent}%`)
      },
      onComplete: () => {
        this.completeRepair(table, progressBg, progressBar, progressText)
      }
    })
    
    // Animation du technicien (joueur)
    this.tweens.add({
      targets: this.player,
      x: this.player.x + 5,
      duration: 200,
      yoyo: true,
      repeat: 7
    })
    
    this.showMessage('🔧 Réparation en cours...')
  }

  private completeRepair(
    table: RepairTable, 
    progressBg: Phaser.GameObjects.Rectangle, 
    progressBar: Phaser.GameObjects.Rectangle, 
    progressText: Phaser.GameObjects.Text
  ): void {
    // Nettoyer les éléments de progression
    progressBg.destroy()
    progressBar.destroy()
    progressText.destroy()
    
    // Transformer le PC
    if (table.pcSprite) {
      this.tweens.add({
        targets: table.pcSprite,
        scaleX: 0,
        duration: 200,
        onComplete: () => {
          table.pcSprite!.setTexture('computer_new')
          this.tweens.add({
            targets: table.pcSprite,
            scaleX: 1.2,
            duration: 200,
            onComplete: () => {
              // Faire disparaître le PC
              this.time.delayedCall(500, () => {
                this.tweens.add({
                  targets: table.pcSprite,
                  alpha: 0,
                  y: table.y - 50,
                  duration: 400,
                  onComplete: () => {
                    table.pcSprite?.destroy()
                    table.pcSprite = undefined
                    table.occupied = false
                    table.isRepairing = false
                  }
                })
              })
            }
          })
        }
      })
    }
    
    this.pcsRepaired++
    this.updateInfoText()
    
    // Message de succès
    const successText = this.add.text(table.x, table.y - 50, '✅ Linux installé !', {
      fontSize: '16px',
      color: '#22c55e',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(9999)
    
    this.tweens.add({
      targets: successText,
      y: table.y - 100,
      alpha: 0,
      duration: 1000,
      onComplete: () => successText.destroy()
    })
    
    // Vérifier si tous les PC sont réparés
    if (this.pcsRepaired >= this.pcsToRepair) {
      this.showMessage('🎉 Tous les PC sont reconditionnés ! Dirigez-vous vers la SORTIE.')
      this.canExit = true
    } else {
      this.showMessage(`✅ PC reconditionné ! (${this.pcsRepaired}/${this.pcsToRepair})`)
    }
  }

  private exitWorkshop(): void {
    this.showMessage('🚪 Sortie de l\'atelier...')
    
    // Écran noir de transition
    const blackScreen = this.add.rectangle(400, 300, 800, 600, 0x000000)
      .setDepth(10000)
      .setAlpha(0)
    
    this.tweens.add({
      targets: blackScreen,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        // Retourner à MainScene avec les données mises à jour
        this.scene.stop('WorkshopScene')
        this.scene.resume('MainScene')
        
        // Envoyer les données de retour
        const mainScene = this.scene.get('MainScene')
        mainScene.events.emit('workshopComplete', {
          pcsRepaired: this.pcsRepaired,
          collectedCount: this.workshopData.collectedCount,
          reconditionedCount: this.workshopData.reconditionedCount + this.pcsRepaired,
          distributedCount: this.workshopData.distributedCount
        })
      }
    })
  }

  private showMessage(text: string): void {
    const msg = this.add.text(400, 500, text, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5).setDepth(9999)
    
    this.tweens.add({
      targets: msg,
      alpha: 0,
      delay: 2000,
      duration: 500,
      onComplete: () => msg.destroy()
    })
  }

  update(): void {
    this.handleMovement()
    this.checkProximity()
    this.updatePlayerDepth()
  }

  private handleMovement(): void {
    if (!this.player || !this.player.body) return
    
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
    this.nearTable = null
    this.interactHint.setVisible(false)
    
    // Vérifier la proximité des tables
    for (const table of this.repairTables) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, table.x, table.y + 30)
      if (dist < 60 && table.occupied && !table.isRepairing) {
        this.nearTable = table
        this.interactHint.setText('[E] Réparer le PC')
        this.interactHint.setPosition(this.player.x, this.player.y - 70)
        this.interactHint.setVisible(true)
        break
      }
    }
    
    // Vérifier la proximité de la sortie
    const exitDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 400, 580)
    if (exitDist < 50) {
      if (this.pcsRepaired >= this.pcsToRepair) {
        this.canExit = true
        this.interactHint.setText('[E] Sortir de l\'atelier')
        this.interactHint.setPosition(this.player.x, this.player.y - 70)
        this.interactHint.setVisible(true)
      } else {
        this.interactHint.setText(`⚠️ Réparez tous les PC d'abord ! (${this.pcsRepaired}/${this.pcsToRepair})`)
        this.interactHint.setPosition(this.player.x, this.player.y - 70)
        this.interactHint.setVisible(true)
      }
    } else {
      this.canExit = false
    }
  }

  private updatePlayerDepth(): void {
    this.player.setDepth(this.player.y + 10)
  }
}
