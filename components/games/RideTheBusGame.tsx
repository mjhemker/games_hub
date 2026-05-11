'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useHaptics } from '@/lib/store';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton } from '@/components/ui/design-system';
import { PlayingCard } from '@/lib/types';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

const RANK_VALUES: Record<string, number> = {
  'A': 14, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13,
};

const suitColors: Record<string, string> = {
  '♠': '#0c0a09',
  '♣': '#0c0a09',
  '♥': '#c4644f',
  '♦': '#c4644f',
};

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

function CardDisplay({ card, size = 'medium', faceDown = false, highlight = false }: {
  card: PlayingCard | null;
  size?: 'small' | 'medium' | 'large';
  faceDown?: boolean;
  highlight?: boolean;
}) {
  const sizes = {
    small: { width: 60, height: 84, fontSize: 14, suitSize: 24 },
    medium: { width: 100, height: 140, fontSize: 20, suitSize: 40 },
    large: { width: 140, height: 196, fontSize: 28, suitSize: 56 },
  };
  const s = sizes[size];

  if (!card || faceDown) {
    return (
      <div style={{
        width: s.width,
        height: s.height,
        background: 'var(--ink-2)',
        border: '1px solid var(--rule)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '80%',
          height: '80%',
          border: '2px solid var(--rule)',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: s.fontSize,
            color: 'var(--game-beer-pressure)',
          }}>
            RTB
          </div>
        </div>
      </div>
    );
  }

  const color = suitColors[card.suit] || '#0c0a09';

  return (
    <div style={{
      width: s.width,
      height: s.height,
      background: 'var(--cream)',
      border: highlight ? '3px solid var(--copper)' : '1px solid var(--rule)',
      borderRadius: 8,
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-serif)',
      fontStyle: 'italic',
      boxShadow: highlight ? '0 0 20px var(--copper)' : 'none',
    }}>
      <div style={{ fontSize: s.fontSize, color }}>{card.rank}{card.suit}</div>
      <div style={{ textAlign: 'center', fontSize: s.suitSize, color }}>{card.suit}</div>
      <div style={{ fontSize: s.fontSize, textAlign: 'right', transform: 'rotate(180deg)', color }}>{card.rank}{card.suit}</div>
    </div>
  );
}

type Phase = 'setup' | 'questions' | 'pyramid' | 'ride' | 'complete';

export function RideTheBusGame() {
  const { vibrate } = useHaptics();

  // Game state
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [playerCards, setPlayerCards] = useState<Record<string, PlayingCard[]>>({});
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [currentCard, setCurrentCard] = useState<PlayingCard | null>(null);
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Pyramid state
  const [pyramid, setPyramid] = useState<PlayingCard[]>([]);
  const [pyramidRevealed, setPyramidRevealed] = useState<boolean[]>([]);
  const [currentPyramidRow, setCurrentPyramidRow] = useState(0);
  const [currentPyramidIndex, setCurrentPyramidIndex] = useState(0);
  const [matchingPlayer, setMatchingPlayer] = useState<string | null>(null);

  // Bus riding state
  const [busRider, setBusRider] = useState<string | null>(null);
  const [busStreak, setBusStreak] = useState(0);
  const [busQuestion, setBusQuestion] = useState(1);
  const [busCards, setBusCards] = useState<PlayingCard[]>([]);

  const PYRAMID_ROWS = [5, 4, 3, 2, 1];
  const PYRAMID_DRINKS = [1, 2, 3, 4, 5];

  const QUESTIONS = [
    { num: 1, question: 'Red or Black?', options: ['Red', 'Black'] },
    { num: 2, question: 'Higher or Lower?', options: ['Higher', 'Lower'] },
    { num: 3, question: 'In Between or Outside?', options: ['In Between', 'Outside'] },
    { num: 4, question: 'Guess the Suit', options: ['♠', '♥', '♦', '♣'] },
  ];

  const addPlayer = () => {
    if (newPlayerName.trim() && !players.includes(newPlayerName.trim())) {
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (name: string) => {
    setPlayers(players.filter(p => p !== name));
  };

  const startGame = () => {
    if (players.length < 2) return;

    const shuffled = shuffleDeck(createDeck());
    setDeck(shuffled);
    setPlayerCards(Object.fromEntries(players.map(p => [p, []])));
    setCurrentPlayerIndex(0);
    setCurrentQuestion(1);
    setPhase('questions');
    vibrate([50, 30, 50]);
  };

  const currentPlayer = players[currentPlayerIndex];

  const handleGuess = (guess: string) => {
    if (!deck.length || showResult) return;

    const card = deck[0];
    const newDeck = deck.slice(1);
    setDeck(newDeck);
    setCurrentCard(card);

    let correct = false;
    const playerHand = playerCards[currentPlayer] || [];

    if (currentQuestion === 1) {
      // Red or Black
      const isRed = card.suit === '♥' || card.suit === '♦';
      correct = (guess === 'Red' && isRed) || (guess === 'Black' && !isRed);
    } else if (currentQuestion === 2) {
      // Higher or Lower
      const prevCard = playerHand[0];
      if (prevCard) {
        const prevValue = RANK_VALUES[prevCard.rank];
        const currValue = RANK_VALUES[card.rank];
        correct = (guess === 'Higher' && currValue > prevValue) ||
                  (guess === 'Lower' && currValue < prevValue);
      }
    } else if (currentQuestion === 3) {
      // In Between or Outside
      if (playerHand.length >= 2) {
        const val1 = RANK_VALUES[playerHand[0].rank];
        const val2 = RANK_VALUES[playerHand[1].rank];
        const currValue = RANK_VALUES[card.rank];
        const low = Math.min(val1, val2);
        const high = Math.max(val1, val2);
        const isBetween = currValue > low && currValue < high;
        correct = (guess === 'In Between' && isBetween) ||
                  (guess === 'Outside' && !isBetween && currValue !== low && currValue !== high);
      }
    } else if (currentQuestion === 4) {
      // Guess the suit
      correct = card.suit === guess;
    }

    setLastGuessCorrect(correct);
    setShowResult(true);

    // Add card to player's hand
    setPlayerCards(prev => ({
      ...prev,
      [currentPlayer]: [...(prev[currentPlayer] || []), card],
    }));

    vibrate(correct ? [50] : [100, 50, 100]);
  };

  const nextTurn = () => {
    setShowResult(false);
    setCurrentCard(null);
    setLastGuessCorrect(null);

    // Check if we need to move to next question or player
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      // All players answered this question
      if (currentQuestion < 4) {
        setCurrentQuestion(currentQuestion + 1);
        setCurrentPlayerIndex(0);
      } else {
        // All questions done, start pyramid
        startPyramid();
      }
    }
  };

  const startPyramid = () => {
    // Create pyramid (15 cards: 5+4+3+2+1)
    const pyramidCards = deck.slice(0, 15);
    const remaining = deck.slice(15);
    setPyramid(pyramidCards);
    setDeck(remaining);
    setPyramidRevealed(new Array(15).fill(false));
    setCurrentPyramidRow(0);
    setCurrentPyramidIndex(0);
    setPhase('pyramid');
    vibrate([50, 30, 50]);
  };

  const revealPyramidCard = () => {
    const newRevealed = [...pyramidRevealed];
    newRevealed[currentPyramidIndex] = true;
    setPyramidRevealed(newRevealed);
    vibrate(50);
  };

  const handlePyramidMatch = (playerName: string) => {
    setMatchingPlayer(playerName);
    vibrate([100, 50, 100]);

    // Remove a matching card from player's hand
    const hand = playerCards[playerName];
    const pyramidCard = pyramid[currentPyramidIndex];
    const matchIdx = hand.findIndex(c => c.rank === pyramidCard.rank);

    if (matchIdx !== -1) {
      const newHand = [...hand];
      newHand.splice(matchIdx, 1);
      setPlayerCards(prev => ({ ...prev, [playerName]: newHand }));
    }

    setTimeout(() => setMatchingPlayer(null), 1500);
  };

  const nextPyramidCard = () => {
    // Calculate next position
    let nextIdx = currentPyramidIndex + 1;
    let nextRow = currentPyramidRow;

    // Check if we need to move to next row
    let cardsInPreviousRows = 0;
    for (let i = 0; i <= currentPyramidRow; i++) {
      cardsInPreviousRows += PYRAMID_ROWS[i];
    }

    if (nextIdx >= cardsInPreviousRows) {
      nextRow++;
    }

    if (nextIdx >= 15) {
      // Pyramid complete, find who rides the bus
      const loser = findBusRider();
      setBusRider(loser);
      setPhase('ride');
      vibrate([100, 50, 100, 50, 200]);
      return;
    }

    setCurrentPyramidIndex(nextIdx);
    setCurrentPyramidRow(nextRow);
  };

  const findBusRider = (): string => {
    let maxCards = -1;
    let loser = players[0];

    for (const player of players) {
      const cardCount = (playerCards[player] || []).length;
      if (cardCount > maxCards) {
        maxCards = cardCount;
        loser = player;
      } else if (cardCount === maxCards) {
        // Tie breaker: highest card
        const currentHigh = Math.max(...(playerCards[loser] || []).map(c => RANK_VALUES[c.rank]));
        const challengerHigh = Math.max(...(playerCards[player] || []).map(c => RANK_VALUES[c.rank]));
        if (challengerHigh > currentHigh) {
          loser = player;
        }
      }
    }

    return loser;
  };

  const handleBusGuess = (guess: string) => {
    if (!deck.length) {
      setPhase('complete');
      return;
    }

    const card = deck[0];
    const newDeck = deck.slice(1);
    setDeck(newDeck);
    setBusCards(prev => [...prev, card]);

    let correct = false;

    if (busQuestion === 1) {
      const isRed = card.suit === '♥' || card.suit === '♦';
      correct = (guess === 'Red' && isRed) || (guess === 'Black' && !isRed);
    } else if (busQuestion === 2) {
      const prevCard = busCards[busCards.length - 1] || (busCards.length === 0 ? null : busCards[0]);
      if (prevCard) {
        const prevValue = RANK_VALUES[prevCard.rank];
        const currValue = RANK_VALUES[card.rank];
        correct = (guess === 'Higher' && currValue > prevValue) ||
                  (guess === 'Lower' && currValue < prevValue);
      } else {
        correct = true; // First card in bus, auto-correct
      }
    } else if (busQuestion === 3) {
      if (busCards.length >= 2) {
        const val1 = RANK_VALUES[busCards[busCards.length - 2].rank];
        const val2 = RANK_VALUES[busCards[busCards.length - 1].rank];
        const currValue = RANK_VALUES[card.rank];
        const low = Math.min(val1, val2);
        const high = Math.max(val1, val2);
        const isBetween = currValue > low && currValue < high;
        correct = (guess === 'In Between' && isBetween) ||
                  (guess === 'Outside' && !isBetween && currValue !== low && currValue !== high);
      }
    } else if (busQuestion === 4) {
      correct = card.suit === guess;
    }

    if (correct) {
      vibrate(50);
      if (busQuestion === 4) {
        // Won! Got off the bus
        setPhase('complete');
        vibrate([100, 50, 100, 50, 200, 100, 300]);
      } else {
        setBusQuestion(busQuestion + 1);
        setBusStreak(busStreak + 1);
      }
    } else {
      // Wrong! Start over
      vibrate([100, 50, 100, 50, 100]);
      setBusQuestion(1);
      setBusStreak(0);
      setBusCards([card]); // Keep only the new card
    }
  };

  const resetGame = () => {
    setPhase('setup');
    setPlayers([]);
    setPlayerCards({});
    setDeck([]);
    setPyramid([]);
    setPyramidRevealed([]);
    setCurrentPlayerIndex(0);
    setCurrentQuestion(1);
    setBusRider(null);
    setBusStreak(0);
    setBusQuestion(1);
    setBusCards([]);
    setCurrentCard(null);
    setShowResult(false);
  };

  const getPyramidRowDrinks = (rowIndex: number): number => {
    return PYRAMID_DRINKS[rowIndex] || 1;
  };

  const getCurrentPyramidRow = (idx: number): number => {
    let count = 0;
    for (let i = 0; i < PYRAMID_ROWS.length; i++) {
      count += PYRAMID_ROWS[i];
      if (idx < count) return i;
    }
    return PYRAMID_ROWS.length - 1;
  };

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

        <Kicker color="var(--game-beer-pressure)" className="mt-8">
          Nº 12
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
          <ItalicAccent>Ride the Bus</ItalicAccent>
        </div>
      </div>

      {/* Setup Phase */}
      {phase === 'setup' && (
        <div style={{ padding: '24px 22px' }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 14,
            color: 'var(--cream-2)',
            marginBottom: 24,
            lineHeight: 1.5,
          }}>
            Four questions. A pyramid of cards. One rider.
          </div>

          <Kicker color="var(--muted)" style={{ marginBottom: 12 }}>PLAYERS ({players.length})</Kicker>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="Enter name..."
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'var(--ink-2)',
                border: '1px solid var(--rule)',
                color: 'var(--cream)',
                fontFamily: 'var(--font-serif)',
                fontSize: 16,
              }}
            />
            <button
              onClick={addPlayer}
              style={{
                padding: '12px 20px',
                background: 'var(--game-beer-pressure)',
                border: 'none',
                color: 'var(--cream)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: 1,
                cursor: 'pointer',
              }}
            >
              ADD
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {players.map((player) => (
              <div
                key={player}
                onClick={() => removePlayer(player)}
                style={{
                  padding: '8px 16px',
                  background: 'var(--ink-2)',
                  border: '1px solid var(--rule)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                  color: 'var(--cream)',
                  cursor: 'pointer',
                }}
              >
                {player} ×
              </div>
            ))}
          </div>

          {/* Rules summary */}
          <div style={{
            padding: 16,
            border: '1px solid var(--rule)',
            background: 'var(--ink-2)',
            marginBottom: 24,
          }}>
            <Kicker color="var(--muted)" style={{ marginBottom: 12 }}>HOW TO PLAY</Kicker>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--cream-2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--cream)' }}>Phase 1:</strong> Answer 4 questions about cards you&apos;ll receive. Wrong = drink.<br/><br/>
              <strong style={{ color: 'var(--cream)' }}>Phase 2:</strong> Pyramid reveals. Match cards to give drinks.<br/><br/>
              <strong style={{ color: 'var(--cream)' }}>Phase 3:</strong> Most cards = ride the bus. Answer all 4 correctly in a row to get off.
            </div>
          </div>

          <PrimaryButton onClick={startGame} disabled={players.length < 2}>
            {players.length < 2 ? 'ADD AT LEAST 2 PLAYERS' : 'START GAME'}
          </PrimaryButton>
        </div>
      )}

      {/* Questions Phase */}
      {phase === 'questions' && (
        <div style={{ padding: '24px 22px' }}>
          {/* Current player indicator */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Kicker color="var(--muted)">QUESTION {currentQuestion} OF 4</Kicker>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              fontStyle: 'italic',
              color: 'var(--cream)',
              marginTop: 8,
            }}>
              {currentPlayer}&apos;s Turn
            </div>
          </div>

          {/* Player's current cards */}
          {playerCards[currentPlayer]?.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {playerCards[currentPlayer].map((card, i) => (
                <CardDisplay key={i} card={card} size="small" />
              ))}
            </div>
          )}

          {/* Question */}
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--font-serif)',
            fontSize: 24,
            color: 'var(--cream)',
            marginBottom: 32,
          }}>
            {QUESTIONS[currentQuestion - 1].question}
          </div>

          {/* Result display */}
          <AnimatePresence>
            {showResult && currentCard && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}
              >
                <CardDisplay card={currentCard} size="large" highlight={lastGuessCorrect === true} />
                <div style={{
                  marginTop: 16,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 20,
                  color: lastGuessCorrect ? 'var(--copper)' : 'var(--game-beer-pressure)',
                }}>
                  {lastGuessCorrect ? 'Correct!' : 'Wrong! Take a drink!'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options */}
          {!showResult && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {QUESTIONS[currentQuestion - 1].options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleGuess(option)}
                  style={{
                    padding: '16px 32px',
                    background: option === '♥' || option === '♦' ? '#c4644f' :
                               option === '♠' || option === '♣' ? 'var(--ink-2)' :
                               option === 'Red' ? '#c4644f' :
                               option === 'Black' ? 'var(--ink-2)' : 'var(--ink-2)',
                    border: '1px solid var(--rule)',
                    color: 'var(--cream)',
                    fontFamily: 'var(--font-serif)',
                    fontSize: option.length === 1 ? 28 : 18,
                    cursor: 'pointer',
                    minWidth: 100,
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Next button */}
          {showResult && (
            <div style={{ marginTop: 24 }}>
              <PrimaryButton onClick={nextTurn}>
                {currentPlayerIndex < players.length - 1 ? 'NEXT PLAYER' :
                 currentQuestion < 4 ? 'NEXT QUESTION' : 'START PYRAMID'}
              </PrimaryButton>
            </div>
          )}
        </div>
      )}

      {/* Pyramid Phase */}
      {phase === 'pyramid' && (
        <div style={{ padding: '24px 22px' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Kicker color="var(--game-beer-pressure)">THE PYRAMID</Kicker>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--muted)',
              marginTop: 8,
            }}>
              Row {getCurrentPyramidRow(currentPyramidIndex) + 1} · {getPyramidRowDrinks(getCurrentPyramidRow(currentPyramidIndex))} drinks
            </div>
          </div>

          {/* Pyramid display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            {PYRAMID_ROWS.map((rowCount, rowIndex) => {
              const startIdx = PYRAMID_ROWS.slice(0, rowIndex).reduce((a, b) => a + b, 0);
              return (
                <div key={rowIndex} style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: rowCount }).map((_, cardIndex) => {
                    const idx = startIdx + cardIndex;
                    const isRevealed = pyramidRevealed[idx];
                    const isCurrent = idx === currentPyramidIndex;
                    return (
                      <motion.div
                        key={idx}
                        animate={isCurrent && !isRevealed ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        style={{
                          transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <CardDisplay
                          card={pyramid[idx]}
                          size="small"
                          faceDown={!isRevealed}
                          highlight={isCurrent && isRevealed}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Current card revealed */}
          {pyramidRevealed[currentPyramidIndex] && (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 16,
                color: 'var(--cream)',
                marginBottom: 12,
              }}>
                Who has a matching <span style={{ color: 'var(--copper)' }}>{pyramid[currentPyramidIndex]?.rank}</span>?
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                {players.map((player) => {
                  const hasMatch = playerCards[player]?.some(c => c.rank === pyramid[currentPyramidIndex]?.rank);
                  return (
                    <button
                      key={player}
                      onClick={() => hasMatch && handlePyramidMatch(player)}
                      disabled={!hasMatch}
                      style={{
                        padding: '10px 20px',
                        background: matchingPlayer === player ? 'var(--copper)' : hasMatch ? 'var(--ink-2)' : 'transparent',
                        border: hasMatch ? '1px solid var(--copper)' : '1px solid var(--rule)',
                        color: hasMatch ? 'var(--cream)' : 'var(--muted)',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 14,
                        cursor: hasMatch ? 'pointer' : 'default',
                        opacity: hasMatch ? 1 : 0.5,
                      }}
                    >
                      {player} ({playerCards[player]?.length || 0})
                    </button>
                  );
                })}
              </div>

              {matchingPlayer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 16,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 18,
                    color: 'var(--copper)',
                  }}
                >
                  {matchingPlayer} gives out {getPyramidRowDrinks(getCurrentPyramidRow(currentPyramidIndex))} drinks!
                </motion.div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            {!pyramidRevealed[currentPyramidIndex] ? (
              <PrimaryButton onClick={revealPyramidCard}>REVEAL CARD</PrimaryButton>
            ) : (
              <PrimaryButton onClick={nextPyramidCard}>
                {currentPyramidIndex >= 14 ? 'FIND THE BUS RIDER' : 'NEXT CARD'}
              </PrimaryButton>
            )}
          </div>
        </div>
      )}

      {/* Ride the Bus Phase */}
      {phase === 'ride' && (
        <div style={{ padding: '24px 22px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Kicker color="var(--game-beer-pressure)">RIDING THE BUS</Kicker>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              fontStyle: 'italic',
              color: 'var(--copper)',
              marginTop: 8,
            }}>
              {busRider}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--muted)',
              marginTop: 8,
            }}>
              Answer all 4 questions correctly in a row to get off!
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {[1, 2, 3, 4].map((q) => (
              <div
                key={q}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: q < busQuestion ? 'var(--copper)' : q === busQuestion ? 'var(--ink-2)' : 'transparent',
                  border: q <= busQuestion ? '2px solid var(--copper)' : '1px solid var(--rule)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  color: q < busQuestion ? 'var(--cream)' : q === busQuestion ? 'var(--copper)' : 'var(--muted)',
                }}
              >
                {q}
              </div>
            ))}
          </div>

          {/* Bus cards */}
          {busCards.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {busCards.slice(-3).map((card, i) => (
                <CardDisplay key={i} card={card} size="small" />
              ))}
            </div>
          )}

          {/* Question */}
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--font-serif)',
            fontSize: 24,
            color: 'var(--cream)',
            marginBottom: 32,
          }}>
            {QUESTIONS[busQuestion - 1].question}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {QUESTIONS[busQuestion - 1].options.map((option) => (
              <button
                key={option}
                onClick={() => handleBusGuess(option)}
                style={{
                  padding: '16px 32px',
                  background: option === '♥' || option === '♦' ? '#c4644f' :
                             option === '♠' || option === '♣' ? 'var(--ink-2)' :
                             option === 'Red' ? '#c4644f' :
                             option === 'Black' ? 'var(--ink-2)' : 'var(--ink-2)',
                  border: '1px solid var(--rule)',
                  color: 'var(--cream)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: option.length === 1 ? 28 : 18,
                  cursor: 'pointer',
                  minWidth: 100,
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {deck.length < 10 && (
            <div style={{
              textAlign: 'center',
              marginTop: 24,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--muted)',
            }}>
              {deck.length} cards remaining in deck
            </div>
          )}
        </div>
      )}

      {/* Complete Phase */}
      {phase === 'complete' && (
        <div style={{ padding: '24px 22px', textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚌</div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              color: 'var(--cream)',
              marginBottom: 8,
            }}>
              {deck.length === 0 ? 'Deck Empty!' : `${busRider} Got Off!`}
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 16,
              color: 'var(--cream-2)',
              marginBottom: 32,
            }}>
              {deck.length === 0
                ? `${busRider} rode the bus until the deck ran out!`
                : 'Successfully answered all 4 questions in a row!'}
            </div>
            <PrimaryButton onClick={resetGame}>PLAY AGAIN</PrimaryButton>
          </motion.div>
        </div>
      )}
    </div>
  );
}
