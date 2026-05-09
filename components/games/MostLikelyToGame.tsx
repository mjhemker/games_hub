'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppStore, useHaptics } from '@/lib/store';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton, PlayerChip, PlayerInput } from '@/components/ui/design-system';
import { CardDeck, Card } from '@/lib/types';

import mostLikelyToCards from '@/data/builtin/most-likely-to.json';

const BUILT_IN_DECK: CardDeck = {
  id: 'most-likely-to-builtin',
  name: 'Classic',
  game: 'most-likely-to',
  theme: 'general',
  spiceLevel: 2,
  cards: mostLikelyToCards as Card[],
  source: 'built-in',
  createdAt: 0,
};

type GamePhase = 'setup' | 'playing';

export function MostLikelyToGame() {
  const { vibrate } = useHaptics();

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentDeck] = useState<CardDeck>(BUILT_IN_DECK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  const addPlayer = (name: string) => {
    setPlayers([...players, name]);
    setScores((prev) => ({ ...prev, [name]: 0 }));
  };

  const removePlayer = (index: number) => {
    const playerName = players[index];
    setPlayers(players.filter((_, i) => i !== index));
    setScores((prev) => {
      const newScores = { ...prev };
      delete newScores[playerName];
      return newScores;
    });
  };

  const startGame = () => {
    if (players.length >= 3) {
      setPhase('playing');
      setCurrentIndex(0);
    }
  };

  const voteForPlayer = (playerName: string) => {
    vibrate(50);
    setScores((prev) => ({
      ...prev,
      [playerName]: (prev[playerName] || 0) + 1,
    }));
  };

  const nextCard = () => {
    vibrate(50);
    setCurrentIndex((prev) => prev + 1);
    setCardKey(prev => prev + 1);
  };

  const handleBackToSetup = () => {
    setPhase('setup');
  };

  const handleEnd = () => {
    if (confirm('End the game?')) {
      setPhase('setup');
      setCurrentIndex(0);
      setScores(Object.fromEntries(players.map((p) => [p, 0])));
    }
  };

  const currentCard = currentDeck.cards[currentIndex];
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const isOutOfCards = currentIndex >= currentDeck.cards.length;

  // ─── LOBBY SCREEN ───────────────────────────────────────────────
  if (phase === 'setup') {
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

          <Kicker color="var(--game-most-likely-to)" className="mt-8">
            Nº 04
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
            Most Likely<br />
            <ItalicAccent>To</ItalicAccent>
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
            Point at who fits best. Most votes drinks.
          </div>

          {/* Players */}
          <div style={{ marginTop: 30 }}>
            <Kicker color="var(--muted)">AT THE TABLE</Kicker>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {players.map((name, i) => (
                <PlayerChip key={i} name={name} onRemove={() => removePlayer(i)} />
              ))}
              <PlayerInput onAdd={addPlayer} />
            </div>
            {players.length < 3 && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--muted)',
                  marginTop: 12,
                  letterSpacing: 0.5,
                }}
              >
                Add at least 3 players to start
              </div>
            )}
          </div>

          {/* Deck Info */}
          <div style={{ marginTop: 34 }}>
            <Kicker color="var(--muted)">DECK</Kicker>
            <div
              style={{
                marginTop: 10,
                padding: 16,
                border: '1px solid var(--rule)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 20,
                    fontStyle: 'italic',
                    color: 'var(--cream)',
                  }}
                >
                  {currentDeck.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--muted)',
                  }}
                >
                  {currentDeck.cards.length} PROMPTS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16 }}>
          <PrimaryButton onClick={startGame} disabled={players.length < 3}>
            Begin →
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // ─── GAME OVER ────────────────────────────────────────────
  if (isOutOfCards) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ textAlign: 'center', padding: 22, width: '100%', maxWidth: 360 }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 36,
              color: 'var(--cream)',
              marginBottom: 8,
            }}
          >
            Game <ItalicAccent>Over</ItalicAccent>!
          </div>

          {/* Final Scores */}
          <div
            style={{
              border: '1px solid var(--rule)',
              padding: 16,
              marginTop: 24,
              marginBottom: 24,
            }}
          >
            <Kicker color="var(--muted)">FINAL SCORES</Kicker>
            <div style={{ marginTop: 12 }}>
              {sortedScores.map(([player, score], index) => (
                <div
                  key={player}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: index < sortedScores.length - 1 ? '1px solid var(--rule)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {index === 0 && <span>👑</span>}
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 16,
                        color: 'var(--cream)',
                      }}
                    >
                      {player}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--muted)',
                    }}
                  >
                    {score} votes
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <SecondaryButton onClick={() => setPhase('setup')}>NEW GAME</SecondaryButton>
            <PrimaryButton onClick={() => {
              setCurrentIndex(0);
              setScores(Object.fromEntries(players.map((p) => [p, 0])));
              setCardKey(prev => prev + 1);
            }}>
              PLAY AGAIN
            </PrimaryButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── PLAYING PHASE ────────────────────────────────────────
  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '64px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleBackToSetup}
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
            ← MOST LIKELY TO
          </button>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--muted)',
              letterSpacing: 1.5,
            }}
          >
            Nº {String(currentIndex + 1).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ padding: '34px 22px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={cardKey}
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              border: '1px solid var(--rule)',
              padding: 24,
              background: 'var(--ink-2)',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <Kicker color="var(--game-most-likely-to)">WHO'S MOST LIKELY TO</Kicker>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 26,
                  lineHeight: 1.2,
                  marginTop: 14,
                  letterSpacing: -0.4,
                  color: 'var(--cream)',
                }}
              >
                {currentCard.text}
              </div>
            </div>
            <div
              style={{
                borderTop: '1px solid var(--rule)',
                paddingTop: 14,
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 13,
                color: 'var(--cream-2)',
              }}
            >
              Point at them. Majority drinks.
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Vote Buttons */}
      <div style={{ padding: '0 22px' }}>
        <Kicker color="var(--muted)">TAP TO VOTE</Kicker>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 10 }}>
          {players.map((player) => (
            <button
              key={player}
              onClick={() => voteForPlayer(player)}
              style={{
                padding: 14,
                border: '1px solid var(--rule)',
                background: 'var(--ink-2)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 16,
                  color: 'var(--cream)',
                }}
              >
                {player}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--muted)',
                  marginTop: 4,
                }}
              >
                {scores[player] || 0} votes
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <SecondaryButton onClick={handleEnd}>END</SecondaryButton>
        </div>
        <div style={{ flex: 2 }}>
          <PrimaryButton onClick={nextCard}>
            NEXT · {currentDeck.cards.length - currentIndex} LEFT
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
