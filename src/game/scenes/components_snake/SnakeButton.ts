import Phaser from "phaser";

export class SnakeButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, onClick: () => void) {
    super(scene, x, y);
    scene.add.existing(this);

    // Bouton visuel
    const buttonBg = scene.add.graphics();
    buttonBg.fillStyle(0x0ea5e9, 1);
    buttonBg.fillRoundedRect(-40, -20, 80, 40, 20);

    const buttonText = scene.add
      .text(0, 0, "Snake", {
        fontSize: "18px",
        color: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add([buttonBg, buttonText]);
    this.setSize(80, 40);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-40, -20, 80, 40),
      Phaser.Geom.Rectangle.Contains
    );

    this.on("pointerover", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x38bdf8, 1);
      buttonBg.fillRoundedRect(-40, -20, 80, 40, 20);
      scene.input.setDefaultCursor("pointer");
    });
    this.on("pointerout", () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x0ea5e9, 1);
      buttonBg.fillRoundedRect(-40, -20, 80, 40, 20);
      scene.input.setDefaultCursor("default");
    });
    this.on("pointerdown", () => {
      scene.input.setDefaultCursor("default");
      onClick();
    });
  }
}
