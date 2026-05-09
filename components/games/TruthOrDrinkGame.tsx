'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppStore, useHaptics } from '@/lib/store';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton, PlayerChip, PlayerInput } from '@/components/ui/design-system';
import { CardDeck, Card, SpiceLevel } from '@/lib/types';
import { generateId } from '@/lib/storage';

import truthOrDrinkData from '@/data/builtin/truth-or-drink.json';

const createBuiltInDeck = (spice: SpiceLevel): CardDeck => {
  const spiceKey = spice === 1 ? 'tame' : spice === 2 ? 'medium' : 'spicy';
  const cards = (truthOrDrinkData as Record<string, Card[]>)[spiceKey] || [];
  return {
    id: `truth-or-drink-builtin-${spice}`,
    name: spice === 1 ? 'Tame Questions' : spice === 2 ? 'Medium Questions' : 'Spicy Questions',
    game: 'truth-or-drink',
    theme: 'general',
    spiceLevel: spice,
    cards,
    source: 'built-in',
    createdAt: 0,
  };
};

type GamePhase = 'setup' | 'playing';

export function TruthOrDrinkGame() {
  const { vibrate } = useHaptics();
  const { decks, addDeck, settings } = useAppStore();

  const builtInDecks = useMemo(() => [
    createBuiltInDeck(1),
    createBuiltInDeck(2),
    createBuiltInDeck(3),
  ], []);

  // Get user's custom decks for this game
  const customDecks = decks.filter(d => d.game === 'truth-or-drink');
  const allDecks = [...builtInDecks, ...customDecks];

  const defaultDeck = useMemo(() => createBuiltInDeck(settings.defaultSpice), [settings.defaultSpice]);

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentDeck, setCurrentDeck] = useState<CardDeck | null>(defaultDeck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateTheme, setGenerateTheme] = useState('');

  const addPlayer = (name: string) => {
    setPlayers([...players, name]);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (players.length >= 2 && currentDeck) {
      setPhase('playing');
      setCurrentPlayerIndex(0);
      setCurrentIndex(0);
    }
  };

  const selectDeck = (deck: CardDeck) => {
    setCurrentDeck(deck);
    setCurrentIndex(0);
    setShowDeckPicker(false);
  };

  const handleGenerateDeck = async () => {
    if (!generateTheme.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'truth-or-drink',
          spice: settings.defaultSpice,
          theme: generateTheme,
          count: 25,
          // Uses server's GEMINI_API_KEY from .env.local by default
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate deck');
      }

      const newDeck: CardDeck = {
        id: generateId(),
        name: `${generateTheme} (AI)`,
        game: 'truth-or-drink',
        theme: generateTheme,
        spiceLevel: settings.defaultSpice,
        cards: data.cards,
        source: 'ai-generated',
        createdAt: Date.now(),
      };

      addDeck(newDeck);
      selectDeck(newDeck);
      setGenerateTheme('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Player chose to answer truthfully - move to next player
  const handleTruth = () => {
    vibrate(50);
    nextTurn();
  };

  // Player chose to drink instead - move to next player
  const handleDrink = () => {
    vibrate([50, 50]);
    nextTurn();
  };

  const nextTurn = () => {
    setCurrentIndex((prev) => prev + 1);
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setCardKey(prev => prev + 1);
  };

  const handleBackToSetup = () => {
    setPhase('setup');
  };

  const handleEnd = () => {
    if (confirm('End the game?')) {
      setPhase('setup');
      setCurrentIndex(0);
      setCurrentPlayerIndex(0);
    }
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentCard = currentDeck?.cards[currentIndex];
  const isOutOfCards = currentDeck && currentIndex >= currentDeck.cards.length;

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

          <Kicker color="var(--game-truth-or-drink)" className="mt-8">
            Nº 02
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
            Truth or<br />
            <ItalicAccent>Drink</ItalicAccent>
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
            See the question. Answer honestly, or take a sip.
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

          {/* Deck Selection */}
          <div style={{ marginTop: 34 }}>
            <Kicker color="var(--muted)">DECK</Kicker>

            {/* Current deck display */}
            {currentDeck && !showDeckPicker && (
              <button
                onClick={() => setShowDeckPicker(true)}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: 16,
                  border: '1px solid var(--rule)',
                  background: 'var(--ink-2)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 18,
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
                        marginTop: 4,
                      }}
                    >
                      {currentDeck.cards.length} CARDS · {currentDeck.source === 'ai-generated' ? 'AI GENERATED' : 'BUILT-IN'}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--copper)',
                      letterSpacing: 1,
                    }}
                  >
                    CHANGE →
                  </div>
                </div>
              </button>
            )}

            {/* Deck picker */}
            {showDeckPicker && (
              <div style={{ marginTop: 10 }}>
                {/* Built-in decks by spice */}
                <Kicker color="var(--muted)" style={{ marginBottom: 8 }}>SPICE LEVEL</Kicker>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {builtInDecks.map((deck, i) => (
                    <button
                      key={deck.id}
                      onClick={() => selectDeck(deck)}
                      style={{
                        flex: 1,
                        padding: '14px 12px',
                        border: currentDeck?.id === deck.id ? '1px solid var(--game-truth-or-drink)' : '1px solid var(--rule)',
                        background: currentDeck?.id === deck.id ? 'var(--ink-2)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontStyle: 'italic',
                          fontSize: 16,
                          color: currentDeck?.id === deck.id ? 'var(--cream)' : 'var(--cream-2)',
                        }}
                      >
                        {i === 0 ? 'Tame' : i === 1 ? 'Medium' : 'Spicy'}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--muted)',
                          marginTop: 4,
                        }}
                      >
                        {deck.cards.length} CARDS
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom/AI decks */}
                {customDecks.length > 0 && (
                  <>
                    <Kicker color="var(--muted)" style={{ marginBottom: 8 }}>YOUR DECKS</Kicker>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {customDecks.map(deck => (
                        <button
                          key={deck.id}
                          onClick={() => selectDeck(deck)}
                          style={{
                            padding: 14,
                            border: currentDeck?.id === deck.id ? '1px solid var(--game-truth-or-drink)' : '1px solid var(--rule)',
                            background: currentDeck?.id === deck.id ? 'var(--ink-2)' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 16,
                                color: 'var(--cream)',
                              }}
                            >
                              {deck.name}
                            </div>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 10,
                                color: 'var(--muted)',
                              }}
                            >
                              {deck.cards.length} CARDS
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Generate new deck */}
                <Kicker color="var(--muted)" style={{ marginBottom: 8 }}>GENERATE NEW</Kicker>
                <div
                  style={{
                    border: '1px solid var(--rule)',
                    padding: 14,
                    background: 'var(--ink-2)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={generateTheme}
                      onChange={(e) => setGenerateTheme(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerateDeck()}
                      placeholder="Theme (e.g., 'college memories')"
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
                      onClick={handleGenerateDeck}
                      disabled={isGenerating || !generateTheme.trim()}
                      style={{
                        padding: '12px 18px',
                        background: generateTheme.trim() && !isGenerating ? 'var(--copper)' : 'var(--ink)',
                        color: generateTheme.trim() && !isGenerating ? 'var(--ink)' : 'var(--muted)',
                        border: '1px solid var(--rule)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: 1,
                        cursor: generateTheme.trim() && !isGenerating ? 'pointer' : 'default',
                      }}
                    >
                      {isGenerating ? '...' : 'CREATE'}
                    </button>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--muted)',
                      marginTop: 8,
                      letterSpacing: 0.5,
                    }}
                  >
                    AI will generate 25 questions based on your theme
                  </div>
                </div>

                {/* Cancel button */}
                <button
                  onClick={() => setShowDeckPicker(false)}
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '10px',
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--muted)',
                    letterSpacing: 1,
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
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

  // ─── OUT OF CARDS ────────────────────────────────────────────
  if (isOutOfCards) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ textAlign: 'center', padding: 22 }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 36,
              color: 'var(--cream)',
              marginBottom: 8,
            }}
          >
            Out of <ItalicAccent>questions</ItalicAccent>!
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--cream-2)',
              marginBottom: 24,
            }}
          >
            You've been through all the cards.
          </div>
          <PrimaryButton onClick={() => setCurrentIndex(0)}>RESTART DECK</PrimaryButton>
        </motion.div>
      </div>
    );
  }

  // ─── PLAYING PHASE - SHOW QUESTION WITH TRUTH/DRINK OPTIONS ────
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
            ← TRUTH OR DRINK
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

      {/* Question Card with Truth/Drink options */}
      <div style={{ padding: '34px 22px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={cardKey}
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              flex: 1,
              border: '1px solid var(--rule)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'var(--ink-2)',
            }}
          >
            <div>
              <Kicker color="var(--game-truth-or-drink)">{currentPlayer?.toUpperCase()}'S TURN</Kicker>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 26,
                  lineHeight: 1.25,
                  marginTop: 16,
                  letterSpacing: -0.4,
                  color: 'var(--cream)',
                }}
              >
                {currentCard?.text}
              </div>
            </div>

            {/* Truth or Drink Buttons */}
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  borderTop: '1px solid var(--rule)',
                  paddingTop: 20,
                  display: 'flex',
                  gap: 12,
                }}
              >
                <motion.button
                  onClick={handleTruth}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    flex: 1,
                    padding: '20px 16px',
                    border: '1px solid var(--game-truth-or-drink)',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 24 }}>💬</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: 18,
                      color: 'var(--cream)',
                    }}
                  >
                    Truth
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--muted)',
                      letterSpacing: 0.5,
                    }}
                  >
                    Answer it
                  </span>
                </motion.button>

                <motion.button
                  onClick={handleDrink}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    flex: 1,
                    padding: '20px 16px',
                    border: '1px solid var(--copper)',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 24 }}>🥃</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: 18,
                      color: 'var(--cream)',
                    }}
                  >
                    Drink
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--muted)',
                      letterSpacing: 0.5,
                    }}
                  >
                    Skip it
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <SecondaryButton onClick={handleEnd}>END</SecondaryButton>
        </div>
        <div style={{ flex: 2 }}>
          <PrimaryButton onClick={handleTruth}>
            NEXT · {currentDeck?.cards.length ? currentDeck.cards.length - currentIndex - 1 : 0} LEFT
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
