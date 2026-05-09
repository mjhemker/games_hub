'use client';

import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Card as CardType, CardCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PromptCardProps {
  card: CardType;
  index: number;
  isActive: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  gradient?: string;
}

const categoryColors: Record<CardCategory, string> = {
  challenge: 'bg-orange-500',
  question: 'bg-blue-500',
  rule: 'bg-purple-500',
  drink: 'bg-amber-500',
  truth: 'bg-pink-500',
  dare: 'bg-red-500',
  general: 'bg-slate-500',
};

const categoryLabels: Record<CardCategory, string> = {
  challenge: 'Challenge',
  question: 'Question',
  rule: 'Group Rule',
  drink: 'Drink',
  truth: 'Truth',
  dare: 'Dare',
  general: 'General',
};

export function PromptCard({
  card,
  index,
  isActive,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  gradient = 'from-slate-800 to-slate-900',
}: PromptCardProps) {
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -100 && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.x > 100 && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          onClick={onTap}
          className={cn(
            'absolute inset-4 rounded-3xl p-8 flex flex-col items-center justify-center',
            'bg-gradient-to-br shadow-2xl cursor-pointer select-none',
            gradient
          )}
          style={{ perspective: '1000px' }}
        >
          {card.category && (
            <div
              className={cn(
                'absolute top-6 left-6 px-3 py-1 rounded-full text-sm font-medium text-white',
                categoryColors[card.category]
              )}
            >
              {categoryLabels[card.category]}
            </div>
          )}

          <p className="text-3xl md:text-4xl font-bold text-white text-center leading-tight">
            {card.text}
          </p>

          {card.drinkCount && (
            <div className="absolute bottom-6 right-6 flex items-center gap-2 text-white/70">
              <span className="text-2xl font-bold">{card.drinkCount}</span>
              <span className="text-sm">sips</span>
            </div>
          )}

          <div className="absolute bottom-6 left-6 text-white/40 text-sm">
            Tap to continue
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CardStack({
  cards,
  currentIndex,
  onNext,
  onPrevious,
  onFavorite,
  gradient,
}: {
  cards: CardType[];
  currentIndex: number;
  onNext: () => void;
  onPrevious?: () => void;
  onFavorite?: (cardId: string) => void;
  gradient?: string;
}) {
  const currentCard = cards[currentIndex];

  if (!currentCard) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/60">
          <p className="text-xl font-medium">No more cards!</p>
          <p className="text-sm mt-2">Generate more or switch decks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <PromptCard
        card={currentCard}
        index={currentIndex}
        isActive={true}
        onSwipeLeft={onPrevious}
        onSwipeRight={() => {
          if (onFavorite) onFavorite(currentCard.id);
          onNext();
        }}
        onTap={onNext}
        gradient={gradient}
      />
    </div>
  );
}
