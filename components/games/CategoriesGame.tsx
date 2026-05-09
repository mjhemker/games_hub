'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useHaptics } from '@/lib/store';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton, PlayerChip, PlayerInput } from '@/components/ui/design-system';
import { Card } from '@/lib/types';

import categoriesData from '@/data/builtin/categories.json';

const TIMER_DURATION = 5;

type GamePhase = 'setup' | 'category-select' | 'playing' | 'eliminated' | 'winner';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function CategoriesGame() {
  const { vibrate } = useHaptics();

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<string[]>([]);
  const [activePlayers, setActivePlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [categories, setCategories] = useState<Card[]>(shuffleArray(categoriesData as Card[]));
  const [currentCategory, setCurrentCategory] = useState<Card | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lastEliminated, setLastEliminated] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addPlayer = (name: string) => {
    if (players.length < 12) {
      setPlayers([...players, name]);
    }
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (players.length >= 2) {
      setActivePlayers([...players]);
      setPhase('category-select');
      setCurrentPlayerIndex(0);
    }
  };

  const selectCategory = (category: Card) => {
    setCurrentCategory(category);
    setCategories(categories.filter((c) => c.id !== category.id));
    setPhase('playing');
    startTimer();
  };

  const generateCustomCategory = async () => {
    if (!customCategory.trim()) return;

    const newCategory: Card = {
      id: `custom-${Date.now()}`,
      text: customCategory.trim(),
      category: 'general',
    };
    selectCategory(newCategory);
    setCustomCategory('');
  };

  const startTimer = () => {
    setTimeRemaining(TIMER_DURATION);
    setIsTimerRunning(true);
  };

  const passTurn = () => {
    vibrate(50);
    setTimeRemaining(TIMER_DURATION);
    const nextIndex = (currentPlayerIndex + 1) % activePlayers.length;
    setCurrentPlayerIndex(nextIndex);
  };

  const eliminatePlayer = useCallback(() => {
    vibrate([100, 50, 100]);
    const eliminatedPlayer = activePlayers[currentPlayerIndex];
    setLastEliminated(eliminatedPlayer);
    setIsTimerRunning(false);

    const remainingPlayers = activePlayers.filter((_, i) => i !== currentPlayerIndex);
    setActivePlayers(remainingPlayers);

    if (remainingPlayers.length === 1) {
      setPhase('winner');
    } else {
      setPhase('eliminated');
      const newIndex = currentPlayerIndex >= remainingPlayers.length ? 0 : currentPlayerIndex;
      setCurrentPlayerIndex(newIndex);
    }
  }, [activePlayers, currentPlayerIndex, vibrate]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((t) => t - 1);
        if (timeRemaining <= 2) {
          vibrate(30);
        }
      }, 1000);
    } else if (isTimerRunning && timeRemaining === 0) {
      eliminatePlayer();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining, eliminatePlayer, vibrate]);

  const continueAfterElimination = () => {
    setPhase('category-select');
    setLastEliminated(null);
  };

  const newRound = () => {
    setActivePlayers([...players]);
    setCurrentPlayerIndex(0);
    setCategories(shuffleArray(categoriesData as Card[]));
    setPhase('category-select');
  };

  const currentPlayer = activePlayers[currentPlayerIndex];

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

          <Kicker color="var(--game-categories)" className="mt-8">
            Nº 05
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
            <ItalicAccent>Categories</ItalicAccent>
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
            Name something in the category before time runs out. Hesitate and you drink.
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
            {players.length < 2 && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--muted)',
                  marginTop: 12,
                  letterSpacing: 0.5,
                }}
              >
                Add at least 2 players to start
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16 }}>
          <PrimaryButton onClick={startGame} disabled={players.length < 2}>
            Begin →
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // ─── CATEGORY SELECTION ───────────────────────────────────────────
  if (phase === 'category-select') {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
        <div style={{ padding: '64px 22px 0' }}>
          <button
            onClick={() => setPhase('setup')}
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
            ← CATEGORIES
          </button>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              lineHeight: 1,
              marginTop: 24,
              color: 'var(--cream)',
            }}
          >
            Pick a <ItalicAccent>category</ItalicAccent>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--cream-2)',
              marginTop: 8,
            }}
          >
            <span style={{ color: 'var(--cream)' }}>{currentPlayer}</span> goes first
          </div>
        </div>

        {/* Custom Category */}
        <div style={{ padding: '24px 22px' }}>
          <div
            style={{
              border: '1px solid var(--rule)',
              padding: 16,
              background: 'var(--ink-2)',
            }}
          >
            <Kicker color="var(--muted)">CUSTOM CATEGORY</Kicker>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                type="text"
                placeholder="Enter any category..."
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
                disabled={!customCategory.trim()}
                style={{
                  padding: '12px 20px',
                  background: customCategory.trim() ? 'var(--cream)' : 'var(--ink)',
                  color: customCategory.trim() ? 'var(--ink)' : 'var(--muted)',
                  border: '1px solid var(--rule)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: 1,
                  cursor: customCategory.trim() ? 'pointer' : 'default',
                }}
              >
                GO
              </button>
            </div>
          </div>
        </div>

        {/* Category Options */}
        <div style={{ padding: '0 22px', paddingBottom: 120 }}>
          <Kicker color="var(--muted)">OR PICK ONE</Kicker>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 10 }}>
            {categories.slice(0, 10).map((category) => (
              <button
                key={category.id}
                onClick={() => selectCategory(category)}
                style={{
                  padding: 16,
                  border: '1px solid var(--rule)',
                  background: 'var(--ink-2)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 15,
                    color: 'var(--cream)',
                    lineHeight: 1.3,
                  }}
                >
                  {category.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAYING ───────────────────────────────────────────────
  if (phase === 'playing' && currentCategory) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
        {/* Header */}
        <div style={{ padding: '64px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: 1.5,
              }}
            >
              {activePlayers.length} PLAYERS LEFT
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 16,
                color: 'var(--cream)',
              }}
            >
              {currentCategory.text}
            </div>
          </div>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 22px' }}>
          <motion.div
            key={timeRemaining}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              border: `4px solid ${timeRemaining <= 2 ? '#ef4444' : 'var(--game-categories)'}`,
              background: timeRemaining <= 2 ? 'rgba(239, 68, 68, 0.1)' : 'var(--ink-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 56,
                color: timeRemaining <= 2 ? '#ef4444' : 'var(--cream)',
              }}
            >
              {timeRemaining}
            </span>
          </motion.div>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              color: 'var(--cream)',
              marginBottom: 8,
            }}
          >
            {currentPlayer}'s turn
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--cream-2)',
              marginBottom: 40,
            }}
          >
            Name something in: <span style={{ color: 'var(--cream)' }}>{currentCategory.text}</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 340 }}>
            <div style={{ flex: 1 }}>
              <button
                onClick={passTurn}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'var(--game-categories)',
                  border: 'none',
                  color: 'var(--cream)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: 1.5,
                  cursor: 'pointer',
                }}
              >
                GOT IT
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <SecondaryButton onClick={eliminatePlayer}>FAILED</SecondaryButton>
            </div>
          </div>
        </div>

        {/* Player Order */}
        <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16 }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {activePlayers.map((player, index) => (
              <div
                key={player}
                style={{
                  padding: '8px 14px',
                  border: index === currentPlayerIndex ? '1px solid var(--game-categories)' : '1px solid var(--rule)',
                  background: index === currentPlayerIndex ? 'var(--ink-2)' : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: index === currentPlayerIndex ? 'var(--cream)' : 'var(--muted)',
                  letterSpacing: 0.5,
                  whiteSpace: 'nowrap',
                }}
              >
                {player}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── ELIMINATED ───────────────────────────────────────────
  if (phase === 'eliminated') {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ textAlign: 'center', padding: 22 }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🍺</div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              color: 'var(--cream)',
              marginBottom: 8,
            }}
          >
            {lastEliminated} <ItalicAccent>drinks</ItalicAccent>!
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--cream-2)',
              marginBottom: 32,
            }}
          >
            {activePlayers.length} players remaining
          </div>
          <PrimaryButton onClick={continueAfterElimination}>CONTINUE</PrimaryButton>
        </motion.div>
      </div>
    );
  }

  // ─── WINNER ───────────────────────────────────────────────
  if (phase === 'winner') {
    const winner = activePlayers[0];
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ textAlign: 'center', padding: 22 }}
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
            {winner} <ItalicAccent>wins</ItalicAccent>!
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--cream-2)',
              marginBottom: 32,
            }}
          >
            Category champion!
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <SecondaryButton onClick={() => setPhase('setup')}>NEW GAME</SecondaryButton>
            <PrimaryButton onClick={newRound}>NEW ROUND</PrimaryButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
