import Database from 'better-sqlite3';
import fs from 'fs';
import config from '../config.js';

if (!fs.existsSync('db')) {
  fs.mkdirSync('db');
}

const db = new Database(config.DB_PATH);

const schema = fs.readFileSync(
  new URL('./schema.sql', import.meta.url),
  'utf8'
);

db.exec(schema);

export default db;
