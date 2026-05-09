'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppStore, useHaptics } from '@/lib/store';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton } from '@/components/ui/design-system';
import { CardDeck, Card, SpiceLevel } from '@/lib/types';

import neverHaveIEverData from '@/data/builtin/never-have-i-ever.json';

const createBuiltInDeck = (spice: SpiceLevel): CardDeck => {
  const spiceKey = spice === 1 ? 'tame' : spice === 2 ? 'medium' : 'spicy';
  const cards = (neverHaveIEverData as Record<string, Card[]>)[spiceKey] || [];
  return {
    id: `never-have-i-ever-builtin-${spice}`,
    name: spice === 1 ? 'Tame' : spice === 2 ? 'Medium' : 'Spicy',
    game: 'never-have-i-ever',
    theme: 'general',
    spiceLevel: spice,
    cards,
    source: 'built-in',
    createdAt: 0,
  };
};

export function NeverHaveIEverGame() {
  const { vibrate } = useHaptics();
  const { settings } = useAppStore();

  const builtInDecks = useMemo(() => [
    createBuiltInDeck(1),
    createBuiltInDeck(2),
    createBuiltInDeck(3),
  ], []);

  const defaultDeck = useMemo(() => createBuiltInDeck(settings.defaultSpice), [settings.defaultSpice]);

  const [currentDeck, setCurrentDeck] = useState<CardDeck | null>(defaultDeck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  const selectSpice = (spice: SpiceLevel) => {
    const deck = builtInDecks.find(d => d.spiceLevel === spice) || defaultDeck;
    setCurrentDeck(deck);
    setCurrentIndex(0);
    setCardKey(prev => prev + 1);
  };

  const nextCard = () => {
    vibrate(50);
    setCurrentIndex((prev) => prev + 1);
    setCardKey(prev => prev + 1);
  };

  const restartDeck = () => {
    setCurrentIndex(0);
    setCardKey(prev => prev + 1);
  };

  if (!currentDeck) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: 1.5 }}>
          LOADING...
        </div>
      </div>
    );
  }

  const currentCard = currentDeck.cards[currentIndex];
  const isOutOfCards = currentIndex >= currentDeck.cards.length;

  // ─── OUT OF CARDS ────────────────────────────────────────────
  if (isOutOfCards) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ textAlign: 'center', padding: 22 }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🙌</div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 36,
              color: 'var(--cream)',
              marginBottom: 8,
            }}
          >
            Out of <ItalicAccent>statements</ItalicAccent>!
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--cream-2)',
              marginBottom: 24,
            }}
          >
            That was revealing. Go again?
          </div>
          <PrimaryButton onClick={restartDeck}>RESTART DECK</PrimaryButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
      {/* Header */}
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

        <Kicker color="var(--game-never-have-i-ever)" className="mt-8">
          Nº 03
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
          Never Have<br />
          <ItalicAccent>I Ever</ItalicAccent>
        </div>
      </div>

      {/* Spice Level Selector */}
      <div style={{ padding: '24px 22px 0' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3].map((spice) => (
            <button
              key={spice}
              onClick={() => selectSpice(spice as SpiceLevel)}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: currentDeck?.spiceLevel === spice ? '1px solid var(--game-never-have-i-ever)' : '1px solid var(--rule)',
                background: currentDeck?.spiceLevel === spice ? 'var(--ink-2)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: 1,
                  color: currentDeck?.spiceLevel === spice ? 'var(--cream)' : 'var(--muted)',
                }}
              >
                {spice === 1 ? 'TAME' : spice === 2 ? 'MEDIUM' : 'SPICY'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Card Display */}
      <div style={{ padding: '34px 22px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 360px)' }}>
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={cardKey}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -180, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={nextCard}
              style={{
                flex: 1,
                border: '1px solid var(--rule)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--ink-2)',
                cursor: 'pointer',
                minHeight: 280,
              }}
            >
              <div>
                <Kicker color="var(--game-never-have-i-ever)">NEVER HAVE I EVER</Kicker>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 28,
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
                If you've done it, take a sip.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <SecondaryButton onClick={restartDeck}>RESTART</SecondaryButton>
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
