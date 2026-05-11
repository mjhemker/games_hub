'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useHaptics } from '@/lib/store';
import { Kicker, PrimaryButton, SecondaryButton } from '@/components/ui/design-system';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

type CardSuit = (typeof SUITS)[number];
type CardRank = (typeof RANKS)[number];

interface PlayingCard {
  rank: CardRank;
  suit: CardSuit;
}

function createDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

function shuffleDeck(deck: PlayingCard[]): PlayingCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const suitColors: Record<CardSuit, string> = {
  '♠': '#0c0a09',
  '♣': '#0c0a09',
  '♥': '#c4644f',
  '♦': '#c4644f',
};

export function KingsCupDeck() {
  const { gameState, updateGameState, settings } = useAppStore();
  const { vibrate } = useHaptics();
  const state = gameState['kings-cup'];
  const [drawnCard, setDrawnCard] = useState<PlayingCard | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize deck on mount if empty - defer to avoid setState during render
  useEffect(() => {
    if (state.deck.length === 0 && !state.isGameOver && state.drawnCards.length === 0) {
      // Use setTimeout to defer state update out of the render cycle
      const timeoutId = setTimeout(() => {
        const deck = shuffleDeck(createDeck());
        updateGameState('kings-cup', {
          deck,
          drawnCards: [],
          kingsDrawn: 0,
          isGameOver: false,
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [state.deck.length, state.isGameOver, state.drawnCards.length, updateGameState]);

  const initGame = () => {
    setIsShuffling(true);
    setIsFlipped(false);
    vibrate([50, 30, 50, 30, 50]);

    setTimeout(() => {
      const deck = shuffleDeck(createDeck());
      updateGameState('kings-cup', {
        deck,
        drawnCards: [],
        kingsDrawn: 0,
        isGameOver: false,
      });
      setDrawnCard(null);
      setIsShuffling(false);
    }, 600);
  };

  const shuffleRemaining = () => {
    if (state.deck.length === 0) return;

    setIsShuffling(true);
    vibrate([50, 30, 50, 30, 50]);

    setTimeout(() => {
      const shuffledDeck = shuffleDeck(state.deck as PlayingCard[]);
      updateGameState('kings-cup', {
        deck: shuffledDeck,
      });
      setIsShuffling(false);
    }, 600);
  };

  const drawCard = () => {
    if (state.deck.length === 0 || state.isGameOver || isDrawing || isShuffling) return;

    setIsDrawing(true);
    vibrate(50);

    const card = state.deck[0];
    const newDeck = state.deck.slice(1);
    const newDrawnCards = [...state.drawnCards, card];
    const newKingsDrawn = card.rank === 'K' ? state.kingsDrawn + 1 : state.kingsDrawn;
    const gameOver = newKingsDrawn >= 4;

    // If already flipped, flip back first then flip to new card
    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        setDrawnCard(card as PlayingCard);
        setIsFlipped(true);
        updateGameState('kings-cup', {
          deck: newDeck,
          drawnCards: newDrawnCards,
          kingsDrawn: newKingsDrawn,
          isGameOver: gameOver,
        });
        setIsDrawing(false);
        if (gameOver) {
          vibrate([100, 50, 100, 50, 200]);
        }
      }, 300);
    } else {
      // First draw - just flip
      setDrawnCard(card as PlayingCard);
      setIsFlipped(true);
      setTimeout(() => {
        updateGameState('kings-cup', {
          deck: newDeck,
          drawnCards: newDrawnCards,
          kingsDrawn: newKingsDrawn,
          isGameOver: gameOver,
        });
        setIsDrawing(false);
        if (gameOver) {
          vibrate([100, 50, 100, 50, 200]);
        }
      }, 300);
    }
  };

  const rule = drawnCard ? settings.kingsCupRules[drawnCard.rank] : null;
  const cardsLeft = state.deck.length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Kings counter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        <Kicker color="var(--muted)">KINGS DRAWN</Kicker>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-circle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: n <= state.kingsDrawn ? 'var(--game-kings-cup)' : 'transparent',
              border: n <= state.kingsDrawn ? 'none' : '1px solid var(--rule)',
              color: n <= state.kingsDrawn ? 'var(--cream)' : 'var(--muted)',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 18,
              transition: 'all 0.2s ease',
            }}
          >
            K
          </div>
        ))}
      </div>

      {/* Card display area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {state.isGameOver ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🍺</div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 36,
                color: 'var(--cream)',
                marginBottom: 8,
              }}
            >
              Drink the <span style={{ fontStyle: 'italic', color: 'var(--game-kings-cup)' }}>Cup</span>!
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                color: 'var(--cream-2)',
                marginBottom: 24,
              }}
            >
              The fourth King has been drawn.
            </div>
            <PrimaryButton onClick={initGame}>PLAY AGAIN</PrimaryButton>
          </motion.div>
        ) : (
          <div style={{ position: 'relative', height: 280, perspective: '1000px' }}>
            {/* Deck pile (background cards) */}
            <motion.div
              animate={isShuffling ? { rotate: [0, -5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {[-12, -6, 6, 12].map((r, i) => (
                <motion.div
                  key={i}
                  animate={isShuffling ? {
                    rotate: [r, r + 15, r - 15, r],
                    y: [0, -10, 10, 0],
                  } : {}}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  style={{
                    position: 'absolute',
                    width: 150,
                    height: 220,
                    background: 'var(--ink-2)',
                    border: '1px solid var(--rule)',
                    borderRadius: 8,
                    transform: `rotate(${r}deg) translateY(${Math.abs(r)}px)`,
                  }}
                />
              ))}
            </motion.div>

            {/* Main card (flippable) */}
            <div
              onClick={drawCard}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 150,
                height: 220,
                cursor: 'pointer',
              }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Card back (face down - visible when not flipped) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    background: 'var(--ink-2)',
                    border: '1px solid var(--rule)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{
                    width: '80%',
                    height: '80%',
                    border: '2px solid var(--rule)',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: 28,
                      color: 'var(--game-kings-cup)',
                    }}>
                      K
                    </div>
                    <Kicker color="var(--muted)" style={{ fontSize: 8 }}>TAP TO DRAW</Kicker>
                  </div>
                </div>

                {/* Card front (face up - visible when flipped 180deg) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'var(--cream)',
                    border: '1px solid var(--rule)',
                    borderRadius: 8,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                  }}
                >
                  {drawnCard && (
                    <>
                      <div style={{ fontSize: 22, color: suitColors[drawnCard.suit] }}>
                        {drawnCard.rank}{drawnCard.suit}
                      </div>
                      <div style={{
                        textAlign: 'center',
                        fontSize: 72,
                        lineHeight: 0.9,
                        color: suitColors[drawnCard.suit]
                      }}>
                        {drawnCard.suit}
                      </div>
                      <div style={{ fontSize: 22, textAlign: 'right', transform: 'rotate(180deg)', color: suitColors[drawnCard.suit] }}>
                        {drawnCard.rank}{drawnCard.suit}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Rule display */}
      {rule && !state.isGameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            margin: '0 16px 16px',
            padding: 18,
            border: '1px solid var(--rule)',
            background: 'var(--ink-2)',
          }}
        >
          <Kicker color="var(--game-kings-cup)">
            {drawnCard?.rank} · {drawnCard?.rank === 'K' ? 'POUR' : 'RULE'}
          </Kicker>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 22,
              lineHeight: 1.2,
              marginTop: 10,
              color: 'var(--cream)',
            }}
          >
            {rule}
          </div>
        </motion.div>
      )}

      {/* Bottom actions */}
      {!state.isGameOver && (
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          <div style={{ flex: 1 }}>
            <SecondaryButton onClick={shuffleRemaining}>SHUFFLE</SecondaryButton>
          </div>
          <div style={{ flex: 2 }}>
            <PrimaryButton onClick={drawCard} disabled={isDrawing || isShuffling}>
              DRAW NEXT · {cardsLeft} LEFT
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Restart */}
      {!state.isGameOver && state.drawnCards.length > 0 && (
        <div style={{ textAlign: 'center', paddingBottom: 16 }}>
          <button
            onClick={initGame}
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
            RESTART GAME
          </button>
        </div>
      )}
    </div>
  );
}
