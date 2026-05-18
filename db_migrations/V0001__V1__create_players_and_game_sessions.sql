CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  session_token VARCHAR(64) UNIQUE NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_sessions (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  mode VARCHAR(20) NOT NULL,
  result VARCHAR(10) NOT NULL,
  score INTEGER DEFAULT 0,
  detail TEXT,
  played_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_players_token ON players(session_token);
CREATE INDEX idx_game_sessions_player ON game_sessions(player_id);
CREATE INDEX idx_players_xp ON players(xp DESC);
