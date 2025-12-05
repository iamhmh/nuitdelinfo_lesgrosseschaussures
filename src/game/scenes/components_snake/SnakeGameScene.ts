/**
 * Scène du jeu Snake sur Nokia 3310 (Pixel Art)
 */
import Phaser from "phaser";
import { SnakeGame } from "./SnakeGame";

export class SnakeGameScene extends Phaser.Scene {
  private backButton!: Phaser.GameObjects.Container;
  private snakeGame: SnakeGame | null = null;
  private gameStarted: boolean = false;
  private screenX: number = 0;
  private screenY: number = 0;
  private screenWidth: number = 0;
  private screenHeight: number = 0;
  private menuContainer!: Phaser.GameObjects.Container;
  private screenGraphics!: Phaser.GameObjects.Graphics;
  private gameOverContainer!: Phaser.GameObjects.Container | null;

  constructor() {
    super({ key: "SnakeGameScene" });
  }

  create(): void {
    console.log("SnakeGameScene.create() called");
    this.gameStarted = false;
    this.snakeGame = null;
    this.gameOverContainer = null;

    const centerX = this.cameras.main.width / 2;

    // Créer le Nokia 3310 en pixel art
    const phoneData = this.createNokia3310(centerX);
    this.screenX = phoneData.screenX;
    this.screenY = phoneData.screenY;
    this.screenWidth = phoneData.screenWidth;
    this.screenHeight = phoneData.screenHeight;

    // Afficher le menu d'accueil du téléphone
    this.showPhoneMenu();

    // Écouter la touche Escape pour revenir
    this.input.keyboard?.on("keydown-ESC", () => {
      this.stopGame();
    });

    // Écouter la touche Entrée ou Espace pour démarrer ou rejouer
    this.input.keyboard?.on("keydown-ENTER", () => {
      if (!this.gameStarted) {
        this.startSnakeGame();
      } else if (this.gameOverContainer) {
        // Si game over affiché, rejouer
        this.restartGame();
      }
    });
    this.input.keyboard?.on("keydown-SPACE", () => {
      if (!this.gameStarted) {
        this.startSnakeGame();
      } else if (this.gameOverContainer) {
        // Si game over affiché, rejouer
        this.restartGame();
      }
    });
  }

  /**
   * Affiche le menu d'accueil du Nokia
   */
  private showPhoneMenu(): void {
    this.menuContainer = this.add.container(0, 0);

    // Fond vert de l'écran (déjà dessiné, on ajoute le contenu par-dessus)
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x9bbc0f);
    menuBg.fillRect(this.screenX, this.screenY, this.screenWidth, this.screenHeight);
    this.menuContainer.add(menuBg);

    // Effet grille LCD
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x8bac00, 0.2);
    for (let y = this.screenY; y < this.screenY + this.screenHeight; y += 4) {
      gridGraphics.lineBetween(this.screenX, y, this.screenX + this.screenWidth, y);
    }
    this.menuContainer.add(gridGraphics);

    // Titre Snake (très grand)
    const title = this.add.text(
      this.screenX + this.screenWidth / 2,
      this.screenY + 120,
      "🐍 SNAKE",
      {
        fontSize: "72px",
        color: "#306230",
        fontStyle: "bold",
        fontFamily: "monospace",
      }
    ).setOrigin(0.5);
    this.menuContainer.add(title);

    // Dessin d'un serpent décoratif (plus grand)
    const snakeDecor = this.add.graphics();
    snakeDecor.fillStyle(0x306230);
    const snakeY = this.screenY + 220;
    const snakeStartX = this.screenX + this.screenWidth / 2 - 120;
    for (let i = 0; i < 10; i++) {
      snakeDecor.fillRect(snakeStartX + i * 28, snakeY + (i % 2) * 10, 24, 24);
    }
    this.menuContainer.add(snakeDecor);

    // Instructions (plus grand)
    const pressStart = this.add.text(
      this.screenX + this.screenWidth / 2,
      this.screenY + this.screenHeight - 150,
      "Appuyez sur ENTRÉE pour jouer",
      {
        fontSize: "32px",
        color: "#306230",
        fontFamily: "monospace",
      }
    ).setOrigin(0.5);
    this.menuContainer.add(pressStart);

    // Animation clignotante pour "Appuyez sur ENTRÉE"
    this.tweens.add({
      targets: pressStart,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Contrôles
    const controls = this.add.text(
      this.screenX + this.screenWidth / 2,
      this.screenY + this.screenHeight - 80,
      "↑ ↓ ← → pour diriger le serpent",
      {
        fontSize: "24px",
        color: "#4a7a4a",
        fontFamily: "monospace",
      }
    ).setOrigin(0.5);
    this.menuContainer.add(controls);

    // Rendre l'écran cliquable pour démarrer
    const clickZone = this.add.rectangle(
      this.screenX + this.screenWidth / 2,
      this.screenY + this.screenHeight / 2,
      this.screenWidth,
      this.screenHeight,
      0x000000,
      0
    ).setInteractive({ useHandCursor: true });

    clickZone.on("pointerdown", () => {
      if (!this.gameStarted) {
        this.startSnakeGame();
      }
    });

    this.menuContainer.add(clickZone);
  }

  /**
   * Démarre le jeu Snake
   */
  private startSnakeGame(): void {
    if (this.gameStarted) return;
    this.gameStarted = true;

    // Supprimer le menu
    this.menuContainer.destroy();

    // Créer le fond de l'écran pour le jeu
    this.screenGraphics = this.add.graphics();
    this.screenGraphics.fillStyle(0x9bbc0f);
    this.screenGraphics.fillRect(this.screenX, this.screenY, this.screenWidth, this.screenHeight);

    // Initialiser le jeu Snake avec callback de game over
    this.snakeGame = new SnakeGame(
      this,
      this.screenX,
      this.screenY,
      this.screenWidth,
      this.screenHeight,
      (score: number) => this.showGameOver(score)
    );

    console.log("SnakeGame started!");
  }

  /**
   * Affiche l'écran de Game Over avec option de rejouer
   */
  private showGameOver(score: number): void {
    // Supprimer le game over précédent s'il existe
    if (this.gameOverContainer) {
      this.gameOverContainer.destroy();
    }

    this.gameOverContainer = this.add.container(0, 0);

    // Fond semi-transparent sur l'écran
    const overlay = this.add.graphics();
    overlay.fillStyle(0x9bbc0f, 0.95);
    overlay.fillRect(this.screenX, this.screenY, this.screenWidth, this.screenHeight);
    this.gameOverContainer.add(overlay);

    // Effet grille LCD
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x8bac00, 0.2);
    for (let y = this.screenY; y < this.screenY + this.screenHeight; y += 4) {
      gridGraphics.lineBetween(this.screenX, y, this.screenX + this.screenWidth, y);
    }
    this.gameOverContainer.add(gridGraphics);

    // Texte GAME OVER (très grand)
    const gameOverText = this.add.text(
      this.screenX + this.screenWidth / 2,
      this.screenY + 150,
      "GAME OVER",
      {
        fontSize: "80px",
        color: "#306230",
        fontStyle: "bold",
        fontFamily: "monospace",
      }
    ).setOrigin(0.5);
    this.gameOverContainer.add(gameOverText);

    // Score (grand)
    const scoreText = this.add.text(
      this.screenX + this.screenWidth / 2,
      this.screenY + 260,
      `Score: ${score.toString().padStart(4, "0")}`,
      {
        fontSize: "48px",
        color: "#306230",
        fontFamily: "monospace",
      }
    ).setOrigin(0.5);
    this.gameOverContainer.add(scoreText);

    // Dessin d'un serpent mort (plus grand)
    const deadSnake = this.add.graphics();
    deadSnake.fillStyle(0x306230);
    const snakeY = this.screenY + 340;
    const snakeStartX = this.screenX + this.screenWidth / 2 - 140;
    for (let i = 0; i < 10; i++) {
      deadSnake.fillRect(snakeStartX + i * 32, snakeY, 28, 28);
    }
    this.gameOverContainer.add(deadSnake);

    // Bouton REJOUER (plus grand)
    const replayBg = this.add.graphics();
    replayBg.fillStyle(0x306230);
    replayBg.fillRoundedRect(
      this.screenX + this.screenWidth / 2 - 150,
      this.screenY + this.screenHeight - 200,
      300,
      80,
      15
    );
    this.gameOverContainer.add(replayBg);

    const replayText = this.add.text(
      this.screenX + this.screenWidth / 2,
      this.screenY + this.screenHeight - 160,
      "🔄 REJOUER",
      {
        fontSize: "36px",
        color: "#9bbc0f",
        fontStyle: "bold",
        fontFamily: "monospace",
      }
    ).setOrigin(0.5);
    this.gameOverContainer.add(replayText);

    // Zone cliquable pour rejouer
    const replayZone = this.add.rectangle(
      this.screenX + this.screenWidth / 2,
      this.screenY + this.screenHeight - 160,
      300,
      80,
      0x000000,
      0
    ).setInteractive({ useHandCursor: true });

    replayZone.on("pointerdown", () => {
      this.restartGame();
    });

    replayZone.on("pointerover", () => {
      replayBg.clear();
      replayBg.fillStyle(0x4a8a4a);
      replayBg.fillRoundedRect(
        this.screenX + this.screenWidth / 2 - 150,
        this.screenY + this.screenHeight - 200,
        300,
        80,
        15
      );
    });

    replayZone.on("pointerout", () => {
      replayBg.clear();
      replayBg.fillStyle(0x306230);
      replayBg.fillRoundedRect(
        this.screenX + this.screenWidth / 2 - 150,
        this.screenY + this.screenHeight - 200,
        300,
        80,
        15
      );
    });

    this.gameOverContainer.add(replayZone);

    // Instructions pour rejouer
    const instructions = this.add.text(
      this.screenX + this.screenWidth / 2,
      this.screenY + this.screenHeight - 80,
      "ou appuyez sur ENTRÉE",
      {
        fontSize: "24px",
        color: "#4a7a4a",
        fontFamily: "monospace",
      }
    ).setOrigin(0.5);
    this.gameOverContainer.add(instructions);

    // Animation clignotante
    this.tweens.add({
      targets: instructions,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Redémarre le jeu Snake
   */
  private restartGame(): void {
    // Nettoyer le game over
    if (this.gameOverContainer) {
      this.gameOverContainer.destroy();
      this.gameOverContainer = null;
    }

    // Nettoyer le jeu précédent
    if (this.snakeGame) {
      this.snakeGame.destroy();
      this.snakeGame = null;
    }

    // Nettoyer les graphiques de l'écran
    if (this.screenGraphics) {
      this.screenGraphics.destroy();
    }

    this.gameStarted = false;

    // Redémarrer le jeu
    this.startSnakeGame();
  }

  /**
   * Crée un Nokia 3310 en pixel art et retourne les coordonnées de l'écran
   */
  private createNokia3310(centerX: number): {
    screenX: number;
    screenY: number;
    screenWidth: number;
    screenHeight: number;
  } {
    const g = this.add.graphics();
    
    // Dimensions du téléphone (ÉCRAN GÉANT - bas masqué)
    const phoneWidth = 900;
    const phoneHeight = 900; // Dépasse l'écran en bas
    const phoneX = centerX - phoneWidth / 2;
    const phoneY = 150; // Commence plus haut pour cacher le bas
    
    // === CORPS PRINCIPAL DU TÉLÉPHONE ===
    // Fond du téléphone (bleu Nokia classique)
    g.fillStyle(0x1e3a5f);
    g.fillRoundedRect(phoneX, phoneY, phoneWidth, phoneHeight, 40);
    
    // Bordure extérieure
    g.lineStyle(6, 0x0f2847);
    g.strokeRoundedRect(phoneX, phoneY, phoneWidth, phoneHeight, 40);
    
    // === PARTIE HAUTE (haut-parleur) ===
    // Grille du haut-parleur
    g.fillStyle(0x0a1929);
    for (let i = 0; i < 20; i++) {
      g.fillRect(phoneX + 400 + i * 20, phoneY + 30, 12, 5);
      g.fillRect(phoneX + 400 + i * 20, phoneY + 42, 12, 5);
    }
    
    // === ÉCRAN LCD (GÉANT) ===
    const screenMargin = 60;
    const screenWidth = phoneWidth - screenMargin * 2;
    const screenHeight = 620; // Écran très grand
    const screenX = phoneX + screenMargin;
    const screenY = phoneY + 70;
    
    // Cadre de l'écran (gris foncé)
    g.fillStyle(0x2a2a2a);
    g.fillRoundedRect(screenX - 10, screenY - 10, screenWidth + 20, screenHeight + 20, 10);
    
    // Écran LCD (vert Nokia classique)
    g.fillStyle(0x9bbc0f);
    g.fillRect(screenX, screenY, screenWidth, screenHeight);
    
    // Effet de grille LCD (lignes horizontales subtiles)
    g.lineStyle(1, 0x8bac00, 0.2);
    for (let y = screenY; y < screenY + screenHeight; y += 4) {
      g.lineBetween(screenX, y, screenX + screenWidth, y);
    }
    
    // Reflet sur l'écran (coin supérieur gauche)
    g.fillStyle(0xc5d88a, 0.3);
    g.fillRect(screenX + 5, screenY + 5, 80, 15);
    
    // === TEXTE NOKIA (sous l'écran, sera partiellement visible) ===
    this.add.text(centerX, screenY + screenHeight + 35, "NOKIA", {
      fontSize: "36px",
      color: "#8ba8c4",
      fontStyle: "bold",
      fontFamily: "Arial",
    }).setOrigin(0.5);
    
    // === ANTENNE (haut du téléphone) ===
    g.fillStyle(0x1a3a5a);
    g.fillRoundedRect(phoneX + phoneWidth - 100, phoneY - 50, 35, 65, 8);
    g.fillStyle(0x152d4a);
    g.fillRoundedRect(phoneX + phoneWidth - 95, phoneY - 45, 25, 55, 6);
    return {
      screenX: screenX,
      screenY: screenY,
      screenWidth: screenWidth,
      screenHeight: screenHeight,
    };
  }

  update(time: number, delta: number): void {
    // Mettre à jour la logique du jeu Snake seulement si le jeu a démarré
    if (this.snakeGame && this.gameStarted) {
      this.snakeGame.update(time, delta);
    }
  }

  private stopGame(): void {
    console.log("Stopping SnakeGameScene");
    this.scene.stop("SnakeGameScene");
  }
}
