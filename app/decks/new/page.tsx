'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GAMES } from '@/games';
import { GameType, SpiceLevel, CardDeck } from '@/lib/types';
import { generateId } from '@/lib/storage';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton } from '@/components/ui/design-system';

// Games that support deck generation (have themes)
const DECK_GAMES = Object.values(GAMES).filter(g => g.supportsTheme && g.id !== 'movie-mode');

export default function NewDeckPage() {
  const router = useRouter();
  const { addDeck, settings } = useAppStore();

  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [theme, setTheme] = useState('');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(settings.defaultSpice);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedGameConfig = selectedGame ? GAMES[selectedGame] : null;
  const supportsSpice = selectedGameConfig?.supportsSpice ?? false;

  const handleGenerate = async () => {
    if (!selectedGame || !theme.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: selectedGame,
          spice: supportsSpice ? spiceLevel : 2,
          theme: theme.trim(),
          count: 25,
          // Don't pass apiKeyOverride - use server's env key
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate deck');
      }

      // Create the deck
      const newDeck: CardDeck = {
        id: generateId(),
        name: `${theme.trim()}`,
        game: selectedGame,
        theme: theme.trim(),
        spiceLevel: supportsSpice ? spiceLevel : 2,
        cards: data.cards,
        source: 'ai-generated',
        createdAt: Date.now(),
      };

      addDeck(newDeck);
      router.push('/decks');
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate deck. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '64px 22px 0' }}>
        <Link
          href="/decks"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: 1.5,
            textDecoration: 'none',
          }}
        >
          ← DECKS
        </Link>

        <Kicker color="var(--copper)" className="mt-8">
          CREATE
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
          New <ItalicAccent>deck</ItalicAccent>
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
          AI will generate 25 cards based on your theme.
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '30px 22px' }}>
        {/* Game Selection */}
        <div style={{ marginBottom: 30 }}>
          <Kicker color="var(--muted)">GAME TYPE</Kicker>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DECK_GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                style={{
                  padding: '16px 18px',
                  border: selectedGame === game.id ? '1px solid var(--copper)' : '1px solid var(--rule)',
                  background: selectedGame === game.id ? 'var(--ink-2)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 18,
                      color: selectedGame === game.id ? 'var(--cream)' : 'var(--cream-2)',
                    }}
                  >
                    {game.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--muted)',
                      marginTop: 4,
                      letterSpacing: 0.5,
                    }}
                  >
                    {game.tagline}
                  </div>
                </div>
                {selectedGame === game.id && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--copper)',
                      letterSpacing: 1,
                    }}
                  >
                    SELECTED
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Input */}
        <div style={{ marginBottom: 30 }}>
          <Kicker color="var(--muted)">THEME</Kicker>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., college memories, road trip, 90s nostalgia"
            style={{
              width: '100%',
              marginTop: 12,
              padding: '16px 18px',
              border: '1px solid var(--rule)',
              background: 'var(--ink-2)',
              color: 'var(--cream)',
              fontFamily: 'var(--font-serif)',
              fontSize: 16,
            }}
          />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--muted)',
              marginTop: 8,
              letterSpacing: 0.5,
            }}
          >
            Describe the vibe or topic for your deck
          </div>
        </div>

        {/* Spice Level (if supported) */}
        {selectedGame && supportsSpice && (
          <div style={{ marginBottom: 30 }}>
            <Kicker color="var(--muted)">SPICE LEVEL</Kicker>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              {([1, 2, 3] as SpiceLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setSpiceLevel(level)}
                  style={{
                    flex: 1,
                    padding: '14px 12px',
                    border: spiceLevel === level ? '1px solid var(--copper)' : '1px solid var(--rule)',
                    background: spiceLevel === level ? 'var(--ink-2)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: 16,
                      color: spiceLevel === level ? 'var(--cream)' : 'var(--cream-2)',
                    }}
                  >
                    {level === 1 ? 'Tame' : level === 2 ? 'Medium' : 'Spicy'}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--muted)',
                      marginTop: 4,
                    }}
                  >
                    {'•'.repeat(level)}{'·'.repeat(3 - level)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div
            style={{
              padding: 16,
              marginBottom: 20,
              border: '1px solid var(--burgundy)',
              background: 'rgba(139, 69, 69, 0.1)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                color: 'var(--burgundy)',
              }}
            >
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div style={{ position: 'fixed', bottom: 100, left: 16, right: 16 }}>
        <PrimaryButton
          onClick={handleGenerate}
          disabled={!selectedGame || !theme.trim() || isGenerating}
        >
          {isGenerating ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >
                ◐
              </motion.span>
              GENERATING...
            </span>
          ) : (
            'GENERATE DECK →'
          )}
        </PrimaryButton>
      </div>

      {/* Bottom spacing for nav */}
      <div style={{ height: 180 }} />
    </div>
  );
}
