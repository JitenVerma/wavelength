-- Wavelength prototype schema
-- Rooms track the shareable lobby entry point.
-- Participants hold lightweight presence and team assignment data.
-- Game sessions and rounds keep the authoritative turn history practical.

create extension if not exists "pgcrypto";

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_player_id uuid,
  status text not null default 'lobby',
  max_players integer not null default 12,
  share_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  team text not null default 'neutral',
  is_host boolean not null default false,
  connected boolean not null default true,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (room_id, player_id)
);

create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references rooms(id) on delete cascade,
  phase text not null default 'starting',
  round_number integer not null default 0,
  active_player_id uuid references players(id),
  active_team text,
  blue_score integer not null default 0,
  red_score integer not null default 0,
  win_score integer not null default 10,
  turn_order jsonb not null default '[]'::jsonb,
  turn_counts jsonb not null default '{}'::jsonb,
  recent_card_ids jsonb not null default '[]'::jsonb,
  winner text,
  updated_at timestamptz not null default now()
);

create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  game_session_id uuid not null references game_sessions(id) on delete cascade,
  actor_player_id uuid not null references players(id),
  actor_team text not null,
  round_number integer not null,
  card_id text not null,
  left_label text not null,
  right_label text not null,
  clue text not null default '',
  hidden_target numeric not null,
  dial_position numeric not null default 50,
  locked_position numeric,
  score_awarded integer not null default 0,
  revealed boolean not null default false,
  started_at timestamptz not null default now(),
  spun_at timestamptz,
  clue_submitted_at timestamptz,
  locked_at timestamptz,
  revealed_at timestamptz
);

create table if not exists room_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists room_participants_room_idx on room_participants(room_id);
create index if not exists rounds_game_session_idx on rounds(game_session_id, round_number desc);
create index if not exists room_events_room_idx on room_events(room_id, created_at desc);
