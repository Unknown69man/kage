PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS containers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,                -- terabox | local
  source TEXT NOT NULL,              -- URL or local path
  title TEXT NOT NULL,
  is_virtual INTEGER DEFAULT 0,
  status TEXT DEFAULT 'idle',        -- idle | previewing | previewed | resolving | resolved | error
  is_title_locked INTEGER DEFAULT 0,
  previewed_at INTEGER,
  resolved_at INTEGER,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  container_id INTEGER NOT NULL,

  -- identity
  provider TEXT,                 -- terabox | local
  fs_id TEXT,                    -- terabox fs_id
  local_path TEXT,               -- for local files
  original_path TEXT,            -- normalized original path from preview

  -- metadata
  name TEXT NOT NULL,
  folder_name TEXT,
  size_bytes INTEGER,
  duration INTEGER,
  mime_type TEXT,

  -- preview
  thumbnail_url TEXT,
  is_primary INTEGER DEFAULT 0,
  is_playable INTEGER DEFAULT 1,
  file_index INTEGER DEFAULT 0,
  fingerprint TEXT UNIQUE,

  -- streaming / auth
  stream_url TEXT,
  fast_stream_url TEXT,
  download_url TEXT,
  auth_fetched_at INTEGER,

  -- playback history
  last_position_secs INTEGER DEFAULT 0,
  watch_progress_percent REAL DEFAULT 0,
  last_watched_at INTEGER,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  UNIQUE(container_id, fs_id),
  FOREIGN KEY(container_id) REFERENCES containers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_containers_created
ON containers(created_at DESC);

-- New indexes for files
CREATE INDEX IF NOT EXISTS idx_files_container_id
ON files(container_id);

CREATE INDEX IF NOT EXISTS idx_files_last_watched
ON files(last_watched_at DESC);
