'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardDeck, GameType, SpiceLevel } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { Layers, Plus, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpiceGate } from './SpiceGateModal';

interface DeckPickerProps {
  game: GameType;
  currentDeckId: string | null;
  onSelectDeck: (deck: CardDeck) => void;
  onGenerateDeck: (theme: string, spice: SpiceLevel) => Promise<void>;
  builtInDecks: CardDeck[];
}

const spiceLevels: { level: SpiceLevel; label: string; icon: React.ReactNode }[] = [
  { level: 1, label: 'Tame', icon: <span className="text-green-400">🌱</span> },
  { level: 2, label: 'Medium', icon: <span className="text-yellow-400">🔥</span> },
  { level: 3, label: 'Spicy', icon: <span className="text-red-400">🌶️</span> },
];

export function DeckPicker({
  game,
  currentDeckId,
  onSelectDeck,
  onGenerateDeck,
  builtInDecks,
}: DeckPickerProps) {
  const { decks, settings } = useAppStore();
  const { checkSpice3Access, isUnlocked } = useSpiceGate();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('');
  const [selectedSpice, setSelectedSpice] = useState<SpiceLevel>(settings.defaultSpice);
  const [isGenerating, setIsGenerating] = useState(false);

  const savedDecks = decks.filter((d) => d.game === game && d.source !== 'built-in');
  const allDecks = [...builtInDecks, ...savedDecks];

  const handleGenerate = async () => {
    const generate = async () => {
      setIsGenerating(true);
      try {
        await onGenerateDeck(theme || 'general party', selectedSpice);
        setTheme('');
        setIsOpen(false);
      } finally {
        setIsGenerating(false);
      }
    };

    if (selectedSpice === 3 && !isUnlocked) {
      checkSpice3Access(generate);
    } else {
      await generate();
    }
  };

  const handleSpiceSelect = (level: SpiceLevel) => {
    if (level === 3 && !isUnlocked) {
      checkSpice3Access(() => setSelectedSpice(level));
    } else {
      setSelectedSpice(level);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="sm" className="text-white/70 hover:text-white" />}
      >
        <Layers className="w-4 h-4 mr-2" />
        Switch Deck
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-slate-900 border-slate-700 h-[80vh]">
        <SheetHeader>
          <SheetTitle className="text-white">Choose a Deck</SheetTitle>
          <SheetDescription className="text-slate-400">
            Select an existing deck or generate a new one
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* Generate New */}
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Generate with AI</h3>
            </div>

            <Input
              placeholder="Theme (e.g., couples, work friends, summer vibes)"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />

            <div className="flex gap-2">
              {spiceLevels.map(({ level, label, icon }) => (
                <button
                  key={level}
                  onClick={() => handleSpiceSelect(level)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all',
                    selectedSpice === level
                      ? 'bg-slate-600 ring-2 ring-purple-500'
                      : 'bg-slate-700 hover:bg-slate-600',
                    level === 3 && !isUnlocked && 'opacity-60'
                  )}
                >
                  {icon}
                  <span className="text-sm text-white">{label}</span>
                  {level === 3 && !isUnlocked && (
                    <span className="text-xs text-slate-400">🔒</span>
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Deck
                </>
              )}
            </Button>
          </div>

          {/* Existing Decks */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Your Decks
            </h3>

            {allDecks.length === 0 ? (
              <p className="text-slate-500 text-sm">No decks yet. Generate one above!</p>
            ) : (
              <div className="space-y-2">
                {allDecks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => {
                      onSelectDeck(deck);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all',
                      deck.id === currentDeckId
                        ? 'bg-purple-600/30 ring-2 ring-purple-500'
                        : 'bg-slate-800 hover:bg-slate-700'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{deck.name}</p>
                        <p className="text-sm text-slate-400">
                          {deck.cards.length} cards • {deck.theme || 'General'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {deck.spiceLevel === 1 && <span className="text-green-400">🌱</span>}
                        {deck.spiceLevel === 2 && <span className="text-yellow-400">🔥</span>}
                        {deck.spiceLevel === 3 && <span className="text-red-400">🌶️</span>}
                        {deck.source === 'built-in' && (
                          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400">
                            Built-in
                          </span>
                        )}
                        {deck.source === 'ai-generated' && (
                          <span className="text-xs bg-purple-700/50 px-2 py-0.5 rounded text-purple-300">
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
