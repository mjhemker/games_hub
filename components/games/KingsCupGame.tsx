'use client';

import { KingsCupDeck } from '@/components/KingsCupDeck';
import { GAMES } from '@/games';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function KingsCupGame() {
  const gameConfig = GAMES['kings-cup'];

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-lg">
        <Link href="/" className="text-slate-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold text-white">King's Cup</h1>
        <div className="w-6" />
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col p-4">
        <KingsCupDeck />
      </div>
    </div>
  );
}
