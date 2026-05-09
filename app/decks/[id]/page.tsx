'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { GAMES } from '@/games';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Trash2, Edit2, Check, X, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const spiceEmoji: Record<number, string> = {
  1: '🌱',
  2: '🔥',
  3: '🌶️',
};

export default function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { decks, updateDeck, removeDeck } = useAppStore();
  const deck = decks.find((d) => d.id === id);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(deck?.name || '');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editedCardText, setEditedCardText] = useState('');

  if (!deck) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-xl font-semibold text-white mb-4">Deck not found</h1>
        <Link href="/decks">
          <Button variant="outline">Back to Decks</Button>
        </Link>
      </div>
    );
  }

  const game = GAMES[deck.game];

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateDeck({ ...deck, name: editedName.trim(), source: 'user-edited' });
    }
    setIsEditingName(false);
  };

  const handleDeleteCard = (cardId: string) => {
    const updatedCards = deck.cards.filter((c) => c.id !== cardId);
    updateDeck({ ...deck, cards: updatedCards, source: 'user-edited' });
  };

  const handleSaveCard = (cardId: string) => {
    if (editedCardText.trim()) {
      const updatedCards = deck.cards.map((c) =>
        c.id === cardId ? { ...c, text: editedCardText.trim() } : c
      );
      updateDeck({ ...deck, cards: updatedCards, source: 'user-edited' });
    }
    setEditingCardId(null);
    setEditedCardText('');
  };

  const handleDeleteDeck = () => {
    if (confirm('Are you sure you want to delete this deck?')) {
      removeDeck(deck.id);
      router.push('/decks');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur-lg z-10 px-4 py-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <Link href="/decks" className="flex items-center gap-2 text-slate-400 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/play/${deck.game}`}>
              <Button size="sm" className={cn('bg-gradient-to-r', game.gradient)}>
                <Play className="w-4 h-4 mr-1" />
                Play
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteDeck}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        {/* Deck Info */}
        <div className="mb-6">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-xl font-bold"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveName}>
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditingName(false);
                  setEditedName(deck.name);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{deck.name}</h1>
              <button
                onClick={() => {
                  setEditedName(deck.name);
                  setIsEditingName(true);
                }}
                className="text-slate-400 hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 mt-2 text-slate-400">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-sm bg-gradient-to-r',
                game.gradient
              )}
            >
              {game.name}
            </span>
            <span className="flex items-center gap-1">
              {spiceEmoji[deck.spiceLevel]}
              <span className="text-sm">
                {deck.spiceLevel === 1 ? 'Tame' : deck.spiceLevel === 2 ? 'Medium' : 'Spicy'}
              </span>
            </span>
            <span className="text-sm">{deck.cards.length} cards</span>
          </div>

          {deck.theme && (
            <p className="text-slate-500 mt-1">Theme: {deck.theme}</p>
          )}
        </div>

        {/* Cards List */}
        <div className="space-y-2">
          {deck.cards.map((card, index) => (
            <div
              key={card.id}
              className="bg-slate-900 rounded-xl p-4"
            >
              {editingCardId === card.id ? (
                <div className="flex items-start gap-2">
                  <Input
                    value={editedCardText}
                    onChange={(e) => setEditedCardText(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleSaveCard(card.id)}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingCardId(null);
                      setEditedCardText('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-slate-600 text-sm mr-2">#{index + 1}</span>
                    <span className="text-white">{card.text}</span>
                    {card.category && (
                      <span className="ml-2 text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                        {card.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCardId(card.id);
                        setEditedCardText(card.text);
                      }}
                      className="p-1.5 text-slate-500 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
