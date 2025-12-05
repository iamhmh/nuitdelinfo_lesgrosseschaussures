import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.ts";
import { MainScene } from "./scenes/MainScene.ts";
import { UIScene } from "./scenes/UIScene.ts";

export const createPhaserConfig = (
  parent: HTMLElement
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.WEBGL,
  parent: parent,
  width: 1280,
  height: 720,
  backgroundColor: "#4a7c59",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MainScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
});
