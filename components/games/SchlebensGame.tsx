'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppStore, useHaptics } from '@/lib/store';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton } from '@/components/ui/design-system';

// Dice face SVG component
function DiceFace({ value, size = 100, color = 'var(--cream)' }: { value: number; size?: number; color?: string }) {
  const dotPositions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  };

  const dots = dotPositions[value] || [];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="12"
        fill="var(--ink-2)"
        stroke={color}
        strokeWidth="2"
      />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="10" fill={color} />
      ))}
    </svg>
  );
}

export function SchlebensGame() {
  const { vibrate } = useHaptics();
  const { gameState, updateGameState } = useAppStore();
  const state = gameState['schlebens'];

  const [die1, setDie1] = useState<number | null>(null);
  const [die2, setDie2] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isSchlebens, setIsSchlebens] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [rollKey, setRollKey] = useState(0);

  const checkSchlebens = (d1: number, d2: number): boolean => {
    const sum = d1 + d2;
    const isDoubles = d1 === d2;
    return sum === 7 || sum === 11 || isDoubles;
  };

  const rollDice = () => {
    if (isRolling) return;

    setIsRolling(true);
    setIsSchlebens(false);
    setShowCelebration(false);
    vibrate([50, 30, 50]);

    // Animate rolling
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);

        // Final roll
        const finalDie1 = Math.floor(Math.random() * 6) + 1;
        const finalDie2 = Math.floor(Math.random() * 6) + 1;
        setDie1(finalDie1);
        setDie2(finalDie2);
        setRollKey((prev) => prev + 1);

        const isWin = checkSchlebens(finalDie1, finalDie2);
        setIsSchlebens(isWin);

        if (isWin) {
          vibrate([100, 50, 100, 50, 200, 100, 300]);
          setTimeout(() => setShowCelebration(true), 200);
          updateGameState('schlebens', {
            totalRolls: state.totalRolls + 1,
            schlebensCount: state.schlebensCount + 1,
          });
        } else {
          updateGameState('schlebens', {
            totalRolls: state.totalRolls + 1,
          });
        }

        setIsRolling(false);
      }
    }, 80);
  };

  const resetStats = () => {
    updateGameState('schlebens', {
      totalRolls: 0,
      schlebensCount: 0,
    });
  };

  const sum = die1 && die2 ? die1 + die2 : null;
  const isDoubles = die1 && die2 && die1 === die2;

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
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
          &larr; INDEX
        </Link>

        <Kicker color="var(--copper)" className="mt-8">
          Nº 11
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
          <ItalicAccent>Schlebens</ItalicAccent>
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
          Roll the dice. 7, 11, or doubles = SCHLEBENS!
        </div>
      </div>

      {/* Dice Display */}
      <div style={{ padding: '40px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <motion.div
            key={`die1-${rollKey}`}
            animate={isRolling ? { rotate: [0, 360], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
          >
            {die1 ? (
              <DiceFace value={die1} size={120} color={isSchlebens ? 'var(--copper)' : 'var(--cream)'} />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  border: '2px dashed var(--rule)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Kicker color="var(--muted)">?</Kicker>
              </div>
            )}
          </motion.div>

          <motion.div
            key={`die2-${rollKey}`}
            animate={isRolling ? { rotate: [0, -360], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
          >
            {die2 ? (
              <DiceFace value={die2} size={120} color={isSchlebens ? 'var(--copper)' : 'var(--cream)'} />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  border: '2px dashed var(--rule)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Kicker color="var(--muted)">?</Kicker>
              </div>
            )}
          </motion.div>
        </div>

        {/* Result Display */}
        {sum && !isRolling && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 24, textAlign: 'center' }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                color: 'var(--muted)',
                letterSpacing: 2,
              }}
            >
              {isDoubles ? `DOUBLES (${die1} + ${die2})` : `${die1} + ${die2} = ${sum}`}
            </div>
          </motion.div>
        )}

        {/* SCHLEBENS Celebration */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, repeat: 3 }}
              style={{
                position: 'absolute',
                top: '35%',
                left: 0,
                right: 0,
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <motion.div
                animate={{
                  textShadow: [
                    '0 0 20px var(--copper)',
                    '0 0 60px var(--copper)',
                    '0 0 20px var(--copper)',
                  ],
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 56,
                  fontStyle: 'italic',
                  color: 'var(--copper)',
                  letterSpacing: 4,
                }}
              >
                SCHLEBENS!
              </motion.div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  color: 'var(--cream)',
                  marginTop: 10,
                  letterSpacing: 3,
                }}
              >
                DRINK!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 22px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 30,
            padding: 16,
            border: '1px solid var(--rule)',
            background: 'var(--ink-2)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>
              TOTAL ROLLS
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--cream)', marginTop: 4 }}>
              {state.totalRolls}
            </div>
          </div>
          <div style={{ width: 1, background: 'var(--rule)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>
              SCHLEBENS
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--copper)', marginTop: 4 }}>
              {state.schlebensCount}
            </div>
          </div>
        </div>
      </div>

      {/* Rules reminder */}
      <div style={{ padding: '20px 22px' }}>
        <div
          style={{
            padding: 14,
            border: '1px solid var(--rule)',
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            color: 'var(--cream-2)',
            lineHeight: 1.5,
          }}
        >
          <Kicker color="var(--muted)" style={{ marginBottom: 8 }}>SCHLEBENS TRIGGERS</Kicker>
          <span style={{ color: 'var(--copper)' }}>7</span> &bull; <span style={{ color: 'var(--copper)' }}>11</span> &bull; <span style={{ color: 'var(--copper)' }}>Doubles</span> (same number on both dice)
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <SecondaryButton onClick={resetStats}>RESET</SecondaryButton>
        </div>
        <div style={{ flex: 2 }}>
          <PrimaryButton onClick={rollDice} disabled={isRolling}>
            {isRolling ? 'ROLLING...' : 'ROLL DICE'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
