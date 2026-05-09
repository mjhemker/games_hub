'use client';

import Link from 'next/link';
import { PHASE_1_GAMES, PHASE_2_GAMES } from '@/games';
import { D1Mark, D1Rule, Kicker, ItalicAccent } from '@/components/ui/design-system';

export default function HomePage() {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '60px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 }}>
          <D1Mark />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--muted)',
              letterSpacing: 1.5,
            }}
          >
            {dayOfWeek} · {currentTime}
          </div>
        </div>

        {/* Hero */}
        <Kicker color="var(--copper)" className="mt-9">
          Nº 047
        </Kicker>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 50,
            lineHeight: 0.95,
            marginTop: 10,
            letterSpacing: -1,
            color: 'var(--cream)',
          }}
        >
          Pick your<br />
          <ItalicAccent>poison</ItalicAccent>.
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 14,
            color: 'var(--cream-2)',
            marginTop: 14,
            lineHeight: 1.5,
          }}
        >
          Seven games for the room. Sit close, speak honestly.
        </div>
      </div>

      {/* Games List */}
      <div style={{ marginTop: 26, borderTop: '1px solid var(--rule)' }}>
        {PHASE_1_GAMES.map((game) => (
          <Link
            key={game.id}
            href={`/play/${game.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '18px 22px',
              borderBottom: '1px solid var(--rule)',
              gap: 14,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: game.accent || 'var(--copper)',
                letterSpacing: 1.5,
                width: 22,
              }}
            >
              {game.num}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 20,
                  lineHeight: 1.1,
                  color: 'var(--cream)',
                }}
              >
                {game.name}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: 'var(--muted)',
                  marginTop: 3,
                  letterSpacing: 0.4,
                }}
              >
                {game.tagline}
              </div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: 13,
                color: 'var(--cream-2)',
              }}
            >
              open →
            </div>
          </Link>
        ))}
      </div>

      {/* Coming Soon Section */}
      {PHASE_2_GAMES.length > 0 && (
        <>
          <div style={{ padding: '24px 22px 12px' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: 2,
              }}
            >
              COMING SOON
            </div>
          </div>
          <D1Rule />
          {PHASE_2_GAMES.map((game) => (
            <div
              key={game.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '18px 22px',
                borderBottom: '1px solid var(--rule)',
                gap: 14,
                opacity: 0.5,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--muted)',
                  letterSpacing: 1.5,
                  width: 22,
                }}
              >
                {game.num}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 20,
                    lineHeight: 1.1,
                    color: 'var(--cream-2)',
                  }}
                >
                  {game.name}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--muted)',
                    marginTop: 3,
                    letterSpacing: 0.4,
                  }}
                >
                  {game.tagline}
                </div>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 13,
                  color: 'var(--muted)',
                }}
              >
                soon
              </div>
            </div>
          ))}
        </>
      )}

      {/* Bottom spacing for nav */}
      <div style={{ height: 120 }} />
    </div>
  );
}
