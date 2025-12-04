/**
 * Scène principale du jeu Phaser
 * Gère le monde isométrique, le joueur et les interactions
 */
import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private speed: number = 200
  private buildings: Phaser.GameObjects.Rectangle[] = []
  private infoText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'MainScene' })
  }

  preload(): void {
    // Ici on chargera les assets (sprites, tilemaps, etc.)
    // Pour le moment, on utilise des formes géométriques
  }

  create(): void {
    // Créer le sol isométrique (grille simple pour le placeholder)
    this.createIsometricGrid()

    // Créer les bâtiments placeholder
    this.createBuildings()

    // Créer le joueur (rectangle placeholder)
    this.player = this.add.rectangle(400, 450, 32, 48, 0x22c55e)
    this.physics.add.existing(this.player)
    
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)

    // Configuration des contrôles clavier
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    // Texte d'information
    this.infoText = this.add.text(400, 30, '🌿 Village Numérique Résistant', {
      fontSize: '20px',
      color: '#22c55e',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    // Instructions
    this.add.text(400, 570, 'Utilisez les flèches ou WASD pour vous déplacer', {
      fontSize: '14px',
      color: '#94a3b8',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    // Message de bienvenue
    this.showMessage('Bienvenue ! Explorez le village et collectez les ordinateurs obsolètes.')
  }

  update(): void {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body

    // Réinitialiser la vélocité
    playerBody.setVelocity(0)

    // Mouvement horizontal
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      playerBody.setVelocityX(-this.speed)
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      playerBody.setVelocityX(this.speed)
    }

    // Mouvement vertical
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      playerBody.setVelocityY(-this.speed)
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      playerBody.setVelocityY(this.speed)
    }

    // Normaliser la vélocité diagonale
    const velocity = playerBody.velocity
    if (velocity.x !== 0 && velocity.y !== 0) {
      playerBody.setVelocity(velocity.x * 0.707, velocity.y * 0.707)
    }

    // Vérifier les collisions avec les bâtiments
    this.checkBuildingInteractions()
  }

  private createIsometricGrid(): void {
    // Créer une grille simple pour simuler le sol
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0x334155, 0.3)

    // Grille de fond
    for (let x = 0; x < 800; x += 50) {
      graphics.moveTo(x, 0)
      graphics.lineTo(x, 600)
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.moveTo(0, y)
      graphics.lineTo(800, y)
    }
    graphics.strokePath()
  }

  private createBuildings(): void {
    // Bâtiments placeholder représentant les lieux du jeu
    const buildingData = [
      { x: 150, y: 150, width: 100, height: 80, color: 0x3b82f6, label: '🏢 Entreprise' },
      { x: 650, y: 150, width: 100, height: 80, color: 0x8b5cf6, label: '🏭 Entreprise 2' },
      { x: 400, y: 300, width: 120, height: 100, color: 0xf59e0b, label: '🔧 Atelier NIRD' },
      { x: 150, y: 450, width: 100, height: 80, color: 0xec4899, label: '🏫 École' },
      { x: 650, y: 450, width: 100, height: 80, color: 0x14b8a6, label: '🏫 Collège' },
    ]

    buildingData.forEach((data) => {
      // Bâtiment
      const building = this.add.rectangle(data.x, data.y, data.width, data.height, data.color, 0.8)
      building.setStrokeStyle(2, 0xffffff, 0.5)
      this.buildings.push(building)

      // Label du bâtiment
      this.add.text(data.x, data.y - data.height / 2 - 15, data.label, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Arial',
      }).setOrigin(0.5)
    })
  }

  private checkBuildingInteractions(): void {
    this.buildings.forEach((building, index) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        building.x,
        building.y
      )

      // Si le joueur est proche d'un bâtiment
      if (distance < 80) {
        building.setStrokeStyle(3, 0x22c55e, 1)
        
        // Afficher une indication d'interaction
        const labels = ['Entreprise Alpha', 'Entreprise Beta', 'Atelier NIRD', 'École Primaire', 'Collège']
        this.infoText.setText(`Appuyez sur ESPACE pour interagir avec ${labels[index]}`)
      } else {
        building.setStrokeStyle(2, 0xffffff, 0.5)
      }
    })
  }

  private showMessage(text: string): void {
    const messageBox = this.add.rectangle(400, 520, 600, 40, 0x1e293b, 0.9)
    messageBox.setStrokeStyle(1, 0x22c55e)
    
    const messageText = this.add.text(400, 520, text, {
      fontSize: '14px',
      color: '#e2e8f0',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    // Faire disparaître le message après 4 secondes
    this.time.delayedCall(4000, () => {
      messageBox.destroy()
      messageText.destroy()
    })
  }
}
