/**
 * Scène de chargement - Génère les assets procéduralement
 */
import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
  const width = this.cameras.main.width;
  const height = this.cameras.main.height;

  // Écran noir façon BIOS
  this.cameras.main.setBackgroundColor("#0b0b0b");

  // HEADER style GRUB
  const header = this.add.text(
    width / 2,
    height * 0.18,
    "GRUB v2.06 — Recondi_Tech Bootloader",
    {
      fontSize: "18px",
      color: "#00FF41",
      fontFamily: "monospace"
    }
  ).setOrigin(0.5);

  // Texte façon BIOS log
  const log = this.add.text(
    width * 0.08,
    height * 0.28,
    "",
    {
      fontSize: "16px",
      color: "#00FF41",
      fontFamily: "monospace",
      lineSpacing: 6
    }
  );

  // Curseur terminal clignotant
  const cursor = this.add.text(
    width * 0.08,
    height * 0.28,
    "█",
    {
      fontSize: "18px",
      color: "#00FF41",
      fontFamily: "monospace"
    }
  );

  this.tweens.add({
    targets: cursor,
    alpha: 0,
    duration: 400,
    yoyo: true,
    repeat: -1
  });

  // Lignes simulées façon kernel boot
  const bootLines = [
    "[ OK ] Initializing hardware...",
    "[ OK ] Loading Linux kernel v6.5...",
    "[ OK ] Mounting NIRD filesystem...",
    "[ OK ] Detecting recycled hardware...",
    "[ OK ] Recondition modules loaded.",
    "[ OK ] Starting Recondi_Tech service...",
    "[ OK ] Preparing virtual village...",
    "[ .. ] Loading assets..."
  ];

  let shownLines = "";
  let lineIndex = 0;

  const interval = setInterval(() => {
    if (lineIndex < bootLines.length) {
      shownLines += bootLines[lineIndex] + "\n";
      log.setText(shownLines);
      lineIndex++;
    } else {
      clearInterval(interval);
    }
  }, 280);

  // Mise à jour "progress" pendant chargement réel
  this.load.on("progress", (value: number) => {
    log.setText(
      shownLines +
      `[ .. ] Asset loading: ${Math.round(value * 100)}%`
    );
  });

  // Fin du chargement
  this.load.on("complete", () => {
    log.setText(shownLines + "[ OK ] Boot sequence complete.");
    setTimeout(() => {
      header.destroy();
      log.destroy();
      cursor.destroy();
    }, 300);
  });
}

  create(): void {
    // Générer les textures procéduralement
    this.generateTextures()
    
    // Lancer la scène principale
    this.scene.start('MainScene')
    this.scene.launch('UIScene')
  }

  private generateTextures(): void {
    // === PERSONNAGE ===
    this.generateCharacterSprites()
    
    // === TILES DE SOL ===
    this.generateGroundTiles()
    
    // === BÂTIMENTS ===
    this.generateBuildings()
    
    // === OBJETS ===
    this.generateObjects()
    
    // === ARBRES ET DÉCORS ===
    this.generateDecorations()
  }

  private generateCharacterSprites(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 })
    
    // Personnage idle (face)
    graphics.clear()
    // Corps
    graphics.fillStyle(0x22c55e)
    graphics.fillRoundedRect(8, 16, 16, 20, 4)
    // Tête
    graphics.fillStyle(0xfcd5b0)
    graphics.fillCircle(16, 10, 8)
    // Yeux
    graphics.fillStyle(0x1e293b)
    graphics.fillCircle(13, 9, 2)
    graphics.fillCircle(19, 9, 2)
    // Cheveux
    graphics.fillStyle(0x4a3728)
    graphics.fillRoundedRect(8, 2, 16, 8, 4)
    // Jambes
    graphics.fillStyle(0x3b82f6)
    graphics.fillRect(10, 36, 5, 8)
    graphics.fillRect(17, 36, 5, 8)
    // Pieds
    graphics.fillStyle(0x1e293b)
    graphics.fillRect(9, 42, 6, 4)
    graphics.fillRect(17, 42, 6, 4)
    
    graphics.generateTexture('player_idle', 32, 48)
    
    // Personnage marche (4 frames)
    for (let i = 0; i < 4; i++) {
      graphics.clear()
      const legOffset = Math.sin(i * Math.PI / 2) * 3
      
      // Corps
      graphics.fillStyle(0x22c55e)
      graphics.fillRoundedRect(8, 16, 16, 20, 4)
      // Tête
      graphics.fillStyle(0xfcd5b0)
      graphics.fillCircle(16, 10, 8)
      // Yeux
      graphics.fillStyle(0x1e293b)
      graphics.fillCircle(13, 9, 2)
      graphics.fillCircle(19, 9, 2)
      // Cheveux
      graphics.fillStyle(0x4a3728)
      graphics.fillRoundedRect(8, 2, 16, 8, 4)
      // Jambes animées
      graphics.fillStyle(0x3b82f6)
      graphics.fillRect(10, 36 + legOffset, 5, 8)
      graphics.fillRect(17, 36 - legOffset, 5, 8)
      // Pieds
      graphics.fillStyle(0x1e293b)
      graphics.fillRect(9, 42 + legOffset, 6, 4)
      graphics.fillRect(17, 42 - legOffset, 6, 4)
      
      graphics.generateTexture(`player_walk_${i}`, 32, 48)
    }
    
    graphics.destroy()
  }

  private generateGroundTiles(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 })
    
    // Herbe normale
    graphics.clear()
    graphics.fillStyle(0x22c55e)
    graphics.fillRect(0, 0, 64, 64)
    // Détails d'herbe
    graphics.fillStyle(0x16a34a)
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 60
      const y = Math.random() * 60
      graphics.fillRect(x, y, 3, 6)
    }
    graphics.generateTexture('grass', 64, 64)
    
    // Herbe foncée
    graphics.clear()
    graphics.fillStyle(0x15803d)
    graphics.fillRect(0, 0, 64, 64)
    graphics.fillStyle(0x166534)
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * 60
      const y = Math.random() * 60
      graphics.fillRect(x, y, 4, 8)
    }
    graphics.generateTexture('grass_dark', 64, 64)
    
    // Chemin/route
    graphics.clear()
    graphics.fillStyle(0x78716c)
    graphics.fillRect(0, 0, 64, 64)
    // Pierres
    graphics.fillStyle(0x57534e)
    graphics.fillCircle(15, 20, 8)
    graphics.fillCircle(45, 35, 10)
    graphics.fillCircle(30, 50, 7)
    graphics.generateTexture('path', 64, 64)
    
    // Eau
    graphics.clear()
    graphics.fillStyle(0x0ea5e9)
    graphics.fillRect(0, 0, 64, 64)
    graphics.fillStyle(0x38bdf8)
    graphics.fillRect(10, 20, 40, 4)
    graphics.fillRect(5, 40, 50, 4)
    graphics.generateTexture('water', 64, 64)
    
    graphics.destroy()
  }

  private generateBuildings(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 })
    
    // === ENTREPRISE (bleue) ===
    graphics.clear()
    // Base
    graphics.fillStyle(0x1e40af)
    graphics.fillRect(0, 40, 128, 88)
    // Façade
    graphics.fillStyle(0x3b82f6)
    graphics.fillRect(5, 45, 118, 78)
    // Toit
    graphics.fillStyle(0x1e3a8a)
    graphics.beginPath()
    graphics.moveTo(0, 40)
    graphics.lineTo(64, 10)
    graphics.lineTo(128, 40)
    graphics.closePath()
    graphics.fillPath()
    // Fenêtres
    graphics.fillStyle(0x93c5fd)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        graphics.fillRect(15 + col * 28, 55 + row * 30, 18, 20)
      }
    }
    // Porte
    graphics.fillStyle(0x1e293b)
    graphics.fillRect(52, 95, 24, 28)
    // Panneau "ENTREPRISE"
    graphics.fillStyle(0xfbbf24)
    graphics.fillRect(30, 30, 68, 12)
    graphics.generateTexture('building_enterprise', 128, 128)
    
    // === ATELIER NIRD (orange/vert) ===
    graphics.clear()
    // Base
    graphics.fillStyle(0x854d0e)
    graphics.fillRect(0, 30, 160, 98)
    // Façade
    graphics.fillStyle(0xf59e0b)
    graphics.fillRect(5, 35, 150, 88)
    // Toit vert (éco)
    graphics.fillStyle(0x15803d)
    graphics.fillRect(0, 20, 160, 15)
    graphics.fillStyle(0x22c55e)
    graphics.fillRect(5, 22, 150, 10)
    // Grande porte d'atelier
    graphics.fillStyle(0x1e293b)
    graphics.fillRect(20, 70, 50, 53)
    graphics.fillRect(90, 70, 50, 53)
    // Fenêtres rondes
    graphics.fillStyle(0xfde68a)
    graphics.fillCircle(45, 50, 12)
    graphics.fillCircle(115, 50, 12)
    // Logo Linux/Tux simplifié
    graphics.fillStyle(0x1e293b)
    graphics.fillCircle(80, 55, 15)
    graphics.fillStyle(0xfbbf24)
    graphics.fillCircle(80, 55, 10)
    graphics.generateTexture('building_workshop', 160, 128)
    
    // === ÉCOLE (rose) ===
    graphics.clear()
    // Base
    graphics.fillStyle(0x9d174d)
    graphics.fillRect(0, 35, 144, 93)
    // Façade
    graphics.fillStyle(0xec4899)
    graphics.fillRect(5, 40, 134, 83)
    // Toit
    graphics.fillStyle(0x831843)
    graphics.beginPath()
    graphics.moveTo(0, 35)
    graphics.lineTo(72, 5)
    graphics.lineTo(144, 35)
    graphics.closePath()
    graphics.fillPath()
    // Clocher
    graphics.fillStyle(0xfbbf24)
    graphics.fillRect(65, 0, 14, 15)
    // Fenêtres
    graphics.fillStyle(0xfbcfe8)
    for (let col = 0; col < 5; col++) {
      graphics.fillRect(12 + col * 26, 55, 18, 25)
    }
    // Grande porte
    graphics.fillStyle(0x7c3aed)
    graphics.fillRect(57, 95, 30, 28)
    graphics.generateTexture('building_school', 144, 128)
    
    // === MAISON (simple) ===
    graphics.clear()
    graphics.fillStyle(0x78350f)
    graphics.fillRect(0, 30, 80, 50)
    graphics.fillStyle(0xfbbf24)
    graphics.fillRect(5, 35, 70, 40)
    // Toit
    graphics.fillStyle(0xdc2626)
    graphics.beginPath()
    graphics.moveTo(0, 30)
    graphics.lineTo(40, 5)
    graphics.lineTo(80, 30)
    graphics.closePath()
    graphics.fillPath()
    // Fenêtre
    graphics.fillStyle(0x7dd3fc)
    graphics.fillRect(15, 45, 20, 20)
    // Porte
    graphics.fillStyle(0x78350f)
    graphics.fillRect(50, 50, 18, 25)
    graphics.generateTexture('building_house', 80, 80)
    
    graphics.destroy()
  }

  private generateObjects(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 })
    
    // === ORDINATEUR OBSOLÈTE (à collecter) ===
    graphics.clear()
    // Moniteur CRT
    graphics.fillStyle(0xd1d5db)
    graphics.fillRoundedRect(4, 0, 24, 20, 3)
    // Écran
    graphics.fillStyle(0x1e40af)
    graphics.fillRect(7, 3, 18, 12)
    // BSOD effet
    graphics.fillStyle(0xffffff)
    graphics.fillRect(10, 5, 12, 2)
    graphics.fillRect(10, 9, 8, 2)
    // Base
    graphics.fillStyle(0x9ca3af)
    graphics.fillRect(8, 20, 16, 4)
    // Tour
    graphics.fillStyle(0xd1d5db)
    graphics.fillRect(0, 8, 8, 16)
    // Effet "obsolète" - X rouge
    graphics.lineStyle(3, 0xef4444)
    graphics.lineBetween(2, 0, 30, 24)
    graphics.lineBetween(30, 0, 2, 24)
    graphics.generateTexture('computer_old', 32, 28)
    
    // === ORDINATEUR RECONDITIONNÉ ===
    graphics.clear()
    // Moniteur moderne
    graphics.fillStyle(0x1e293b)
    graphics.fillRoundedRect(4, 0, 24, 18, 2)
    // Écran Linux
    graphics.fillStyle(0x22c55e)
    graphics.fillRect(6, 2, 20, 13)
    // Terminal
    graphics.fillStyle(0x0f172a)
    graphics.fillRect(8, 4, 16, 9)
    graphics.fillStyle(0x22c55e)
    graphics.fillRect(9, 5, 8, 2)
    graphics.fillRect(9, 8, 12, 2)
    // Base fine
    graphics.fillStyle(0x374151)
    graphics.fillRect(12, 18, 8, 3)
    graphics.fillRect(8, 21, 16, 2)
    // Coeur vert
    graphics.fillStyle(0x22c55e)
    graphics.fillCircle(28, 20, 5)
    graphics.fillStyle(0x0f172a)
    graphics.fillRect(26, 18, 4, 4)
    graphics.generateTexture('computer_new', 32, 28)
    
    // === INDICATEUR D'INTERACTION ===
    graphics.clear()
    graphics.fillStyle(0xfbbf24)
    graphics.beginPath()
    graphics.moveTo(16, 0)
    graphics.lineTo(20, 8)
    graphics.lineTo(28, 10)
    graphics.lineTo(22, 16)
    graphics.lineTo(24, 24)
    graphics.lineTo(16, 20)
    graphics.lineTo(8, 24)
    graphics.lineTo(10, 16)
    graphics.lineTo(4, 10)
    graphics.lineTo(12, 8)
    graphics.closePath()
    graphics.fillPath()
    graphics.generateTexture('interact_icon', 32, 28)
    
    graphics.destroy()
  }

  private generateDecorations(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 })
    
    // === ARBRE ===
    graphics.clear()
    // Tronc
    graphics.fillStyle(0x78350f)
    graphics.fillRect(20, 50, 12, 30)
    // Feuillage (3 cercles)
    graphics.fillStyle(0x15803d)
    graphics.fillCircle(26, 35, 22)
    graphics.fillStyle(0x22c55e)
    graphics.fillCircle(18, 28, 16)
    graphics.fillCircle(34, 28, 16)
    graphics.fillCircle(26, 18, 18)
    graphics.generateTexture('tree', 52, 80)
    
    // === BUISSON ===
    graphics.clear()
    graphics.fillStyle(0x15803d)
    graphics.fillCircle(16, 20, 16)
    graphics.fillStyle(0x22c55e)
    graphics.fillCircle(10, 16, 10)
    graphics.fillCircle(22, 16, 10)
    graphics.generateTexture('bush', 32, 32)
    
    // === FLEUR ===
    graphics.clear()
    // Tige
    graphics.fillStyle(0x22c55e)
    graphics.fillRect(7, 10, 2, 12)
    // Pétales
    graphics.fillStyle(0xfbbf24)
    graphics.fillCircle(8, 6, 5)
    graphics.fillStyle(0xf59e0b)
    graphics.fillCircle(8, 6, 3)
    graphics.generateTexture('flower', 16, 24)
    
    // === PANNEAU ===
    graphics.clear()
    // Poteau
    graphics.fillStyle(0x78350f)
    graphics.fillRect(14, 20, 4, 30)
    // Panneau
    graphics.fillStyle(0xfbbf24)
    graphics.fillRect(0, 5, 32, 18)
    graphics.fillStyle(0x78350f)
    graphics.fillRect(2, 7, 28, 14)
    graphics.generateTexture('sign', 32, 50)
    
    // === ROCHER ===
    graphics.clear()
    graphics.fillStyle(0x6b7280)
    graphics.fillCircle(16, 20, 14)
    graphics.fillStyle(0x9ca3af)
    graphics.fillCircle(12, 16, 8)
    graphics.generateTexture('rock', 32, 32)
    
    graphics.destroy()
  }
}
