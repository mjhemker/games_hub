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
  const [cardKey, setCardKey] = useState(0);

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
      setCardKey(prev => prev + 1);
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
    const isGameOver = newKingsDrawn >= 4;

    setDrawnCard(card as PlayingCard);
    setCardKey(prev => prev + 1);

    setTimeout(() => {
      updateGameState('kings-cup', {
        deck: newDeck,
        drawnCards: newDrawnCards,
        kingsDrawn: newKingsDrawn,
        isGameOver,
      });
      setIsDrawing(false);

      if (isGameOver) {
        vibrate([100, 50, 100, 50, 200]);
      }
    }, 300);
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
          <div style={{ position: 'relative', height: 280 }}>
            {/* Fanned deck cards */}
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
              {[-12, -6, 0, 6, 12].map((r, i) => (
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
                    background: i === 2 && drawnCard ? 'var(--cream)' : 'var(--ink-2)',
                    border: '1px solid var(--rule)',
                    transform: `rotate(${r}deg) translateY(${Math.abs(r)}px)`,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    cursor: i === 2 ? 'pointer' : 'default',
                  }}
                  onClick={i === 2 ? drawCard : undefined}
                >
                  {i === 2 && drawnCard ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={cardKey}
                        initial={{ rotateY: 180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -180, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          color: suitColors[drawnCard.suit],
                        }}
                      >
                        <div style={{ fontSize: 18 }}>{drawnCard.rank}{drawnCard.suit}</div>
                        <div style={{ textAlign: 'center', fontSize: 60, lineHeight: 0.9 }}>{drawnCard.rank}</div>
                        <div style={{ fontSize: 18, textAlign: 'right' }}>{drawnCard.suit}</div>
                      </motion.div>
                    </AnimatePresence>
                  ) : i === 2 ? (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)',
                    }}>
                      <Kicker color="var(--muted)">TAP TO DRAW</Kicker>
                    </div>
                  ) : null}
                </motion.div>
              ))}
            </motion.div>
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
