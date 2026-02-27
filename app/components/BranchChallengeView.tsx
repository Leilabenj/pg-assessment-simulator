"use client";

import React from "react";
import type {
  BranchChallenge,
  BranchChallengeLevel1,
  BranchChallengeLevel2,
  BranchChallengeLevel3,
  BranchChallengeLevel4,
} from "@/lib/branch-challenge-types";
import {
  getOutputOrder,
  reorderByBranch,
} from "@/lib/branch-challenge-utils";

const INITIAL_SYMBOLS = [1, 2, 3, 4] as const;

function SymbolShape({ id }: { id: number }) {
  if (id === 1) {
    return <div className="w-10 h-10 bg-red-500 rounded" />;
  }
  if (id === 2) {
    return (
      <div
        className="bg-yellow-500"
        style={{
          width: 36,
          height: 36,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        }}
      />
    );
  }
  if (id === 3) {
    return (
      <div className="w-10 h-10 bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
        +
      </div>
    );
  }
  if (id === 4) {
    return <div className="w-10 h-10 bg-green-500 rounded-full" />;
  }
  return null;
}

function SymbolCell({ id }: { id: number }) {
  return (
    <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center border border-slate-600">
      <SymbolShape id={id} />
    </div>
  );
}

function SymbolRow({ symbols }: { symbols: number[] }) {
  return (
    <div className="flex justify-center gap-3">
      {symbols.map((id, i) => (
        <SymbolCell key={`${id}-${i}`} id={id} />
      ))}
    </div>
  );
}

function FunnelTop() {
  return (
    <div
      className="w-48 h-8 bg-blue-600 mx-auto"
      style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)" }}
    />
  );
}

function FunnelBottom() {
  return (
    <div
      className="w-48 h-8 bg-blue-600 mx-auto"
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" }}
    />
  );
}

type Props = {
  challenge: BranchChallenge;
  selectedBranch: number | null;
  onSelectBranch: (index: number) => void;
  onUnlock: () => void;
};

function Level1View({
  challenge,
  selectedBranch,
  onSelectBranch,
  onUnlock,
}: Props & { challenge: BranchChallengeLevel1 }) {
  const outputOrder = getOutputOrder(challenge.branches[challenge.correctBranchIndex]);

  return (
    <div className="space-y-6">
      <SymbolRow symbols={[...INITIAL_SYMBOLS]} />
      <FunnelTop />
      <div className="flex justify-center gap-4">
        {challenge.branches.map((branchLabel, idx) => {
          const isSelected = selectedBranch === idx;
          return (
            <button
              key={branchLabel}
              onClick={() => onSelectBranch(idx)}
              className={`px-6 py-4 rounded-xl font-mono text-xl font-bold transition-all ${
                isSelected ? "bg-blue-500 ring-2 ring-blue-300 text-white" : "bg-slate-600 hover:bg-slate-500 text-slate-200"
              }`}
            >
              {branchLabel}
            </button>
          );
        })}
      </div>
      <FunnelBottom />
      <SymbolRow symbols={outputOrder} />
      <UnlockButton selectedBranch={selectedBranch} onUnlock={onUnlock} />
    </div>
  );
}

function Level2View({
  challenge,
  selectedBranch,
  onSelectBranch,
  onUnlock,
}: Props & { challenge: BranchChallengeLevel2 }) {
  const branchA =
    challenge.knownBranchPosition === "A"
      ? challenge.knownBranch
      : challenge.candidateBranches[challenge.correctCandidateIndex];
  const branchB =
    challenge.knownBranchPosition === "B"
      ? challenge.knownBranch
      : challenge.candidateBranches[challenge.correctCandidateIndex];
  const intermediate = reorderByBranch([...INITIAL_SYMBOLS], branchA);
  const output = reorderByBranch(intermediate, branchB);

  const knownA = challenge.knownBranchPosition === "A";
  const candidates = challenge.candidateBranches;

  return (
    <div className="space-y-6">
      {/* Input */}
      <SymbolRow symbols={[...INITIAL_SYMBOLS]} />
      <FunnelTop />

      {/* Stage 1: Branch A */}
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-400">Branch A</div>
        {knownA ? (
          <div className="flex justify-center">
            <div className="px-6 py-4 rounded-xl font-mono text-xl font-bold bg-slate-600 text-slate-300 border border-slate-500">
              {challenge.knownBranch}
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            {candidates.map((code, idx) => {
              const isSelected = selectedBranch === idx;
              return (
                <button
                  key={code}
                  onClick={() => onSelectBranch(idx)}
                  className={`px-6 py-4 rounded-xl font-mono text-xl font-bold transition-all ${
                    isSelected ? "bg-blue-500 ring-2 ring-blue-300 text-white" : "bg-slate-600 hover:bg-slate-500 text-slate-200"
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <FunnelBottom />

      {/* Intermediate - show when Branch A is known */}
      {knownA && <SymbolRow symbols={intermediate} />}
      {!knownA && (
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-lg bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-slate-500"
            >
              ?
            </div>
          ))}
        </div>
      )}

      <FunnelTop />

      {/* Stage 2: Branch B */}
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-400">Branch B</div>
        {!knownA ? (
          <div className="flex justify-center">
            <div className="px-6 py-4 rounded-xl font-mono text-xl font-bold bg-slate-600 text-slate-300 border border-slate-500">
              {challenge.knownBranch}
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-4">
            {candidates.map((code, idx) => {
              const isSelected = selectedBranch === idx;
              return (
                <button
                  key={code}
                  onClick={() => onSelectBranch(idx)}
                  className={`px-6 py-4 rounded-xl font-mono text-xl font-bold transition-all ${
                    isSelected ? "bg-blue-500 ring-2 ring-blue-300 text-white" : "bg-slate-600 hover:bg-slate-500 text-slate-200"
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <FunnelBottom />

      {/* Output */}
      <SymbolRow symbols={output} />
      <UnlockButton selectedBranch={selectedBranch} onUnlock={onUnlock} />
    </div>
  );
}

function Level3View({
  challenge,
  selectedBranch,
  onSelectBranch,
  onUnlock,
}: Props & { challenge: BranchChallengeLevel3 }) {
  return (
    <div className="space-y-6">
      {/* Input */}
      <SymbolRow symbols={[...INITIAL_SYMBOLS]} />
      <FunnelTop />

      {/* Branch A - known */}
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-400">Branch A</div>
        <div className="flex justify-center">
          <div className="px-6 py-4 rounded-xl font-mono text-xl font-bold bg-slate-600 text-slate-300 border border-slate-500">
            {challenge.branchA}
          </div>
        </div>
      </div>

      <FunnelBottom />

      {/* Branch B - known */}
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-400">Branch B</div>
        <div className="flex justify-center">
          <div className="px-6 py-4 rounded-xl font-mono text-xl font-bold bg-slate-600 text-slate-300 border border-slate-500">
            {challenge.branchB}
          </div>
        </div>
      </div>

      <FunnelBottom />

      {/* Output selection */}
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-400">
          Which is the output?
        </div>
        <div className="flex flex-col gap-3">
          {challenge.candidateOutputs.map((symbols, idx) => {
            const isSelected = selectedBranch === idx;
            return (
              <button
                key={symbols.join(",")}
                onClick={() => onSelectBranch(idx)}
                className={`flex justify-center gap-3 p-3 rounded-xl transition-all border-2 ${
                  isSelected
                    ? "bg-blue-500/20 border-blue-500 ring-2 ring-blue-300"
                    : "bg-slate-800 border-slate-600 hover:border-slate-500"
                }`}
              >
                <SymbolRow symbols={[...symbols]} />
              </button>
            );
          })}
        </div>
      </div>

      <UnlockButton selectedBranch={selectedBranch} onUnlock={onUnlock} />
    </div>
  );
}

function Level4View({
  challenge,
  selectedBranch,
  onSelectBranch,
  onUnlock,
}: Props & { challenge: BranchChallengeLevel4 }) {
  const correctPair = challenge.candidatePairs[challenge.correctPairIndex];
  const output = reorderByBranch(
    reorderByBranch([...INITIAL_SYMBOLS], correctPair[0]),
    correctPair[1]
  );

  return (
    <div className="space-y-6">
      {/* Input - known */}
      <SymbolRow symbols={[...INITIAL_SYMBOLS]} />
      <FunnelTop />

      {/* Branch A - unknown placeholder */}
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-400">Branch A</div>
        <div className="flex justify-center">
          <div className="px-6 py-4 rounded-xl font-mono text-xl font-bold bg-slate-800 text-slate-500 border border-dashed border-slate-600">
            ?
          </div>
        </div>
      </div>

      <FunnelBottom />

      {/* Branch B - unknown placeholder */}
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-400">Branch B</div>
        <div className="flex justify-center">
          <div className="px-6 py-4 rounded-xl font-mono text-xl font-bold bg-slate-800 text-slate-500 border border-dashed border-slate-600">
            ?
          </div>
        </div>
      </div>

      <FunnelBottom />

      {/* Output - known */}
      <SymbolRow symbols={output} />

      {/* Pair selection */}
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-400">
          Which pair (A, B) produces this output?
        </div>
        <div className="flex flex-col gap-3">
          {challenge.candidatePairs.map((pair, idx) => {
            const isSelected = selectedBranch === idx;
            return (
              <button
                key={`${pair[0]}-${pair[1]}`}
                onClick={() => onSelectBranch(idx)}
                className={`flex justify-center gap-4 py-3 px-4 rounded-xl transition-all border-2 font-mono text-lg ${
                  isSelected
                    ? "bg-blue-500/20 border-blue-500 ring-2 ring-blue-300"
                    : "bg-slate-800 border-slate-600 hover:border-slate-500"
                }`}
              >
                <span>A: {pair[0]}</span>
                <span>B: {pair[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <UnlockButton selectedBranch={selectedBranch} onUnlock={onUnlock} />
    </div>
  );
}

function UnlockButton({
  selectedBranch,
  onUnlock,
}: {
  selectedBranch: number | null;
  onUnlock: () => void;
}) {
  return (
    <div className="flex justify-center pt-4">
      <button
        onClick={onUnlock}
        disabled={selectedBranch === null}
        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all ${
          selectedBranch !== null ? "bg-green-600 hover:bg-green-500 text-white" : "bg-slate-600 text-slate-400 cursor-not-allowed"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Unlock
      </button>
    </div>
  );
}

export function BranchChallengeView({
  challenge,
  selectedBranch,
  onSelectBranch,
  onUnlock,
}: Props) {
  if (challenge.level === 1) {
    return (
      <Level1View
        challenge={challenge}
        selectedBranch={selectedBranch}
        onSelectBranch={onSelectBranch}
        onUnlock={onUnlock}
      />
    );
  }
  if (challenge.level === 2) {
    return (
      <Level2View
        challenge={challenge}
        selectedBranch={selectedBranch}
        onSelectBranch={onSelectBranch}
        onUnlock={onUnlock}
      />
    );
  }
  if (challenge.level === 3) {
    return (
      <Level3View
        challenge={challenge}
        selectedBranch={selectedBranch}
        onSelectBranch={onSelectBranch}
        onUnlock={onUnlock}
      />
    );
  }
  return (
    <Level4View
      challenge={challenge}
      selectedBranch={selectedBranch}
      onSelectBranch={onSelectBranch}
      onUnlock={onUnlock}
    />
  );
}
