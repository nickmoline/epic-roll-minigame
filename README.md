# Epic Combat Rolloff

A web-based tracker for D&D mass combat mini-games. Built to replace a Google Sheets prototype with a purpose-driven app that handles all the bookkeeping so the DM and players can focus on the drama.

## What is this?

In certain D&D campaigns, large-scale battles between armies are resolved with a dice rolloff mini-game. Two groups face off — each round, a player rolls two dice (one per side). The higher roll wins the round, and the loser takes damage equal to the difference. Combat continues until one side's HP hits zero.

The DM customizes each battle with special rules that keep things interesting:

- **Tie Events** — When both dice match, something happens (reinforcements arrive, terrain shifts, etc.). Events are triggered in order: 1st tie, 2nd tie, and so on, with an optional fallback for remaining ties.
- **Round Events** — At specific rounds, scripted events fire automatically (e.g., "Round 5: Enemy reinforcements arrive, Enemies +5 HP").
- **Mulligans** — Each side gets unique special abilities they can activate once per combat. Effects include: negating damage, modifying HP, adding roll bonuses, or temporarily swapping to a different die.
- **Decreasing Die** — When a group's HP drops below a threshold, they downgrade to a smaller die (e.g., D12 → D10), representing their diminished fighting force. If they recover HP above the threshold, the die resets.

## Features

- **Combat setup screen** with named combats, configurable dice, HP, mulligans with mechanical effects, tie events, round events, and decreasing die rules
- **Save and load setups** so the DM can pre-configure multiple battles and load them at the table
- **Live combat tracking** with HP bars, die shape indicators (proper polyhedral silhouettes for D4/D6/D8/D10/D12/D20), mulligan status, and round-by-round input
- **Digital dice roller** for quick play, with manual entry still available
- **Auto-generated event log** that records who won each round, by how much, and any mulligans, tie events, or round events that fired
- **Undo support** to correct mistakes
- **Victory screen** with final stats and full combat log
- **Persistent state** via localStorage — refresh the page mid-combat and pick up where you left off
- **Fantasy-themed UI** with a dark parchment aesthetic

## Tech Stack

- React 18
- Vite
- Tailwind CSS v3

## Getting Started

```bash
npm install
npm run dev
```
