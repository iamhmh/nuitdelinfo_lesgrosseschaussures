/**
 * MainScene - Ville procédurale avec layout cohérent
 */
import Phaser from "phaser";

interface Building {
  x: number;
  y: number;
  type:
    | "enterprise"
    | "workshop"
    | "school"
    | "university"
    | "house"
    | "shop"
    | "apartment"
    | "office";
  name: string;
  sprite?: Phaser.GameObjects.Image;
}

interface CollectibleComputer {
  x: number;
  y: number;
  collected: boolean;
  sprite?: Phaser.GameObjects.Image;
  interactIcon?: Phaser.GameObjects.Image;
}

interface SpecialObject {
  x: number;
  y: number;
  type: "tux";
  sprite?: Phaser.GameObjects.Image;
  interactIcon?: Phaser.GameObjects.Image;
  interacted: boolean;
  phoneFound: boolean; // Tux a retrouvé son téléphone
  phone?: {
    sprite?: Phaser.GameObjects.Image;
    interactIcon?: Phaser.GameObjects.Image;
  };
}

// Compteur de PC distribués par école
interface SchoolDelivery {
  buildingName: string;
  count: number;
  maxCount: number;
}

interface NPC {
  sprite: Phaser.GameObjects.Sprite;
  type: "citizen" | "woman" | "technician";
  isMoving: boolean;
  targetX?: number;
  targetY?: number;
  speed: number;
  direction: "left" | "right";
}

interface Car {
  sprite: Phaser.GameObjects.Image;
  direction: "h" | "v";
  speed: number;
  baseSpeed: number; // Vitesse de base (avant arrêt au feu)
  lane: number;
  roadIndex: number; // Index de la route sur laquelle se trouve la voiture
}

// Feu tricolore à une intersection
interface TrafficLight {
  x: number;
  y: number;
  roadX: number; // Colonne de la route V
  roadY: number; // Ligne de la route H
  spriteH: Phaser.GameObjects.Image; // Feu pour la route H
  spriteV: Phaser.GameObjects.Image; // Feu pour la route V
}

// État global des feux (synchronisés)
type TrafficPhase = "h_green" | "h_yellow" | "v_green" | "v_yellow";

// Dimensions des bâtiments (en pixels) - correspondent aux textures générées dans BootScene
interface BuildingSize {
  width: number;
  height: number;
}

// Tailles en tiles (1 tile = 64 pixels)
const TILE_SIZE = 64;
const BUILDING_SIZES: Record<string, BuildingSize> = {
  enterprise: { width: 4 * TILE_SIZE, height: 6 * TILE_SIZE }, // 4x6 tiles = 256x384
  school: { width: 3 * TILE_SIZE, height: 3 * TILE_SIZE }, // 3x3 tiles = 192x192
  university: { width: 4 * TILE_SIZE, height: 4 * TILE_SIZE }, // 4x4 tiles = 256x256
  workshop: { width: 3 * TILE_SIZE, height: 3 * TILE_SIZE }, // 3x3 tiles = 192x192
  house: { width: 2 * TILE_SIZE, height: 2 * TILE_SIZE }, // 2x2 tiles = 128x128
  apartment: { width: 3 * TILE_SIZE, height: 3 * TILE_SIZE }, // 3x3 tiles = 192x192
  shop: { width: 2 * TILE_SIZE, height: 2 * TILE_SIZE }, // 2x2 tiles = 128x128
  office: { width: 3 * TILE_SIZE, height: 4 * TILE_SIZE }, // 3x4 tiles = 192x256
};

// Zone occupée par un bâtiment (pour éviter superpositions)
interface OccupiedZone {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private playerSpeed: number = 280;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private interactKey!: Phaser.Input.Keyboard.Key;

  // Map dimensions - Carte agrandie pour plus d'espace
  // 60 tiles x 45 tiles = 3840 x 2880 pixels
  private mapWidth: number = 3840;
  private mapHeight: number = 2880;
  private tileSize: number = 64;

  // Layout de la ville (en tiles)
  // Moins de routes pour plus d'espace constructible
  // Routes horizontales: y = 15, 30 (2 routes au lieu de 3)
  // Routes verticales: x = 20, 40 (2 routes au lieu de 3)
  private roadTilesH = [15, 30]; // Lignes de routes horizontales
  private roadTilesV = [20, 40]; // Colonnes de routes verticales

  private buildings: Building[] = [];
  private occupiedZones: OccupiedZone[] = []; // Zones occupées par les bâtiments
  private computers: CollectibleComputer[] = [];
  private specialObjects: SpecialObject[] = []; // Objets spéciaux comme Tux
  private cars: Car[] = [];
  private npcs: NPC[] = [];

  // Groupes de collision
  private buildingColliders: Phaser.Physics.Arcade.StaticGroup | null = null;
  private treeColliders: Phaser.Physics.Arcade.StaticGroup | null = null;

  // Système de feux de circulation
  private trafficLights: TrafficLight[] = []
  private trafficPhase: TrafficPhase = 'h_green'
  private trafficTimer: number = 0
  private readonly TRAFFIC_GREEN_DURATION = 5000 // 5 secondes de vert
  private readonly TRAFFIC_YELLOW_DURATION = 1500 // 1.5 secondes d'orange
  
  private collectedCount: number = 0
  private reconditionedCount: number = 0
  private distributedCount: number = 0
  private inventory: number = 0
  private nearBuilding: Building | null = null
  private nearComputer: CollectibleComputer | null = null
  private nearTechnician: NPC | null = null // NPC technicien à proximité
  private nearSpecialObject: SpecialObject | null = null // Objet spécial à proximité (Tux, téléphone...)
  
  // Suivi des PC distribués par école (max 2 par école)
  private schoolDeliveries: Map<string, SchoolDelivery> = new Map();

  // Sprite du PC porté par le joueur (bras droit)
  private carriedPCSprite: Phaser.GameObjects.Image | null = null;
  // Sprite du 2e PC porté par le joueur (bras gauche)
  private carriedPCSprite2: Phaser.GameObjects.Image | null = null;
  // Sprite du téléphone porté par le joueur
  private carriedPhoneSprite: Phaser.GameObjects.Image | null = null;
  // Flag pour savoir si le joueur porte un téléphone
  private isCarryingPhone: boolean = false;

  // État de l'atelier intérieur
  private isInsideWorkshop: boolean = false;

  // Debug
  private debugText!: Phaser.GameObjects.Text;
  private debugGridContainer!: Phaser.GameObjects.Container;
  private debugGridVisible: boolean = true;
  private toggleGridKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "MainScene" });
  }

  /**
   * Réinitialise complètement l'état du jeu
   * Appelé automatiquement par Phaser avant create() lors d'un restart
   */
  init(): void {
    // Réinitialiser les compteurs
    this.collectedCount = 0;
    this.reconditionedCount = 0;
    this.distributedCount = 0;
    this.inventory = 0;

    // Réinitialiser les références
    this.nearBuilding = null
    this.nearComputer = null
    this.nearTechnician = null
    this.nearSpecialObject = null
    
    // Réinitialiser les tableaux (important pour éviter les doublons)
    this.buildings = [];
    this.occupiedZones = [];
    this.computers = [];
    this.cars = [];
    this.npcs = [];
    this.trafficLights = [];

    // Réinitialiser les groupes de collision
    this.buildingColliders = null;
    this.treeColliders = null;

    // Réinitialiser le système de feux
    this.trafficPhase = "h_green";
    this.trafficTimer = 0;

    // Réinitialiser le debug (masqué par défaut)
    this.debugGridVisible = false;

    // Réinitialiser les nouvelles propriétés
    this.schoolDeliveries = new Map();
    this.carriedPCSprite = null;
    this.carriedPCSprite2 = null;
    this.isInsideWorkshop = false;
  }

  create(): void {
    // Initialiser les groupes de collision
    this.buildingColliders = this.physics.add.staticGroup();
    this.treeColliders = this.physics.add.staticGroup();

    this.createTerrain();
    this.createDebugGrid(); // Grille de debug (après terrain, avant tout le reste)
    this.createBuildings();
    this.createComputers();
    this.createSpecialObjects();
    this.createCars();
    this.createNPCs();
    this.createVegetation();
    this.createPlayer();
    this.setupCollisions(); // Configurer les collisions après création du joueur
    this.setupControls();
    this.setupCamera();
    this.createAnimations();
    this.setupEvents();
    this.setupPauseEvents(); // Écouter les événements pause/restart de React
    this.setupWorkshopEvents(); // Écouter le retour de WorkshopScene
    this.createDebugUI();

    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // Émettre les stats initiales (toutes à 0) après un court délai
    // pour laisser le temps à UIScene de créer ses éléments
    this.time.delayedCall(100, () => {
      this.events.emit("updateStats", {
        collected: this.collectedCount,
        reconditioned: this.reconditionedCount,
        distributed: this.distributedCount,
        inventory: this.inventory,
      });
    });
  }

  /**
   * Configure les événements de retour de WorkshopScene
   */
  private setupWorkshopEvents(): void {
    this.events.on(
      "workshopComplete",
      (data: {
        pcsRepaired: number;
        collectedCount: number;
        reconditionedCount: number;
        distributedCount: number;
      }) => {
        this.onWorkshopComplete(data);
      }
    );
  }

  /**
   * Configure les collisions entre le joueur et les obstacles
   */
  private setupCollisions(): void {
    // Collision avec les bâtiments
    if (this.buildingColliders) {
      this.physics.add.collider(this.player, this.buildingColliders);
    }

    // Collision avec les arbres
    if (this.treeColliders) {
      this.physics.add.collider(this.player, this.treeColliders);
    }

    // Collision avec les NPCs
    this.npcs.forEach((npc) => {
      if (npc.sprite && npc.sprite.body) {
        this.physics.add.collider(this.player, npc.sprite);
      }
    });

    // Les collisions avec les voitures sont gérées manuellement dans updateCars()
  }

  /**
   * Configure les événements de pause/restart depuis React
   */
  private setupPauseEvents(): void {
    // Écouter l'événement de pause depuis React
    const handlePause = (e: CustomEvent) => {
      if (e.detail.paused) {
        this.scene.pause();
        this.scene.pause("UIScene");
      } else {
        this.scene.resume();
        this.scene.resume("UIScene");
      }
    };

    // Écouter l'événement de restart depuis React
    const handleRestart = () => {
      this.scene.stop("UIScene");
      this.scene.stop("MainScene");
      this.scene.start("BootScene");
    };

    window.addEventListener("game-pause", handlePause as EventListener);
    window.addEventListener("game-restart", handleRestart);

    // Nettoyer les listeners quand la scène est détruite
    this.events.on("shutdown", () => {
      window.removeEventListener("game-pause", handlePause as EventListener);
      window.removeEventListener("game-restart", handleRestart);
    });
  }

  // ==================== TERRAIN ====================
  private createTerrain(): void {
    const tilesX = Math.ceil(this.mapWidth / this.tileSize);
    const tilesY = Math.ceil(this.mapHeight / this.tileSize);

    // Dessiner l'herbe partout d'abord
    for (let tx = 0; tx < tilesX; tx++) {
      for (let ty = 0; ty < tilesY; ty++) {
        const px = tx * this.tileSize + 32;
        const py = ty * this.tileSize + 32;
        const grassType = Math.random() > 0.85 ? "grass_dark" : "grass";
        this.add.image(px, py, grassType).setDepth(0);
      }
    }

    // Dessiner les routes et trottoirs
    this.createRoads();
  }

  private createRoads(): void {
    const tilesX = Math.ceil(this.mapWidth / this.tileSize);
    const tilesY = Math.ceil(this.mapHeight / this.tileSize);

    // Routes horizontales (2 tiles de large chacune)
    this.roadTilesH.forEach((roadY) => {
      for (let tx = 0; tx < tilesX; tx++) {
        const px = tx * this.tileSize + 32;
        // Trottoir haut
        this.add
          .image(px, (roadY - 1) * this.tileSize + 32, "sidewalk")
          .setDepth(1);
        // Route (2 voies)
        this.add.image(px, roadY * this.tileSize + 32, "road_h").setDepth(1);
        this.add
          .image(px, (roadY + 1) * this.tileSize + 32, "road")
          .setDepth(1);
        // Trottoir bas
        this.add
          .image(px, (roadY + 2) * this.tileSize + 32, "sidewalk")
          .setDepth(1);
      }
    });

    // Routes verticales (2 tiles de large chacune)
    this.roadTilesV.forEach((roadX) => {
      for (let ty = 0; ty < tilesY; ty++) {
        const py = ty * this.tileSize + 32;

        // Ne pas dessiner sur les intersections (déjà fait par routes H)
        const isHRoad = this.roadTilesH.some((h) => ty >= h - 1 && ty <= h + 2);
        if (isHRoad) continue;

        // Trottoir gauche
        this.add
          .image((roadX - 1) * this.tileSize + 32, py, "sidewalk")
          .setDepth(1);
        // Route (2 voies)
        this.add.image(roadX * this.tileSize + 32, py, "road_v").setDepth(1);
        this.add
          .image((roadX + 1) * this.tileSize + 32, py, "road")
          .setDepth(1);
        // Trottoir droit
        this.add
          .image((roadX + 2) * this.tileSize + 32, py, "sidewalk")
          .setDepth(1);
      }
    });

    // Intersections
    this.roadTilesH.forEach((roadY) => {
      this.roadTilesV.forEach((roadX) => {
        // Centre intersection
        for (let dx = 0; dx < 2; dx++) {
          for (let dy = 0; dy < 2; dy++) {
            const px = (roadX + dx) * this.tileSize + 32;
            const py = (roadY + dy) * this.tileSize + 32;
            this.add.image(px, py, "road_cross").setDepth(1);
          }
        }

        // Passages piétons
        this.add
          .image(
            (roadX - 1) * this.tileSize + 32,
            roadY * this.tileSize + 32,
            "crosswalk_v"
          )
          .setDepth(2);
        this.add
          .image(
            (roadX - 1) * this.tileSize + 32,
            (roadY + 1) * this.tileSize + 32,
            "crosswalk_v"
          )
          .setDepth(2);
        this.add
          .image(
            (roadX + 2) * this.tileSize + 32,
            roadY * this.tileSize + 32,
            "crosswalk_v"
          )
          .setDepth(2);
        this.add
          .image(
            (roadX + 2) * this.tileSize + 32,
            (roadY + 1) * this.tileSize + 32,
            "crosswalk_v"
          )
          .setDepth(2);

        // Créer les feux tricolores dynamiques pour cette intersection
        this.createTrafficLightsForIntersection(roadX, roadY);
      });
    });
  }

  /**
   * Crée les feux de circulation pour une intersection donnée
   */
  private createTrafficLightsForIntersection(
    roadX: number,
    roadY: number
  ): void {
    // Positions des feux sur les coins de l'intersection
    // On place un feu pour les voitures H et un pour les voitures V

    // Feu pour route horizontale (en haut-gauche de l'intersection)
    const hLightX = (roadX - 1) * this.tileSize + 32;
    const hLightY = (roadY - 1) * this.tileSize + 32;
    const spriteH = this.add
      .image(hLightX, hLightY, "traffic_light_green")
      .setOrigin(0.5, 1)
      .setDepth(hLightY + 50);

    // Feu pour route verticale (en bas-droite de l'intersection)
    const vLightX = (roadX + 2) * this.tileSize + 32;
    const vLightY = (roadY + 2) * this.tileSize + 32;
    const spriteV = this.add
      .image(vLightX, vLightY, "traffic_light_red")
      .setOrigin(0.5, 1)
      .setDepth(vLightY + 50);

    this.trafficLights.push({
      x: roadX * this.tileSize,
      y: roadY * this.tileSize,
      roadX,
      roadY,
      spriteH,
      spriteV,
    });
  }

  // ==================== BÂTIMENTS ====================

  /**
   * Calcule la zone occupée par un bâtiment (en pixels)
   * Le bâtiment a son origine en bas-centre, donc on calcule la zone autour de ce point
   * withSpacing: true pour vérifier placement (avec marge), false pour collisions exactes
   */
  private getBuildingBounds(
    x: number,
    y: number,
    type: Building["type"],
    scale: number = 1,
    withSpacing: boolean = true
  ): OccupiedZone {
    const size = BUILDING_SIZES[type];
    const w = size.width * scale;
    const h = size.height * scale;
    const spacing = withSpacing ? this.tileSize : 0; // Espacement pour placement, pas pour debug/collision

    return {
      minX: x - w / 2 - spacing,
      maxX: x + w / 2 + spacing,
      minY: y - h - spacing, // Le bâtiment s'étend vers le HAUT depuis y
      maxY: y + spacing,
    };
  }

  /**
   * Retourne les bounds exactes du bâtiment (sans spacing) pour les collisions
   */
  private getExactBuildingBounds(
    x: number,
    y: number,
    type: Building["type"],
    scale: number = 1
  ): OccupiedZone {
    return this.getBuildingBounds(x, y, type, scale, false);
  }

  /**
   * Vérifie si une zone chevauche une autre zone
   */
  private zonesOverlap(a: OccupiedZone, b: OccupiedZone): boolean {
    return !(
      a.maxX < b.minX ||
      a.minX > b.maxX ||
      a.maxY < b.minY ||
      a.minY > b.maxY
    );
  }

  /**
   * Vérifie si un bâtiment dépasse sur une route
   */
  private buildingOverlapsRoad(bounds: OccupiedZone): boolean {
    // Vérifier routes horizontales
    for (const roadY of this.roadTilesH) {
      const roadMinY = (roadY - 1) * this.tileSize;
      const roadMaxY = (roadY + 3) * this.tileSize;
      if (bounds.minY < roadMaxY && bounds.maxY > roadMinY) {
        // Le bâtiment est dans la zone Y de la route
        return true;
      }
    }

    // Vérifier routes verticales
    for (const roadX of this.roadTilesV) {
      const roadMinX = (roadX - 1) * this.tileSize;
      const roadMaxX = (roadX + 3) * this.tileSize;
      if (bounds.minX < roadMaxX && bounds.maxX > roadMinX) {
        // Le bâtiment est dans la zone X de la route
        // Mais seulement si sa zone Y touche la partie route
        return true;
      }
    }

    return false;
  }

  /**
   * Vérifie si un bâtiment peut être placé à cette position
   */
  private canPlaceBuilding(
    x: number,
    y: number,
    type: Building["type"],
    scale: number = 1
  ): boolean {
    const bounds = this.getBuildingBounds(x, y, type, scale);

    // Vérifier les limites de la carte
    if (
      bounds.minX < 0 ||
      bounds.maxX > this.mapWidth ||
      bounds.minY < 0 ||
      bounds.maxY > this.mapHeight
    ) {
      return false;
    }

    // Vérifier si ça dépasse sur une route
    if (this.buildingOverlapsRoad(bounds)) {
      return false;
    }

    // Vérifier collision avec autres bâtiments
    for (const zone of this.occupiedZones) {
      if (this.zonesOverlap(bounds, zone)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Place un bâtiment aligné sur les tiles et enregistre sa zone
   * tx, ty: coordonnées de la tile du coin bas-gauche du bâtiment
   * Le bâtiment occupera les tiles de (tx, ty - heightInTiles + 1) à (tx + widthInTiles - 1, ty)
   */
  private placeBuilding(
    tx: number,
    ty: number,
    type: Building["type"],
    name: string,
    scale: number = 1
  ): boolean {
    const size = BUILDING_SIZES[type];
    const widthInTiles = size.width / this.tileSize;

    // Position en pixels - alignée sur les tiles
    // Le sprite utilise setOrigin(0.5, 1) donc:
    // x = centre horizontal du bâtiment (milieu des tiles occupées)
    // y = bas du bâtiment (bord inférieur de la tile ty)
    const x = tx * this.tileSize + (widthInTiles * this.tileSize) / 2;
    const y = (ty + 1) * this.tileSize; // Bas du bâtiment = bord inférieur de la tile ty

    if (!this.canPlaceBuilding(x, y, type, scale)) {
      console.warn(`⚠️ Impossible de placer "${name}" à tile (${tx}, ${ty})`);
      return false;
    }

    const bounds = this.getBuildingBounds(x, y, type, scale);
    this.occupiedZones.push(bounds);

    this.buildings.push({ x, y, type, name });
    return true;
  }

  private createBuildings(): void {
    /*
     * ===========================================
     * CARTE: 60 tiles (colonnes) x 45 tiles (lignes)
     * ===========================================
     * Routes H aux lignes: 15, 30 (avec trottoirs à -1 et +2)
     * Routes V aux colonnes: 20, 40 (avec trottoirs à -1 et +2)
     *
     * ZONES CONSTRUCTIBLES (herbe):
     * - Zone A: colonnes 0-18,  lignes 0-13   (haut gauche)
     * - Zone B: colonnes 24-38, lignes 0-13   (haut droite)
     * - Zone C: colonnes 44-59, lignes 0-13   (haut extrême droite)
     * - Zone D: colonnes 0-18,  lignes 18-28  (milieu gauche)
     * - Zone E: colonnes 24-38, lignes 18-28  (milieu centre)
     * - Zone F: colonnes 44-59, lignes 18-28  (milieu droite)
     * - Zone G: colonnes 0-18,  lignes 33-44  (bas gauche)
     * - Zone H: colonnes 24-38, lignes 33-44  (bas centre)
     * - Zone I: colonnes 44-59, lignes 33-44  (bas droite)
     * ===========================================
     */

    // ========== ZONE A: ENTREPRISES (haut gauche) ==========
    this.placeBuilding(4, 10, "enterprise", "🏢 TechCorp Solutions");
    this.placeBuilding(10, 10, "enterprise", "🏢 DataSoft Analytics");
    this.placeBuilding(16, 10, "office", "🏢 ByteCloud Services");

    // ========== ZONE B: ENTREPRISES (haut centre) ==========
    this.placeBuilding(26, 10, "enterprise", "🏢 GreenTech Inc");
    this.placeBuilding(32, 10, "office", "🏢 EcoData Systems");

    // ========== ZONE C: ENTREPRISES (haut droite) ==========
    this.placeBuilding(48, 10, "enterprise", "🏢 InfoSys Global");
    this.placeBuilding(54, 10, "office", "🏢 Innovation Hub");

    // ========== ZONE D: ATELIER AU CENTRE + RÉSIDENTIEL ==========
    // Atelier NIRD au centre de la carte (entre les 4 routes)
    this.placeBuilding(
      28,
      24,
      "workshop",
      "🔧 Atelier NIRD - Reconditionnement Linux"
    );
    this.placeBuilding(3, 22, "house", "🏠 Maison Rose");
    this.placeBuilding(15, 22, "apartment", "🏢 Résidence du Parc");

    // ========== ZONE E: RÉSIDENTIEL (milieu centre) ==========
    this.placeBuilding(26, 22, "house", "🏠 Villa Bleue");
    this.placeBuilding(30, 24, "shop", "🏪 Boulangerie Martin");
    this.placeBuilding(35, 22, "apartment", "🏢 Les Jardins");

    // ========== ZONE F: RÉSIDENTIEL (milieu droite) ==========
    this.placeBuilding(46, 22, "shop", "🏪 Librairie Pages");
    this.placeBuilding(52, 24, "house", "🏠 Pavillon Vert");
    this.placeBuilding(56, 22, "shop", "🏪 Café du Centre");

    // ========== ZONE G: ÉCOLES (bas gauche) ==========
    this.placeBuilding(5, 40, "school", "📚 École Primaire Jean Jaurès");
    this.placeBuilding(14, 40, "school", "📚 Collège Victor Hugo");

    // ========== ZONE H: UNIVERSITÉ (bas centre) ==========
    this.placeBuilding(
      30,
      40,
      "university",
      "🎓 Université Pierre et Marie Curie"
    );

    // ========== ZONE I: ÉCOLES (bas droite) ==========
    this.placeBuilding(46, 40, "school", "📚 Lycée Marie Curie");
    this.placeBuilding(54, 40, "school", "📚 École Montessori");

    // Créer les sprites pour tous les bâtiments placés
    this.buildings.forEach((building) => {
      const textureKey = `building_${building.type}`;
      building.sprite = this.add
        .image(building.x, building.y, textureKey)
        .setOrigin(0.5, 1)
        .setDepth(building.y);

      // Créer un collider invisible pour ce bâtiment
      if (this.buildingColliders) {
        const bounds = this.getExactBuildingBounds(
          building.x,
          building.y,
          building.type
        );
        const collider = this.add.rectangle(
          bounds.minX + (bounds.maxX - bounds.minX) / 2,
          bounds.minY + (bounds.maxY - bounds.minY) / 2,
          bounds.maxX - bounds.minX,
          bounds.maxY - bounds.minY
        );
        this.physics.add.existing(collider, true); // true = static
        this.buildingColliders.add(collider);
        collider.setVisible(false);
      }
    });

    // Debug: afficher les zones occupées
    this.drawOccupiedZonesDebug();
  }

  private drawOccupiedZonesDebug(): void {
    const g = this.add.graphics();
    g.lineStyle(2, 0xff00ff, 0.5);

    // Afficher les zones exactes des bâtiments (sans spacing)
    this.buildings.forEach((building) => {
      const zone = this.getExactBuildingBounds(
        building.x,
        building.y,
        building.type
      );
      g.strokeRect(
        zone.minX,
        zone.minY,
        zone.maxX - zone.minX,
        zone.maxY - zone.minY
      );
    });

    g.setDepth(5001);
    this.debugGridContainer.add(g);
  }

  // ==================== ORDINATEURS ====================
  private createComputers(): void {
    // On place exactement 8 ordinateurs devant les entreprises/bureaux
    const techBuildings = this.buildings.filter(
      (b) => b.type === "enterprise" || b.type === "office"
    );

    // Positions fixes pour les 8 ordinateurs (1 par bâtiment tech, on en a 7, donc 2 pour le premier)
    const computerPositions: {
      buildingIndex: number;
      offsetX: number;
      offsetY: number;
    }[] = [
      { buildingIndex: 0, offsetX: -30, offsetY: 50 },
      { buildingIndex: 0, offsetX: 30, offsetY: 60 },
      { buildingIndex: 1, offsetX: 0, offsetY: 55 },
      { buildingIndex: 2, offsetX: -20, offsetY: 50 },
      { buildingIndex: 3, offsetX: 10, offsetY: 55 },
      { buildingIndex: 4, offsetX: -10, offsetY: 50 },
      { buildingIndex: 5, offsetX: 20, offsetY: 55 },
      { buildingIndex: 6, offsetX: 0, offsetY: 50 },
    ];

    computerPositions.forEach((pos) => {
      const building = techBuildings[pos.buildingIndex % techBuildings.length];
      if (!building) return;

      const compX = building.x + pos.offsetX;
      const compY = building.y + pos.offsetY;

      // Vérifier qu'on n'est pas sur la route
      if (!this.isOnRoad(compX, compY)) {
        this.computers.push({
          x: compX,
          y: compY,
          collected: false,
        });
      } else {
        // Si sur la route, décaler un peu
        this.computers.push({
          x: compX,
          y: compY + 30,
          collected: false,
        });
      }
    });

    this.computers.forEach((computer) => {
      computer.sprite = this.add
        .image(computer.x, computer.y, "computer_old")
        .setDepth(computer.y)
        .setScale(1.2);

      computer.interactIcon = this.add
        .image(computer.x, computer.y - 30, "interact_icon")
        .setDepth(computer.y + 100)
        .setScale(0.8)
        .setVisible(false);

      this.tweens.add({
        targets: computer.interactIcon,
        y: computer.y - 40,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  // ==================== OBJETS SPÉCIAUX ====================
  private createSpecialObjects(): void {
    // Placer TUX devant l'Atelier NIRD (à environ 28, 24)
    const workshopBuilding = this.buildings.find((b) => b.type === "workshop");
    if (workshopBuilding) {
      const tuxX = workshopBuilding.x;
      const tuxY = workshopBuilding.y + 50;

      this.specialObjects.push({
        x: tuxX,
        y: tuxY,
        type: "tux",
        interacted: false,
        phoneFound: false,
      });
    }

    // Créer les sprites pour tous les objets spéciaux
    this.specialObjects.forEach((obj) => {
      if (obj.type === "tux") {
        obj.sprite = this.add
          .image(obj.x, obj.y, "tux_mascot")
          .setOrigin(0.5, 1)
          .setDepth(obj.y)
          .setScale(2);

        // Ajouter une légère animation de bobbing
        this.tweens.add({
          targets: obj.sprite,
          y: obj.y - 5,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        obj.interactIcon = this.add
          .image(obj.x, obj.y - 40, "interact_icon")
          .setDepth(obj.y + 100)
          .setScale(1)
          .setVisible(false);

        // Animation du symbole d'interaction
        this.tweens.add({
          targets: obj.interactIcon,
          y: obj.y - 50,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    });
  }

  // ==================== VOITURES ====================
  private createCars(): void {
    const carColors = ["red", "blue", "green", "yellow", "white", "black"];
    const carScale = 1.8; // Voitures plus grandes pour être visibles

    // Voitures sur les routes horizontales
    // Voie 0 (haut de la route) : va vers la DROITE
    // Voie 1 (bas de la route) : va vers la GAUCHE
    this.roadTilesH.forEach((roadY, roadIndex) => {
      for (let i = 0; i < 2; i++) {
        const color = Phaser.Math.RND.pick(carColors);
        // Positionner au centre de chaque voie
        const laneY = (roadY + (i === 0 ? 0.5 : 1.5)) * this.tileSize;
        const startX = Math.random() * this.mapWidth;
        const baseSpeed = 80 + Math.random() * 40;

        // Voie 0: vers la droite (rotation 0), Voie 1: vers la gauche (flip horizontal)
        const goingRight = i === 0;

        const sprite = this.add
          .image(startX, laneY, `car_${color}`)
          .setScale(carScale)
          .setDepth(laneY + 5)
          .setFlipX(!goingRight); // Flip si va vers la gauche

        this.cars.push({
          sprite,
          direction: "h",
          speed: baseSpeed * (goingRight ? 1 : -1),
          baseSpeed: baseSpeed * (goingRight ? 1 : -1),
          lane: i,
          roadIndex,
        });
      }
    });

    // Voitures sur les routes verticales
    // Voie 0 (gauche de la route) : va vers le BAS
    // Voie 1 (droite de la route) : va vers le HAUT
    this.roadTilesV.forEach((roadX, roadIndex) => {
      for (let i = 0; i < 2; i++) {
        const color = Phaser.Math.RND.pick(carColors);
        // Positionner au centre de chaque voie
        const laneX = (roadX + (i === 0 ? 0.5 : 1.5)) * this.tileSize;
        const startY = Math.random() * this.mapHeight;
        const baseSpeed = 80 + Math.random() * 40;

        // Voie 0: vers le bas (rotation 90°), Voie 1: vers le haut (rotation -90°)
        const goingDown = i === 0;

        const sprite = this.add
          .image(laneX, startY, `car_${color}`)
          .setScale(carScale)
          .setDepth(startY + 5)
          .setRotation(goingDown ? Math.PI / 2 : -Math.PI / 2);

        this.cars.push({
          sprite,
          direction: "v",
          speed: baseSpeed * (goingDown ? 1 : -1),
          baseSpeed: baseSpeed * (goingDown ? 1 : -1),
          lane: i,
          roadIndex,
        });
      }
    });
  }

  // ==================== PNJs ====================
  private createNPCs(): void {
    // Types pour les NPCs aléatoires (sans technician - celui-ci est placé manuellement près de l'atelier)
    const npcTypes: Array<"citizen" | "woman"> = [
      "citizen",
      "woman",
    ];

    // PNJs fixes (sur les trottoirs des nouvelles routes)
    // Routes H: 15, 30 | Routes V: 20, 40
    const fixedNPCPositions = [
      // Trottoirs route H ligne 15
      { tx: 10, ty: 14 },
      { tx: 30, ty: 14 },
      { tx: 50, ty: 14 },
      // Trottoirs route H ligne 30
      { tx: 10, ty: 33 },
      { tx: 30, ty: 33 },
      { tx: 50, ty: 33 },
      // Trottoirs route V colonne 20
      { tx: 19, ty: 8 },
      { tx: 19, ty: 25 },
      { tx: 19, ty: 38 },
      // Trottoirs route V colonne 40
      { tx: 43, ty: 8 },
      { tx: 43, ty: 25 },
      { tx: 43, ty: 38 },
    ]
    
    fixedNPCPositions.forEach(pos => {
      const type = Phaser.Math.RND.pick(npcTypes)
      const sprite = this.physics.add.sprite(
        pos.tx * this.tileSize + 32,
        pos.ty * this.tileSize + 32,
        `npc_${type}`
      ).setOrigin(0.5, 1).setScale(1.1).setDepth(pos.ty * this.tileSize)
      
      // Rendre le sprite immobile (collision statique)
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setSize(24, 16);
      body.setOffset(4, 48);

      this.npcs.push({
        sprite,
        type,
        isMoving: false,
        speed: 0,
        direction: Math.random() > 0.5 ? "left" : "right",
      });
    });

    // PNJs en mouvement (sur les trottoirs)
    const movingNPCPositions = [
      { tx: 5, ty: 14, targetTx: 55 },
      { tx: 50, ty: 33, targetTx: 5 },
      { tx: 19, ty: 5, targetTx: 19 }, // Se déplace verticalement via update
      { tx: 43, ty: 40, targetTx: 43 },
    ];

    movingNPCPositions.forEach((pos) => {
      const type = Phaser.Math.RND.pick(npcTypes);
      const startX = pos.tx * this.tileSize + 32;
      const startY = pos.ty * this.tileSize + 32;

      const sprite = this.physics.add
        .sprite(startX, startY, `npc_${type}`)
        .setOrigin(0.5, 1)
        .setScale(1.1)
        .setDepth(startY)
      
      // Rendre le sprite immobile (collision)
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setSize(24, 16);
      body.setOffset(4, 48);

      const targetX = pos.targetTx * this.tileSize + 32;
      const direction = targetX > startX ? "right" : "left";
      sprite.setFlipX(direction === "left");

      this.npcs.push({
        sprite,
        type,
        isMoving: true,
        targetX,
        targetY: startY,
        speed: 30 + Math.random() * 20,
        direction,
      });
    });

    // Technicien près de l'atelier NIRD (un seul)
    const workshop = this.buildings.find((b) => b.type === "workshop");
    if (workshop) {
      const sprite = this.physics.add.sprite(
        workshop.x + 188,  // Déplacé de 2 tiles vers la droite (60 + 128)
        workshop.y + 20,
        'npc_technician'
      ).setOrigin(0.5, 1).setScale(1.1).setDepth(workshop.y + 20)
      
      // Rendre le sprite immobile (collision)
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setSize(24, 16);
      body.setOffset(4, 48);

      this.npcs.push({
        sprite,
        type: "technician",
        isMoving: false,
        speed: 0,
        direction: "left",
      });
    }
  }

  // ==================== VÉGÉTATION ====================
  private createVegetation(): void {
    const tilesX = 60; // Nouvelle largeur
    const tilesY = 45; // Nouvelle hauteur

    // Arbres - uniquement sur l'herbe
    const treePositions: Array<{ tx: number; ty: number }> = [];

    // Bordures de la carte
    for (let tx = 0; tx < tilesX; tx += 4) {
      if (!this.isTileOnRoadOrBuilding(tx, 1))
        treePositions.push({ tx, ty: 1 });
      if (!this.isTileOnRoadOrBuilding(tx, tilesY - 2))
        treePositions.push({ tx, ty: tilesY - 2 });
    }
    for (let ty = 0; ty < tilesY; ty += 4) {
      if (!this.isTileOnRoadOrBuilding(1, ty))
        treePositions.push({ tx: 1, ty });
      if (!this.isTileOnRoadOrBuilding(tilesX - 2, ty))
        treePositions.push({ tx: tilesX - 2, ty });
    }

    // Arbres entre les zones (adaptés à la nouvelle carte)
    const additionalTrees = [
      // Zone haute
      { tx: 8, ty: 5 },
      { tx: 14, ty: 5 },
      { tx: 28, ty: 5 },
      { tx: 34, ty: 5 },
      { tx: 48, ty: 5 },
      { tx: 54, ty: 5 },
      // Zone milieu
      { tx: 8, ty: 22 },
      { tx: 14, ty: 22 },
      { tx: 28, ty: 22 },
      { tx: 34, ty: 22 },
      { tx: 48, ty: 22 },
      { tx: 54, ty: 22 },
      // Zone basse
      { tx: 8, ty: 38 },
      { tx: 14, ty: 38 },
      { tx: 28, ty: 38 },
      { tx: 34, ty: 38 },
      { tx: 48, ty: 38 },
      { tx: 54, ty: 38 },
    ];
    treePositions.push(
      ...additionalTrees.filter((p) => !this.isTileOnRoadOrBuilding(p.tx, p.ty))
    );

    treePositions.forEach((pos) => {
      const px = pos.tx * this.tileSize + 32;
      const py = pos.ty * this.tileSize + 64;
      const treeType = Math.random() > 0.4 ? "tree" : "tree_pine";
      const treeScale = 0.9 + Math.random() * 0.3;

      this.add
        .image(px, py, treeType)
        .setOrigin(0.5, 1)
        .setDepth(py)
        .setScale(treeScale);

      // Ajouter un collider pour le tronc de l'arbre
      if (this.treeColliders) {
        const trunkWidth = 20;
        const trunkHeight = 30;
        const collider = this.add.rectangle(
          px,
          py - trunkHeight / 2,
          trunkWidth,
          trunkHeight
        );
        this.physics.add.existing(collider, true); // true = static
        this.treeColliders.add(collider);
        collider.setVisible(false);
      }
    });

    // Buissons - sur l'herbe uniquement
    for (let i = 0; i < 60; i++) {
      let tx: number, ty: number;
      let attempts = 0;
      do {
        tx = Math.floor(Math.random() * tilesX);
        ty = Math.floor(Math.random() * tilesY);
        attempts++;
      } while (this.isTileOnRoadOrBuilding(tx, ty) && attempts < 20);

      if (attempts < 20) {
        const px = tx * this.tileSize + 32 + (Math.random() - 0.5) * 30;
        const py = ty * this.tileSize + 48;
        this.add
          .image(px, py, "bush")
          .setOrigin(0.5, 1)
          .setDepth(py)
          .setScale(0.6 + Math.random() * 0.4);
      }
    }

    // Fleurs - sur l'herbe uniquement
    for (let i = 0; i < 80; i++) {
      let tx: number, ty: number;
      let attempts = 0;
      do {
        tx = Math.floor(Math.random() * tilesX);
        ty = Math.floor(Math.random() * tilesY);
        attempts++;
      } while (this.isTileOnRoadOrBuilding(tx, ty) && attempts < 20);

      if (attempts < 20) {
        const px = tx * this.tileSize + 32 + (Math.random() - 0.5) * 40;
        const py = ty * this.tileSize + 40;
        const flowerType = Math.random() > 0.5 ? "flower" : "flower_yellow";
        this.add
          .image(px, py, flowerType)
          .setOrigin(0.5, 1)
          .setDepth(py - 10)
          .setScale(0.5 + Math.random() * 0.4);
      }
    }

    // Rochers
    for (let i = 0; i < 25; i++) {
      let tx: number, ty: number;
      let attempts = 0;
      do {
        tx = Math.floor(Math.random() * tilesX);
        ty = Math.floor(Math.random() * tilesY);
        attempts++;
      } while (this.isTileOnRoadOrBuilding(tx, ty) && attempts < 20);

      if (attempts < 20) {
        const px = tx * this.tileSize + 32;
        const py = ty * this.tileSize + 48;
        this.add
          .image(px, py, "rock")
          .setOrigin(0.5, 1)
          .setDepth(py)
          .setScale(0.5 + Math.random() * 0.5);
      }
    }

    // Mobilier urbain - sur les trottoirs
    this.createStreetFurniture();
  }

  private createStreetFurniture(): void {
    // Lampadaires le long des routes
    this.roadTilesH.forEach((roadY) => {
      for (let tx = 4; tx < 58; tx += 6) {
        if (this.isTileOnRoadOrBuilding(tx, roadY - 1)) continue;
        const px = tx * this.tileSize + 32;
        const py = (roadY - 1) * this.tileSize + 64;
        this.add.image(px, py, "lamppost").setOrigin(0.5, 1).setDepth(py);
      }
    });

    // Bancs sur les trottoirs (adaptés aux nouvelles routes)
    const benchPositions = [
      // Trottoir route H ligne 15
      { tx: 8, ty: 14 },
      { tx: 28, ty: 14 },
      { tx: 48, ty: 14 },
      // Trottoir route H ligne 30
      { tx: 8, ty: 33 },
      { tx: 28, ty: 33 },
      { tx: 48, ty: 33 },
    ];
    benchPositions.forEach((pos) => {
      const px = pos.tx * this.tileSize + 32;
      const py = pos.ty * this.tileSize + 48;
      this.add.image(px, py, "bench").setOrigin(0.5, 1).setDepth(py);
    });

    // Poubelles près des bancs
    benchPositions.forEach((pos) => {
      const px = pos.tx * this.tileSize + 60;
      const py = pos.ty * this.tileSize + 48;
      this.add.image(px, py, "trashcan").setOrigin(0.5, 1).setDepth(py);
    });

    // Fontaines dans les espaces verts
    const fountainPositions = [
      { tx: 10, ty: 8 }, // Zone A
      { tx: 50, ty: 8 }, // Zone C
      { tx: 10, ty: 38 }, // Zone G
      { tx: 50, ty: 38 }, // Zone I
    ];
    fountainPositions.forEach((pos) => {
      if (!this.isTileOnRoadOrBuilding(pos.tx, pos.ty)) {
        const px = pos.tx * this.tileSize + 32;
        const py = pos.ty * this.tileSize + 64;
        this.add
          .image(px, py, "fountain")
          .setOrigin(0.5, 0.5)
          .setDepth(py + 40)
          .setScale(1.3);
      }
    });

    // Panneaux d'indication (aux intersections)
    const signPositions = [
      { tx: 19, ty: 14 }, // Intersection route V20 / H15
      { tx: 43, ty: 14 }, // Intersection route V40 / H15
      { tx: 19, ty: 33 }, // Intersection route V20 / H30
      { tx: 43, ty: 33 }, // Intersection route V40 / H30
    ];
    signPositions.forEach((pos) => {
      const px = pos.tx * this.tileSize + 48;
      const py = pos.ty * this.tileSize + 64;
      this.add.image(px, py, "sign").setOrigin(0.5, 1).setDepth(py);
    });

    // Arrêts de bus
    const busStopPositions = [
      { tx: 23, ty: 14 }, // Arrêt route H15
      { tx: 37, ty: 14 },
      { tx: 23, ty: 33 }, // Arrêt route H30
      { tx: 37, ty: 33 },
    ];
    busStopPositions.forEach((pos) => {
      const px = pos.tx * this.tileSize + 32;
      const py = pos.ty * this.tileSize + 64;
      this.add.image(px, py, "bus_stop").setOrigin(0.5, 1).setDepth(py);
    });

    // Boîtes aux lettres près des maisons
    const mailboxPositions = [
      { tx: 5, ty: 23 },
      { tx: 17, ty: 23 },
      { tx: 28, ty: 23 },
      { tx: 54, ty: 25 },
    ];
    mailboxPositions.forEach((pos) => {
      if (!this.isTileOnRoadOrBuilding(pos.tx, pos.ty)) {
        const px = pos.tx * this.tileSize + 32;
        const py = pos.ty * this.tileSize + 48;
        this.add.image(px, py, "mailbox").setOrigin(0.5, 1).setDepth(py);
      }
    });

    // Parcs avec arbres groupés et bancs
    this.createParks();
  }

  /**
   * Crée des parcs avec des zones de verdure groupées
   */
  private createParks(): void {
    // Parc dans la zone A (haut gauche)
    this.createParkZone(12, 5, "Parc du Numérique");

    // Parc dans la zone I (bas droite)
    this.createParkZone(52, 37, "Jardins Linux");

    // Mini-parcs près des écoles
    this.createMiniPark(7, 42);
    this.createMiniPark(16, 42);
    this.createMiniPark(48, 42);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createParkZone(
    centerTx: number,
    centerTy: number,
    _name: string
  ): void {
    const centerX = centerTx * this.tileSize + 32;
    const centerY = centerTy * this.tileSize + 32;

    // Cercle d'arbres autour
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const tx = centerTx + Math.round(Math.cos(angle) * 3);
      const ty = centerTy + Math.round(Math.sin(angle) * 2);
      if (!this.isTileOnRoadOrBuilding(tx, ty)) {
        const px = tx * this.tileSize + 32;
        const py = ty * this.tileSize + 64;
        const treeType = Math.random() > 0.5 ? "tree" : "tree_pine";
        this.add
          .image(px, py, treeType)
          .setOrigin(0.5, 1)
          .setDepth(py)
          .setScale(0.8 + Math.random() * 0.3);
      }
    }

    // Bancs au centre
    this.add
      .image(centerX - 30, centerY + 20, "bench")
      .setOrigin(0.5, 1)
      .setDepth(centerY + 20);
    this.add
      .image(centerX + 30, centerY + 20, "bench")
      .setOrigin(0.5, 1)
      .setDepth(centerY + 20);

    // Fleurs autour
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      const fx = centerX + Math.cos(angle) * distance;
      const fy = centerY + Math.sin(angle) * distance;
      const flowerType = Math.random() > 0.5 ? "flower" : "flower_yellow";
      this.add
        .image(fx, fy, flowerType)
        .setOrigin(0.5, 1)
        .setDepth(fy - 10)
        .setScale(0.5 + Math.random() * 0.3);
    }
  }

  private createMiniPark(tx: number, ty: number): void {
    if (this.isTileOnRoadOrBuilding(tx, ty)) return;

    const px = tx * this.tileSize + 32;
    const py = ty * this.tileSize + 48;

    // Arbre central
    this.add
      .image(px, py + 16, Math.random() > 0.5 ? "tree" : "tree_pine")
      .setOrigin(0.5, 1)
      .setDepth(py + 16)
      .setScale(0.7);

    // Buissons autour
    this.add
      .image(px - 25, py + 10, "bush")
      .setOrigin(0.5, 1)
      .setDepth(py + 10)
      .setScale(0.5);
    this.add
      .image(px + 25, py + 10, "bush")
      .setOrigin(0.5, 1)
      .setDepth(py + 10)
      .setScale(0.5);

    // Quelques fleurs
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const fx = px + Math.cos(angle) * 20;
      const fy = py + Math.sin(angle) * 15;
      this.add
        .image(fx, fy, i % 2 === 0 ? "flower" : "flower_yellow")
        .setOrigin(0.5, 1)
        .setDepth(fy - 5)
        .setScale(0.4);
    }
  }

  // ==================== UTILITAIRES ====================
  private isTileOnRoadOrBuilding(tx: number, ty: number): boolean {
    // Check routes horizontales
    for (const roadY of this.roadTilesH) {
      if (ty >= roadY - 1 && ty <= roadY + 2) return true;
    }
    // Check routes verticales
    for (const roadX of this.roadTilesV) {
      if (tx >= roadX - 1 && tx <= roadX + 2) return true;
    }
    return false;
  }

  private isOnRoad(x: number, y: number): boolean {
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);
    return this.isTileOnRoadOrBuilding(tx, ty);
  }

  // ==================== JOUEUR ====================
  private createPlayer(): void {
    // Spawn près de l'atelier NIRD
    const workshop = this.buildings.find((b) => b.type === "workshop");
    const startX = workshop ? workshop.x + 100 : this.mapWidth / 2;
    const startY = workshop ? workshop.y + 50 : this.mapHeight / 2;

    this.player = this.add
      .sprite(startX, startY, "player_idle")
      .setOrigin(0.5, 1)
      .setScale(1.3); // Personnage plus grand

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(20, 16);
    body.setOffset(10, 48);
  }

  private createAnimations(): void {
    if (!this.anims.exists("walk")) {
      this.anims.create({
        key: "walk",
        frames: [
          { key: "player_walk_0" },
          { key: "player_walk_1" },
          { key: "player_walk_2" },
          { key: "player_walk_3" },
        ],
        frameRate: 10,
        repeat: -1,
      });
    }

    // Animations PNJ
    const npcTypes = ["citizen", "woman", "technician"];
    npcTypes.forEach((type) => {
      if (!this.anims.exists(`npc_${type}_walk`)) {
        this.anims.create({
          key: `npc_${type}_walk`,
          frames: [
            { key: `npc_${type}_walk_0` },
            { key: `npc_${type}_walk_1` },
            { key: `npc_${type}_walk_2` },
            { key: `npc_${type}_walk_3` },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
    });
  }

  private setupControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
    this.toggleGridKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.G
    );
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
  }

  private setupEvents(): void {
    this.interactKey.on("down", () => this.handleInteraction());
    this.toggleGridKey.on("down", () => this.toggleDebugGrid());
  }

  private toggleDebugGrid(): void {
    this.debugGridVisible = !this.debugGridVisible;
    this.debugGridContainer.setVisible(this.debugGridVisible);
  }

  private createDebugUI(): void {
    // Positionné en bas à gauche de l'écran
    const screenHeight = this.cameras.main.height;
    this.debugText = this.add
      .text(10, screenHeight - 80, "", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(9999);

    // Masquer le debug par défaut
    this.debugText.setVisible(false);
    this.debugGridContainer.setVisible(false);

    // Écouter l'événement pour toggle le debug depuis le menu pause
    const handleToggleDebug = (e: CustomEvent) => {
      this.debugGridVisible = e.detail.visible;
      this.debugText.setVisible(e.detail.visible);
      this.debugGridContainer.setVisible(e.detail.visible);
    };
    window.addEventListener(
      "game-toggle-debug",
      handleToggleDebug as EventListener
    );

    // Nettoyer le listener quand la scène est détruite
    this.events.on("shutdown", () => {
      window.removeEventListener(
        "game-toggle-debug",
        handleToggleDebug as EventListener
      );
    });
  }

  private createDebugGrid(): void {
    this.debugGridContainer = this.add.container(0, 0);

    const tilesX = Math.ceil(this.mapWidth / this.tileSize);
    const tilesY = Math.ceil(this.mapHeight / this.tileSize);

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x000000, 0.3);

    // Lignes verticales
    for (let tx = 0; tx <= tilesX; tx++) {
      const x = tx * this.tileSize;
      graphics.lineBetween(x, 0, x, this.mapHeight);
    }

    // Lignes horizontales
    for (let ty = 0; ty <= tilesY; ty++) {
      const y = ty * this.tileSize;
      graphics.lineBetween(0, y, this.mapWidth, y);
    }

    this.debugGridContainer.add(graphics);

    // Numéros de colonnes (en haut)
    for (let tx = 0; tx < tilesX; tx++) {
      const label = this.add
        .text(tx * this.tileSize + this.tileSize / 2, 4, `${tx}`, {
          fontSize: "10px",
          color: "#000000",
          backgroundColor: "#ffffffaa",
        })
        .setOrigin(0.5, 0);
      this.debugGridContainer.add(label);
    }

    // Numéros de lignes (à gauche)
    for (let ty = 0; ty < tilesY; ty++) {
      const label = this.add
        .text(4, ty * this.tileSize + this.tileSize / 2, `${ty}`, {
          fontSize: "10px",
          color: "#000000",
          backgroundColor: "#ffffffaa",
        })
        .setOrigin(0, 0.5);
      this.debugGridContainer.add(label);
    }

    // Marquer les zones spéciales avec des couleurs
    const zoneGraphics = this.add.graphics();

    // Routes horizontales (rouge transparent)
    this.roadTilesH.forEach((roadY) => {
      zoneGraphics.fillStyle(0xff0000, 0.15);
      zoneGraphics.fillRect(
        0,
        (roadY - 1) * this.tileSize,
        this.mapWidth,
        4 * this.tileSize
      );
    });

    // Routes verticales (rouge transparent)
    this.roadTilesV.forEach((roadX) => {
      zoneGraphics.fillStyle(0xff0000, 0.15);
      zoneGraphics.fillRect(
        (roadX - 1) * this.tileSize,
        0,
        4 * this.tileSize,
        this.mapHeight
      );
    });

    // Zone A: Entreprises haut gauche (bleu)
    zoneGraphics.fillStyle(0x0066ff, 0.1);
    zoneGraphics.fillRect(0, 0, 19 * this.tileSize, 14 * this.tileSize);

    // Zone B: Entreprises haut centre (bleu)
    zoneGraphics.fillStyle(0x0066ff, 0.1);
    zoneGraphics.fillRect(
      24 * this.tileSize,
      0,
      15 * this.tileSize,
      14 * this.tileSize
    );

    // Zone C: Entreprises haut droite (bleu)
    zoneGraphics.fillStyle(0x0066ff, 0.1);
    zoneGraphics.fillRect(
      44 * this.tileSize,
      0,
      16 * this.tileSize,
      14 * this.tileSize
    );

    // Zone D, E, F: Résidentiel milieu (jaune)
    zoneGraphics.fillStyle(0xffaa00, 0.1);
    zoneGraphics.fillRect(
      0,
      18 * this.tileSize,
      19 * this.tileSize,
      11 * this.tileSize
    );
    zoneGraphics.fillRect(
      24 * this.tileSize,
      18 * this.tileSize,
      15 * this.tileSize,
      11 * this.tileSize
    );
    zoneGraphics.fillRect(
      44 * this.tileSize,
      18 * this.tileSize,
      16 * this.tileSize,
      11 * this.tileSize
    );

    // Zone G, H, I: Écoles/Université bas (vert)
    zoneGraphics.fillStyle(0x00ff00, 0.1);
    zoneGraphics.fillRect(
      0,
      33 * this.tileSize,
      19 * this.tileSize,
      12 * this.tileSize
    );
    zoneGraphics.fillRect(
      24 * this.tileSize,
      33 * this.tileSize,
      15 * this.tileSize,
      12 * this.tileSize
    );
    zoneGraphics.fillRect(
      44 * this.tileSize,
      33 * this.tileSize,
      16 * this.tileSize,
      12 * this.tileSize
    );

    this.debugGridContainer.add(zoneGraphics);
    this.debugGridContainer.setDepth(5000);
  }

  // ==================== UPDATE ====================
  update(_time: number, delta: number): void {
    this.handleMovement();
    this.checkProximity();
    this.updateDepth();
    this.updateTrafficLights(delta);
    this.updateCars();
    this.updateNPCs();
    this.updateDebug();
  }

  /**
   * Met à jour le cycle des feux tricolores
   */
  private updateTrafficLights(delta: number): void {
    if (!this.trafficLights || this.trafficLights.length === 0) return;

    this.trafficTimer += delta;

    // Déterminer la durée selon la phase
    const currentDuration =
      this.trafficPhase === "h_yellow" || this.trafficPhase === "v_yellow"
        ? this.TRAFFIC_YELLOW_DURATION
        : this.TRAFFIC_GREEN_DURATION;

    if (this.trafficTimer >= currentDuration) {
      this.trafficTimer = 0;

      // Passer à la phase suivante
      switch (this.trafficPhase) {
        case "h_green":
          this.trafficPhase = "h_yellow";
          break;
        case "h_yellow":
          this.trafficPhase = "v_green";
          break;
        case "v_green":
          this.trafficPhase = "v_yellow";
          break;
        case "v_yellow":
          this.trafficPhase = "h_green";
          break;
      }

      // Mettre à jour les sprites des feux
      this.updateTrafficLightSprites();
    }
  }

  /**
   * Met à jour les textures des feux selon la phase actuelle
   */
  private updateTrafficLightSprites(): void {
    if (!this.trafficLights || this.trafficLights.length === 0) return;

    this.trafficLights.forEach((light) => {
      // Vérifier que les sprites existent et sont actifs
      if (
        !light.spriteH ||
        !light.spriteH.scene ||
        !light.spriteV ||
        !light.spriteV.scene
      )
        return;

      switch (this.trafficPhase) {
        case "h_green":
          light.spriteH.setTexture("traffic_light_green");
          light.spriteV.setTexture("traffic_light_red");
          break;
        case "h_yellow":
          light.spriteH.setTexture("traffic_light_orange");
          light.spriteV.setTexture("traffic_light_red");
          break;
        case "v_green":
          light.spriteH.setTexture("traffic_light_red");
          light.spriteV.setTexture("traffic_light_green");
          break;
        case "v_yellow":
          light.spriteH.setTexture("traffic_light_red");
          light.spriteV.setTexture("traffic_light_orange");
          break;
      }
    });
  }

  /**
   * Vérifie si une voiture doit s'arrêter au prochain feu rouge
   */
  private shouldCarStop(car: Car): boolean {
    const stopDistance = 80; // Distance d'arrêt avant le feu

    // Vérifier chaque intersection
    for (const light of this.trafficLights) {
      const intersectionMinX = (light.roadX - 1) * this.tileSize;
      const intersectionMaxX = (light.roadX + 3) * this.tileSize;
      const intersectionMinY = (light.roadY - 1) * this.tileSize;
      const intersectionMaxY = (light.roadY + 3) * this.tileSize;

      if (car.direction === "h") {
        // Voiture horizontale - vérifier si on approche une intersection avec feu rouge
        const isHorizontalRed =
          this.trafficPhase === "v_green" || this.trafficPhase === "v_yellow";
        if (!isHorizontalRed) continue;

        // Vérifier si la voiture est sur la même ligne que l'intersection
        if (car.sprite.y < intersectionMinY || car.sprite.y > intersectionMaxY)
          continue;

        // Voiture allant vers la droite
        if (car.baseSpeed > 0) {
          const distanceToIntersection = intersectionMinX - car.sprite.x;
          if (
            distanceToIntersection > 0 &&
            distanceToIntersection < stopDistance
          ) {
            return true;
          }
        }
        // Voiture allant vers la gauche
        else {
          const distanceToIntersection = car.sprite.x - intersectionMaxX;
          if (
            distanceToIntersection > 0 &&
            distanceToIntersection < stopDistance
          ) {
            return true;
          }
        }
      } else {
        // Voiture verticale - vérifier si on approche une intersection avec feu rouge
        const isVerticalRed =
          this.trafficPhase === "h_green" || this.trafficPhase === "h_yellow";
        if (!isVerticalRed) continue;

        // Vérifier si la voiture est sur la même colonne que l'intersection
        if (car.sprite.x < intersectionMinX || car.sprite.x > intersectionMaxX)
          continue;

        // Voiture allant vers le bas
        if (car.baseSpeed > 0) {
          const distanceToIntersection = intersectionMinY - car.sprite.y;
          if (
            distanceToIntersection > 0 &&
            distanceToIntersection < stopDistance
          ) {
            return true;
          }
        }
        // Voiture allant vers le haut
        else {
          const distanceToIntersection = car.sprite.y - intersectionMaxY;
          if (
            distanceToIntersection > 0 &&
            distanceToIntersection < stopDistance
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private handleMovement(): void {
    if (!this.player || !this.player.body || !this.player.active) return;

    // Ne pas bouger si on est dans l'atelier
    if (this.isInsideWorkshop) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    let isMoving = false;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      body.setVelocityX(-this.playerSpeed);
      this.player.setFlipX(true);
      isMoving = true;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      body.setVelocityX(this.playerSpeed);
      this.player.setFlipX(false);
      isMoving = true;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      body.setVelocityY(-this.playerSpeed);
      isMoving = true;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      body.setVelocityY(this.playerSpeed);
      isMoving = true;
    }

    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      body.velocity.normalize().scale(this.playerSpeed);
    }

    if (isMoving) {
      this.player.play("walk", true);
    } else {
      this.player.stop();
      this.player.setTexture("player_idle");
    }

    // Mettre à jour la position du/des PC porté(s)
    if (this.carriedPCSprite && this.carriedPCSprite.active) {
      // PC côté droit
      const offsetX = this.player.flipX ? -18 : 18;
      this.carriedPCSprite.setPosition(
        this.player.x + offsetX,
        this.player.y - 28
      );
      this.carriedPCSprite.setDepth(this.player.depth + 1);
    }
    if (this.carriedPCSprite2 && this.carriedPCSprite2.active) {
      // PC côté gauche (opposé)
      const offsetX = this.player.flipX ? 18 : -18;
      this.carriedPCSprite2.setPosition(
        this.player.x + offsetX,
        this.player.y - 28
      );
      this.carriedPCSprite2.setDepth(this.player.depth + 1);
    }
    // Mettre à jour la position du téléphone porté
    if (
      this.carriedPhoneSprite &&
      this.carriedPhoneSprite.active &&
      this.isCarryingPhone
    ) {
      const offsetX = this.player.flipX ? -18 : 18;
      this.carriedPhoneSprite.setPosition(
        this.player.x + offsetX,
        this.player.y - 28
      );
      this.carriedPhoneSprite.setDepth(this.player.depth + 1);
    }
  }

  private checkProximity(): void {
    if (!this.player || !this.player.active) return
    
    this.nearBuilding = null
    this.nearComputer = null
    this.nearTechnician = null
    this.nearSpecialObject = null
    
    if (this.computers) {
      this.computers.forEach((c) => {
        if (c.interactIcon && !c.collected) {
          c.interactIcon.setVisible(false);
        }
      });
    }
    
    // Vérifier la proximité avec le NPC technicien (celui près de l'atelier)
    for (const npc of this.npcs) {
      if (npc.type === 'technician' && npc.sprite) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y)
        if (dist < 80) {
          this.nearTechnician = npc
          this.events.emit('nearBuilding', { name: '🔧 Technicien NIRD', type: 'npc_technician' })
          break
        }
      }
    }
    
    if (!this.nearTechnician) {
      if (!this.buildings) return
      for (const building of this.buildings) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, building.x, building.y)
        if (dist < 120) {
          this.nearBuilding = building
          this.events.emit('nearBuilding', building)
          break
        }
      }
    }
    
    if (!this.nearBuilding && !this.nearTechnician) {
      this.events.emit('nearBuilding', null)
    }

    for (const computer of this.computers) {
      if (computer.collected) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        computer.x,
        computer.y
      );
      if (dist < 50) {
        this.nearComputer = computer;
        if (computer.interactIcon) computer.interactIcon.setVisible(true);
        break;
      }
    }

    // Vérifier la proximité avec les objets spéciaux
    for (const obj of this.specialObjects) {
      // Vérifier la proximité du téléphone SEULEMENT si on ne le porte pas
      if (obj.phone && obj.phone.sprite && !this.isCarryingPhone) {
        const phoneDist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          obj.phone.sprite.x,
          obj.phone.sprite.y
        );
        if (phoneDist < 60) {
          this.nearSpecialObject = obj;
          if (obj.phone.interactIcon) obj.phone.interactIcon.setVisible(true);
          break;
        } else if (obj.phone.interactIcon) {
          obj.phone.interactIcon.setVisible(false);
        }
      }

      // Vérifier la proximité avec Tux lui-même
      // Interactif si: pas encore interagi OU si porte le téléphone à retrouver
      if (obj.interacted && !this.isCarryingPhone && !obj.phoneFound) {
        // Tux a été interagi, pas de téléphone en main, et il n'y a rien à faire
        continue;
      }

      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        obj.x,
        obj.y
      );
      if (dist < 60) {
        this.nearSpecialObject = obj;
        if (obj.interactIcon) obj.interactIcon.setVisible(true);
        break;
      }

      if (obj.interactIcon) {
        obj.interactIcon.setVisible(false);
      }
    }
  }

  private updateDepth(): void {
    if (!this.player || !this.player.active) return
    this.player.setDepth(this.player.y)
    
    // Mettre à jour le depth des NPCs en mouvement
    this.npcs.forEach(npc => {
      if (npc.sprite && npc.sprite.active && npc.isMoving) {
        npc.sprite.setDepth(npc.sprite.y)
      }
    })
  }

  private updateCars(): void {
    if (!this.cars || this.cars.length === 0) return;

    const delta = this.game.loop.delta / 1000;

    this.cars.forEach((car) => {
      if (!car.sprite || !car.sprite.active) return;

      // Vérifier si la voiture doit s'arrêter au feu rouge
      const mustStopAtLight = this.shouldCarStop(car);

      // Vérifier si le joueur est devant la voiture
      const mustStopForPlayer = this.isPlayerInFrontOfCar(car);

      // Vitesse actuelle (arrêt pour feu rouge ou piéton)
      let currentSpeed = car.baseSpeed;
      if (mustStopAtLight || mustStopForPlayer) {
        currentSpeed = 0;
      }

      // Déplacer la voiture
      if (car.direction === "h") {
        car.sprite.x += currentSpeed * delta;
        // Téléportation aux bords de la carte
        if (car.sprite.x > this.mapWidth + 60) car.sprite.x = -60;
        if (car.sprite.x < -60) car.sprite.x = this.mapWidth + 60;
      } else {
        car.sprite.y += currentSpeed * delta;
        // Téléportation aux bords de la carte
        if (car.sprite.y > this.mapHeight + 60) car.sprite.y = -60;
        if (car.sprite.y < -60) car.sprite.y = this.mapHeight + 60;
      }

      // Mettre à jour la profondeur pour le tri visuel
      car.sprite.setDepth(car.sprite.y + 5);
    });

    // Vérifier les collisions manuellement avec le joueur
    this.checkCarCollisions();
  }

  /**
   * Vérifie si le joueur est devant la voiture (dans sa trajectoire)
   * La voiture s'arrête si le joueur est à moins de 80px devant elle
   */
  private isPlayerInFrontOfCar(car: Car): boolean {
    if (!this.player || !this.player.active) return false;

    const playerX = this.player.x;
    const playerY = this.player.y - 20; // Centre du joueur
    const carX = car.sprite.x;
    const carY = car.sprite.y;

    const stopDistance = 80; // Distance à laquelle la voiture s'arrête
    const laneWidth = 40; // Largeur de détection de la voie

    if (car.direction === "h") {
      // Voiture horizontale
      // Vérifier si le joueur est sur la même voie (même Y approximativement)
      const sameY = Math.abs(playerY - carY) < laneWidth;
      if (!sameY) return false;

      // Vérifier si le joueur est devant la voiture selon sa direction
      if (car.baseSpeed > 0) {
        // Va vers la droite - joueur doit être à droite
        return playerX > carX && playerX < carX + stopDistance;
      } else {
        // Va vers la gauche - joueur doit être à gauche
        return playerX < carX && playerX > carX - stopDistance;
      }
    } else {
      // Voiture verticale
      // Vérifier si le joueur est sur la même voie (même X approximativement)
      const sameX = Math.abs(playerX - carX) < laneWidth;
      if (!sameX) return false;

      // Vérifier si le joueur est devant la voiture selon sa direction
      if (car.baseSpeed > 0) {
        // Va vers le bas - joueur doit être en dessous
        return playerY > carY && playerY < carY + stopDistance;
      } else {
        // Va vers le haut - joueur doit être au-dessus
        return playerY < carY && playerY > carY - stopDistance;
      }
    }
  }

  /**
   * Vérifie les collisions entre le joueur et les voitures
   */
  private checkCarCollisions(): void {
    if (!this.player || !this.player.active) return;
    if (!this.cars || this.cars.length === 0) return;

    const playerBounds = {
      x: this.player.x - 10,
      y: this.player.y - 40,
      width: 20,
      height: 40,
    };

    for (const car of this.cars) {
      if (!car.sprite || !car.sprite.active) continue;
      // Calculer les bounds de la voiture selon son orientation
      let carWidth: number, carHeight: number;
      if (car.direction === "h") {
        carWidth = 50; // Voiture horizontale
        carHeight = 25;
      } else {
        carWidth = 25; // Voiture verticale
        carHeight = 50;
      }

      const carBounds = {
        x: car.sprite.x - carWidth / 2,
        y: car.sprite.y - carHeight / 2,
        width: carWidth,
        height: carHeight,
      };

      // Vérifier l'intersection
      if (this.boundsIntersect(playerBounds, carBounds)) {
        // Repousser le joueur hors de la voiture
        this.pushPlayerFromCar(car, carBounds);
      }
    }
  }

  private boundsIntersect(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private pushPlayerFromCar(
    car: Car,
    carBounds: { x: number; y: number; width: number; height: number }
  ): void {
    const pushForce = 8;

    if (car.direction === "h") {
      // Voiture horizontale - pousser le joueur vers le haut ou le bas
      const playerCenterY = this.player.y - 20;
      const carCenterY = carBounds.y + carBounds.height / 2;
      if (playerCenterY < carCenterY) {
        this.player.y -= pushForce;
      } else {
        this.player.y += pushForce;
      }
    } else {
      // Voiture verticale - pousser le joueur vers la gauche ou la droite
      const playerCenterX = this.player.x;
      const carCenterX = carBounds.x + carBounds.width / 2;
      if (playerCenterX < carCenterX) {
        this.player.x -= pushForce;
      } else {
        this.player.x += pushForce;
      }
    }
  }

  private updateNPCs(): void {
    if (!this.npcs || this.npcs.length === 0) return;

    const delta = this.game.loop.delta / 1000;

    this.npcs.forEach((npc) => {
      // Vérifier que le sprite existe et a des animations
      if (!npc.sprite || !npc.sprite.anims) return;

      if (npc.isMoving && npc.targetX !== undefined) {
        const dx = npc.targetX - npc.sprite.x;

        if (Math.abs(dx) > 5) {
          npc.sprite.x += npc.speed * delta * Math.sign(dx);
          npc.sprite.setFlipX(dx < 0);
          npc.sprite.play(`npc_${npc.type}_walk`, true);
        } else {
          // Arrivé à destination, retourner dans l'autre sens
          npc.targetX =
            npc.sprite.x + (npc.direction === "right" ? -1000 : 1000);
          npc.direction = npc.direction === "right" ? "left" : "right";
        }

        npc.sprite.setDepth(npc.sprite.y + 10);
      }
    });
  }

  private updateDebug(): void {
    if (!this.player || !this.player.active || !this.debugText) return;
    if (!this.debugGridVisible) return; // Ne pas mettre à jour si masqué

    const tx = Math.floor(this.player.x / this.tileSize);
    const ty = Math.floor(this.player.y / this.tileSize);
    const onRoad = this.isOnRoad(this.player.x, this.player.y)
      ? "✅ Route"
      : "❌ Herbe";
    this.debugText.setText(
      `📍 Position: (${Math.round(this.player.x)}, ${Math.round(
        this.player.y
      )}) | Tile: (${tx}, ${ty}) | ${onRoad}\n` +
        `💻 PC: ${this.inventory} | 🔧 Recond: ${this.reconditionedCount} | 🎁 Distrib: ${this.distributedCount}\n` +
        `[G] Toggle grille | Grille: ${this.debugGridVisible ? "ON" : "OFF"}`
    );
  }

  // ==================== INTERACTIONS ====================
  private handleInteraction(): void {
    // Interaction avec le technicien IA
    if (this.nearTechnician) {
      this.openTechnicianChat()
      return
    }
    
    if (this.nearComputer && !this.nearComputer.collected) {
      this.collectComputer(this.nearComputer)
      return
    }

    if (this.nearSpecialObject) {
      // Vérifier si on est près du téléphone (pour le ramasser)
      if (this.nearSpecialObject.phone && this.nearSpecialObject.phone.sprite && !this.isCarryingPhone) {
        // Vérifier la distance au téléphone
        const phoneDist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          this.nearSpecialObject.phone.sprite.x,
          this.nearSpecialObject.phone.sprite.y
        );
        if (phoneDist < 60) {
          this.handlePhoneInteraction();
          return;
        }
      }
      
      // Toujours interactif si on porte le téléphone qu'il cherche
      if (
        this.nearSpecialObject.type === "tux" &&
        this.isCarryingPhone &&
        this.nearSpecialObject.phoneFound
      ) {
        this.interactWithSpecialObject(this.nearSpecialObject);
        return;
      } 
      // Ou si on n'a pas encore interagi avec Tux
      if (!this.nearSpecialObject.interacted) {
        this.interactWithSpecialObject(this.nearSpecialObject);
        return;
      }
    }

    if (this.nearBuilding) {
      this.interactWithBuilding(this.nearBuilding);
    }
  }
  
  /**
   * Ouvre le chatbot IA du technicien
   * Émet un événement global que React écoute
   */
  private openTechnicianChat(): void {
    // Pause le jeu pendant le chat
    this.scene.pause('MainScene')
    this.scene.pause('UIScene')
    
    // Émettre un événement global pour ouvrir le chatbot React
    window.dispatchEvent(new CustomEvent('open-technician-chat'))
  }

  private collectComputer(computer: CollectibleComputer): void {
    // Limiter l'inventaire à 2 PC maximum
    if (this.inventory >= 2) {
      this.events.emit(
        "showMessage",
        "⚠️ Vous ne pouvez porter que 2 PC maximum ! Allez les déposer à l'atelier NIRD."
      );
      return;
    }

    computer.collected = true;
    this.collectedCount++;
    this.inventory++;

    this.tweens.add({
      targets: computer.sprite,
      y: computer.y - 50,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      onComplete: () => {
        computer.sprite?.destroy();
        computer.interactIcon?.destroy();
      },
    });

    const text = this.add
      .text(computer.x, computer.y - 30, "+1 PC 💻", {
        fontSize: "18px",
        color: "#22c55e",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(9999);

    this.tweens.add({
      targets: text,
      y: computer.y - 70,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    });

    // Mettre à jour le sprite du PC porté
    this.updateCarriedPC();

    this.events.emit("updateStats", {
      collected: this.collectedCount,
      reconditioned: this.reconditionedCount,
      distributed: this.distributedCount,
      inventory: this.inventory,
    });

    this.events.emit(
      "showMessage",
      `PC obsolète collecté ! (${this.inventory} en inventaire)`
    );
  }

  private interactWithSpecialObject(obj: SpecialObject): void {
    if (obj.type === "tux") {
      // Si le joueur porte le téléphone et que Tux le cherchait, afficher le message de remerciement
      if (this.isCarryingPhone && obj.phoneFound) {
        const thankYouMessage =
          "Merci beaucoup ! 🐧 Mon Nokia 3310 me manquait tellement ! Tu es un vrai héros du Linux. Voici ta récompense !";

        // Émettre l'événement pour débloquer le jeu Snake AVANT le dialogue
        window.dispatchEvent(new CustomEvent("phoneGivenToTux"));

        window.dispatchEvent(
          new CustomEvent("showDialog", {
            detail: {
              character: "Tux",
              message: thankYouMessage,
              icon: "🐧",
            },
          })
        );

        // Détruire le téléphone porté
        if (this.carriedPhoneSprite) {
          this.carriedPhoneSprite.destroy();
          this.carriedPhoneSprite = null;
        }
        this.isCarryingPhone = false;
        obj.phoneFound = false;

        // Faire disparaître Tux avec une animation
        if (obj.sprite) {
          this.tweens.add({
            targets: obj.sprite,
            y: obj.y - 50,
            alpha: 0,
            scale: 0.5,
            duration: 800,
            ease: "Cubic.easeIn",
            onComplete: () => {
              obj.sprite?.destroy();
              obj.sprite = undefined;
              // Masquer aussi l'icône d'interaction si elle existe
              if (obj.interactIcon) {
                obj.interactIcon.destroy();
                obj.interactIcon = undefined;
              }
            },
          });
        }

        return;
      }

      // Premier contact: demande d'aide pour retrouver le téléphone
      if (!obj.interacted) {
        const dialogMessage =
          "Bonjour jeune NIRDien ! Merci de contribuer à la réutilisation des ordinateurs avec Linux. J'ai besoin d'aide pour retrouver mon Nokia 3310 perdu en ville. Peux-tu m'aider ?";

        const handleYes = () => {
          obj.interacted = true;
          this.spawnPhone();
        };

        const handleNo = () => {
          // L'utilisateur refuse - rien ne se passe
        };

        window.dispatchEvent(
          new CustomEvent("showDialog", {
            detail: {
              character: "Tux",
              message: dialogMessage,
              icon: "🐧",
              showButtons: true,
              onYesCallback: handleYes,
              onNoCallback: handleNo,
            },
          })
        );
      }
    }
  }

  private spawnPhone(): void {
    // Créer le téléphone au milieu à droite de la map
    // Position principale: milieu droit
    let phoneX = this.mapWidth - 250;
    let phoneY = this.mapHeight / 2;

    // Vérifier qu'il n'y a pas de bâtiment/objet à cette position
    let isValid = true;
    for (const zone of this.occupiedZones) {
      if (
        phoneX >= zone.minX &&
        phoneX <= zone.maxX &&
        phoneY >= zone.minY &&
        phoneY <= zone.maxY
      ) {
        isValid = false;
        break;
      }
    }

    // Si la position est occupée, essayer une position alternative
    if (!isValid) {
      phoneY = this.mapHeight / 3; // Plus haut
    }

    // Créer le sprite du téléphone
    const phoneSprite = this.add
      .image(phoneX, phoneY, "nokia_phone")
      .setScale(0.8)
      .setDepth(100);

    // Animation de bobbing du téléphone
    this.tweens.add({
      targets: phoneSprite,
      y: phoneY - 5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inout",
    });

    // Créer l'icône d'interaction
    const interactIcon = this.add
      .image(phoneX, phoneY - 25, "interact_icon")
      .setScale(1.2)
      .setDepth(101)
      .setAlpha(0);

    // Animation d'apparition de l'icône
    this.tweens.add({
      targets: interactIcon,
      alpha: 1,
      duration: 300,
    });

    // Animation de bobbing de l'icône
    this.tweens.add({
      targets: interactIcon,
      y: phoneY - 30,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inout",
    });

    // Ajouter à specialObjects avec la propriété phone
    const specialObject = this.specialObjects[0];
    if (specialObject) {
      specialObject.phone = {
        sprite: phoneSprite,
        interactIcon: interactIcon,
      };
      specialObject.phoneFound = true;
    }
  }

  private handlePhoneInteraction(): void {
    // Trouver le téléphone actif
    const tuxObj = this.specialObjects.find(
      (obj) => obj.type === "tux" && obj.phone
    );
    if (tuxObj && tuxObj.phone) {
      // Mettre le téléphone à la main du joueur
      const phoneSprite = tuxObj.phone.sprite;
      if (phoneSprite) {
        phoneSprite.setPosition(this.player.x + 18, this.player.y - 28);
        phoneSprite.setScale(0.5);
        phoneSprite.setDepth(this.player.depth + 1);

        // Arrêter les animations de bobbing
        this.tweens.killTweensOf(phoneSprite);
        if (tuxObj.phone.interactIcon) {
          this.tweens.killTweensOf(tuxObj.phone.interactIcon);
          tuxObj.phone.interactIcon.destroy();
        }

        // Sauvegarder le sprite du téléphone porté
        this.carriedPhoneSprite = phoneSprite;
        this.isCarryingPhone = true;
      }

      // Supprimer la référence du téléphone spawnné
      tuxObj.phone = undefined;
      this.nearSpecialObject = null;

      // Déclencher le jeu Snake
      window.dispatchEvent(new CustomEvent("snakeGameRequested"));
    }
  }

  private interactWithBuilding(building: Building): void {
    switch (building.type) {
      case "enterprise":
      case "office":
        this.events.emit(
          "showMessage",
          `${building.name}: "Prenez ces vieux PC, on allait les jeter..."`
        );
        break;

      case "workshop":
        if (this.inventory > 0) {
          this.reconditionComputers();
        } else {
          this.events.emit(
            "showMessage",
            '🔧 Atelier NIRD: "Apportez-nous des PC à reconditionner sous Linux !"'
          );
        }
        break;

      case "school":
      case "university": {
        // Vérifier combien de PC ont déjà été distribués à cette école
        const delivery = this.schoolDeliveries.get(building.name) || {
          buildingName: building.name,
          count: 0,
          maxCount: 2,
        };

        if (delivery.count >= delivery.maxCount) {
          this.events.emit(
            "showMessage",
            `${building.name}: "Merci ! Nous avons déjà nos ${delivery.maxCount} ordinateurs !" ✅`
          );
        } else if (this.reconditionedCount > this.distributedCount) {
          this.distributeComputer(building);
        } else {
          this.events.emit(
            "showMessage",
            `${building.name}: "Nous attendons des ordinateurs !"`
          );
        }
        break;
      }

      default:
        this.events.emit("showMessage", `${building.name}`);
        break;
    }
  }

  private reconditionComputers(): void {
    const count = this.inventory;

    // Lancer la scène de l'atelier
    this.enterWorkshop(count);
  }

  /**
   * Lance la scène WorkshopScene pour le reconditionnement
   */
  private enterWorkshop(pcCount: number): void {
    this.isInsideWorkshop = true;

    // Masquer le joueur et désactiver les contrôles
    this.player.setVisible(false);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    // Écran noir de transition
    const blackScreen = this.add
      .rectangle(
        this.cameras.main.scrollX + this.cameras.main.width / 2,
        this.cameras.main.scrollY + this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000
      )
      .setDepth(10000)
      .setAlpha(0)
      .setScrollFactor(0);

    // Fade to black puis lancer WorkshopScene
    this.tweens.add({
      targets: blackScreen,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        blackScreen.destroy();

        // Mettre cette scène en pause
        this.scene.pause("MainScene");
        this.scene.pause("UIScene");

        // Lancer la scène de l'atelier avec les données
        this.scene.launch("WorkshopScene", {
          pcCount: pcCount,
          collectedCount: this.collectedCount,
          reconditionedCount: this.reconditionedCount,
          distributedCount: this.distributedCount,
        });
      },
    });
  }

  /**
   * Appelé quand on revient de WorkshopScene
   */
  private onWorkshopComplete(data: {
    pcsRepaired: number;
    collectedCount: number;
    reconditionedCount: number;
    distributedCount: number;
  }): void {
    // Mettre à jour les compteurs
    this.inventory = 0;
    this.reconditionedCount = data.reconditionedCount;

    // Mettre à jour le PC porté
    this.updateCarriedPC();

    // Réafficher le joueur
    this.player.setVisible(true);
    this.isInsideWorkshop = false;

    // Afficher le message de sortie
    const workshop = this.buildings.find((b) => b.type === "workshop");
    if (workshop) {
      const text = this.add
        .text(
          workshop.x,
          workshop.y - 80,
          `+${data.pcsRepaired} PC Linux ! 🐧`,
          {
            fontSize: "22px",
            color: "#22c55e",
            fontStyle: "bold",
          }
        )
        .setOrigin(0.5)
        .setDepth(9999);

      this.tweens.add({
        targets: text,
        y: workshop.y - 140,
        alpha: 0,
        duration: 1500,
        onComplete: () => text.destroy(),
      });
    }

    this.events.emit("updateStats", {
      collected: this.collectedCount,
      reconditioned: this.reconditionedCount,
      distributed: this.distributedCount,
      inventory: this.inventory,
    });

    this.events.emit(
      "showMessage",
      `🎉 ${data.pcsRepaired} PC reconditionnés ! Distribuez-les aux écoles.`
    );
  }

  private distributeComputer(school: Building): void {
    // Mettre à jour le compteur de l'école
    const delivery = this.schoolDeliveries.get(school.name) || {
      buildingName: school.name,
      count: 0,
      maxCount: 2,
    };
    delivery.count++;
    this.schoolDeliveries.set(school.name, delivery);

    this.distributedCount++;

    // Position fixe pour les 2 PC (pas aléatoire)
    const offsetX = delivery.count === 1 ? -25 : 25;

    const pc = this.add
      .image(school.x + offsetX, school.y + 40, "computer_new")
      .setScale(0)
      .setDepth(school.y + 50);

    this.tweens.add({
      targets: pc,
      scale: 1,
      duration: 300,
      ease: "Back.easeOut",
    });

    const remainingSlots = delivery.maxCount - delivery.count;
    const statusText =
      remainingSlots > 0 ? `(${remainingSlots} place restante)` : "(complet !)";

    const text = this.add
      .text(school.x, school.y - 40, `🎉 +1 PC distribué ! ${statusText}`, {
        fontSize: "18px",
        color: "#ec4899",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(9999);

    this.tweens.add({
      targets: text,
      y: school.y - 90,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });

    // Mettre à jour le sprite du PC porté
    this.updateCarriedPC();

    this.events.emit("updateStats", {
      collected: this.collectedCount,
      reconditioned: this.reconditionedCount,
      distributed: this.distributedCount,
      inventory: this.inventory,
    });

    this.events.emit("showMessage", `PC offert à ${school.name} ! 🐧`);

    // Victoire si tous les 8 PC ont été distribués
    if (this.distributedCount >= 8) {
      // Utiliser setTimeout natif car time.delayedCall est affecté par pause
      setTimeout(() => {
        this.events.emit("victory");
        // Appeler directement UIScene
        const uiScene = this.scene.get("UIScene") as Phaser.Scene & {
          showVictory?: () => void;
        };
        if (uiScene && typeof uiScene.showVictory === "function") {
          uiScene.showVictory();
        }
      }, 500);
    }
  }

  /**
   * Met à jour les sprites des PC portés par le joueur
   * Affiche un PC dans chaque bras quand l'inventaire est à 2
   */
  private updateCarriedPC(): void {
    // Détruire les anciens sprites s'ils existent
    if (this.carriedPCSprite) {
      this.carriedPCSprite.destroy();
      this.carriedPCSprite = null;
    }
    if (this.carriedPCSprite2) {
      this.carriedPCSprite2.destroy();
      this.carriedPCSprite2 = null;
    }

    // Si le joueur a des PC non reconditionnés dans l'inventaire
    if (this.inventory >= 1) {
      // Premier PC (bras droit)
      this.carriedPCSprite = this.add
        .image(0, 0, "computer_old")
        .setScale(0.7)
        .setDepth(9998);
    }
    if (this.inventory >= 2) {
      // Deuxième PC (bras gauche)
      this.carriedPCSprite2 = this.add
        .image(0, 0, "computer_old")
        .setScale(0.7)
        .setDepth(9998);
    }
    // Si le joueur a des PC reconditionnés à distribuer (et pas de PC obsoletes)
    else if (
      this.inventory === 0 &&
      this.reconditionedCount > this.distributedCount
    ) {
      const pcsToDistribute = this.reconditionedCount - this.distributedCount;
      // Premier PC reconditionné (bras droit)
      this.carriedPCSprite = this.add
        .image(0, 0, "computer_new")
        .setScale(0.7)
        .setDepth(9998);
      // Deuxième PC si on en a plus d'un
      if (pcsToDistribute >= 2) {
        this.carriedPCSprite2 = this.add
          .image(0, 0, "computer_new")
          .setScale(0.7)
          .setDepth(9998);
      }
    }
  }
}
