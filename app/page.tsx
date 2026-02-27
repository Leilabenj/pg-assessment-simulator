"use client";
import React, { useState, useEffect, useRef } from 'react';
import type { Challenge } from '@/lib/challenge-types';
import { CHALLENGE_BANK } from '@/lib/challenges.generated';
import { buildLevelDecks, getLevelForScore, getIndexInLevel, LEVEL_ORDER, type Level } from '@/lib/challenge-utils';
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

const HAS_FORMULA_CHALLENGES = LEVEL_ORDER.some((l) => (CHALLENGE_BANK[l]?.length ?? 0) > 0);
const HAS_BRANCH_CHALLENGES =
  (BRANCH_CHALLENGE_BANK[1]?.length ?? 0) > 0 ||
  (BRANCH_CHALLENGE_BANK[2]?.length ?? 0) > 0 ||
  (BRANCH_CHALLENGE_BANK[3]?.length ?? 0) > 0 ||
  (BRANCH_CHALLENGE_BANK[4]?.length ?? 0) > 0;
const HAS_CHALLENGES = HAS_FORMULA_CHALLENGES || HAS_BRANCH_CHALLENGES;

type GameMode = 'formula' | 'branch' | null;

export default function DigitChallenge() {
  const [mode, setMode] = useState<GameMode>(null);
  const [levelDecks, setLevelDecks] = useState<Record<Level, Challenge[]> | null>(null);
  const [branchDeck, setBranchDeck] = useState<Record<1 | 2 | 3 | 4, BranchChallenge[]> | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [score, setScore] = useState(0);
  const [currentInput, setCurrentInput] = useState<number[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [status, setStatus] = useState<'START' | 'PLAY' | 'END'>('START');
  const scoreRef = useRef(score);
  const failTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  scoreRef.current = score;

  useEffect(() => {
    return () => {
      if (failTimeoutRef.current) clearTimeout(failTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (status === 'PLAY' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (status === 'PLAY' && timeLeft === 0) {
      setStatus('END');
    }
  }, [status, timeLeft]);

  const handleKey = (num: number) => {
    if (status !== 'PLAY' || mode !== 'formula' || !levelDecks) return;
    if (failTimeoutRef.current) {
      clearTimeout(failTimeoutRef.current);
      failTimeoutRef.current = null;
    }
    setCurrentInput(prev => {
      const newInput = [...prev, num];
      const s = scoreRef.current;
      const level = getLevelForScore(s);
      const idx = getIndexInLevel(s);
      const deck = levelDecks[level];
      const challenge = deck?.[idx % deck.length];
      if (!challenge) return newInput;
      const placeholderCount = getPlaceholderCount(challenge.formula);
      if (newInput.length === placeholderCount) {
        if (isCorrectFormula(challenge, newInput)) {
          setScore(s => s + 1);
          return [];
        } else {
          failTimeoutRef.current = setTimeout(() => {
            failTimeoutRef.current = null;
            setCurrentInput([]);
          }, 300);
          return newInput;
        }
      }
      return newInput;
    });
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
    setMode(null);
    setLevelDecks(null);
    setBranchDeck(null);
    setTimeLeft(300);
    setScore(0);
    setCurrentInput([]);
    setSelectedBranch(null);
    setStatus('START');
  };

  const handleStartFormula = () => {
    setMode('formula');
    const decks = buildLevelDecks();
    setLevelDecks(decks);
    setStatus('PLAY');
  };

  const handleStartBranch = () => {
    setMode('branch');
    const deck = buildBranchDecks();
    setBranchDeck(deck);
    setStatus('PLAY');
  };

  const handleUnlockBranch = () => {
    if (status !== 'PLAY' || mode !== 'branch' || !branchDeck || selectedBranch === null) return;
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
    if (challenge.validate([selectedBranch])) {
      setScore(s + 1);
      setSelectedBranch(null);
    } else {
      failTimeoutRef.current = setTimeout(() => {
        failTimeoutRef.current = null;
        setSelectedBranch(null);
      }, 300);
    }
  };

  const currentLevel = getLevelForScore(score);
  const indexInLevel = getIndexInLevel(score);
  const formulaDeck = levelDecks?.[currentLevel];
  const currentFormulaChallenge = formulaDeck?.[indexInLevel % formulaDeck.length] ?? null;
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
                {mode === 'formula'
                ? `Level ${currentLevel} / ${LEVEL_ORDER.length}`
                : `Branch Level ${branchLevel} / ${BRANCH_LEVEL_ORDER.length}`}
              </div>
            )}
            <div className="text-xl bg-slate-700 px-4 py-1 rounded-full">Score: {score}</div>
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

        {status === 'PLAY' && mode === 'formula' && currentFormulaChallenge && (
          <>
            <div className="text-center text-4xl mb-12 font-mono min-h-20 flex flex-wrap items-center justify-center gap-2 px-2">
              {currentFormulaChallenge.formula.split('( )').map((part, i, arr) => (
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
                const forbiddenDigits = getPureDigitsInFormula(currentFormulaChallenge.formula);
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
            <p className="text-xl text-slate-400 mb-8">Final Score: {score}</p>
            <button onClick={handleRetry} className="px-10 py-3 bg-white text-black rounded-full font-bold">RETRY</button>
          </div>
        )}
      </div>
    </main>
  );
}
