'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore, useHaptics } from '@/lib/store';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton, PlayerChip, PlayerInput } from '@/components/ui/design-system';
import { CardDeck, Card, SpiceLevel } from '@/lib/types';
import { generateId } from '@/lib/storage';

import beerPressureCards from '@/data/builtin/beer-pressure.json';

const MAX_ACTIVE_RULES = 3;

const BUILT_IN_DECK: CardDeck = {
  id: 'beer-pressure-builtin',
  name: 'Classic Party',
  game: 'beer-pressure',
  theme: 'general',
  spiceLevel: 2,
  cards: beerPressureCards as Card[],
  source: 'built-in',
  createdAt: 0,
};

type GamePhase = 'setup' | 'playing';

export function BeerPressureGame() {
  const router = useRouter();
  const { vibrate } = useHaptics();
  const { decks, addDeck, gameState, updateGameState, settings } = useAppStore();
  const state = gameState['beer-pressure'];

  // Get custom decks for this game
  const customDecks = decks.filter((d) => d.game === 'beer-pressure');
  const allDecks = [BUILT_IN_DECK, ...customDecks];

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentDeck, setCurrentDeck] = useState<CardDeck>(BUILT_IN_DECK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeRules, setActiveRules] = useState<Card[]>([]);
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateTheme, setGenerateTheme] = useState('');

  // Load saved state on mount
  useEffect(() => {
    if (state.currentDeckId) {
      const deck = allDecks.find((d) => d.id === state.currentDeckId) || BUILT_IN_DECK;
      setCurrentDeck(deck);
    }
    if (state.players && state.players.length > 0) {
      setPlayers(state.players);
    }
  }, []);

  const addPlayer = (name: string) => {
    const updatedPlayers = [...players, name];
    setPlayers(updatedPlayers);
    updateGameState('beer-pressure', { players: updatedPlayers });
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
    updateGameState('beer-pressure', { players: updatedPlayers });
  };

  const selectDeck = (deck: CardDeck) => {
    setCurrentDeck(deck);
    setCurrentIndex(0);
    setShowDeckPicker(false);
    updateGameState('beer-pressure', { currentDeckId: deck.id });
  };

  const handleGenerateDeck = async () => {
    if (!generateTheme.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'beer-pressure',
          spice: settings.defaultSpice,
          theme: generateTheme,
          count: 25,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate deck');
      }

      const newDeck: CardDeck = {
        id: generateId(),
        name: generateTheme,
        game: 'beer-pressure',
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
      alert(err instanceof Error ? err.message : 'Failed to generate deck');
    } finally {
      setIsGenerating(false);
    }
  };

  const startGame = () => {
    if (players.length >= 2 && currentDeck) {
      setPhase('playing');
      setCurrentPlayerIndex(0);
      setCurrentIndex(0);
      setActiveRules([]);
      updateGameState('beer-pressure', {
        currentDeckId: currentDeck.id,
        currentCardIndex: 0,
        activeRules: [],
        currentPlayerIndex: 0,
      });
    }
  };

  const handleNextCard = () => {
    if (!currentDeck) return;

    vibrate(50);
    const currentCard = currentDeck.cards[currentIndex];

    let newActiveRules = [...activeRules];
    if (currentCard?.category === 'rule') {
      newActiveRules = [...activeRules, currentCard];
      if (newActiveRules.length > MAX_ACTIVE_RULES) {
        newActiveRules = newActiveRules.slice(-MAX_ACTIVE_RULES);
      }
      setActiveRules(newActiveRules);
    }

    const nextIndex = currentIndex + 1;
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    setCurrentIndex(nextIndex);
    setCurrentPlayerIndex(nextPlayerIndex);

    updateGameState('beer-pressure', {
      currentCardIndex: nextIndex,
      activeRules: newActiveRules,
      currentPlayerIndex: nextPlayerIndex,
    });
  };

  const handleEnd = () => {
    if (confirm('End the night?')) {
      setPhase('setup');
      setCurrentIndex(0);
      setActiveRules([]);
      setCurrentPlayerIndex(0);
      updateGameState('beer-pressure', {
        currentCardIndex: 0,
        activeRules: [],
        currentPlayerIndex: 0,
      });
    }
  };

  const handleBackToSetup = () => {
    setPhase('setup');
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentCard = currentDeck?.cards[currentIndex];

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

          <Kicker color="var(--copper)" className="mt-8">
            Nº 01
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
            Beer<br />
            <ItalicAccent>Pressure</ItalicAccent>
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
            Turn-based prompts. Three rules in play at once.
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
            {!showDeckPicker && (
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
                {/* All available decks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {allDecks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => selectDeck(deck)}
                      style={{
                        padding: 14,
                        border: currentDeck.id === deck.id ? '1px solid var(--copper)' : '1px solid var(--rule)',
                        background: currentDeck.id === deck.id ? 'var(--ink-2)' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
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
                              marginTop: 4,
                            }}
                          >
                            {deck.cards.length} CARDS · {deck.source === 'ai-generated' ? 'AI' : 'BUILT-IN'}
                          </div>
                        </div>
                        {currentDeck.id === deck.id && (
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              color: 'var(--copper)',
                            }}
                          >
                            SELECTED
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

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
                      placeholder="Theme (e.g., 'college party')"
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
                    AI will generate 25 cards based on your theme
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
                  DONE
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

        {/* Bottom spacing */}
        <div style={{ height: 140 }} />
      </div>
    );
  }

  // ─── IN-PLAY CARD SCREEN ────────────────────────────────────────
  if (!currentDeck || !currentCard) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: 1.5 }}>
          BREWING...
        </div>
      </div>
    );
  }

  const cardNum = String(currentIndex + 1).padStart(2, '0');
  const isRule = currentCard.category === 'rule';

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
            ← BEER PRESSURE
          </button>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--muted)',
              letterSpacing: 1.5,
            }}
          >
            Nº {cardNum}
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ padding: '34px 22px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)' }}>
        <div
          onClick={handleNextCard}
          style={{
            flex: 1,
            border: '1px solid var(--rule)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--ink-2)',
            cursor: 'pointer',
          }}
        >
          <div>
            <Kicker color={isRule ? 'var(--copper)' : 'var(--muted)'}>
              {isRule ? `NEW RULE · ${currentPlayer?.toUpperCase()}` : currentPlayer?.toUpperCase()}
            </Kicker>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 30,
                lineHeight: 1.15,
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
            {isRule ? `${currentPlayer} chooses who enforces it.` : 'Tap to advance →'}
          </div>
        </div>

        {/* Active Rules */}
        {activeRules.length > 0 && (
          <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--rule)' }}>
            <Kicker color="var(--muted)">
              RULES IN PLAY · {activeRules.length}/{MAX_ACTIVE_RULES}
            </Kicker>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontStyle: 'italic',
                color: 'var(--cream-2)',
                lineHeight: 1.5,
                marginTop: 8,
              }}
            >
              {activeRules.map((rule) => (
                <div key={rule.id}>· {rule.text.length > 40 ? rule.text.slice(0, 40) + '...' : rule.text}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <SecondaryButton onClick={handleEnd}>END</SecondaryButton>
        </div>
        <div style={{ flex: 2 }}>
          <PrimaryButton onClick={handleNextCard}>NEXT CARD →</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
