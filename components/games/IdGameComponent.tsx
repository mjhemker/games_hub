'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useAppStore, useHaptics } from '@/lib/store';
import { Kicker, ItalicAccent, PrimaryButton, SecondaryButton, PlayerChip, PlayerInput } from '@/components/ui/design-system';

import questions from '@/data/builtin/id-game-ranking.json';

type GamePhase = 'setup' | 'generate' | 'rank' | 'guess' | 'reveal';

export function IdGameComponent() {
  const { vibrate } = useHaptics();
  const { gameState, updateGameState } = useAppStore();
  const state = gameState['id-game'];

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [questionNumber, setQuestionNumber] = useState<number | null>(null);
  const [rankedPlayers, setRankedPlayers] = useState<string[]>([]);
  const [guessRange, setGuessRange] = useState<number[]>([]);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Load saved players on mount
  useEffect(() => {
    if (state.players && state.players.length > 0) {
      setPlayers(state.players);
    }
  }, []);

  const addPlayer = (name: string) => {
    const updatedPlayers = [...players, name];
    setPlayers(updatedPlayers);
    updateGameState('id-game', { players: updatedPlayers });
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
    updateGameState('id-game', { players: updatedPlayers });
  };

  const startGame = () => {
    if (players.length >= 2) {
      setPhase('generate');
      setCurrentPlayerIndex(0);
    }
  };

  const generateNumber = () => {
    vibrate(50);
    const num = Math.floor(Math.random() * questions.length) + 1;
    setQuestionNumber(num);
    setRankedPlayers([...players]);
    setPhase('rank');
  };

  const generateRange = () => {
    if (questionNumber === null) return;

    // Generate a range of 5 numbers including the actual question number
    const rangeSize = 5;
    const actualNum = questionNumber;

    // Random position for the actual number within the range
    const position = Math.floor(Math.random() * rangeSize);

    // Calculate start to keep actual number at the random position
    let start = actualNum - position;

    // Ensure we don't go below 1 or above max
    if (start < 1) start = 1;
    if (start + rangeSize - 1 > questions.length) {
      start = questions.length - rangeSize + 1;
    }

    const range: number[] = [];
    for (let i = 0; i < rangeSize; i++) {
      range.push(start + i);
    }

    setGuessRange(range);
    setPhase('guess');
  };

  const handleGuess = (num: number) => {
    setSelectedGuess(num);
  };

  const revealAnswer = () => {
    setIsRevealed(true);
    setPhase('reveal');
  };

  const nextRound = () => {
    const nextPlayer = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayer);
    setQuestionNumber(null);
    setRankedPlayers([]);
    setGuessRange([]);
    setSelectedGuess(null);
    setIsRevealed(false);
    setPhase('generate');
  };

  const endGame = () => {
    if (confirm('End the game?')) {
      setPhase('setup');
      setQuestionNumber(null);
      setRankedPlayers([]);
      setGuessRange([]);
      setSelectedGuess(null);
      setIsRevealed(false);
      setCurrentPlayerIndex(0);
    }
  };

  const currentPlayer = players[currentPlayerIndex];
  const currentQuestion = questionNumber ? questions[questionNumber - 1] : null;

  // ─── SETUP SCREEN ───────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
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

          <Kicker color="var(--game-id-game)" className="mt-8">
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
            The ID<br />
            <ItalicAccent>Game</ItalicAccent>
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
            Rank your friends from most to least likely. Can they guess which prompt you used?
          </div>

          {/* How to Play */}
          <div style={{ marginTop: 24, padding: 16, border: '1px solid var(--rule)', background: 'var(--ink-2)' }}>
            <Kicker color="var(--muted)">HOW TO PLAY</Kicker>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--cream-2)', marginTop: 10, lineHeight: 1.6 }}>
              1. Generate a random number (1-{questions.length})<br />
              2. Secretly view your prompt<br />
              3. Rank the group from most to least likely<br />
              4. Give a range of 5 numbers (including yours)<br />
              5. Group guesses which prompt you used!
            </div>
          </div>

          {/* Players */}
          <div style={{ marginTop: 30 }}>
            <Kicker color="var(--muted)">PLAYERS</Kicker>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {players.map((name, i) => (
                <PlayerChip key={i} name={name} onRemove={() => removePlayer(i)} />
              ))}
              <PlayerInput onAdd={addPlayer} />
            </div>
            {players.length < 2 && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--muted)',
                  marginTop: 12,
                  letterSpacing: 0.5,
                }}
              >
                Add at least 2 players to start
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16 }}>
          <PrimaryButton onClick={startGame} disabled={players.length < 2}>
            Start Game &rarr;
          </PrimaryButton>
        </div>

        <div style={{ height: 140 }} />
      </div>
    );
  }

  // ─── GENERATE NUMBER SCREEN ───────────────────────────────────────
  if (phase === 'generate') {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
        <div style={{ padding: '64px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={endGame}
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
              &larr; END GAME
            </button>
          </div>
        </div>

        <div style={{ padding: '60px 22px', textAlign: 'center' }}>
          <Kicker color="var(--copper)">{currentPlayer?.toUpperCase()}&apos;S TURN</Kicker>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              color: 'var(--cream)',
              marginTop: 20,
              lineHeight: 1.2,
            }}
          >
            Tap to generate<br />
            <ItalicAccent>your number</ItalicAccent>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--cream-2)',
              marginTop: 16,
            }}
          >
            Don&apos;t show anyone your screen!
          </div>

          <motion.button
            onClick={generateNumber}
            whileTap={{ scale: 0.95 }}
            style={{
              marginTop: 40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              border: '2px solid var(--copper)',
              background: 'var(--ink-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--copper)', letterSpacing: 2 }}>
              TAP
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--cream-2)', marginTop: 4 }}>
              1 - {questions.length}
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // ─── RANK PLAYERS SCREEN ───────────────────────────────────────
  if (phase === 'rank') {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
        <div style={{ padding: '64px 22px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Kicker color="var(--copper)">YOUR PROMPT</Kicker>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--copper)' }}>
              #{questionNumber}
            </div>
          </div>

          {/* The Question - Secret */}
          <div
            style={{
              marginTop: 16,
              padding: 20,
              border: '1px solid var(--copper)',
              background: 'var(--ink-2)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 22,
                color: 'var(--cream)',
                lineHeight: 1.3,
              }}
            >
              {currentQuestion}
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--muted)',
              marginTop: 12,
              letterSpacing: 0.5,
            }}
          >
            DON&apos;T SHOW ANYONE! Drag to reorder players.
          </div>

          {/* Draggable Player List */}
          <div style={{ marginTop: 20 }}>
            <Kicker color="var(--muted)" style={{ marginBottom: 10 }}>
              MOST LIKELY &rarr; LEAST LIKELY
            </Kicker>

            <Reorder.Group
              axis="y"
              values={rankedPlayers}
              onReorder={setRankedPlayers}
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
            >
              {rankedPlayers.map((player, index) => (
                <Reorder.Item
                  key={player}
                  value={player}
                  style={{
                    padding: '14px 16px',
                    marginBottom: 8,
                    border: '1px solid var(--rule)',
                    background: 'var(--ink-2)',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--copper)',
                      width: 20,
                    }}
                  >
                    {index + 1}.
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: 16,
                      color: 'var(--cream)',
                    }}
                  >
                    {player}
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--muted)' }}>
                    &#8942;
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>

        {/* CTA */}
        <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16 }}>
          <PrimaryButton onClick={generateRange}>
            Done Ranking &rarr;
          </PrimaryButton>
        </div>

        <div style={{ height: 140 }} />
      </div>
    );
  }

  // ─── GUESS SCREEN ───────────────────────────────────────────────
  if (phase === 'guess') {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
        <div style={{ padding: '64px 22px 0' }}>
          <Kicker color="var(--copper)">GROUP&apos;S TURN</Kicker>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28,
              color: 'var(--cream)',
              marginTop: 12,
              lineHeight: 1.2,
            }}
          >
            {currentPlayer} ranked you:
          </div>

          {/* Show the ranking */}
          <div style={{ marginTop: 20 }}>
            {rankedPlayers.map((player, index) => (
              <div
                key={player}
                style={{
                  padding: '12px 16px',
                  marginBottom: 6,
                  border: '1px solid var(--rule)',
                  background: 'var(--ink-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: index === 0 ? 'var(--copper)' : 'var(--muted)',
                    width: 20,
                  }}
                >
                  {index + 1}.
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: 15,
                    color: 'var(--cream)',
                  }}
                >
                  {player}
                </div>
              </div>
            ))}
          </div>

          {/* Range Selection */}
          <div style={{ marginTop: 30 }}>
            <Kicker color="var(--muted)">WHICH PROMPT WAS IT?</Kicker>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                color: 'var(--cream-2)',
                marginTop: 6,
              }}
            >
              {currentPlayer}&apos;s number is one of these:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {guessRange.map((num) => (
                <button
                  key={num}
                  onClick={() => handleGuess(num)}
                  style={{
                    padding: '14px 16px',
                    border: selectedGuess === num ? '1px solid var(--copper)' : '1px solid var(--rule)',
                    background: selectedGuess === num ? 'var(--ink-2)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: selectedGuess === num ? 'var(--copper)' : 'var(--muted)',
                      minWidth: 30,
                    }}
                  >
                    #{num}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 14,
                      color: 'var(--cream)',
                      lineHeight: 1.3,
                    }}
                  >
                    {questions[num - 1]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16 }}>
          <PrimaryButton onClick={revealAnswer} disabled={selectedGuess === null}>
            Reveal Answer &rarr;
          </PrimaryButton>
        </div>

        <div style={{ height: 140 }} />
      </div>
    );
  }

  // ─── REVEAL SCREEN ───────────────────────────────────────────────
  if (phase === 'reveal') {
    const isCorrect = selectedGuess === questionNumber;

    return (
      <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
        <div style={{ padding: '64px 22px 0' }}>
          <Kicker color={isCorrect ? 'var(--copper)' : 'var(--muted)'}>
            {isCorrect ? 'CORRECT!' : 'WRONG!'}
          </Kicker>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              color: 'var(--cream)',
              marginTop: 12,
              lineHeight: 1.2,
            }}
          >
            The answer was<br />
            <span style={{ color: 'var(--copper)' }}>#{questionNumber}</span>
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 20,
              border: '1px solid var(--copper)',
              background: 'var(--ink-2)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 20,
                color: 'var(--cream)',
                lineHeight: 1.3,
              }}
            >
              {currentQuestion}
            </div>
          </div>

          {!isCorrect && selectedGuess && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--muted)',
                  letterSpacing: 0.5,
                }}
              >
                YOU GUESSED #{selectedGuess}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                  color: 'var(--cream-2)',
                  marginTop: 6,
                }}
              >
                {questions[selectedGuess - 1]}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 30,
              padding: 16,
              border: '1px solid var(--rule)',
              background: 'var(--ink-2)',
            }}
          >
            <Kicker color="var(--muted)">{currentPlayer}&apos;s RANKING</Kicker>
            <div style={{ marginTop: 10 }}>
              {rankedPlayers.map((player, index) => (
                <div
                  key={player}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 14,
                    color: index === 0 ? 'var(--cream)' : 'var(--cream-2)',
                    marginBottom: 4,
                  }}
                >
                  {index + 1}. <span style={{ fontStyle: 'italic' }}>{player}</span>
                </div>
              ))}
            </div>
          </div>

          {isCorrect && (
            <div
              style={{
                marginTop: 20,
                fontFamily: 'var(--font-serif)',
                fontSize: 16,
                color: 'var(--copper)',
                textAlign: 'center',
              }}
            >
              {currentPlayer} drinks!
            </div>
          )}

          {!isCorrect && (
            <div
              style={{
                marginTop: 20,
                fontFamily: 'var(--font-serif)',
                fontSize: 16,
                color: 'var(--copper)',
                textAlign: 'center',
              }}
            >
              Everyone else drinks!
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ position: 'fixed', bottom: 50, left: 16, right: 16, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <SecondaryButton onClick={endGame}>END</SecondaryButton>
          </div>
          <div style={{ flex: 2 }}>
            <PrimaryButton onClick={nextRound}>Next Player &rarr;</PrimaryButton>
          </div>
        </div>

        <div style={{ height: 140 }} />
      </div>
    );
  }

  return null;
}
