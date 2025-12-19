import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  PORT: 3880,
  HOST: '127.0.0.1',
  DB_PATH: path.join(__dirname, 'db', 'app.db'),
  UPLOADS_PATH: path.join(__dirname, 'uploads'),
  VAULT_PIN_HASH: process.env.VAULT_PIN_HASH || '$2b$10$V/5wO8MxDTuUMTY.tZ8aW.iui.R6DV8rAAeNQ3MDNEyPXIMGTnT/i'
};
