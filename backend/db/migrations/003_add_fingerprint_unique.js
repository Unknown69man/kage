import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'app.db');
const BACKUP_PATH = path.join(__dirname, '..', 'app.db.bak');

if (!fs.existsSync(DB_PATH)) {
  console.error('Database not found at', DB_PATH);
  process.exit(1);
}

fs.copyFileSync(DB_PATH, BACKUP_PATH);
console.log('Backup created at', BACKUP_PATH);

const db = new Database(DB_PATH);

function indexExists(name) {
  const rows = db.prepare("PRAGMA index_list('files')").all();
  return rows.some(r => r.name === name);
}

if (indexExists('idx_files_fingerprint')) {
  console.log('Index idx_files_fingerprint already exists, skipping');
  db.close();
  process.exit(0);
}

// check for duplicate fingerprints
const dups = db.prepare(`
  SELECT fingerprint, COUNT(*) as c
  FROM files
  WHERE fingerprint IS NOT NULL
  GROUP BY fingerprint
  HAVING c > 1
`).all();

if (dups.length > 0) {
  console.error('Found duplicate fingerprints. Migration aborted.');
  console.error('Duplicates (fingerprint : count):');
  for (const r of dups) console.error(`${r.fingerprint} : ${r.c}`);
  console.error('\nPlease deduplicate these rows manually before running this migration.');
  db.close();
  process.exit(2);
}

try {
  db.prepare('CREATE UNIQUE INDEX idx_files_fingerprint ON files(fingerprint);').run();
  console.log('Unique index idx_files_fingerprint created successfully');
} catch (err) {
  console.error('Failed to create unique index:', err.message || err);
  db.close();
  process.exit(1);
}

db.close();
