'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { GameType } from '@/lib/types';
import { GAMES } from '@/games';
import { BeerPressureGame } from '@/components/games/BeerPressureGame';
import { TruthOrDrinkGame } from '@/components/games/TruthOrDrinkGame';
import { IdGameComponent } from '@/components/games/IdGameComponent';
import { KingsCupGame } from '@/components/games/KingsCupGame';
import { MostLikelyToGame } from '@/components/games/MostLikelyToGame';
import { NeverHaveIEverGame } from '@/components/games/NeverHaveIEverGame';
import { CategoriesGame } from '@/components/games/CategoriesGame';
import { SchlebensGame } from '@/components/games/SchlebensGame';

const GAME_COMPONENTS: Partial<Record<GameType, React.ComponentType>> = {
  'beer-pressure': BeerPressureGame,
  'truth-or-drink': TruthOrDrinkGame,
  'id-game': IdGameComponent,
  'kings-cup': KingsCupGame,
  'most-likely-to': MostLikelyToGame,
  'never-have-i-ever': NeverHaveIEverGame,
  'categories': CategoriesGame,
  'schlebens': SchlebensGame,
};

export default function GamePlayPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game: gameSlug } = use(params);
  const gameType = gameSlug as GameType;
  const gameConfig = GAMES[gameType];

  if (!gameConfig) {
    notFound();
  }

  // Check if game is available (Phase 1 only for now)
  if (gameConfig.phase > 1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-bold text-white mb-2">{gameConfig.name}</h1>
        <p className="text-slate-400">Coming soon in a future update!</p>
      </div>
    );
  }

  const GameComponent = GAME_COMPONENTS[gameType];

  if (!GameComponent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-2xl font-bold text-white mb-2">{gameConfig.name}</h1>
        <p className="text-slate-400">Game component not found</p>
      </div>
    );
  }

  return <GameComponent />;
}
