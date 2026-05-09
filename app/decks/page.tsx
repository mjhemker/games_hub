'use client';

import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { CardDeck, GameType } from '@/lib/types';
import { GAMES } from '@/games';
import { D1Rule, Kicker, ItalicAccent, CopperButton } from '@/components/ui/design-system';

const spiceDots = (level: number) => {
  return '•'.repeat(level) + '·'.repeat(3 - level);
};

export default function DecksPage() {
  const { decks, removeDeck } = useAppStore();

  // Group decks by game
  const decksByGame = decks.reduce(
    (acc, deck) => {
      if (!acc[deck.game]) {
        acc[deck.game] = [];
      }
      acc[deck.game].push(deck);
      return acc;
    },
    {} as Record<GameType, CardDeck[]>
  );

  const gameTypes = Object.keys(decksByGame) as GameType[];

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '64px 22px 0' }}>
        <Kicker color="var(--muted)">DECKS</Kicker>
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
          Your <ItalicAccent>library</ItalicAccent>
        </div>
      </div>

      {decks.length === 0 ? (
        <div style={{ padding: '80px 22px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 18,
              color: 'var(--cream-2)',
              marginBottom: 32,
            }}
          >
            Nothing yet.
          </div>
          <Link href="/decks/new">
            <CopperButton>+ GENERATE A NEW DECK</CopperButton>
          </Link>
        </div>
      ) : (
        <>
          {/* Decks List */}
          <div style={{ marginTop: 26, borderTop: '1px solid var(--rule)' }}>
            {decks.map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                style={{
                  display: 'block',
                  padding: '18px 22px',
                  borderBottom: '1px solid var(--rule)',
                  textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 19,
                      color: 'var(--cream)',
                    }}
                  >
                    {deck.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--copper)',
                      letterSpacing: 1,
                    }}
                  >
                    {spiceDots(deck.spiceLevel)}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--muted)',
                    marginTop: 4,
                    letterSpacing: 0.4,
                  }}
                >
                  {deck.cards.length} cards · {deck.spiceLevel === 1 ? 'tame' : deck.spiceLevel === 2 ? 'medium' : 'spicy'} · {deck.source === 'built-in' ? 'built-in' : deck.source === 'ai-generated' ? 'ai' : 'custom'}
                </div>
              </Link>
            ))}
          </div>

          {/* Generate Button */}
          <div style={{ padding: '32px 22px' }}>
            <Link href="/decks/new">
              <CopperButton>+ GENERATE A NEW DECK</CopperButton>
            </Link>
          </div>
        </>
      )}

      {/* Bottom spacing for nav */}
      <div style={{ height: 120 }} />
    </div>
  );
}
