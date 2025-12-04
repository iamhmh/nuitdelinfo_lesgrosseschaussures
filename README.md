# 🌿 Village Numérique Résistant

> Projet réalisé lors de **La Nuit de l'Info 2025** par l'équipe **Les Grosses Chaussures**

## 🎯 Objectif pédagogique

Ce projet vise à sensibiliser le public à la démarche **NIRD** (Numérique Inclusif, Responsable, Durable et de Réemploi) à travers un mini-jeu interactif.

Le joueur apprend comment :
- ♻️ **Récupérer** des ordinateurs obsolètes dans les entreprises
- 🐧 **Reconditionner** ces machines sous Linux pour leur donner une seconde vie
- 🏫 **Redistribuer** les équipements aux établissements scolaires

## 🎮 Concept du jeu

Un mini-jeu isométrique WebGL où le joueur :
1. Se déplace dans un village numérique virtuel
2. Collecte des PC sous Windows obsolètes dans différentes entreprises
3. Les amène à un atelier NIRD pour les reconditionner sous Linux
4. Les redistribue dans des écoles pour promouvoir le réemploi et l'open-source

## 🛠️ Stack technique

| Technologie | Usage |
|-------------|-------|
| **React + Vite + TypeScript** | Framework principal |
| **React Router** | Navigation entre pages |
| **TailwindCSS** | Styles et design |
| **react-three-fiber + drei** | Ordinateur 3D animé sur la page d'accueil |
| **Phaser 3** | Moteur de jeu isométrique |
| **Zustand** | Gestion d'état global du jeu |

## 📁 Structure du projet

```
src/
├── components/
│   └── Computer3D.tsx      # Composant 3D de l'ordinateur (Three.js)
├── game/
│   ├── Game.tsx            # Wrapper React pour Phaser
│   ├── MainScene.ts        # Scène principale du jeu
│   └── phaserConfig.ts     # Configuration Phaser
├── pages/
│   ├── Home.tsx            # Page d'accueil avec 3D
│   ├── GamePage.tsx        # Page du jeu Phaser
│   └── About.tsx           # Page À propos (démarche NIRD)
├── store/
│   └── gameState.ts        # État global Zustand
├── assets/                 # Ressources (images, sons, etc.)
├── App.tsx                 # Routing principal
├── main.tsx                # Point d'entrée
└── index.css               # Styles globaux + Tailwind
```

## 🚀 Lancement du projet

### Prérequis
- Node.js 20+ (utiliser `nvm use 20` si nécessaire)
- npm ou yarn

### Installation

```bash
# Cloner le projet
git clone https://github.com/iamhmh/nuitdelinfo_lesgrosseschaussures.git
cd nuitdelinfo_lesgrosseschaussures

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le projet sera accessible sur `http://localhost:5173`

### Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Prévisualiser le build
npm run lint     # Linter le code
```

## 🎯 Routes de l'application

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil avec ordinateur 3D animé |
| `/game` | Mini-jeu isométrique Phaser |
| `/a-propos` | Explication de la démarche NIRD |

## 🎨 Ce qui reste à faire

- [ ] Ajouter les assets graphiques (sprites, tilemaps)
- [ ] Implémenter la boucle de gameplay complète
- [ ] Ajouter les dialogues et la narration NIRD
- [ ] Créer les animations du personnage
- [ ] Ajouter les interactions avec les bâtiments
- [ ] Implémenter le système de missions
- [ ] Ajouter des sons et effets sonores

## 👥 Équipe

**Les Grosses Chaussures** - 4 développeurs passionnés pour 14h de code intensif !

## 📜 Licence

Projet open-source réalisé dans le cadre de La Nuit de l'Info 2025.

---

*Fait avec 💚 pour un numérique plus responsable*
