'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/lib/types';
import { useHaptics } from '@/lib/store';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton } from '@/components/ui/design-system';

interface HeadsUpViewProps {
  cards: Card[];
  onRoundEnd: (score: number, skipped: number) => void;
}

type GamePhase = 'ready' | 'playing' | 'results';

export function HeadsUpView({ cards, onRoundEnd }: HeadsUpViewProps) {
  const { vibrate } = useHaptics();
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [deviceOrientation, setDeviceOrientation] = useState<'neutral' | 'down' | 'up'>('neutral');
  const [hasOrientationPermission, setHasOrientationPermission] = useState(false);

  const currentCard = cards[currentIndex];

  // Request device orientation permission (iOS 13+)
  const requestOrientationPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      // @ts-expect-error - iOS specific API
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        // @ts-expect-error - iOS specific API
        const permission = await DeviceOrientationEvent.requestPermission();
        setHasOrientationPermission(permission === 'granted');
      } catch {
        setHasOrientationPermission(false);
      }
    } else {
      // Non-iOS or older browsers
      setHasOrientationPermission(true);
    }
  };

  // Handle device orientation
  useEffect(() => {
    if (phase !== 'playing' || !hasOrientationPermission) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta; // -180 to 180, front-back tilt
      if (beta === null) return;

      if (beta > 60) {
        setDeviceOrientation('down');
      } else if (beta < -30) {
        setDeviceOrientation('up');
      } else {
        setDeviceOrientation('neutral');
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [phase, hasOrientationPermission]);

  // Handle orientation gestures
  useEffect(() => {
    if (phase !== 'playing') return;

    if (deviceOrientation === 'down') {
      handleSkip();
      setDeviceOrientation('neutral');
    } else if (deviceOrientation === 'up') {
      // Not used in standard Heads Up
    }
  }, [deviceOrientation, phase]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;

    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(timer);
          endRound();
          return 0;
        }
        if (t <= 5) {
          vibrate(50);
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const startGame = async () => {
    await requestOrientationPermission();
    setPhase('playing');
    setTimeRemaining(60);
    setScore(0);
    setSkipped(0);
    setCurrentIndex(0);
    vibrate(100);
  };

  const handleCorrect = useCallback(() => {
    vibrate([50, 50, 50]);
    setScore((s) => s + 1);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      endRound();
    }
  }, [currentIndex, cards.length]);

  const handleSkip = useCallback(() => {
    vibrate(50);
    setSkipped((s) => s + 1);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      endRound();
    }
  }, [currentIndex, cards.length]);

  const endRound = () => {
    setPhase('results');
    onRoundEnd(score, skipped);
  };

  const resetGame = () => {
    setPhase('ready');
    setTimeRemaining(60);
    setScore(0);
    setSkipped(0);
    setCurrentIndex(0);
  };

  if (phase === 'ready') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 24, transform: 'rotate(90deg)' }}>📱</div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 28,
            color: 'var(--cream)',
            marginBottom: 8,
          }}
        >
          Ready to <ItalicAccent>play</ItalicAccent>?
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 14,
            color: 'var(--cream-2)',
            marginBottom: 32,
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          Hold the phone to your forehead. Tilt down to skip, tap when you get it right.
        </div>
        <PrimaryButton onClick={startGame}>START ROUND</PrimaryButton>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              color: 'var(--cream)',
            }}
          >
            Round <ItalicAccent>over</ItalicAccent>!
          </div>
        </motion.div>

        <div style={{ display: 'flex', gap: 48, marginBottom: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 48,
                color: 'var(--game-categories)',
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: 1.5,
              }}
            >
              CORRECT
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 48,
                color: 'var(--copper)',
              }}
            >
              {skipped}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--muted)',
                letterSpacing: 1.5,
              }}
            >
              SKIPPED
            </div>
          </div>
        </div>

        <PrimaryButton onClick={resetGame}>PLAY AGAIN</PrimaryButton>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Timer and Score */}
      <div style={{ position: 'absolute', top: 16, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 36,
            color: timeRemaining <= 10 ? '#ef4444' : 'var(--cream)',
          }}
        >
          {timeRemaining}s
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: 1,
          }}
        >
          {score} correct · {skipped} skipped
        </div>
      </div>

      {/* Main card area */}
      <div
        onClick={handleCorrect}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          cursor: 'pointer',
        }}
      >
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -50, rotateX: 15 }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 48,
                  lineHeight: 1.1,
                  color: 'var(--cream)',
                }}
              >
                {currentCard.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls (for devices without orientation) */}
      <div style={{ display: 'flex', gap: 12, padding: '0 22px 24px', justifyContent: 'center' }}>
        <div style={{ flex: 1, maxWidth: 140 }}>
          <SecondaryButton onClick={handleSkip}>SKIP</SecondaryButton>
        </div>
        <div style={{ flex: 1, maxWidth: 140 }}>
          <button
            onClick={handleCorrect}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'var(--game-categories)',
              border: 'none',
              color: 'var(--cream)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: 1.5,
              cursor: 'pointer',
            }}
          >
            CORRECT
          </button>
        </div>
      </div>
    </div>
  );
}
