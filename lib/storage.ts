import { CardDeck, AppSettings, GameState, DEFAULT_KINGS_CUP_RULES } from './types';

const STORAGE_KEYS = {
  DECKS: 'dgh:decks',
  SETTINGS: 'dgh:settings',
  GAME_STATE: 'dgh:gameState',
} as const;

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
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getDecks(): CardDeck[] {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DECKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDecks(decks: CardDeck[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
}

export function getDeck(id: string): CardDeck | undefined {
  return getDecks().find((d) => d.id === id);
}

export function saveDeck(deck: CardDeck): void {
  const decks = getDecks();
  const index = decks.findIndex((d) => d.id === deck.id);
  if (index >= 0) {
    decks[index] = deck;
  } else {
    decks.push(deck);
  }
  saveDecks(decks);
}

export function deleteDeck(id: string): void {
  const decks = getDecks().filter((d) => d.id !== id);
  saveDecks(decks);
}

export function getSettings(): AppSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...updates };
  saveSettings(updated);
  return updated;
}

export function getGameState(): GameState {
  if (!isBrowser()) return DEFAULT_GAME_STATE;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    return data ? { ...DEFAULT_GAME_STATE, ...JSON.parse(data) } : DEFAULT_GAME_STATE;
  } catch {
    return DEFAULT_GAME_STATE;
  }
}

export function saveGameState(state: GameState): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
}

export function updateGameState<T extends keyof GameState>(
  game: T,
  updates: Partial<GameState[T]>
): GameState {
  const current = getGameState();
  const updated = {
    ...current,
    [game]: { ...current[game], ...updates },
  };
  saveGameState(updated);
  return updated;
}

export function resetGameState<T extends keyof GameState>(game: T): GameState {
  const current = getGameState();
  const updated = {
    ...current,
    [game]: DEFAULT_GAME_STATE[game],
  };
  saveGameState(updated);
  return updated;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
