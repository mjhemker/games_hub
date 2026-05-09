'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeadsUpView } from '@/components/HeadsUpView';
import { Card, CardDeck } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { generateId } from '@/lib/storage';
import { Kicker, ItalicAccent, PrimaryButton } from '@/components/ui/design-system';

import idGameData from '@/data/builtin/id-game.json';

type Category = keyof typeof idGameData;

const CATEGORIES: { id: Category; name: string; emoji: string }[] = [
  { id: 'celebrities', name: 'Celebrities', emoji: '⭐' },
  { id: 'movies', name: 'Movies', emoji: '🎬' },
  { id: 'animals', name: 'Animals', emoji: '🐾' },
  { id: 'brands', name: 'Brands', emoji: '🏷️' },
  { id: 'songs', name: 'Songs', emoji: '🎵' },
  { id: 'drunk-logic', name: 'Drunk Logic', emoji: '🍺' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function IdGameComponent() {
  const { addDeck, settings } = useAppStore();

  const [phase, setPhase] = useState<'select' | 'playing'>('select');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'custom' | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startWithCategory = (category: Category) => {
    const categoryCards = idGameData[category] as Card[];
    const shuffled = shuffleArray(categoryCards);
    setCards(shuffled);
    setSelectedCategory(category);
    setPhase('playing');
  };

  const generateCustomCategory = async () => {
    if (!customCategory.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'id-game',
          category: customCategory,
          count: 50,
          apiKeyOverride: settings.geminiApiKeyOverride,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cards');
      }

      const shuffled = shuffleArray(data.cards as Card[]);
      setCards(shuffled);
      setSelectedCategory('custom');
      setPhase('playing');

      // Save as deck
      const newDeck: CardDeck = {
        id: generateId(),
        name: customCategory,
        game: 'id-game',
        theme: customCategory,
        spiceLevel: 1,
        cards: data.cards,
        source: 'ai-generated',
        createdAt: Date.now(),
      };
      addDeck(newDeck);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRoundEnd = (score: number, skipped: number) => {
    console.log(`Round ended: ${score} correct, ${skipped} skipped`);
  };

  if (phase === 'playing') {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '64px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setPhase('select')}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: 1.5,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ← ID GAME
            </button>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 16,
                color: 'var(--cream)',
              }}
            >
              {selectedCategory === 'custom' ? customCategory : CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </div>
          </div>
        </div>

        <HeadsUpView cards={cards} onRoundEnd={handleRoundEnd} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '70px 22px 0' }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: 1.5,
            textDecoration: 'none',
          }}
        >
          ← INDEX
        </Link>

        <Kicker color="var(--game-id-game)" className="mt-8">
          Nº 06
        </Kicker>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 44,
            lineHeight: 0.95,
            marginTop: 8,
            letterSpacing: -0.8,
            color: 'var(--cream)',
          }}
        >
          The ID<br />
          <ItalicAccent>Game</ItalicAccent>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            color: 'var(--cream-2)',
            marginTop: 12,
            lineHeight: 1.5,
          }}
        >
          Hold the phone to your forehead. Friends give you clues.
        </div>
      </div>

      {/* Category Selection */}
      <div style={{ padding: '34px 22px', paddingBottom: 120 }}>
        <Kicker color="var(--muted)">CHOOSE A CATEGORY</Kicker>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12 }}>
          {CATEGORIES.map(({ id, name, emoji }) => (
            <button
              key={id}
              onClick={() => startWithCategory(id)}
              style={{
                padding: 20,
                border: '1px solid var(--rule)',
                background: 'var(--ink-2)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 28 }}>{emoji}</span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 15,
                  color: 'var(--cream)',
                }}
              >
                {name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Category */}
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              border: '1px solid var(--rule)',
              padding: 16,
              background: 'var(--ink-2)',
            }}
          >
            <Kicker color="var(--muted)">CUSTOM CATEGORY</Kicker>

            {error && (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  border: '1px solid #ef4444',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#ef4444',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                type="text"
                placeholder="e.g., 80s Rock Bands"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateCustomCategory()}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  border: '1px solid var(--rule)',
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                }}
              />
              <button
                onClick={generateCustomCategory}
                disabled={isGenerating || !customCategory.trim()}
                style={{
                  padding: '12px 20px',
                  background: customCategory.trim() && !isGenerating ? 'var(--cream)' : 'var(--ink)',
                  color: customCategory.trim() && !isGenerating ? 'var(--ink)' : 'var(--muted)',
                  border: '1px solid var(--rule)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: 1,
                  cursor: customCategory.trim() && !isGenerating ? 'pointer' : 'default',
                }}
              >
                {isGenerating ? '...' : 'GENERATE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
