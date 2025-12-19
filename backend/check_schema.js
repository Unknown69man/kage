// backend/check_schema.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(__dirname, 'db', 'app.db'));

console.log(db.prepare("PRAGMA table_info('files');").all());