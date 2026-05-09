'use client';

import Link from 'next/link';
import { GameConfig } from '@/lib/types';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameTileProps {
  game: GameConfig;
  disabled?: boolean;
}

export function GameTile({ game, disabled }: GameTileProps) {
  const IconComponent = Icons[game.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 h-40 flex flex-col justify-between',
        'bg-gradient-to-br',
        game.gradient,
        'transition-all duration-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
      )}
    >
      {disabled && (
        <div className="absolute top-2 right-2 bg-black/30 rounded-full px-2 py-0.5 text-xs font-medium">
          Coming Soon
        </div>
      )}
      <div className="flex items-start justify-between">
        {IconComponent && <IconComponent className="w-8 h-8 text-white/90" />}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{game.name}</h3>
        <p className="text-sm text-white/80 mt-1">{game.tagline}</p>
      </div>
    </div>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link href={`/play/${game.id}`} className="block">
      {content}
    </Link>
  );
}
