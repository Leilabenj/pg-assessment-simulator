"use client";
import React, { useState, useEffect, useRef } from 'react';
import type { Challenge } from '@/lib/challenge-types';
import { INTERNAL_LEVEL_POOLS } from '@/lib/level-config';
import {
  getNextInternalLevel,
  generateChallengeForInternalLevel,
} from '@/lib/adaptive-formula';
import {
  isCorrectFormula,
  getPlaceholderCount,
  getPureDigitsInFormula,
} from '@/lib/formula-validation';
import type { BranchChallenge } from '@/lib/branch-challenge-types';
import { BRANCH_CHALLENGE_BANK } from '@/lib/branch-challenges.generated';
import {
  buildBranchDecks,
  getBranchLevelForScore,
  getBranchIndexInLevel,
  BRANCH_LEVEL_ORDER,
} from '@/lib/branch-challenge-utils';
import { BranchChallengeView } from '@/app/components/BranchChallengeView';
import { saveSession } from '@/app/actions/save-session';

const HAS_FORMULA_CHALLENGES = INTERNAL_LEVEL_POOLS.length > 0;
const HAS_BRANCH_CHALLENGES =
  (BRANCH_CHALLENGE_BANK[1]?.length ?? 0) > 0 ||
  (BRANCH_CHALLENGE_BANK[2]?.length ?? 0) > 0 ||
  (BRANCH_CHALLENGE_BANK[3]?.length ?? 0) > 0;
const HAS_CHALLENGES = HAS_FORMULA_CHALLENGES || HAS_BRANCH_CHALLENGES;

type GameMode = 'formula' | 'branch' | null;

type AttemptRecord = {
  sequence: number;
  difficulty: number;
  isCorrect: boolean;
  responseTimeMs: number;
};

export default function DigitChallenge() {
  const [mode, setMode] = useState<GameMode>(null);
  const [branchDeck, setBranchDeck] = useState<Record<1 | 2 | 3, BranchChallenge[]> | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [score, setScore] = useState(0);
  const [currentInput, setCurrentInput] = useState<number[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedBranchB, setSelectedBranchB] = useState<number | null>(null);
  const [status, setStatus] = useState<'START' | 'PLAY' | 'END'>('START');
  const scoreRef = useRef(score);
  const failTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSavedRef = useRef(false);

  const [internalLevel, setInternalLevel] = useState(1);
  const [sequence, setSequence] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const maxInternalLevelRef = useRef(1);
  const sequenceRef = useRef(1);
  const correctCountRef = useRef(0);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const challengeStartTimeRef = useRef(0);
  const [branchSequence, setBranchSequence] = useState(0);
  const maxBranchLevelRef = useRef(0);
  const branchSequenceRef = useRef(0);

  scoreRef.current = score;
  sequenceRef.current = sequence;
  correctCountRef.current = correctCount;
  branchSequenceRef.current = branchSequence;

  useEffect(() => {
    return () => {
      if (failTimeoutRef.current) clearTimeout(failTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (status === 'PLAY' && mode === 'branch' && branchDeck) {
      const bl = getBranchLevelForScore(score);
      const bil = getBranchIndexInLevel(score);
      const deck = branchDeck[bl];
      const ch = deck?.[bil % deck.length];
      if (ch) challengeStartTimeRef.current = Date.now();
    }
  }, [status, mode, score, branchDeck]);

  useEffect(() => {
    if (status === 'PLAY' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (status === 'PLAY' && timeLeft === 0) {
      if (!hasSavedRef.current && mode) {
        hasSavedRef.current = true;
        saveSession({
          mode,
          maxInternalLevel:
            mode === 'formula' ? maxInternalLevelRef.current : Math.max(1, maxBranchLevelRef.current),
          totalQuestions: mode === 'formula' ? sequenceRef.current : branchSequenceRef.current,
          correctCount: mode === 'formula' ? correctCountRef.current : score,
          durationSeconds: 300,
        }).catch(console.error);
      }
      setStatus('END');
    }
  }, [status, timeLeft, mode, score, sequence, correctCount]);

  const handleKey = (num: number) => {
    if (status !== 'PLAY' || mode !== 'formula' || !currentChallenge) return;
    if (failTimeoutRef.current) {
      clearTimeout(failTimeoutRef.current);
      failTimeoutRef.current = null;
    }
    const newInput = [...currentInput, num];
    const placeholderCount = getPlaceholderCount(currentChallenge.formula);

    if (newInput.length < placeholderCount) {
      setCurrentInput(newInput);
      return;
    }

    const responseTimeMs = Date.now() - challengeStartTimeRef.current;
    const isCorrect = isCorrectFormula(currentChallenge, newInput);
    setAttempts(prev => [...prev, {
      sequence,
      difficulty: internalLevel,
      isCorrect,
      responseTimeMs,
    }]);
    const nextLevel = getNextInternalLevel(internalLevel, isCorrect);
    if (nextLevel > maxInternalLevelRef.current) {
      maxInternalLevelRef.current = nextLevel;
    }
    setCurrentInput([]);
    setInternalLevel(nextLevel);
    setCorrectCount(c => (isCorrect ? c + 1 : c));
    setSequence(s => s + 1);
    const nextChallenge = generateChallengeForInternalLevel(nextLevel);
    challengeStartTimeRef.current = Date.now();
    setCurrentChallenge(nextChallenge ?? currentChallenge);
  };

  const handleBackspace = () => {
    if (status !== 'PLAY') return;
    setCurrentInput(prev => (prev.length > 0 ? prev.slice(0, -1) : prev));
  };

  const handleRetry = () => {
    if (failTimeoutRef.current) {
      clearTimeout(failTimeoutRef.current);
      failTimeoutRef.current = null;
    }
    hasSavedRef.current = false;
    setMode(null);
    setBranchDeck(null);
    setTimeLeft(300);
    setScore(0);
    setCurrentInput([]);
    setSelectedBranch(null);
    setSelectedBranchB(null);
    setStatus('START');
    setInternalLevel(1);
    setSequence(1);
    setCorrectCount(0);
    setCurrentChallenge(null);
    setAttempts([]);
    setBranchSequence(0);
    challengeStartTimeRef.current = 0;
    maxInternalLevelRef.current = 1;
    maxBranchLevelRef.current = 0;
  };

  const handleStartFormula = () => {
    setMode('formula');
    setCurrentInput([]);
    setInternalLevel(1);
    setSequence(1);
    setCorrectCount(0);
    setAttempts([]);
    maxInternalLevelRef.current = 1;
    const firstChallenge = generateChallengeForInternalLevel(1);
    setCurrentChallenge(firstChallenge);
    challengeStartTimeRef.current = Date.now();
    setStatus('PLAY');
  };

  const handleStartBranch = () => {
    setMode('branch');
    const deck = buildBranchDecks();
    setBranchDeck(deck);
    setAttempts([]);
    setBranchSequence(0);
    maxBranchLevelRef.current = 0;
    setStatus('PLAY');
  };

  const handleUnlockBranch = () => {
    if (status !== 'PLAY' || mode !== 'branch' || !branchDeck) return;
    if (failTimeoutRef.current) {
      clearTimeout(failTimeoutRef.current);
      failTimeoutRef.current = null;
    }
    const s = scoreRef.current;
    const branchLevel = getBranchLevelForScore(s);
    const indexInBranchLevel = getBranchIndexInLevel(s);
    const deck = branchDeck[branchLevel];
    const challenge = deck?.[indexInBranchLevel % deck.length];
    if (!challenge) return;
    const isLevel4 = challenge.level === 4;
    if (isLevel4 && (selectedBranch === null || selectedBranchB === null)) return;
    if (!isLevel4 && selectedBranch === null) return;
    const validateInputs = isLevel4 ? [selectedBranch!, selectedBranchB!] : [selectedBranch!];
    const responseTimeMs = Date.now() - challengeStartTimeRef.current;
    const isCorrect = challenge.validate(validateInputs);
    if (challenge.level > maxBranchLevelRef.current) {
      maxBranchLevelRef.current = challenge.level;
    }
    const nextSeq = branchSequenceRef.current + 1;
    setAttempts(prev => [...prev, {
      sequence: nextSeq,
      difficulty: challenge.level,
      isCorrect,
      responseTimeMs,
    }]);
    setBranchSequence(nextSeq);
    if (isCorrect) {
      setScore(s + 1);
      setSelectedBranch(null);
      setSelectedBranchB(null);
    } else {
      failTimeoutRef.current = setTimeout(() => {
        challengeStartTimeRef.current = Date.now();
        failTimeoutRef.current = null;
        setSelectedBranch(null);
        setSelectedBranchB(null);
      }, 300);
    }
  };

  const branchLevel = getBranchLevelForScore(score);
  const branchIndexInLevel = getBranchIndexInLevel(score);
  const branchLevelDeck = branchDeck?.[branchLevel];
  const currentBranchChallenge =
    branchLevelDeck?.[branchIndexInLevel % branchLevelDeck.length] ?? null;

  if (!HAS_CHALLENGES) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 text-center">
          <p className="text-xl text-slate-300">No challenges defined. Add entries to CHALLENGES.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
          <div className="text-3xl font-mono font-bold text-blue-400">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="flex items-center gap-3">
            {status === 'PLAY' && mode && (
              <div className="text-lg bg-slate-700 px-4 py-1 rounded-full">
                {mode === 'formula' ? `Level ${sequence}` : `Branch Level ${branchLevel} / ${BRANCH_LEVEL_ORDER.length}`}
              </div>
            )}
            {mode === 'branch' && (
              <div className="text-xl bg-slate-700 px-4 py-1 rounded-full">Score: {score}</div>
            )}
          </div>
        </div>

        {status === 'START' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-slate-300 mb-6">Choose your challenge </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HAS_FORMULA_CHALLENGES && (
                <button
                  onClick={handleStartFormula}
                  className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl text-left border border-slate-600 transition-all"
                >
                  <h3 className="font-bold text-lg mb-2">The Digit Challenge</h3>
                  <p className="text-slate-400 text-sm">Solve math equations with the keypad.</p>
                </button>
              )}
              {HAS_BRANCH_CHALLENGES && (
                <button
                  onClick={handleStartBranch}
                  className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl text-left border border-slate-600 transition-all"
                >
                  <h3 className="font-bold text-lg mb-2">The Tube Branch Challenge</h3>
                  <p className="text-slate-400 text-sm">Identify which tube branch reordered the symbols.</p>
                </button>
              )}
            </div>
          </div>
        )}

        {status === 'PLAY' && mode === 'formula' && currentChallenge && (
          <>
            <div className="text-center text-4xl mb-12 font-mono min-h-20 flex flex-wrap items-center justify-center gap-2 px-2">
              {currentChallenge.formula.split('( )').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="min-w-12 w-14 border-b-4 border-blue-500 text-blue-400 text-center">
                      {currentInput[i] || ""}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(() => {
                const forbiddenDigits = getPureDigitsInFormula(currentChallenge.formula);
                return [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                  const isDisabled = forbiddenDigits.has(n) || currentInput.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => handleKey(n)}
                      disabled={isDisabled}
                      className={
                        isDisabled
                          ? "py-5 bg-slate-800 text-slate-500 cursor-not-allowed rounded-xl text-2xl font-bold transition-all"
                          : "py-5 bg-slate-700 hover:bg-slate-600 rounded-xl text-2xl font-bold active:scale-95 transition-all"
                      }
                    >
                      {n}
                    </button>
                  );
                });
              })()}
              <button onClick={handleBackspace} className="py-5 bg-slate-700 hover:bg-slate-600 rounded-xl text-2xl font-bold active:scale-95 transition-all" title="Remove last digit">
                ⌫
              </button>
              <button onClick={() => setCurrentInput([])} className="py-5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold active:scale-95 transition-all uppercase tracking-wider">
                Clear
              </button>
              <button onClick={handleRetry} className="py-3 text-slate-400 hover:text-white uppercase text-sm tracking-widest">
                Restart Session
              </button>
            </div>
          </>
        )}

        {status === 'PLAY' && mode === 'branch' && currentBranchChallenge && (
          <>
            <BranchChallengeView
              challenge={currentBranchChallenge}
              selectedBranch={selectedBranch}
              onSelectBranch={setSelectedBranch}
              selectedBranchB={selectedBranchB}
              onSelectBranchB={setSelectedBranchB}
              onUnlock={handleUnlockBranch}
            />
            <div className="mt-6 flex justify-center">
              <button onClick={handleRetry} className="py-3 text-slate-400 hover:text-white uppercase text-sm tracking-widest">
                Restart Session
              </button>
            </div>
          </>
        )}

        {status === 'END' && (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">FINISH</h2>
            <p className="text-xl text-slate-400 mb-8">
              {mode === 'formula' ? `Final Level: ${sequence}` : `Final Score: ${score}`}
            </p>
            <button onClick={handleRetry} className="px-10 py-3 bg-white text-black rounded-full font-bold">RETRY</button>
          </div>
        )}
      </div>
    </main>
  );
}
