export type GameType =
  | 'beer-pressure'
  | 'truth-or-drink'
  | 'id-game'
  | 'kings-cup'
  | 'most-likely-to'
  | 'never-have-i-ever'
  | 'paranoia'
  | 'categories'
  | 'power-hour'
  | 'movie-mode'
  | 'schlebens';

export type CardCategory =
  | 'challenge'
  | 'question'
  | 'rule'
  | 'drink'
  | 'truth'
  | 'dare'
  | 'general';

export type Card = {
  id: string;
  text: string;
  category?: CardCategory;
  drinkCount?: number;
};

export type SpiceLevel = 1 | 2 | 3;

export type CardDeck = {
  id: string;
  name: string;
  game: GameType;
  theme?: string;
  spiceLevel: SpiceLevel;
  cards: Card[];
  source: 'built-in' | 'ai-generated' | 'user-edited';
  createdAt: number;
};

export type AppSettings = {
  geminiApiKeyOverride?: string;
  defaultSpice: SpiceLevel;
  spice3Unlocked: boolean;
  hapticsEnabled: boolean;
  theme: 'dark' | 'light';
  kingsCupRules: Record<string, string>;
};

export type BeerPressureState = {
  currentDeckId: string | null;
  selectedDeckIds?: string[];
  currentCardIndex: number;
  activeRules: Card[];
  favorites: string[];
  players: string[];
  currentPlayerIndex: number;
};

export type TruthOrDrinkState = {
  currentDeckId: string | null;
  currentCardIndex: number;
  playerNames: string[];
  currentPlayerIndex: number;
};

export type IdGameState = {
  currentDeckId: string | null;
  currentCardIndex: number;
  score: number;
  skipped: number;
  isPlaying: boolean;
  timeRemaining: number;
  players: string[];
};

export type KingsCupState = {
  deck: { rank: string; suit: string }[];
  drawnCards: { rank: string; suit: string }[];
  kingsDrawn: number;
  isGameOver: boolean;
};

export type MostLikelyToState = {
  currentDeckId: string | null;
  currentCardIndex: number;
  playerNames: string[];
  scores: Record<string, number>;
};

export type NeverHaveIEverState = {
  currentDeckId: string | null;
  currentCardIndex: number;
};

export type CategoriesState = {
  currentCategory: string | null;
  playerNames: string[];
  currentPlayerIndex: number;
  eliminatedPlayers: string[];
  isTimerRunning: boolean;
  timeRemaining: number;
};

export type ParanoiaState = {
  currentDeckId: string | null;
  currentCardIndex: number;
  playerNames: string[];
  currentPlayerIndex: number;
  lastCoinResult: 'heads' | 'tails' | null;
};

export type PowerHourState = {
  isPlaying: boolean;
  minutesPassed: number;
  currentCardIndex: number;
  mode: 'power-hour' | 'centurion';
};

export type MovieModeState = {
  currentDeckId: string | null;
  checkedRules: string[];
};

export type SchlebensState = {
  totalRolls: number;
  schlebensCount: number;
};

export type GameState = {
  'beer-pressure': BeerPressureState;
  'truth-or-drink': TruthOrDrinkState;
  'id-game': IdGameState;
  'kings-cup': KingsCupState;
  'most-likely-to': MostLikelyToState;
  'never-have-i-ever': NeverHaveIEverState;
  'categories': CategoriesState;
  'paranoia': ParanoiaState;
  'power-hour': PowerHourState;
  'movie-mode': MovieModeState;
  'schlebens': SchlebensState;
};

export type GameConfig = {
  id: GameType;
  name: string;
  tagline: string;
  blurb?: string;
  icon: string;
  gradient: string;
  accent?: string;
  num?: string;
  phase: 1 | 2 | 3;
  supportsSpice: boolean;
  supportsTheme: boolean;
};

export const DEFAULT_KINGS_CUP_RULES: Record<string, string> = {
  'A': 'Waterfall - Everyone drinks in order, can\'t stop until person before stops',
  '2': 'You - Point at someone, they drink',
  '3': 'Me - You drink',
  '4': 'Floor - Last to touch the floor drinks',
  '5': 'Guys - All guys drink',
  '6': 'Chicks - All girls drink',
  '7': 'Heaven - Last to raise hand drinks',
  '8': 'Mate - Pick someone to drink with you for the rest of the game',
  '9': 'Rhyme - Say a word, go around rhyming. First to fail drinks',
  '10': 'Categories - Pick a category, go around naming items. First to fail drinks',
  'J': 'Never Have I Ever - Put up 3 fingers, play a round',
  'Q': 'Question Master - Anyone who answers your questions drinks',
  'K': 'King\'s Cup - Pour into center cup. 4th King drinks it!',
};
