/**
 * Logique du jeu Snake
 */
import Phaser from "phaser";

interface SnakeSegment {
  x: number;
  y: number;
}

export class SnakeGame {
  private scene: Phaser.Scene;
  private gameWidth: number;
  private gameHeight: number;
  private gameX: number;
  private gameY: number;
  private cellSize: number = 20;

  // État du jeu
  private snake: SnakeSegment[] = [];
  private food: SnakeSegment | null = null;
  private direction: { x: number; y: number } = { x: 1, y: 0 };
  private nextDirection: { x: number; y: number } = { x: 1, y: 0 };
  private score: number = 0;
  private gameRunning: boolean = true;
  private onGameOver: ((score: number) => void) | null = null;

  // Graphics et affichage
  private gameContainer!: Phaser.GameObjects.Container;
  private snakeGraphics!: Phaser.GameObjects.Graphics;
  private foodGraphics!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;

  // Timer pour le mouvement
  private moveTimer: number = 0;
  private moveInterval: number = 100; // ms

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    onGameOver?: (score: number) => void
  ) {
    this.scene = scene;
    this.gameWidth = width;
    this.gameHeight = height;
    this.gameX = x;
    this.gameY = y;
    this.onGameOver = onGameOver || null;

    this.gameContainer = scene.add.container(x, y);

    // Créer les graphics pour le rendu (en utilisant les coordonnées du container)
    this.snakeGraphics = scene.add.graphics();
    this.foodGraphics = scene.add.graphics();

    // Score text (affiche juste le nombre avec zéros) - plus grand
    this.scoreText = scene.add.text(x + 15, y + 15, "0000", {
      fontSize: "32px",
      color: "#306230",
      fontFamily: "monospace",
      fontStyle: "bold",
    });

    // Initialiser le jeu
    this.initializeGame();

    // Dessiner l'état initial
    this.draw();

    // Écouter les contrôles clavier
    this.setupControls();
  }

  private initializeGame(): void {
    // Créer le serpent initial (3 segments)
    const startX = Math.floor(this.gameWidth / this.cellSize / 2);
    const startY = Math.floor(this.gameHeight / this.cellSize / 2);

    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];

    // Créer la première nourriture
    this.spawnFood();

    this.score = 0;
    this.gameRunning = true;
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
  }

  private spawnFood(): void {
    let foodX: number;
    let foodY: number;
    let validPosition: boolean;

    do {
      foodX = Math.floor(Math.random() * (this.gameWidth / this.cellSize));
      foodY = Math.floor(Math.random() * (this.gameHeight / this.cellSize));

      // Vérifier que la nourriture ne se spawn pas sur le serpent
      validPosition = !this.snake.some(
        (segment) => segment.x === foodX && segment.y === foodY
      );
    } while (!validPosition);

    this.food = { x: foodX, y: foodY };
  }

  private setupControls(): void {
    // Écouter les événements clavier directement
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      if (!this.gameRunning) return;

      const key = event.key.toLowerCase();

      // Empêcher le changement de direction vers la direction opposée
      if (key === "arrowup" || key === "w") {
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: -1 };
          event.preventDefault();
        }
      } else if (key === "arrowdown" || key === "s") {
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: 1 };
          event.preventDefault();
        }
      } else if (key === "arrowleft" || key === "a") {
        if (this.direction.x === 0) {
          this.nextDirection = { x: -1, y: 0 };
          event.preventDefault();
        }
      } else if (key === "arrowright" || key === "d") {
        if (this.direction.x === 0) {
          this.nextDirection = { x: 1, y: 0 };
          event.preventDefault();
        }
      }
    });
  }

  update(_time: number, delta: number): void {
    if (!this.gameRunning) return;

    this.moveTimer += delta;

    if (this.moveTimer >= this.moveInterval) {
      this.moveTimer = 0;

      // Appliquer la direction suivante
      this.direction = this.nextDirection;

      // Calculer la nouvelle tête
      const head = this.snake[0];
      const newHead = {
        x: head.x + this.direction.x,
        y: head.y + this.direction.y,
      };

      // Vérifier les collisions avec les murs
      if (
        newHead.x < 0 ||
        newHead.x >= this.gameWidth / this.cellSize ||
        newHead.y < 0 ||
        newHead.y >= this.gameHeight / this.cellSize
      ) {
        this.endGame();
        return;
      }

      // Vérifier les collisions avec le serpent
      if (
        this.snake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        this.endGame();
        return;
      }

      // Ajouter la nouvelle tête
      this.snake.unshift(newHead);

      // Vérifier si on a mangé la nourriture
      if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
        this.score += 1;
        this.scoreText.setText(this.score.toString().padStart(4, "0"));
        this.spawnFood();
      } else {
        // Retirer la queue si on n'a pas mangé
        this.snake.pop();
      }

      // Redessiner
      this.draw();
    }
  }

  private draw(): void {
    // Effacer les anciens graphics
    this.snakeGraphics.clear();
    this.foodGraphics.clear();

    // Dessiner le serpent
    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];
      const x = this.gameX + segment.x * this.cellSize;
      const y = this.gameY + segment.y * this.cellSize;

      // Tête plus claire
      if (i === 0) {
        this.snakeGraphics.fillStyle(0x86efac, 1);
      } else {
        this.snakeGraphics.fillStyle(0x22c55e, 1);
      }

      this.snakeGraphics.fillRect(
        x + 1,
        y + 1,
        this.cellSize - 2,
        this.cellSize - 2
      );
    }

    // Dessiner la nourriture (pomme rouge foncé pour meilleure visibilité)
    if (this.food) {
      this.foodGraphics.fillStyle(0xdc2626, 1); // Rouge foncé
      const fx = this.gameX + this.food.x * this.cellSize;
      const fy = this.gameY + this.food.y * this.cellSize;
      this.foodGraphics.fillCircle(
        fx + this.cellSize / 2,
        fy + this.cellSize / 2,
        this.cellSize / 2 - 1
      );
      // Ajouter un petit reflet pour un effet pomme
      this.foodGraphics.fillStyle(0x7f1d1d, 1); // Rouge encore plus foncé pour le contour
      this.foodGraphics.fillCircle(
        fx + this.cellSize / 2,
        fy + this.cellSize / 2,
        this.cellSize / 2 - 3
      );
      this.foodGraphics.fillStyle(0xdc2626, 1);
      this.foodGraphics.fillCircle(
        fx + this.cellSize / 2 - 2,
        fy + this.cellSize / 2 - 2,
        this.cellSize / 2 - 5
      );
    }
  }

  private endGame(): void {
    this.gameRunning = false;
    if (this.onGameOver) {
      this.onGameOver(this.score);
    }
  }

  reset(): void {
    this.initializeGame();
    this.draw();
  }

  getScore(): number {
    return this.score;
  }

  destroy(): void {
    this.snakeGraphics.destroy();
    this.foodGraphics.destroy();
    this.scoreText.destroy();
    this.gameContainer.destroy();
  }

  isRunning(): boolean {
    return this.gameRunning;
  }

  getGameContainer(): Phaser.GameObjects.Container {
    return this.gameContainer;
  }
}
