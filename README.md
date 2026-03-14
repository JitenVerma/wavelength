# Wavelength Prototype

A warm, multiplayer party game prototype built with Next.js and inspired by the social guessing format of Wavelength. This is a custom digital adaptation for the web, not a 1:1 recreation of the physical board game.

## Overview

This project is a polished MVP for a room-based multiplayer guessing game. Players can create or join a room, choose teams in a shared lobby, and play through synchronized rounds built around hidden spectrum targets, teammate clues, dial adjustment, reveal, and scoring.

The current prototype focuses on:

- a strong end-to-end vertical slice
- clean architecture with typed server actions
- smooth, warm UI with subtle animation
- multiplayer-ready state flow with a Supabase-friendly design

The app currently keeps gameplay server-authoritative in an in-memory room store. When Supabase is configured, clients also subscribe to Supabase Realtime room broadcasts and fall back to periodic HTTP resyncs.

## Features

- Beautiful landing page with create and join flows
- Room codes and shareable join links
- Pre-game lobby with host controls
- Blue team / Red team selection with neutral starting state
- Player list with host badge and connection state
- Team shuffle and host-only game start
- Turn-based multiplayer flow
- Two-turns-per-player rule tracking
- Spectrum card dataset with seeded prompts
- Hidden target logic that stays concealed from the active player until reveal
- Spin, clue, dial-adjustment, lock-in, reveal, scoring, and next-turn phases
- Configurable race-to-win scoring model
- Mobile-responsive interface
- Supabase Realtime room broadcast wiring with HTTP resync fallback
- Example Supabase schema for rooms, players, sessions, rounds, and events

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Zustand
- Zod
- Supabase client SDK

## Project Structure

- `app/`
  - App Router pages for landing, join, room, and game
  - Route handlers for room and gameplay actions
- `components/`
  - Reusable UI for lobby, board, dial, score, turn state, players, and sharing
- `hooks/`
  - Client room-sync hook for Supabase broadcasts, actions, and reconnect state
- `lib/`
  - Cards, scoring, validation, room-code generation, realtime adapter, and game engine logic
- `lib/server/`
  - In-memory room store and server-authoritative room service
- `stores/`
  - Lightweight Zustand UI state
- `supabase/migrations/`
  - Example schema for moving the prototype to Supabase

## Prerequisites

Before running the project, make sure you have:

- Node.js 20 or newer
- npm 10 or newer

## Install Dependencies

From the project root, install dependencies with:

```bash
npm install
```

## Environment Setup

Copy the example environment file:

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Environment values:

- `NEXT_PUBLIC_APP_URL`
  - Base URL used for room share links
- `NEXT_PUBLIC_REALTIME_PROVIDER`
  - Use `supabase` to enable Supabase room broadcasts or `local` to stay on polling only
- `NEXT_PUBLIC_SUPABASE_URL`
  - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - Supabase public publishable key
- `SUPABASE_SERVICE_ROLE_KEY`
  - Reserved for future authoritative persistence work

For Supabase-backed realtime, set:

```env
NEXT_PUBLIC_REALTIME_PROVIDER=supabase
```

If the Supabase URL or publishable key is missing, the app falls back to the local realtime adapter.

## Run the Project

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

- `npm run dev`
  - Start the local development server
- `npm run build`
  - Create a production build
- `npm run start`
  - Start the production server after building
- `npm run lint`
  - Run TypeScript verification

## How Multiplayer Works

Important game actions stay server-authoritative through Next.js route handlers:

1. A client sends an action such as create room, join room, switch teams, spin, submit clue, move dial, or lock guess.
2. The request is validated with Zod.
3. The room service updates authoritative room and game state.
4. The client polls the latest room snapshot.
5. The active player's snapshot hides the round target until reveal.

Current runtime behavior uses:

- in-memory room state
- Supabase Realtime room broadcasts when configured
- periodic HTTP resyncs for freshness and fallback
- reconnect heartbeats
- host reassignment when needed

Planned production direction:

- Supabase Postgres for persistent room and match data
- Supabase Realtime for presence and room events
- Same server-authoritative route layer for protected actions

## Game Phases

The gameplay state machine includes:

- `lobby`
- `starting`
- `spin`
- `clue`
- `dial-adjustment`
- `lock-in`
- `reveal`
- `scoring`
- `next-turn`
- `finished`

Each player gets up to two turns, tracked in game state.

## Supabase Migration

The example schema is included here:

[supabase/migrations/0001_wavelength.sql](/c:/Users/jiten/Documents/software-projects/wavelength/supabase/migrations/0001_wavelength.sql)

It defines practical tables for:

- rooms
- players
- room participants
- game sessions
- rounds
- room events

## Notes

- The prototype is playable locally without Supabase.
- Local room state is not persistent across server restarts.
- Supabase Realtime currently handles room-change notifications, while gameplay state still lives in memory.
- Scoring and sound hooks are modular so game rules and polish can evolve without major rewrites.

## Verification

The project currently passes:

```bash
npm run lint
npm run build
```
