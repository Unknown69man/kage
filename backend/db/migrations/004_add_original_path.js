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

function hasColumn(table, column) {
  const row = db.prepare(`PRAGMA table_info('${table}')`).all();
  return row.some(r => r.name === column);
}

const col = 'original_path';
if (hasColumn('files', col)) {
  console.log(`Column ${col} already exists, skipping`);
  db.close();
  process.exit(0);
}

try {
  db.prepare(`ALTER TABLE files ADD COLUMN ${col} TEXT;`).run();
  console.log(`Column ${col} added to files table`);
} catch (err) {
  console.error('Failed to add column:', err.message || err);
  db.close();
  process.exit(1);
}

db.close();
