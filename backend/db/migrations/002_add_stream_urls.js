import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const DB_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'db');
const DB_PATH = path.join(DB_DIR, 'app.db');
const BACKUP_PATH = path.join(DB_DIR, 'app.db.bak');

// Backup db
if (!fs.existsSync(DB_PATH)) {
  console.error('Database not found at', DB_PATH);
  process.exit(1);
}

fs.copyFileSync(DB_PATH, BACKUP_PATH);
console.log('Backup created at', BACKUP_PATH);

const db = new Database(DB_PATH);

function hasColumn(table, column) {
  const row = db.prepare(`PRAGMA table_info('${table}')`).all();
  return row.some(r => r.name === column);
}

const columns = [
  { name: 'stream_url', type: 'TEXT' },
  { name: 'fast_stream_url', type: 'TEXT' },
  { name: 'download_url', type: 'TEXT' },
  { name: 'auth_fetched_at', type: 'INTEGER' }
];

for (const col of columns) {
  if (!hasColumn('files', col.name)) {
    console.log(`Adding column ${col.name} to files`);
    db.prepare(`ALTER TABLE files ADD COLUMN ${col.name} ${col.type};`).run();
    console.log(`${col.name} added`);
  } else {
    console.log(`${col.name} already exists, skipping`);
  }
}

db.close();
