# PG Assessment Simulator

A web-based cognitive assessment simulator with two timed game modes: **The Digit Challenge** (math equation fill-in-the-blank) and **The Tube Branch Challenge** (symbol reordering puzzles).

## Features

- **Digit Challenge** — Fill blanks in equations using digits 1–9. Progressive difficulty across 4 levels. Digits shown in the formula cannot be reused. Each digit used at most once per formula.
- **Tube Branch Challenge** — Deduce which tube branch or combination reordered a sequence of symbols.
- 5-minute timed sessions with level-based progression and score tracking.
- Pre-generated challenge banks with template pools; regenerates fresh puzzles on demand.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Regenerating Challenges

```bash
npm run generate        # Digit Challenge (formula) puzzles
npm run generate:branch # Tube Branch challenges
```

## Game Modes

### The Digit Challenge

Fill in the blanks in math equations using digits 1–9. Each session is 5 minutes.

**Level progression** (cumulative correct answers):

| Score   | Level |
|---------|-------|
| 0–7     | Level 1 — Simple multiplication |
| 8–14    | Level 2 — Mult with add/sub |
| 15–20   | Level 3 — Two blanks, mult + div |
| 21+     | Level 4 — Three blanks, product and division |

**Rules:** Digits already shown on the left side of the equation cannot be used. Each digit may appear only once per formula. No zero allowed.

### The Tube Branch Challenge

Symbols pass through “tube branches” that reorder them. Identify which branch or combination produced the output.

- **Level 1** — Pick the branch that maps input → output
- **Level 2** — Two branches in series; one known, deduce the other
- **Level 3** — Both branches known; predict the output
- **Level 4** — Input and output known; find the correct branch pair

## Tech Stack

- [Next.js](https://nextjs.org) 16 · React 19 · TypeScript · Tailwind CSS v4
