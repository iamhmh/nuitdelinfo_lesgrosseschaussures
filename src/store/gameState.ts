/**
 * Store Zustand pour gérer l'état global du jeu
 * Gère les ordinateurs collectés, reconditionnés et distribués
 */
import { create } from 'zustand'

// Types pour les ordinateurs
export interface Computer {
  id: string
  status: 'obsolete' | 'collected' | 'reconditioned' | 'distributed'
  origin: string // Nom de l'entreprise d'origine
  destination?: string // École de destination
}

// État global du jeu
interface GameState {
  // Compteurs
  computersCollected: number
  computersReconditioned: number
  computersDistributed: number
  
  // Liste des ordinateurs
  computers: Computer[]
  
  // État du joueur
  playerName: string
  currentLocation: 'village' | 'enterprise' | 'workshop' | 'school'
  
  // Messages/dialogues
  currentMessage: string | null
  
  // Actions
  collectComputer: (origin: string) => void
  reconditionComputer: (computerId: string) => void
  distributeComputer: (computerId: string, school: string) => void
  setPlayerName: (name: string) => void
  setLocation: (location: GameState['currentLocation']) => void
  setMessage: (message: string | null) => void
  resetGame: () => void
}

// Création du store
export const useGameStore = create<GameState>((set) => ({
  // État initial
  computersCollected: 0,
  computersReconditioned: 0,
  computersDistributed: 0,
  computers: [],
  playerName: 'Joueur',
  currentLocation: 'village',
  currentMessage: null,

  // Collecter un ordinateur obsolète
  collectComputer: (origin: string) => {
    const newComputer: Computer = {
      id: `pc-${Date.now()}`,
      status: 'collected',
      origin,
    }
    set((state) => ({
      computers: [...state.computers, newComputer],
      computersCollected: state.computersCollected + 1,
    }))
  },

  // Reconditionner un ordinateur (passer sous Linux)
  reconditionComputer: (computerId: string) => {
    set((state) => ({
      computers: state.computers.map((pc) =>
        pc.id === computerId ? { ...pc, status: 'reconditioned' as const } : pc
      ),
      computersReconditioned: state.computersReconditioned + 1,
    }))
  },

  // Distribuer un ordinateur à une école
  distributeComputer: (computerId: string, school: string) => {
    set((state) => ({
      computers: state.computers.map((pc) =>
        pc.id === computerId
          ? { ...pc, status: 'distributed' as const, destination: school }
          : pc
      ),
      computersDistributed: state.computersDistributed + 1,
    }))
  },

  // Définir le nom du joueur
  setPlayerName: (name: string) => set({ playerName: name }),

  // Changer de lieu
  setLocation: (location) => set({ currentLocation: location }),

  // Afficher un message/dialogue
  setMessage: (message) => set({ currentMessage: message }),

  // Réinitialiser le jeu
  resetGame: () =>
    set({
      computersCollected: 0,
      computersReconditioned: 0,
      computersDistributed: 0,
      computers: [],
      currentLocation: 'village',
      currentMessage: null,
    }),
}))
