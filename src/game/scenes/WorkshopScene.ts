/**
 * WorkshopScene - Intérieur de l'atelier NIRD
 * Scène dédiée à la réparation et au reconditionnement des PC
 */
import Phaser from 'phaser'

interface RepairTable {
  sprite: Phaser.GameObjects.Container
  collider: Phaser.GameObjects.Rectangle
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

// Distributions Linux disponibles
interface LinuxDistro {
  name: string
  icon: string // Emoji de fallback
  textureKey: string // Clé de la texture pour le logo
  color: number
  description: string
}

const LINUX_DISTROS: LinuxDistro[] = [
  { name: 'Ubuntu', icon: '🟠', textureKey: 'logo_ubuntu', color: 0xE95420, description: 'Idéal pour débuter' },
  { name: 'Linux Mint', icon: '🟢', textureKey: 'logo_mint', color: 0x87CF3E, description: 'Simple et élégant' },
  { name: 'Debian', icon: '🔴', textureKey: 'logo_debian', color: 0xA80030, description: 'Stable et fiable' },
  { name: 'Fedora', icon: '🔵', textureKey: 'logo_fedora', color: 0x3C6EB4, description: 'Moderne et innovant' },
]

export class WorkshopScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite
  private playerSpeed: number = 150
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private interactKey!: Phaser.Input.Keyboard.Key
  
  private repairTables: RepairTable[] = []
  private tableColliders!: Phaser.Physics.Arcade.StaticGroup
  private nearTable: RepairTable | null = null
  private pcsToRepair: number = 0
  private pcsRepaired: number = 0
  
  private exitZone!: Phaser.GameObjects.Zone
  private canExit: boolean = false
  private isPlayerRepairing: boolean = false
  private isDesktopOpen: boolean = false
  
  private infoText!: Phaser.GameObjects.Text
  private interactHint!: Phaser.GameObjects.Text
  
  // Éléments de la modale desktop
  private desktopContainer!: Phaser.GameObjects.Container
  
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
    this.isPlayerRepairing = false
    this.isDesktopOpen = false
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
    const width = this.scale.width
    const height = this.scale.height
    
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
    
    // Étagères sur le mur (positionnées proportionnellement)
    this.add.image(width * 0.1, 85, 'shelf').setOrigin(0.5, 1).setDepth(90)
    this.add.image(width * 0.4, 85, 'shelf').setOrigin(0.5, 1).setDepth(90)
    this.add.image(width * 0.7, 85, 'shelf').setOrigin(0.5, 1).setDepth(90)
    this.add.image(width * 0.9, 85, 'shelf').setOrigin(0.5, 1).setDepth(90)
    
    // Affiches Linux
    this.add.image(width * 0.2, 70, 'linux_poster').setOrigin(0.5, 1).setDepth(85)
    this.add.image(width * 0.5, 70, 'linux_poster').setOrigin(0.5, 1).setDepth(85)
    this.add.image(width * 0.8, 70, 'linux_poster').setOrigin(0.5, 1).setDepth(85)
    
    // Titre de l'atelier
    this.add.text(width / 2, 30, '🔧 ATELIER NIRD - Reconditionnement Linux 🐧', {
      fontSize: '32px',
      color: '#22c55e',
      fontStyle: 'bold',
      backgroundColor: '#1a1a1a',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(100)
  }

  private createRepairTables(): void {
    const width = this.scale.width
    const height = this.scale.height
    
    // Créer le groupe de colliders statiques
    this.tableColliders = this.physics.add.staticGroup()
    
    const tablePositions = [
      { x: width * 0.15, y: height * 0.35 },
      { x: width * 0.5, y: height * 0.35 },
      { x: width * 0.85, y: height * 0.35 },
      { x: width * 0.15, y: height * 0.6 },
      { x: width * 0.5, y: height * 0.6 },
      { x: width * 0.85, y: height * 0.6 },
    ]
    
    tablePositions.forEach((pos, index) => {
      const container = this.add.container(pos.x, pos.y)
      
      // Table
      const table = this.add.image(0, 0, 'repair_table').setOrigin(0.5, 0.5)
      container.add(table)
      
      // Numéro de table (au-dessus de la table)
      const label = this.add.text(0, -55, `Table ${index + 1}`, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 6, y: 3 }
      }).setOrigin(0.5)
      container.add(label)
      
      container.setDepth(pos.y)
      
      // Créer le collider invisible pour la table
      const collider = this.add.rectangle(pos.x, pos.y + 10, 100, 60, 0xff0000, 0)
      this.physics.add.existing(collider, true)
      this.tableColliders.add(collider)
      
      this.repairTables.push({
        sprite: container,
        collider: collider,
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
    const width = this.scale.width
    const height = this.scale.height
    
    // Spawn en bas de l'atelier (près de la sortie)
    this.player = this.add.sprite(width / 2, height - 70, 'player_idle')
      .setOrigin(0.5, 1)
      .setScale(1.3)
      .setDepth(1000)
    
    this.physics.add.existing(this.player)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(20, 16)
    body.setOffset(10, 48)
    
    // Limiter le mouvement à l'intérieur de l'atelier
    this.physics.world.setBounds(50, 150, width - 100, height - 200)
    
    // Ajouter la collision avec les tables
    this.physics.add.collider(this.player, this.tableColliders)
  }

  private createExitZone(): void {
    const width = this.scale.width
    const height = this.scale.height
    
    // Zone de sortie en bas
    this.add.image(width / 2, height - 15, 'exit_zone').setDepth(50)
    
    this.add.text(width / 2, height - 20, '🚪 SORTIE', {
      fontSize: '16px',
      color: '#22c55e',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(51)
    
    this.exitZone = this.add.zone(width / 2, height - 25, 120, 40)
    this.physics.add.existing(this.exitZone, true)
  }

  private createUI(): void {
    const width = this.scale.width
    
    // Info en haut
    this.infoText = this.add.text(width / 2, 80, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setDepth(100)
    
    this.updateInfoText()
    
    // Indication d'interaction (positionnée dynamiquement au-dessus du joueur)
    this.interactHint = this.add.text(width / 2, 150, '', {
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setDepth(100000).setVisible(false)
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
    // Ne pas permettre d'interaction si le desktop est ouvert
    if (this.isDesktopOpen) return
    
    // Vérifier si on peut sortir
    if (this.canExit && this.pcsRepaired >= this.pcsToRepair) {
      this.exitWorkshop()
      return
    }
    
    // Vérifier si on est près d'une table avec un PC à réparer
    if (this.nearTable && this.nearTable.occupied && !this.nearTable.isRepairing) {
      this.openDesktop(this.nearTable)
    }
  }

  private openDesktop(table: RepairTable): void {
    this.isDesktopOpen = true
    this.isPlayerRepairing = true
    
    // Bloquer le joueur
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0)
    
    const width = this.scale.width
    const height = this.scale.height
    
    // Créer le conteneur de la modale desktop
    this.desktopContainer = this.add.container(width / 2, height / 2).setDepth(50000)
    
    // Fond noir semi-transparent pour l'arrière-plan
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
    overlay.setInteractive()
    this.desktopContainer.add(overlay)
    
    // Écran du PC (bureau Linux)
    const screenWidth = 700
    const screenHeight = 450
    
    // Bordure de l'écran (comme un moniteur)
    const monitor = this.add.rectangle(0, 0, screenWidth + 20, screenHeight + 50, 0x222222)
    this.desktopContainer.add(monitor)
    
    // Écran avec fond de bureau Linux (gradient bleu/violet)
    const screen = this.add.rectangle(0, -15, screenWidth, screenHeight, 0x2d1b4e)
    this.desktopContainer.add(screen)
    
    // Barre du haut (Ubuntu-style)
    const topBar = this.add.rectangle(0, -15 - screenHeight/2 + 15, screenWidth, 30, 0x3c3c3c)
    this.desktopContainer.add(topBar)
    
    // Titre de la barre
    const topBarText = this.add.text(-screenWidth/2 + 20, -15 - screenHeight/2 + 8, '🐧 Installation Linux', {
      fontSize: '14px',
      color: '#ffffff'
    })
    this.desktopContainer.add(topBarText)
    
    // Bouton fermer
    const closeBtn = this.add.rectangle(screenWidth/2 - 20, -15 - screenHeight/2 + 15, 20, 20, 0xff5555)
      .setInteractive({ useHandCursor: true })
    closeBtn.on('pointerdown', () => this.closeDesktop(false))
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xff7777))
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0xff5555))
    this.desktopContainer.add(closeBtn)
    
    const closeBtnX = this.add.text(screenWidth/2 - 24, -15 - screenHeight/2 + 8, '✕', {
      fontSize: '14px',
      color: '#ffffff'
    })
    this.desktopContainer.add(closeBtnX)
    
    // Titre principal
    const title = this.add.text(0, -160, '🐧 Choisissez une distribution Linux', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.desktopContainer.add(title)
    
    const subtitle = this.add.text(0, -130, 'Cliquez sur une distribution pour l\'installer sur ce PC', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5)
    this.desktopContainer.add(subtitle)
    
    // Afficher les distributions Linux
    const distroStartX = -250
    const distroY = -30
    const distroSpacing = 170
    
    LINUX_DISTROS.forEach((distro, index) => {
      const x = distroStartX + index * distroSpacing
      
      // Icône de la distro
      const distroBox = this.add.rectangle(x, distroY, 140, 120, 0x1a1a1a)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x444444)
      
      distroBox.on('pointerover', () => {
        distroBox.setFillStyle(0x2a2a2a)
        distroBox.setStrokeStyle(3, distro.color)
      })
      distroBox.on('pointerout', () => {
        distroBox.setFillStyle(0x1a1a1a)
        distroBox.setStrokeStyle(2, 0x444444)
      })
      distroBox.on('pointerdown', () => {
        this.startInstallation(table, distro)
      })
      
      this.desktopContainer.add(distroBox)
      
      // Logo de la distribution (image)
      const logo = this.add.image(x, distroY - 25, distro.textureKey)
        .setScale(0.15) // Ajuster la taille selon les logos
        .setOrigin(0.5)
      this.desktopContainer.add(logo)
      
      // Nom
      const name = this.add.text(x, distroY + 15, distro.name, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5)
      this.desktopContainer.add(name)
      
      // Description
      const desc = this.add.text(x, distroY + 40, distro.description, {
        fontSize: '11px',
        color: '#888888'
      }).setOrigin(0.5)
      this.desktopContainer.add(desc)
    })
    
    // Pied de page
    const footer = this.add.text(0, 190, 'Appuyez sur Échap ou cliquez sur ✕ pour annuler', {
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0.5)
    this.desktopContainer.add(footer)
    
    // Ajouter la touche Échap pour fermer
    this.input.keyboard!.once('keydown-ESC', () => {
      if (this.isDesktopOpen) {
        this.closeDesktop(false)
      }
    })
  }

  private startInstallation(table: RepairTable, distro: LinuxDistro): void {
    // Nettoyer le contenu actuel du desktop
    this.desktopContainer.removeAll(true)
    
    const width = this.scale.width
    const height = this.scale.height
    
    // Fond noir semi-transparent
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
    this.desktopContainer.add(overlay)
    
    // Écran d'installation
    const screenWidth = 500
    const screenHeight = 300
    
    const installScreen = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x1a1a1a)
      .setStrokeStyle(3, distro.color)
    this.desktopContainer.add(installScreen)
    
    // Titre avec logo
    const titleLogo = this.add.image(-120, -110, distro.textureKey)
      .setScale(0.1)
      .setOrigin(0.5)
    this.desktopContainer.add(titleLogo)
    
    const title = this.add.text(10, -110, `Installation de ${distro.name}`, {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5)
    this.desktopContainer.add(title)
    
    // Barre de progression
    const progressBg = this.add.rectangle(0, -20, 400, 30, 0x333333)
    this.desktopContainer.add(progressBg)
    
    const progressBar = this.add.rectangle(-198, -20, 0, 26, distro.color)
      .setOrigin(0, 0.5)
    this.desktopContainer.add(progressBar)
    
    // Texte de progression
    const progressText = this.add.text(0, 25, 'Préparation de l\'installation...', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5)
    this.desktopContainer.add(progressText)
    
    // Pourcentage
    const percentText = this.add.text(0, -20, '0%', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.desktopContainer.add(percentText)
    
    // Messages d'installation
    const messages = [
      'Partitionnement du disque...',
      'Copie des fichiers système...',
      'Installation du noyau Linux...',
      'Configuration du bootloader...',
      'Installation des paquets de base...',
      'Configuration du réseau...',
      'Installation des pilotes...',
      'Finalisation de l\'installation...',
      `${distro.name} installé avec succès ! 🎉`
    ]
    
    // Animation d'installation
    this.tweens.add({
      targets: progressBar,
      width: 396,
      duration: 4000,
      ease: 'Linear',
      onUpdate: () => {
        const percent = Math.floor((progressBar.width / 396) * 100)
        percentText.setText(`${percent}%`)
        
        const messageIndex = Math.floor((percent / 100) * (messages.length - 1))
        progressText.setText(messages[Math.min(messageIndex, messages.length - 1)])
      },
      onComplete: () => {
        percentText.setText('100%')
        progressText.setText(messages[messages.length - 1])
        progressText.setColor('#22c55e')
        
        // Fermer automatiquement et passer au PC suivant après 1.5s
        this.time.delayedCall(1500, () => {
          this.closeDesktop(true)
          this.completeRepairAfterInstall(table, distro)
        })
      }
    })
  }

  private closeDesktop(completed: boolean): void {
    if (!this.isDesktopOpen) return
    
    this.isDesktopOpen = false
    this.isPlayerRepairing = false // Débloquer le joueur dans tous les cas
    
    if (this.desktopContainer) {
      this.desktopContainer.destroy()
    }
    
    // Si annulé, afficher un message
    if (!completed) {
      this.showMessage('❌ Installation annulée')
    }
  }

  private completeRepairAfterInstall(table: RepairTable, distro: LinuxDistro): void {
    table.isRepairing = true
    
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
                    this.isPlayerRepairing = false
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
    
    // Message de succès avec le nom de la distro
    const successText = this.add.text(table.x, table.y - 50, `✅ ${distro.name} installé !`, {
      fontSize: '16px',
      color: '#22c55e',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(50001)
    
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
      this.showMessage(`✅ PC reconditionné avec ${distro.name} ! (${this.pcsRepaired}/${this.pcsToRepair})`)
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
    const width = this.scale.width
    const height = this.scale.height
    
    const msg = this.add.text(width / 2, height - 100, text, {
      fontSize: '20px',
      color: '#ffd700',
      backgroundColor: '#000000',
      padding: { x: 20, y: 12 }
    }).setOrigin(0.5).setDepth(100000)
    
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
    
    // Bloquer le mouvement pendant la réparation
    if (this.isPlayerRepairing) {
      body.setVelocity(0)
      this.player.stop()
      this.player.setTexture('player_idle')
      return
    }
    
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
    
    // Ne pas vérifier si en réparation
    if (this.isPlayerRepairing) return
    
    // Vérifier la proximité des tables
    for (const table of this.repairTables) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, table.x, table.y + 30)
      if (dist < 80 && table.occupied && !table.isRepairing) {
        this.nearTable = table
        this.interactHint.setText('[E] Réparer le PC')
        this.interactHint.setPosition(this.player.x, this.player.y - 80)
        this.interactHint.setVisible(true)
        break
      }
    }
    
    // Vérifier la proximité de la sortie
    const height = this.scale.height
    const exitDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.scale.width / 2, height - 25)
    if (exitDist < 60) {
      if (this.pcsRepaired >= this.pcsToRepair) {
        this.canExit = true
        this.interactHint.setText('[E] Sortir de l\'atelier')
        this.interactHint.setPosition(this.player.x, this.player.y - 80)
        this.interactHint.setVisible(true)
      } else {
        this.interactHint.setText(`⚠️ Réparez tous les PC d'abord ! (${this.pcsRepaired}/${this.pcsToRepair})`)
        this.interactHint.setPosition(this.player.x, this.player.y - 80)
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
