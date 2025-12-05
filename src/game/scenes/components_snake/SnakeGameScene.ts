/**
 * Scène du jeu Snake sur Nokia 3310
 */
import Phaser from "phaser";
import { SnakeGame } from "./SnakeGame";

export class SnakeGameScene extends Phaser.Scene {
  private phone!: Phaser.GameObjects.Image;
  private backButton!: Phaser.GameObjects.Container;
  private snakeGame!: SnakeGame;

  constructor() {
    super({ key: "SnakeGameScene" });
  }

  preload(): void {
    // Charger l'image du Nokia 3310
    this.load.image("nokia3310", "/src/assets/snake_3310.webp");
  }

  create(): void {
    console.log("SnakeGameScene.create() called");

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Afficher l'image du téléphone Nokia 3310 - redimensionnée pour l'écran
    this.phone = this.add.image(centerX, centerY, "nokia3310");
    this.phone.setOrigin(0.5);

    console.log(
      "Phone image loaded, size:",
      this.phone.width,
      "x",
      this.phone.height
    );

    // Dimensionner pour que l'image tienne complètement à l'écran (80% de la hauteur)
    const maxHeight = this.cameras.main.height * 0.85;
    this.phone.setDisplaySize(
      (this.phone.width / this.phone.height) * maxHeight,
      maxHeight
    );

    console.log(
      "Phone display size:",
      this.phone.displayWidth,
      "x",
      this.phone.displayHeight
    );

    // Calculer les dimensions du Nokia
    const phoneDisplayHeight = this.phone.displayHeight;
    const phoneDisplayWidth = this.phone.displayWidth;

    // Calculer la position et taille de la partie verte (écran) du Nokia
    // Mesurements de l'image Nokia 3310 réelle:
    // - L'écran vert occupe environ 55% de la hauteur et 70% de la largeur
    // - Positionné à environ 15% du haut et 15% de la gauche
    const greenScreenX = centerX - phoneDisplayWidth * 0.35;
    const greenScreenY = centerY - phoneDisplayHeight * 0.15;
    const greenScreenWidth = phoneDisplayWidth * 0.7;
    const greenScreenHeight = phoneDisplayHeight * 0.55;

    console.log("Green screen area:", {
      x: greenScreenX,
      y: greenScreenY,
      width: greenScreenWidth,
      height: greenScreenHeight,
    });

    // Ajouter un fond noir pour recouvrir complètement la partie verte
    const screenBg = this.add.graphics();
    screenBg.fillStyle(0x000000, 1);
    screenBg.fillRect(
      greenScreenX,
      greenScreenY,
      greenScreenWidth,
      greenScreenHeight
    );

    // Initialiser le jeu Snake avec dimensions exactes de l'écran vert
    // On utilise les dimensions complètes sans marge pour remplir tout l'écran
    this.snakeGame = new SnakeGame(
      this,
      greenScreenX,
      greenScreenY,
      greenScreenWidth,
      greenScreenHeight
    );

    console.log("SnakeGame initialized");

    // Bouton retour en bas (outside phone)
    this.createBackButton();

    // Écouter la touche Escape pour revenir
    this.input.keyboard?.on("keydown-ESC", () => {
      this.stopGame();
    });
  }

  update(time: number, delta: number): void {
    // Mettre à jour la logique du jeu Snake
    if (this.snakeGame) {
      this.snakeGame.update(time, delta);
    }
  }

  private createBackButton(): void {
    const backX = this.cameras.main.width / 2;
    const backY = this.cameras.main.height - 50;

    const bg = this.add.graphics();
    bg.fillStyle(0x22c55e, 1);
    bg.fillRoundedRect(-50, -18, 100, 36, 8);

    const text = this.add
      .text(0, 0, "[ ESC ] Retour", {
        fontSize: "14px",
        color: "#0f172a",
        fontStyle: "bold",
        fontFamily: "monospace",
      })
      .setOrigin(0.5);

    this.backButton = this.add.container(backX, backY, [bg, text]);
    this.backButton.setInteractive(
      new Phaser.Geom.Rectangle(-50, -18, 100, 36),
      Phaser.Geom.Rectangle.Contains
    );

    this.backButton.on("pointerdown", () => {
      this.stopGame();
    });

    this.backButton.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(0x16a34a, 1);
      bg.fillRoundedRect(-50, -18, 100, 36, 8);
      this.input.setDefaultCursor("pointer");
    });

    this.backButton.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(0x22c55e, 1);
      bg.fillRoundedRect(-50, -18, 100, 36, 8);
      this.input.setDefaultCursor("default");
    });
  }

  private stopGame(): void {
    console.log("Stopping SnakeGameScene");
    this.scene.stop("SnakeGameScene");
  }
}
