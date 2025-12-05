/**
 * Scène d'interface utilisateur - HUD du jeu
 */
import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  private statsPanel!: Phaser.GameObjects.Container;
  private messageBox!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  private interactHint!: Phaser.GameObjects.Container;

  // Stats affichées
  private collectedText!: Phaser.GameObjects.Text;
  private reconditionedText!: Phaser.GameObjects.Text;
  private distributedText!: Phaser.GameObjects.Text;
  private inventoryText!: Phaser.GameObjects.Text;

  // Référence à MainScene pour nettoyer les listeners
  private mainScene: Phaser.Scene | null = null;

  constructor() {
    super({ key: "UIScene" });
  }

  /**
   * Réinitialise l'état de l'UI lors du restart
   */
  init(): void {
    // Nettoyer les anciens listeners si MainScene existe
    if (this.mainScene) {
      this.mainScene.events.off("updateStats");
      this.mainScene.events.off("showMessage");
      this.mainScene.events.off("nearBuilding");
      this.mainScene.events.off("victory");
    }
    this.mainScene = null;
  }

  create(): void {
    this.createStatsPanel();
    this.createMessageBox();
    this.createInteractHint();
    // Le jeu Snake est maintenant géré par React via une modal
    // Les instructions sont maintenant dans le menu pause de React

    // Écouter les événements de la scène principale
    this.mainScene = this.scene.get("MainScene");

    this.mainScene.events.on(
      "updateStats",
      (stats: {
        collected: number;
        reconditioned: number;
        distributed: number;
        inventory: number;
      }) => {
        this.updateStats(stats);
      }
    );
    
    this.mainScene.events.on('victory', () => {
      this.showVictory()
    });
    
    // Écouter l'événement nearBuilding pour afficher/cacher l'indication d'interaction
    this.mainScene.events.on('nearBuilding', (building: { name: string; type: string } | null) => {
      if (building) {
        this.interactHint.setVisible(true);
      } else {
        this.interactHint.setVisible(false);
      }
    });
    
    // Écouter l'événement showMessage pour afficher les messages d'interaction
    this.mainScene.events.on('showMessage', (message: string) => {
      this.showMessage(message);
    });
  }

  private createStatsPanel(): void {
    const panelWidth = 280;
    const panelHeight = 160;

    // Fond du panneau
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.9);
    bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 12);
    bg.lineStyle(2, 0x22c55e, 0.5);
    bg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 12);

    // Titre
    const title = this.add
      .text(panelWidth / 2, 15, "📱 Recondi_Tech.apk", {
        fontSize: "16px",
        color: "#22c55e",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);

    // Stats
    const startY = 45;
    const lineHeight = 28;

    const collectedIcon = this.add.text(15, startY, "💻", { fontSize: "18px" });
    this.collectedText = this.add.text(45, startY, "Collectés: 0", {
      fontSize: "14px",
      color: "#94a3b8",
    });

    const recondIcon = this.add.text(15, startY + lineHeight, "🐧", {
      fontSize: "18px",
    });
    this.reconditionedText = this.add.text(
      45,
      startY + lineHeight,
      "Reconditionnés: 0",
      {
        fontSize: "14px",
        color: "#94a3b8",
      }
    );

    const distIcon = this.add.text(15, startY + lineHeight * 2, "🏫", {
      fontSize: "18px",
    });
    this.distributedText = this.add.text(
      45,
      startY + lineHeight * 2,
      "Distribués: 0 / 8",
      {
        fontSize: "14px",
        color: "#94a3b8",
      }
    );

    const invIcon = this.add.text(15, startY + lineHeight * 3, "🎒", {
      fontSize: "18px",
    });
    this.inventoryText = this.add.text(
      45,
      startY + lineHeight * 3,
      "Inventaire: 0 PC",
      {
        fontSize: "14px",
        color: "#fbbf24",
      }
    );

    this.statsPanel = this.add.container(20, 20, [
      bg,
      title,
      collectedIcon,
      this.collectedText,
      recondIcon,
      this.reconditionedText,
      distIcon,
      this.distributedText,
      invIcon,
      this.inventoryText,
    ]);
  }

  private createMessageBox(): void {
    const width = 600;
    const height = 60;
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height - 100; // Remonté de 50 pixels

    // Fond
    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 0.95);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.lineStyle(2, 0x22c55e, 0.3);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

    // Texte
    this.messageText = this.add
      .text(0, 0, "", {
        fontSize: "16px",
        color: "#e2e8f0",
        align: "center",
        wordWrap: { width: width - 40 },
      })
      .setOrigin(0.5);

    this.messageBox = this.add.container(x, y, [bg, this.messageText]);
    this.messageBox.setVisible(false);
  }

  private createInteractHint(): void {
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height - 170; // Remonté de 50 pixels

    // Fond
    const bg = this.add.graphics();
    bg.fillStyle(0x22c55e, 0.9);
    bg.fillRoundedRect(-100, -18, 200, 36, 18);

    // Texte
    const text = this.add
      .text(0, 0, "[ E ] Interagir", {
        fontSize: "16px",
        color: "#0f172a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.interactHint = this.add.container(x, y, [bg, text]);
    this.interactHint.setVisible(false);

    // Animation
    this.tweens.add({
      targets: this.interactHint,
      y: y - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private showMessage(message: string): void {
    this.messageText.setText(message);
    this.messageBox.setVisible(true);
    
    // Masquer après 3 secondes
    this.time.delayedCall(3000, () => {
      this.messageBox.setVisible(false);
    });
  }

  private updateStats(stats: {
    collected: number;
    reconditioned: number;
    distributed: number;
    inventory: number;
  }): void {
    this.collectedText.setText(`Collectés: ${stats.collected}`);
    this.reconditionedText.setText(`Reconditionnés: ${stats.reconditioned}`);
    this.distributedText.setText(`Distribués: ${stats.distributed} / 8`);
    this.inventoryText.setText(`Inventaire: ${stats.inventory} PC`);

    // Animation de mise à jour
    this.tweens.add({
      targets: this.statsPanel,
      scale: 1.05,
      duration: 100,
      yoyo: true,
    });

    // Couleur de progression
    if (stats.distributed >= 8) {
      this.distributedText.setColor("#22c55e");
    }
  }

  public showVictory(): void {
    console.log("showVictory appelé !");
    
    // Overlay sombre
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x0f172a,
      0.9
    ).setDepth(10000);

    // Texte de victoire - plus haut
    const victoryTitle = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 150,
        "🎉 MISSION ACCOMPLIE ! 🎉",
        {
          fontSize: "48px",
          color: "#22c55e",
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5)
      .setDepth(10001);

    const victoryText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 20,
        [
          "Vous avez redistribué 8 ordinateurs reconditionnés !",
          "",
          "Grâce à vous, des élèves découvrent Linux",
          "et le numérique responsable.",
          "",
          "♻️ Réemploi • 🐧 Open Source • 🌿 NIRD",
        ].join("\n"),
        {
          fontSize: "20px",
          color: "#e2e8f0",
          align: "center",
          lineSpacing: 8,
        }
      )
      .setOrigin(0.5)
      .setDepth(10001);

    // Bouton rejouer - zone interactive plus grande et mieux définie
    const buttonWidth = 160;
    const buttonHeight = 50;
    const buttonX = this.cameras.main.width / 2;
    const buttonY = this.cameras.main.height / 2 + 130;

    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x22c55e, 1);
    buttonBg.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      25
    );

    const buttonText = this.add
      .text(0, 0, "Rejouer", {
        fontSize: "20px",
        color: "#0f172a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const button = this.add.container(buttonX, buttonY, [buttonBg, buttonText]);

    // Zone interactive plus grande
    const hitArea = new Phaser.Geom.Rectangle(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight
    );
    button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    button.setSize(buttonWidth, buttonHeight);

    button.on("pointerover", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x16a34a, 1);
      buttonBg.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        25
      );
      this.input.setDefaultCursor("pointer");
    });

    button.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x22c55e, 1);
      buttonBg.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        25
      );
      this.input.setDefaultCursor("default");
    });

    button.on("pointerdown", () => {
      // Redémarrer le jeu proprement
      this.input.setDefaultCursor("default");
      this.scene.stop("MainScene");
      this.scene.stop("UIScene");
      this.scene.start("BootScene"); // Recommencer depuis le début
    });

    // Animation d'entrée
    const container = this.add.container(0, 0, [
      overlay,
      victoryTitle,
      victoryText,
      button,
    ]);
    container.setAlpha(0);
    container.setDepth(10000);

    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 500,
    });

    // Particules de célébration
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Math.random() * this.cameras.main.width,
        -20,
        5 + Math.random() * 10,
        [0x22c55e, 0x06b6d4, 0xf59e0b, 0xec4899][Math.floor(Math.random() * 4)]
      ).setDepth(10002);

      this.tweens.add({
        targets: particle,
        y: this.cameras.main.height + 20,
        x: particle.x + (Math.random() - 0.5) * 200,
        rotation: Math.random() * 10,
        duration: 2000 + Math.random() * 2000,
        delay: Math.random() * 1000,
        repeat: -1,
      });
    }
  }
}
