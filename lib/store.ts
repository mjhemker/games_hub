'use client';

import { create } from 'zustand';
import { CardDeck, AppSettings, GameState, GameType, DEFAULT_KINGS_CUP_RULES } from './types';
import * as storage from './storage';

interface AppStore {
  // Decks
  decks: CardDeck[];
  loadDecks: () => void;
  addDeck: (deck: CardDeck) => void;
  updateDeck: (deck: CardDeck) => void;
  removeDeck: (id: string) => void;
  getDecksByGame: (game: GameType) => CardDeck[];

  // Settings
  settings: AppSettings;
  loadSettings: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  unlockSpice3: () => void;

  // Game State
  gameState: GameState;
  loadGameState: () => void;
  updateGameState: <T extends keyof GameState>(game: T, updates: Partial<GameState[T]>) => void;
  resetGameState: (game: GameType) => void;

  // UI State
  isSpiceGateOpen: boolean;
  setSpiceGateOpen: (open: boolean) => void;
  pendingSpiceAction: (() => void) | null;
  setPendingSpiceAction: (action: (() => void) | null) => void;

  // Initialization
  isInitialized: boolean;
  initialize: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultSpice: 2,
  spice3Unlocked: false,
  hapticsEnabled: true,
  theme: 'dark',
  kingsCupRules: DEFAULT_KINGS_CUP_RULES,
};

const DEFAULT_GAME_STATE: GameState = {
  'beer-pressure': {
    currentDeckId: null,
    currentCardIndex: 0,
    activeRules: [],
    favorites: [],
    players: [],
    currentPlayerIndex: 0,
  },
  'truth-or-drink': {
    currentDeckId: null,
    currentCardIndex: 0,
    playerNames: [],
    currentPlayerIndex: 0,
  },
  'id-game': {
    currentDeckId: null,
    currentCardIndex: 0,
    score: 0,
    skipped: 0,
    isPlaying: false,
    timeRemaining: 60,
    players: [],
  },
  'kings-cup': {
    deck: [],
    drawnCards: [],
    kingsDrawn: 0,
    isGameOver: false,
  },
  'most-likely-to': {
    currentDeckId: null,
    currentCardIndex: 0,
    playerNames: [],
    scores: {},
  },
  'never-have-i-ever': {
    currentDeckId: null,
    currentCardIndex: 0,
  },
  'categories': {
    currentCategory: null,
    playerNames: [],
    currentPlayerIndex: 0,
    eliminatedPlayers: [],
    isTimerRunning: false,
    timeRemaining: 5,
  },
  'paranoia': {
    currentDeckId: null,
    currentCardIndex: 0,
    playerNames: [],
    currentPlayerIndex: 0,
    lastCoinResult: null,
  },
  'power-hour': {
    isPlaying: false,
    minutesPassed: 0,
    currentCardIndex: 0,
    mode: 'power-hour',
  },
  'movie-mode': {
    currentDeckId: null,
    checkedRules: [],
  },
  'schlebens': {
    totalRolls: 0,
    schlebensCount: 0,
  },
};

export const useAppStore = create<AppStore>((set, get) => ({
  // Decks
  decks: [],
  loadDecks: () => {
    const decks = storage.getDecks();
    set({ decks });
  },
  addDeck: (deck) => {
    storage.saveDeck(deck);
    set((state) => ({ decks: [...state.decks, deck] }));
  },
  updateDeck: (deck) => {
    storage.saveDeck(deck);
    set((state) => ({
      decks: state.decks.map((d) => (d.id === deck.id ? deck : d)),
    }));
  },
  removeDeck: (id) => {
    storage.deleteDeck(id);
    set((state) => ({
      decks: state.decks.filter((d) => d.id !== id),
    }));
  },
  getDecksByGame: (game) => {
    return get().decks.filter((d) => d.game === game);
  },

  // Settings
  settings: DEFAULT_SETTINGS,
  loadSettings: () => {
    const settings = storage.getSettings();
    set({ settings });
  },
  updateSettings: (updates) => {
    const updated = storage.updateSettings(updates);
    set({ settings: updated });
  },
  unlockSpice3: () => {
    const updated = storage.updateSettings({ spice3Unlocked: true });
    set({ settings: updated });
  },

  // Game State
  gameState: DEFAULT_GAME_STATE,
  loadGameState: () => {
    const gameState = storage.getGameState();
    set({ gameState });
  },
  updateGameState: (game, updates) => {
    const updated = storage.updateGameState(game, updates);
    set({ gameState: updated });
  },
  resetGameState: (game) => {
    const updated = storage.resetGameState(game);
    set({ gameState: updated });
  },

  // UI State
  isSpiceGateOpen: false,
  setSpiceGateOpen: (open) => set({ isSpiceGateOpen: open }),
  pendingSpiceAction: null,
  setPendingSpiceAction: (action) => set({ pendingSpiceAction: action }),

  // Initialization
  isInitialized: false,
  initialize: () => {
    if (get().isInitialized) return;
    get().loadDecks();
    get().loadSettings();
    get().loadGameState();
    set({ isInitialized: true });
  },
}));

// Utility hook for haptic feedback
export function useHaptics() {
  const { settings } = useAppStore();

  const vibrate = (pattern: number | number[] = 50) => {
    if (settings.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  return { vibrate };
}
