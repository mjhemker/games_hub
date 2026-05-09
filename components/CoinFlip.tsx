'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CoinFlipProps {
  onResult: (result: 'heads' | 'tails') => void;
  className?: string;
}

export function CoinFlip({ onResult, className }: CoinFlipProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    // Random result
    const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';

    // Delay showing result for animation
    setTimeout(() => {
      setResult(coinResult);
      setIsFlipping(false);
      onResult(coinResult);
    }, 1500);
  };

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <div className="relative w-32 h-32" style={{ perspective: '1000px' }}>
        <motion.div
          className="w-full h-full"
          animate={{
            rotateY: isFlipping ? [0, 1800] : 0,
          }}
          transition={{
            duration: 1.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Heads side */}
          <div
            className={cn(
              'absolute inset-0 rounded-full flex items-center justify-center',
              'bg-gradient-to-br from-yellow-400 to-amber-600',
              'border-4 border-yellow-300 shadow-lg',
              'backface-hidden'
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-4xl">👑</span>
          </div>
          {/* Tails side */}
          <div
            className={cn(
              'absolute inset-0 rounded-full flex items-center justify-center',
              'bg-gradient-to-br from-slate-400 to-slate-600',
              'border-4 border-slate-300 shadow-lg',
              'backface-hidden'
            )}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="text-4xl">🦅</span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {result && !isFlipping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <p className="text-2xl font-bold text-white capitalize">{result}!</p>
            <p className="text-slate-400 text-sm mt-1">
              {result === 'heads' ? 'Question revealed!' : 'Stays a secret...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={flipCoin}
        disabled={isFlipping}
        size="lg"
        className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
      >
        {isFlipping ? 'Flipping...' : 'Flip Coin'}
      </Button>
    </div>
  );
}
