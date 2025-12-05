/**
 * BootScene - Génération procédurale de toutes les textures
 */
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor("#0a0a0a");

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a1a2e, 0.9);
    progressBox.fillRect(width / 2 - 200, height / 2 - 30, 400, 60);
    progressBox.lineStyle(2, 0x22c55e);
    progressBox.strokeRect(width / 2 - 200, height / 2 - 30, 400, 60);

    const header = this.add
      .text(width / 2, height / 2 - 80, "🖥️ NIRD OS v2.0", {
        fontSize: "24px",
        color: "#22c55e",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    const progressBar = this.add.graphics();

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x22c55e, 1);
      progressBar.fillRect(width / 2 - 190, height / 2 - 20, 380 * value, 40);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      header.destroy();
    });

    this.load.image(
      "placeholder",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    );
    
    // Charger les logos des distributions Linux
    this.load.image("logo_ubuntu", "/src/assets/ubuntu-removebg-preview.png");
    this.load.image("logo_debian", "/src/assets/debian-removebg-preview.png");
    this.load.image("logo_fedora", "/src/assets/fedora-removebg-preview.png");
    this.load.image("logo_mint", "/src/assets/mint-removebg-preview.png");
  }

  create(): void {
    this.generateAllTextures();
    this.scene.start("MainScene");
    this.scene.launch("UIScene");
  }

  private generateAllTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    this.generateTerrain(g);
    this.generateBuildings(g);
    this.generateVehicles(g);
    this.generateVegetation(g);
    this.generateFurniture(g);
    this.generateGameObjects(g);
    this.generateCharacters(g);

    g.destroy();
  }

  // ==================== TERRAIN ====================
  private generateTerrain(g: Phaser.GameObjects.Graphics): void {
    // Herbe normale
    g.clear();
    g.fillStyle(0x4a7c59);
    g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 30; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x3d6b4a, 0x5a8c69, 0x3a5a40]));
      g.fillRect(Math.random() * 60, Math.random() * 60, 2, 4);
    }
    g.generateTexture("grass", 64, 64);

    // Herbe foncée
    g.clear();
    g.fillStyle(0x3a5a40);
    g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 25; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x2d4a35, 0x4a6a50]));
      g.fillRect(Math.random() * 60, Math.random() * 60, 2, 4);
    }
    g.generateTexture("grass_dark", 64, 64);

    // Route asphalt
    g.clear();
    g.fillStyle(0x3a3a3a);
    g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 50; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x333333, 0x404040, 0x2a2a2a]));
      g.fillRect(Math.random() * 62, Math.random() * 62, 2, 2);
    }
    g.generateTexture("road", 64, 64);

    // Route avec ligne horizontale (centrée - route de 2 tiles = 128px, centre à 64px)
    // Cette tile est la PREMIERE des 2, donc la ligne doit être en BAS
    g.clear();
    g.fillStyle(0x3a3a3a);
    g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 40; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x333333, 0x404040]));
      g.fillRect(Math.random() * 62, Math.random() * 62, 2, 2);
    }
    // Ligne discontinue en bas de la tile (sera au centre de la route 2 tiles)
    g.fillStyle(0xffffff);
    for (let i = 0; i < 4; i++) {
      g.fillRect(i * 16 + 4, 60, 10, 4);
    }
    g.generateTexture("road_h", 64, 64);

    // Route avec ligne verticale (centrée)
    g.clear();
    g.fillStyle(0x3a3a3a);
    g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 40; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x333333, 0x404040]));
      g.fillRect(Math.random() * 62, Math.random() * 62, 2, 2);
    }
    // Ligne discontinue à droite de la tile (sera au centre de la route 2 tiles)
    g.fillStyle(0xffffff);
    for (let i = 0; i < 4; i++) {
      g.fillRect(60, i * 16 + 4, 4, 10);
    }
    g.generateTexture("road_v", 64, 64);

    // Intersection
    g.clear();
    g.fillStyle(0x3a3a3a);
    g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 40; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0x333333, 0x404040]));
      g.fillRect(Math.random() * 62, Math.random() * 62, 2, 2);
    }
    g.generateTexture("road_cross", 64, 64);

    // Passage piéton H
    g.clear();
    g.fillStyle(0x3a3a3a);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0xffffff);
    for (let i = 0; i < 5; i++) {
      g.fillRect(6 + i * 12, 0, 8, 64);
    }
    g.generateTexture("crosswalk_h", 64, 64);

    // Passage piéton V
    g.clear();
    g.fillStyle(0x3a3a3a);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0xffffff);
    for (let i = 0; i < 5; i++) {
      g.fillRect(0, 6 + i * 12, 64, 8);
    }
    g.generateTexture("crosswalk_v", 64, 64);

    // Trottoir
    g.clear();
    g.fillStyle(0xb0b0b0);
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(1, 0x909090);
    g.lineBetween(32, 0, 32, 64);
    g.lineBetween(0, 32, 64, 32);
    for (let i = 0; i < 20; i++) {
      g.fillStyle(Phaser.Math.RND.pick([0xa0a0a0, 0xc0c0c0]));
      g.fillRect(Math.random() * 60, Math.random() * 60, 2, 2);
    }
    g.generateTexture("sidewalk", 64, 64);

    // Parking
    g.clear();
    g.fillStyle(0x4a4a4a);
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(2, 0xffffff);
    g.lineBetween(0, 0, 0, 64);
    g.lineBetween(63, 0, 63, 64);
    g.generateTexture("parking", 64, 64);
  }

  // ==================== BÂTIMENTS ====================
  private generateBuildings(g: Phaser.GameObjects.Graphics): void {
    // ENTREPRISE - Grand immeuble moderne 4x6 tiles = 256x384
    const ew = 256,
      eh = 384;
    g.clear();
    // Structure principale - verre bleuté
    g.fillStyle(0x1a3a5a);
    g.fillRect(0, 50, ew, eh - 50);
    // Façade vitrée
    g.fillStyle(0x2a5a8a);
    g.fillRect(10, 60, ew - 20, eh - 75);
    // Fenêtres en grille (plus de lignes pour un bâtiment plus grand)
    for (let row = 0; row < 14; row++) {
      for (let col = 0; col < 6; col++) {
        g.fillStyle(0x1a3a5a);
        g.fillRect(16 + col * 38, 68 + row * 22, 32, 18);
        g.fillStyle(Math.random() > 0.3 ? 0x87ceeb : 0xffd700);
        g.fillRect(18 + col * 38, 70 + row * 22, 28, 14);
      }
    }
    // Toit
    g.fillStyle(0x2a4a6a);
    g.fillRect(0, 44, ew, 12);
    // Antennes
    g.fillStyle(0x555555);
    g.fillRect(40, 12, 5, 35);
    g.fillRect(200, 18, 5, 30);
    g.fillStyle(0xff0000);
    g.fillCircle(42, 12, 5);
    // Entrée
    g.fillStyle(0x0a1a2a);
    g.fillRect(100, eh - 60, 56, 60);
    g.fillStyle(0x5a8aba);
    g.fillRect(106, eh - 54, 44, 48);
    // Logo vert
    g.fillStyle(0x22c55e);
    g.fillRect(112, 90, 32, 22);
    g.generateTexture("building_enterprise", ew, eh);

    // ÉCOLE - Bâtiment en brique 3x3 tiles = 192x192
    const sw = 192,
      sh = 192;
    g.clear();
    // Structure principale brique
    g.fillStyle(0xa54a4a);
    g.fillRect(15, 50, sw - 30, sh - 50);
    // Motif briques
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 10; col++) {
        const offset = row % 2 === 0 ? 0 : 8;
        g.fillStyle(Phaser.Math.RND.pick([0x954040, 0xb55050]));
        g.fillRect(17 + offset + col * 16, 52 + row * 9, 14, 7);
      }
    }
    // Grandes fenêtres
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x2a2a2a);
      g.fillRect(22 + i * 40, 65, 32, 45);
      g.fillStyle(0x87ceeb);
      g.fillRect(24 + i * 40, 67, 28, 41);
      g.fillStyle(0xffffff);
      g.fillRect(37 + i * 40, 67, 2, 41);
      g.fillRect(24 + i * 40, 86, 28, 2);
    }
    // Entrée centrale
    g.fillStyle(0xe8e8e8);
    g.fillRect(70, 35, 52, sh - 35);
    // Colonnes
    g.fillStyle(0xf0f0f0);
    g.fillRect(72, 40, 8, sh - 50);
    g.fillRect(112, 40, 8, sh - 50);
    // Porte double
    g.fillStyle(0x4a2a2a);
    g.fillRect(82, sh - 50, 28, 50);
    g.fillStyle(0x5a3a3a);
    g.fillRect(84, sh - 48, 11, 45);
    g.fillRect(97, sh - 48, 11, 45);
    // Fronton
    g.fillStyle(0xd0d0d0);
    g.beginPath();
    g.moveTo(65, 35);
    g.lineTo(96, 12);
    g.lineTo(127, 35);
    g.closePath();
    g.fillPath();
    // Horloge
    g.fillStyle(0xffffff);
    g.fillCircle(96, 24, 8);
    g.fillStyle(0x000000);
    g.fillCircle(96, 24, 6);
    g.fillStyle(0xffffff);
    g.fillCircle(96, 24, 4);
    // Drapeau
    g.fillStyle(0x555555);
    g.fillRect(sw - 18, 10, 3, 40);
    g.fillStyle(0x0055a4);
    g.fillRect(sw - 15, 12, 5, 10);
    g.fillStyle(0xffffff);
    g.fillRect(sw - 10, 12, 5, 10);
    g.fillStyle(0xef4135);
    g.fillRect(sw - 5, 12, 5, 10);
    g.generateTexture("building_school", sw, sh);

    // UNIVERSITÉ - Grand campus moderne 4x4 tiles = 256x256
    const uw = 256,
      uh = 256;
    g.clear();
    // Bâtiment principal - pierre noble
    g.fillStyle(0xd4c8b8);
    g.fillRect(15, 60, uw - 30, uh - 60);
    // Ailes latérales
    g.fillStyle(0xc8bca8);
    g.fillRect(0, 80, 22, uh - 80);
    g.fillRect(uw - 22, 80, 22, uh - 80);
    // Colonnes majestueuses
    g.fillStyle(0xe8e0d0);
    for (let i = 0; i < 5; i++) {
      g.fillRect(38 + i * 45, 70, 14, uh - 80);
      g.fillStyle(0xf0e8d8);
      g.fillRect(40 + i * 45, 70, 10, uh - 80);
      g.fillStyle(0xe8e0d0);
    }
    // Fronton triangulaire
    g.fillStyle(0xe0d8c8);
    g.beginPath();
    g.moveTo(30, 60);
    g.lineTo(uw / 2, 18);
    g.lineTo(uw - 30, 60);
    g.closePath();
    g.fillPath();
    // Détails du fronton
    g.fillStyle(0xc8c0b0);
    g.beginPath();
    g.moveTo(48, 58);
    g.lineTo(uw / 2, 28);
    g.lineTo(uw - 48, 58);
    g.closePath();
    g.fillPath();
    // Grandes fenêtres cintrées
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x2a3a4a);
      g.fillRect(42 + i * 48, 90, 32, 50);
      // Arc
      g.fillStyle(0x2a3a4a);
      g.fillCircle(58 + i * 48, 90, 16);
      // Vitre
      g.fillStyle(0x87ceeb);
      g.fillRect(45 + i * 48, 95, 26, 42);
      g.fillCircle(58 + i * 48, 93, 13);
    }
    // Fenêtres étage
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0x2a3a4a);
      g.fillRect(35 + i * 42, 165, 28, 35);
      g.fillStyle(0x87ceeb);
      g.fillRect(37 + i * 42, 167, 24, 31);
    }
    // Porte monumentale
    g.fillStyle(0x3a2a1a);
    g.fillRect(100, uh - 70, 56, 70);
    g.fillStyle(0x4a3a2a);
    g.fillRect(105, uh - 65, 22, 60);
    g.fillRect(129, uh - 65, 22, 60);
    // Arc porte
    g.fillStyle(0xd4c8b8);
    g.fillCircle(128, uh - 70, 30);
    g.fillStyle(0x3a2a1a);
    g.fillCircle(128, uh - 70, 26);
    // Dôme/coupole
    g.fillStyle(0x4a6a8a);
    g.fillCircle(uw / 2, 32, 22);
    g.fillStyle(0x5a7a9a);
    g.fillCircle(uw / 2, 30, 17);
    // Flèche
    g.fillStyle(0xffd700);
    g.fillRect(uw / 2 - 2, 4, 4, 14);
    // Enseigne
    g.fillStyle(0x1a3a5a);
    g.fillRect(uw / 2 - 40, 48, 80, 10);
    g.generateTexture("building_university", uw, uh);

    // ATELIER NIRD - Bâtiment moderne éco 3x3 tiles = 192x192
    const ww = 192,
      wh = 192;
    g.clear();

    // === FONDATION ===
    g.fillStyle(0x3a3a3a);
    g.fillRect(5, wh - 8, ww - 10, 8);

    // === STRUCTURE PRINCIPALE (style industriel moderne) ===
    // Mur principal - béton texturé
    g.fillStyle(0x5a6a7a);
    g.fillRect(8, 55, ww - 16, wh - 63);
    // Texture béton
    for (let i = 0; i < 8; i++) {
      g.fillStyle(i % 2 === 0 ? 0x4a5a6a : 0x6a7a8a);
      g.fillRect(8, 55 + i * 16, ww - 16, 15);
    }

    // Bordure métallique verte
    g.fillStyle(0x22c55e);
    g.fillRect(5, 52, ww - 10, 6);
    g.fillRect(5, 52, 5, wh - 60);
    g.fillRect(ww - 10, 52, 5, wh - 60);

    // === TOIT VÉGÉTALISÉ ===
    g.fillStyle(0x2d5a2d);
    g.beginPath();
    g.moveTo(0, 55);
    g.lineTo(ww / 2, 8);
    g.lineTo(ww, 55);
    g.closePath();
    g.fillPath();
    // Herbe sur le toit
    g.fillStyle(0x4a8a4a);
    for (let i = 0; i < 12; i++) {
      const tx = 20 + i * 13;
      const ty = 45 - Math.abs(tx - ww / 2) * 0.3;
      g.fillCircle(tx, ty, 6 + Math.random() * 3);
    }

    // === PANNEAUX SOLAIRES (plus réalistes) ===
    // Panneau gauche
    g.fillStyle(0x1a2a4a);
    g.fillRect(22, 22, 55, 22);
    g.fillStyle(0x3a5a8a);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillRect(24 + col * 13, 24 + row * 10, 11, 8);
      }
    }
    // Panneau droit
    g.fillStyle(0x1a2a4a);
    g.fillRect(115, 22, 55, 22);
    g.fillStyle(0x3a5a8a);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillRect(117 + col * 13, 24 + row * 10, 11, 8);
      }
    }

    // === GRANDE PORTE ATELIER (style hangar) ===
    g.fillStyle(0x3a4a3a);
    g.fillRect(12, 75, 85, wh - 83);
    // Cadre métallique
    g.fillStyle(0x22c55e);
    g.fillRect(12, 75, 85, 4);
    g.fillRect(12, 75, 4, wh - 83);
    g.fillRect(93, 75, 4, wh - 83);
    // Lamelles de la porte
    for (let i = 0; i < 7; i++) {
      g.fillStyle(i % 2 === 0 ? 0x4a5a4a : 0x5a6a5a);
      g.fillRect(16, 80 + i * 14, 77, 13);
    }
    // Fenêtres de la porte
    g.fillStyle(0x87ceeb);
    g.fillRect(22, 85, 30, 22);
    g.fillRect(58, 85, 30, 22);
    g.fillStyle(0x5a8aba);
    g.fillRect(22, 95, 30, 2);
    g.fillRect(58, 95, 30, 2);

    // === PORTE BUREAU ===
    g.fillStyle(0x4a3a2a);
    g.fillRect(110, 105, 55, wh - 113);
    g.fillStyle(0x22c55e);
    g.fillRect(110, 105, 55, 4);
    // Vitre
    g.fillStyle(0x87ceeb);
    g.fillRect(118, 115, 40, 45);
    g.fillStyle(0x5a8aba);
    g.fillRect(137, 115, 2, 45);

    // === ENSEIGNE NIRD (plus visible) ===
    // Fond enseigne
    g.fillStyle(0x1a1a1a);
    g.fillRect(ww / 2 - 45, 58, 90, 30);
    // Bordure lumineuse
    g.fillStyle(0x22c55e);
    g.fillRect(ww / 2 - 47, 56, 94, 3);
    g.fillRect(ww / 2 - 47, 87, 94, 3);
    g.fillRect(ww / 2 - 47, 56, 3, 34);
    g.fillRect(ww / 2 + 44, 56, 3, 34);
    // Texte NIRD (stylisé avec des rectangles)
    g.fillStyle(0x22c55e);
    // N
    g.fillRect(ww / 2 - 38, 63, 4, 18);
    g.fillRect(ww / 2 - 38, 63, 12, 4);
    g.fillRect(ww / 2 - 30, 63, 4, 18);
    // I
    g.fillRect(ww / 2 - 20, 63, 4, 18);
    // R
    g.fillRect(ww / 2 - 10, 63, 4, 18);
    g.fillRect(ww / 2 - 10, 63, 12, 4);
    g.fillRect(ww / 2 - 10, 71, 12, 4);
    g.fillRect(ww / 2 - 2, 63, 4, 12);
    // D
    g.fillRect(ww / 2 + 8, 63, 4, 18);
    g.fillRect(ww / 2 + 8, 63, 10, 4);
    g.fillRect(ww / 2 + 8, 77, 10, 4);
    g.fillRect(ww / 2 + 14, 67, 4, 10);

    // === LOGO TUX (mascotte Linux) ===
    // Corps
    g.fillStyle(0x000000);
    g.fillEllipse(170, 130, 24, 30);
    // Ventre
    g.fillStyle(0xf0f0f0);
    g.fillEllipse(170, 135, 16, 20);
    // Yeux
    g.fillStyle(0xffffff);
    g.fillCircle(164, 118, 6);
    g.fillCircle(176, 118, 6);
    g.fillStyle(0x000000);
    g.fillCircle(165, 118, 3);
    g.fillCircle(177, 118, 3);
    // Bec
    g.fillStyle(0xffa500);
    g.fillTriangle(170, 122, 164, 128, 176, 128);
    // Pattes
    g.fillStyle(0xffa500);
    g.fillRect(162, 150, 8, 6);
    g.fillRect(172, 150, 8, 6);

    // === ÉLÉMENTS DÉCORATIFS ===
    // Plantes en pot
    g.fillStyle(0x8b4513);
    g.fillRect(4, wh - 25, 14, 17);
    g.fillStyle(0x4a8a4a);
    g.fillCircle(11, wh - 30, 10);

    g.fillStyle(0x8b4513);
    g.fillRect(ww - 18, wh - 25, 14, 17);
    g.fillStyle(0x4a8a4a);
    g.fillCircle(ww - 11, wh - 30, 10);

    // Lampe extérieure
    g.fillStyle(0x333333);
    g.fillRect(105, 90, 3, 12);
    g.fillStyle(0xffdd44);
    g.fillCircle(106, 88, 5);

    g.generateTexture("building_workshop", ww, wh);

    // MAISON (neutre) 2x2 tiles = 128x128
    const hw = 128,
      hh = 128;
    g.clear();
    // Mur
    g.fillStyle(0xe8d8b8);
    g.fillRect(10, 50, hw - 20, hh - 50);
    // Toit
    g.fillStyle(0xc84a3a);
    g.beginPath();
    g.moveTo(5, 53);
    g.lineTo(hw / 2, 15);
    g.lineTo(hw - 5, 53);
    g.closePath();
    g.fillPath();
    // Tuiles
    for (let row = 0; row < 4; row++) {
      for (let i = 0; i < 11; i++) {
        g.fillStyle(row % 2 === 0 ? 0xb83a2a : 0xd85a4a);
        g.fillRect(14 + i * 10 + (row % 2) * 5, 26 + row * 8, 9, 6);
      }
    }
    // Cheminée
    g.fillStyle(0xa54040);
    g.fillRect(92, 22, 14, 28);
    // Fenêtre
    g.fillStyle(0x2a2a2a);
    g.fillRect(20, 60, 38, 38);
    g.fillStyle(0x87ceeb);
    g.fillRect(22, 62, 34, 34);
    g.fillStyle(0xffffff);
    g.fillRect(38, 62, 3, 34);
    g.fillRect(22, 78, 34, 3);
    // Porte
    g.fillStyle(0x5a3a2a);
    g.fillRect(72, 72, 34, hh - 72);
    g.fillStyle(0xffd700);
    g.fillCircle(96, 100, 4);
    g.generateTexture("building_house", hw, hh);

    // IMMEUBLE (neutre) 3x3 tiles = 192x192
    const aw = 192,
      ah = 192;
    g.clear();
    // Structure
    g.fillStyle(0xd8c8a8);
    g.fillRect(0, 25, aw, ah - 25);
    // Fenêtres et balcons
    for (let floor = 0; floor < 5; floor++) {
      const y = 32 + floor * 32;
      for (let apt = 0; apt < 4; apt++) {
        const x = 12 + apt * 46;
        g.fillStyle(0x2a2a2a);
        g.fillRect(x, y, 38, 26);
        g.fillStyle(Math.random() > 0.4 ? 0x87ceeb : 0xffeaa7);
        g.fillRect(x + 2, y + 2, 34, 22);
        if (floor < 4) {
          g.fillStyle(0x888888);
          g.fillRect(x - 2, y + 28, 42, 3);
        }
      }
    }
    // Toit
    g.fillStyle(0x8a8a8a);
    g.fillRect(0, 20, aw, 8);
    // Entrée
    g.fillStyle(0x4a4a4a);
    g.fillRect(75, ah - 45, 42, 45);
    g.fillStyle(0x87ceeb);
    g.fillRect(81, ah - 40, 30, 35);
    g.generateTexture("building_apartment", aw, ah);

    // COMMERCE (neutre) 2x2 tiles = 128x128
    const cw = 128,
      ch = 128;
    g.clear();
    // Structure
    g.fillStyle(0xe0d0b0);
    g.fillRect(0, 30, cw, ch - 30);
    // Vitrine
    g.fillStyle(0x2a3a4a);
    g.fillRect(10, 48, cw - 20, 50);
    g.fillStyle(0xadd8e6);
    g.fillRect(12, 50, cw - 24, 46);
    // Auvent
    for (let i = 0; i < 13; i++) {
      g.fillStyle(i % 2 === 0 ? 0xe74c3c : 0xffffff);
      g.beginPath();
      g.moveTo(i * 10, 30);
      g.lineTo(i * 10 + 10, 30);
      g.lineTo(i * 10 + 10, 48);
      g.lineTo(i * 10, 42);
      g.closePath();
      g.fillPath();
    }
    // Porte
    g.fillStyle(0x4a3a2a);
    g.fillRect(50, 70, 28, ch - 70);
    g.fillStyle(0x87ceeb);
    g.fillRect(54, 74, 20, 32);
    // Enseigne
    g.fillStyle(0x2a5a2a);
    g.fillRect(25, 33, 78, 14);
    g.generateTexture("building_shop", cw, ch);

    // BUREAU (neutre) 3x4 tiles = 192x256
    const ow = 192,
      oh = 256;
    g.clear();
    // Structure béton
    g.fillStyle(0x7a7a8a);
    g.fillRect(0, 30, ow, oh - 30);
    // Étages
    for (let floor = 0; floor < 9; floor++) {
      const y = 38 + floor * 24;
      g.fillStyle(0x6a6a7a);
      g.fillRect(8, y, ow - 16, 21);
      for (let win = 0; win < 5; win++) {
        g.fillStyle(0x1a2a3a);
        g.fillRect(14 + win * 36, y + 3, 28, 15);
        g.fillStyle(Math.random() > 0.4 ? 0x87ceeb : 0xffeaa7);
        g.fillRect(16 + win * 36, y + 5, 24, 11);
      }
    }
    // Toit
    g.fillStyle(0x5a5a6a);
    g.fillRect(0, 24, ow, 10);
    // Porte
    g.fillStyle(0x2a2a3a);
    g.fillRect(76, oh - 45, 40, 45);
    g.fillStyle(0x5a5a6a);
    g.fillRect(80, oh - 40, 32, 36);
    g.generateTexture("building_office", ow, oh);
  }

  // ==================== VÉHICULES ====================
  private generateVehicles(g: Phaser.GameObjects.Graphics): void {
    const carColors = [
      { name: "red", color: 0xc0392b, dark: 0x922b21 },
      { name: "blue", color: 0x2980b9, dark: 0x1f618d },
      { name: "green", color: 0x27ae60, dark: 0x1e8449 },
      { name: "yellow", color: 0xf1c40f, dark: 0xb7950b },
      { name: "white", color: 0xecf0f1, dark: 0xbdc3c7 },
      { name: "black", color: 0x2c3e50, dark: 0x1a252f },
    ];

    carColors.forEach((car) => {
      g.clear();

      // === VUE 3/4 ARRIÈRE - Voiture avec perspective ===

      // Partie basse du corps (dessous)
      g.fillStyle(0x1a1a1a);
      g.fillRect(10, 42, 60, 8);

      // Corps principal de la voiture
      g.fillStyle(car.color);
      g.fillRoundedRect(8, 22, 64, 28, 4);

      // Côté gauche (ombre pour volume)
      g.fillStyle(car.dark);
      g.fillRect(8, 26, 4, 20);

      // Capot avant (partie haute inclinée)
      g.fillStyle(car.color);
      g.beginPath();
      g.moveTo(8, 30);
      g.lineTo(8, 22);
      g.lineTo(20, 18);
      g.lineTo(20, 30);
      g.closePath();
      g.fillPath();

      // Coffre arrière
      g.fillStyle(car.dark);
      g.beginPath();
      g.moveTo(72, 22);
      g.lineTo(72, 50);
      g.lineTo(68, 50);
      g.lineTo(62, 30);
      g.lineTo(62, 22);
      g.closePath();
      g.fillPath();

      // Toit/cabine (volume 3D)
      g.fillStyle(0x2c3e50);
      g.fillRoundedRect(20, 12, 40, 22, 3);

      // Ombre du toit
      g.fillStyle(0x1a252f);
      g.fillRect(20, 30, 40, 4);

      // Pare-brise avant (incliné)
      g.fillStyle(0x85c1e9);
      g.beginPath();
      g.moveTo(22, 14);
      g.lineTo(30, 14);
      g.lineTo(26, 28);
      g.lineTo(22, 28);
      g.closePath();
      g.fillPath();

      // Vitre latérale
      g.fillStyle(0x5dade2);
      g.fillRect(32, 14, 18, 14);

      // Montant central
      g.fillStyle(0x2c3e50);
      g.fillRect(42, 14, 3, 14);

      // Vitre arrière
      g.fillStyle(0x85c1e9);
      g.beginPath();
      g.moveTo(52, 14);
      g.lineTo(58, 14);
      g.lineTo(58, 28);
      g.lineTo(54, 28);
      g.closePath();
      g.fillPath();

      // Reflet sur le toit
      g.fillStyle(0xffffff);
      g.setAlpha(0.15);
      g.fillRect(25, 13, 30, 3);
      g.setAlpha(1);

      // Phares avant
      g.fillStyle(0xfffacd);
      g.fillCircle(12, 28, 4);
      g.fillCircle(12, 44, 4);
      // Lueur phares
      g.fillStyle(0xffffff);
      g.setAlpha(0.5);
      g.fillCircle(12, 28, 2);
      g.fillCircle(12, 44, 2);
      g.setAlpha(1);

      // Feux arrière
      g.fillStyle(0xe74c3c);
      g.fillRect(68, 26, 4, 6);
      g.fillRect(68, 42, 4, 6);

      // Roues (vue latérale avec perspective)
      // Roue avant gauche
      g.fillStyle(0x1a1a1a);
      g.fillEllipse(18, 50, 14, 10);
      g.fillStyle(0x555555);
      g.fillEllipse(18, 50, 8, 6);
      g.fillStyle(0x888888);
      g.fillEllipse(18, 50, 4, 3);

      // Roue arrière gauche
      g.fillStyle(0x1a1a1a);
      g.fillEllipse(58, 50, 14, 10);
      g.fillStyle(0x555555);
      g.fillEllipse(58, 50, 8, 6);
      g.fillStyle(0x888888);
      g.fillEllipse(58, 50, 4, 3);

      // Reflet carrosserie
      g.fillStyle(0xffffff);
      g.setAlpha(0.1);
      g.fillRect(12, 24, 50, 2);
      g.setAlpha(1);

      g.generateTexture(`car_${car.name}`, 80, 64);
    });
  }

  // ==================== VÉGÉTATION ====================
  private generateVegetation(g: Phaser.GameObjects.Graphics): void {
    // Arbre grand
    g.clear();
    g.fillStyle(0x5a3a1a);
    g.fillRect(24, 60, 16, 40);
    g.fillStyle(0x4a2a0a);
    g.fillRect(24, 60, 5, 40);
    g.fillStyle(0x2a5a2a);
    g.fillCircle(32, 45, 30);
    g.fillStyle(0x3a7a3a);
    g.fillCircle(22, 38, 22);
    g.fillCircle(42, 38, 22);
    g.fillStyle(0x4a8a4a);
    g.fillCircle(32, 28, 24);
    g.fillStyle(0x5a9a5a);
    g.fillCircle(32, 20, 14);
    g.generateTexture("tree", 64, 100);

    // Sapin
    g.clear();
    g.fillStyle(0x4a2a0a);
    g.fillRect(22, 75, 10, 25);
    g.fillStyle(0x1a4a2a);
    g.beginPath();
    g.moveTo(27, 8);
    g.lineTo(50, 40);
    g.lineTo(4, 40);
    g.closePath();
    g.fillPath();
    g.fillStyle(0x2a5a3a);
    g.beginPath();
    g.moveTo(27, 25);
    g.lineTo(54, 60);
    g.lineTo(0, 60);
    g.closePath();
    g.fillPath();
    g.fillStyle(0x3a6a4a);
    g.beginPath();
    g.moveTo(27, 45);
    g.lineTo(58, 80);
    g.lineTo(-4, 80);
    g.closePath();
    g.fillPath();
    g.generateTexture("tree_pine", 58, 100);

    // Buisson
    g.clear();
    g.fillStyle(0x2a5a2a);
    g.fillCircle(20, 26, 18);
    g.fillStyle(0x3a7a3a);
    g.fillCircle(12, 20, 14);
    g.fillCircle(28, 20, 14);
    g.fillStyle(0x4a8a4a);
    g.fillCircle(20, 14, 12);
    g.fillStyle(0xff69b4);
    g.fillCircle(10, 16, 3);
    g.fillCircle(30, 18, 3);
    g.fillStyle(0xffff00);
    g.fillCircle(20, 12, 3);
    g.generateTexture("bush", 40, 36);

    // Fleur
    g.clear();
    g.fillStyle(0x3a7a3a);
    g.fillRect(9, 16, 3, 18);
    g.fillStyle(0xff69b4);
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      g.fillCircle(10 + Math.cos(angle) * 5, 10 + Math.sin(angle) * 5, 4);
    }
    g.fillStyle(0xffff00);
    g.fillCircle(10, 10, 4);
    g.generateTexture("flower", 20, 34);

    // Fleur jaune
    g.clear();
    g.fillStyle(0x3a7a3a);
    g.fillRect(9, 14, 3, 16);
    g.fillStyle(0xffd700);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      g.fillEllipse(10 + Math.cos(angle) * 5, 9 + Math.sin(angle) * 5, 5, 7);
    }
    g.fillStyle(0x8b4513);
    g.fillCircle(10, 9, 4);
    g.generateTexture("flower_yellow", 20, 30);

    // Rocher
    g.clear();
    g.fillStyle(0x6a6a6a);
    g.fillCircle(20, 24, 18);
    g.fillStyle(0x8a8a8a);
    g.fillCircle(14, 18, 12);
    g.fillStyle(0x9a9a9a);
    g.fillCircle(10, 12, 6);
    g.fillStyle(0x5a5a5a);
    g.fillCircle(26, 26, 8);
    g.generateTexture("rock", 40, 40);
  }

  // ==================== MOBILIER URBAIN ====================
  private generateFurniture(g: Phaser.GameObjects.Graphics): void {
    // Lampadaire
    g.clear();
    g.fillStyle(0x3a3a3a);
    g.fillRect(8, 25, 5, 70);
    g.fillStyle(0x2a2a2a);
    g.fillRect(3, 6, 15, 22);
    g.fillStyle(0xfffacd);
    g.fillRect(5, 10, 11, 14);
    g.fillStyle(0xfffff0);
    g.setAlpha(0.4);
    g.fillCircle(10, 17, 12);
    g.setAlpha(1);
    g.generateTexture("lamppost", 21, 95);

    // Feu tricolore - ROUGE
    g.clear();
    g.fillStyle(0x2a2a2a);
    g.fillRect(10, 40, 6, 55);
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(5, 6, 16, 38, 3);
    // Rouge allumé
    g.fillStyle(0xff0000);
    g.fillCircle(13, 14, 5);
    g.fillStyle(0xff4444);
    g.fillCircle(12, 13, 2);
    // Orange éteint
    g.fillStyle(0x3a3a00);
    g.fillCircle(13, 26, 5);
    // Vert éteint
    g.fillStyle(0x003a00);
    g.fillCircle(13, 38, 5);
    g.generateTexture("traffic_light_red", 26, 95);

    // Feu tricolore - ORANGE
    g.clear();
    g.fillStyle(0x2a2a2a);
    g.fillRect(10, 40, 6, 55);
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(5, 6, 16, 38, 3);
    // Rouge éteint
    g.fillStyle(0x3a0000);
    g.fillCircle(13, 14, 5);
    // Orange allumé
    g.fillStyle(0xffa500);
    g.fillCircle(13, 26, 5);
    g.fillStyle(0xffcc44);
    g.fillCircle(12, 25, 2);
    // Vert éteint
    g.fillStyle(0x003a00);
    g.fillCircle(13, 38, 5);
    g.generateTexture("traffic_light_orange", 26, 95);

    // Feu tricolore - VERT
    g.clear();
    g.fillStyle(0x2a2a2a);
    g.fillRect(10, 40, 6, 55);
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(5, 6, 16, 38, 3);
    // Rouge éteint
    g.fillStyle(0x3a0000);
    g.fillCircle(13, 14, 5);
    // Orange éteint
    g.fillStyle(0x3a3a00);
    g.fillCircle(13, 26, 5);
    // Vert allumé
    g.fillStyle(0x00ff00);
    g.fillCircle(13, 38, 5);
    g.fillStyle(0x44ff44);
    g.fillCircle(12, 37, 2);
    g.generateTexture("traffic_light_green", 26, 95);

    // Garder l'ancien pour compatibilité
    g.clear();
    g.fillStyle(0x2a2a2a);
    g.fillRect(10, 40, 6, 55);
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(5, 6, 16, 38, 3);
    g.fillStyle(0xff0000);
    g.fillCircle(13, 14, 5);
    g.fillStyle(0x4a4a00);
    g.fillCircle(13, 26, 5);
    g.fillStyle(0x004a00);
    g.fillCircle(13, 38, 5);
    g.generateTexture("traffic_light", 26, 95);

    // Banc
    g.clear();
    g.fillStyle(0x5a3a1a);
    g.fillRect(0, 14, 50, 8);
    g.fillRect(0, 24, 50, 5);
    g.fillStyle(0x3a3a3a);
    g.fillRect(6, 22, 5, 18);
    g.fillRect(39, 22, 5, 18);
    g.generateTexture("bench", 50, 40);

    // Poubelle
    g.clear();
    g.fillStyle(0x2a5a2a);
    g.fillRect(5, 10, 20, 30);
    g.fillStyle(0x1a4a1a);
    g.fillRect(3, 8, 24, 5);
    g.fillStyle(0xffffff);
    g.fillCircle(15, 25, 6);
    g.fillStyle(0x2a5a2a);
    g.fillCircle(15, 25, 4);
    g.generateTexture("trashcan", 30, 40);

    // Panneau
    g.clear();
    g.fillStyle(0x4a4a4a);
    g.fillRect(12, 25, 5, 50);
    g.fillStyle(0x2a5a8a);
    g.fillRoundedRect(0, 3, 30, 25, 4);
    g.fillStyle(0xffffff);
    g.fillRect(5, 10, 20, 3);
    g.fillRect(5, 16, 15, 3);
    g.generateTexture("sign", 30, 75);

    // Boîte aux lettres
    g.clear();
    g.fillStyle(0xf1c40f);
    g.fillRoundedRect(3, 12, 24, 30, 4);
    g.fillStyle(0xe67e22);
    g.fillRect(7, 22, 16, 4);
    g.fillStyle(0x3a3a3a);
    g.fillRect(12, 42, 6, 18);
    g.generateTexture("mailbox", 30, 60);

    // Fontaine
    g.clear();
    g.fillStyle(0x888888);
    g.fillCircle(40, 40, 36);
    g.fillStyle(0x666666);
    g.fillCircle(40, 40, 30);
    g.fillStyle(0x5588aa);
    g.fillCircle(40, 40, 24);
    g.fillStyle(0x777777);
    g.fillCircle(40, 40, 10);
    g.fillStyle(0x666666);
    g.fillRect(38, 25, 5, 15);
    g.fillStyle(0x88ccff);
    g.setAlpha(0.7);
    g.fillCircle(40, 20, 5);
    g.fillCircle(34, 24, 4);
    g.fillCircle(46, 24, 4);
    g.setAlpha(1);
    g.generateTexture("fountain", 80, 80);

    // Arrêt de bus
    g.clear();
    g.fillStyle(0x3a3a3a);
    g.fillRect(5, 35, 5, 60);
    g.fillRect(40, 35, 5, 60);
    g.fillStyle(0x2a5a8a);
    g.fillRect(0, 28, 50, 10);
    g.fillStyle(0x4a4a4a);
    g.fillRect(8, 40, 34, 18);
    g.fillStyle(0x2a5a8a);
    g.fillRect(10, 42, 30, 14);
    g.generateTexture("bus_stop", 50, 95);
  }

  // ==================== OBJETS DU JEU ====================
  private generateGameObjects(g: Phaser.GameObjects.Graphics): void {
    // Ordinateur obsolète
    g.clear();
    g.fillStyle(0xc4b494);
    g.fillRoundedRect(8, 3, 30, 24, 3);
    g.fillStyle(0x1a1a4a);
    g.fillRect(11, 6, 24, 18);
    g.fillStyle(0x0000aa);
    g.fillRect(12, 7, 22, 16);
    g.fillStyle(0xffffff);
    g.fillRect(14, 10, 12, 3);
    g.fillRect(14, 16, 10, 3);
    g.fillStyle(0xc4b494);
    g.fillRect(0, 10, 10, 22);
    g.fillStyle(0xff0000);
    g.fillCircle(5, 16, 3);
    g.lineStyle(3, 0xff0000);
    g.lineBetween(8, 3, 35, 27);
    g.lineBetween(35, 3, 8, 27);
    g.generateTexture("computer_old", 45, 35);

    // Ordinateur reconditionné
    g.clear();
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(5, 0, 35, 24, 3);
    g.fillStyle(0x0a2a0a);
    g.fillRect(8, 3, 29, 18);
    g.fillStyle(0x22c55e);
    g.fillRect(10, 5, 14, 3);
    g.fillRect(10, 10, 22, 3);
    g.fillRect(10, 15, 10, 3);
    g.fillStyle(0x2a2a2a);
    g.fillRect(18, 24, 10, 5);
    g.fillRect(12, 28, 22, 4);
    g.fillStyle(0x22c55e);
    g.fillCircle(38, 28, 6);
    g.lineStyle(2, 0xffffff);
    g.lineBetween(35, 28, 37, 30);
    g.lineBetween(37, 30, 42, 24);
    g.generateTexture("computer_new", 45, 35);

    // Icône interaction
    g.clear();
    g.fillStyle(0xffd700);
    g.beginPath();
    g.moveTo(20, 3);
    g.lineTo(24, 12);
    g.lineTo(34, 14);
    g.lineTo(26, 22);
    g.lineTo(29, 32);
    g.lineTo(20, 26);
    g.lineTo(11, 32);
    g.lineTo(14, 22);
    g.lineTo(6, 14);
    g.lineTo(16, 12);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, 0xffa500);
    g.strokePath();
    g.generateTexture("interact_icon", 40, 35);

    // === LOGO TUX STANDALONE (pour la carte) ===
    g.clear();
    // Ombre
    g.fillStyle(0x000000);
    g.setAlpha(0.2);
    g.fillEllipse(32, 58, 30, 8);
    g.setAlpha(1);
    // Corps
    g.fillStyle(0x000000);
    g.fillEllipse(32, 32, 20, 24);
    // Ventre blanc
    g.fillStyle(0xf0f0f0);
    g.fillEllipse(32, 35, 14, 18);
    // Yeux
    g.fillStyle(0xffffff);
    g.fillCircle(26, 22, 5);
    g.fillCircle(38, 22, 5);
    g.fillStyle(0x000000);
    g.fillCircle(27, 22, 2);
    g.fillCircle(39, 22, 2);
    // Bec
    g.fillStyle(0xffa500);
    g.fillTriangle(32, 27, 26, 33, 38, 33);
    // Pattes
    g.fillStyle(0xffa500);
    g.fillRect(24, 52, 6, 5);
    g.fillRect(40, 52, 6, 5);
    g.generateTexture("tux_mascot", 64, 60);

    // === TÉLÉPHONE NOKIA 3310 ===
    g.clear();
    // Ombre
    g.fillStyle(0x000000);
    g.setAlpha(0.2);
    g.fillEllipse(16, 30, 12, 4);
    g.setAlpha(1);
    // Châssis gris
    g.fillStyle(0x3a3a3a);
    g.fillRoundedRect(4, 2, 24, 32, 2);
    // Écran noir
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(6, 5, 20, 18, 1);
    // Écran vert Nokia (avec barre de signal)
    g.fillStyle(0x7cb342);
    g.fillRoundedRect(7, 6, 18, 16, 1);
    // Barre de signal (4 carrés verts)
    g.fillStyle(0x4caf50);
    g.fillRect(24, 12, 1, 2);
    g.fillRect(24, 10, 1, 4);
    g.fillRect(24, 8, 1, 6);
    g.fillRect(24, 6, 1, 8);
    // Boutons numériques
    g.fillStyle(0x2a2a2a);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        g.fillRoundedRect(7 + col * 6, 25 + row * 2.5, 5, 2, 0.5);
      }
    }
    // Bouton central de sélection
    g.fillStyle(0x4caf50);
    g.fillCircle(16, 32, 2);
    g.generateTexture("nokia_phone", 32, 36);
  }

  // ==================== PERSONNAGES ====================
  private generateCharacters(g: Phaser.GameObjects.Graphics): void {
    // Joueur idle
    g.clear();
    g.fillStyle(0x000000);
    g.setAlpha(0.3);
    g.fillEllipse(20, 58, 26, 10);
    g.setAlpha(1);
    g.fillStyle(0x22c55e);
    g.fillRoundedRect(10, 22, 20, 24, 4);
    g.fillStyle(0x166534);
    g.fillRect(14, 28, 12, 8);
    g.fillStyle(0xffdbac);
    g.fillRect(4, 24, 8, 16);
    g.fillRect(28, 24, 8, 16);
    g.fillStyle(0xffdbac);
    g.fillRoundedRect(10, 4, 20, 20, 5);
    g.fillStyle(0x4a3728);
    g.fillRoundedRect(10, 2, 20, 12, 5);
    g.fillRect(10, 10, 20, 5);
    g.fillStyle(0x000000);
    g.fillCircle(15, 14, 2);
    g.fillCircle(25, 14, 2);
    g.fillStyle(0xffffff);
    g.fillCircle(14, 13, 1);
    g.fillCircle(24, 13, 1);
    g.fillStyle(0x3b82f6);
    g.fillRect(11, 44, 8, 15);
    g.fillRect(21, 44, 8, 15);
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(10, 56, 9, 6, 2);
    g.fillRoundedRect(21, 56, 9, 6, 2);
    g.generateTexture("player_idle", 40, 64);

    // Animation marche
    for (let i = 0; i < 4; i++) {
      g.clear();
      const legOffset = Math.sin((i * Math.PI) / 2) * 5;
      const armOffset = Math.sin((i * Math.PI) / 2) * 4;
      const bobOffset = Math.abs(Math.sin((i * Math.PI) / 2)) * 2;

      g.fillStyle(0x000000);
      g.setAlpha(0.3);
      g.fillEllipse(20, 58, 26, 10);
      g.setAlpha(1);
      g.fillStyle(0x22c55e);
      g.fillRoundedRect(10, 22 - bobOffset, 20, 24, 4);
      g.fillStyle(0x166534);
      g.fillRect(14, 28 - bobOffset, 12, 8);
      g.fillStyle(0xffdbac);
      g.fillRect(4, 24 - armOffset - bobOffset, 8, 16);
      g.fillRect(28, 24 + armOffset - bobOffset, 8, 16);
      g.fillStyle(0xffdbac);
      g.fillRoundedRect(10, 4 - bobOffset, 20, 20, 5);
      g.fillStyle(0x4a3728);
      g.fillRoundedRect(10, 2 - bobOffset, 20, 12, 5);
      g.fillRect(10, 10 - bobOffset, 20, 5);
      g.fillStyle(0x000000);
      g.fillCircle(15, 14 - bobOffset, 2);
      g.fillCircle(25, 14 - bobOffset, 2);
      g.fillStyle(0x3b82f6);
      g.fillRect(11, 44 + legOffset, 8, 14 - legOffset);
      g.fillRect(21, 44 - legOffset, 8, 14 + legOffset);
      g.fillStyle(0x1a1a1a);
      g.fillRoundedRect(10, 56 + legOffset, 9, 6, 2);
      g.fillRoundedRect(21, 56 - legOffset, 9, 6, 2);
      g.generateTexture(`player_walk_${i}`, 40, 64);
    }

    // PNJ type 1 - Citoyen (chemise bleue)
    g.clear();
    g.fillStyle(0x000000);
    g.setAlpha(0.3);
    g.fillEllipse(20, 58, 26, 10);
    g.setAlpha(1);
    g.fillStyle(0x3b82f6);
    g.fillRoundedRect(10, 22, 20, 24, 4);
    g.fillStyle(0xffdbac);
    g.fillRect(4, 24, 8, 16);
    g.fillRect(28, 24, 8, 16);
    g.fillStyle(0xffdbac);
    g.fillRoundedRect(10, 4, 20, 20, 5);
    g.fillStyle(0x2a2a2a);
    g.fillRoundedRect(10, 2, 20, 12, 5);
    g.fillRect(10, 10, 20, 5);
    g.fillStyle(0x000000);
    g.fillCircle(15, 14, 2);
    g.fillCircle(25, 14, 2);
    g.fillStyle(0x2a2a2a);
    g.fillRect(11, 44, 8, 15);
    g.fillRect(21, 44, 8, 15);
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(10, 56, 9, 6, 2);
    g.fillRoundedRect(21, 56, 9, 6, 2);
    g.generateTexture("npc_citizen", 40, 64);

    // PNJ type 2 - Femme (robe rose)
    g.clear();
    g.fillStyle(0x000000);
    g.setAlpha(0.3);
    g.fillEllipse(20, 58, 26, 10);
    g.setAlpha(1);
    g.fillStyle(0xec4899);
    g.fillRoundedRect(8, 22, 24, 30, 4);
    g.fillStyle(0xffdbac);
    g.fillRect(2, 24, 8, 14);
    g.fillRect(30, 24, 8, 14);
    g.fillStyle(0xffdbac);
    g.fillRoundedRect(10, 4, 20, 20, 5);
    g.fillStyle(0xf4d03f);
    g.fillRoundedRect(8, 2, 24, 14, 6);
    g.fillStyle(0x000000);
    g.fillCircle(15, 14, 2);
    g.fillCircle(25, 14, 2);
    g.fillStyle(0xffdbac);
    g.fillRect(14, 52, 5, 8);
    g.fillRect(21, 52, 5, 8);
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(13, 57, 6, 5, 2);
    g.fillRoundedRect(20, 57, 6, 5, 2);
    g.generateTexture("npc_woman", 40, 64);

    // PNJ type 3 - Technicien NIRD (combinaison verte)
    g.clear();
    g.fillStyle(0x000000);
    g.setAlpha(0.3);
    g.fillEllipse(20, 58, 26, 10);
    g.setAlpha(1);
    g.fillStyle(0x166534);
    g.fillRoundedRect(10, 22, 20, 36, 4);
    g.fillStyle(0x22c55e);
    g.fillRect(14, 26, 12, 10);
    g.fillStyle(0xffdbac);
    g.fillRect(4, 24, 8, 16);
    g.fillRect(28, 24, 8, 16);
    g.fillStyle(0xffdbac);
    g.fillRoundedRect(10, 4, 20, 20, 5);
    g.fillStyle(0x166534);
    g.fillRoundedRect(10, 2, 20, 8, 5);
    g.fillStyle(0x000000);
    g.fillCircle(15, 14, 2);
    g.fillCircle(25, 14, 2);
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(10, 56, 9, 6, 2);
    g.fillRoundedRect(21, 56, 9, 6, 2);
    g.generateTexture("npc_technician", 40, 64);

    // PNJ marche animations
    for (let type = 0; type < 3; type++) {
      const colors = [
        { body: 0x3b82f6, hair: 0x2a2a2a, pants: 0x2a2a2a, name: "citizen" },
        { body: 0xec4899, hair: 0xf4d03f, pants: 0xec4899, name: "woman" },
        { body: 0x166534, hair: 0x166534, pants: 0x166534, name: "technician" },
      ][type];

      for (let i = 0; i < 4; i++) {
        g.clear();
        const legOffset = Math.sin((i * Math.PI) / 2) * 4;
        const armOffset = Math.sin((i * Math.PI) / 2) * 3;

        g.fillStyle(0x000000);
        g.setAlpha(0.3);
        g.fillEllipse(20, 58, 26, 10);
        g.setAlpha(1);
        g.fillStyle(colors.body);
        g.fillRoundedRect(10, 22, 20, 24, 4);
        g.fillStyle(0xffdbac);
        g.fillRect(4, 24 - armOffset, 8, 16);
        g.fillRect(28, 24 + armOffset, 8, 16);
        g.fillStyle(0xffdbac);
        g.fillRoundedRect(10, 4, 20, 20, 5);
        g.fillStyle(colors.hair);
        g.fillRoundedRect(10, 2, 20, 12, 5);
        g.fillStyle(0x000000);
        g.fillCircle(15, 14, 2);
        g.fillCircle(25, 14, 2);
        g.fillStyle(colors.pants);
        g.fillRect(11, 44 + legOffset, 8, 14 - legOffset);
        g.fillRect(21, 44 - legOffset, 8, 14 + legOffset);
        g.fillStyle(0x1a1a1a);
        g.fillRoundedRect(10, 56 + legOffset, 9, 6, 2);
        g.fillRoundedRect(21, 56 - legOffset, 9, 6, 2);
        g.generateTexture(`npc_${colors.name}_walk_${i}`, 40, 64);
      }
    }
  }
}
