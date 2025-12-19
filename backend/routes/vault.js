import db from '../db/index.js';
import config from '../config.js';
import fs from 'fs';
import bcrypt from 'bcrypt';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

async function verifyPin(req, res) {
  const { pin } = req.body;
  if (!pin) {
    res.status(401).send({ error: 'PIN is required' });
    return;
  }
  const match = await bcrypt.compare(pin, config.VAULT_PIN_HASH);
  if (!match) {
    res.status(401).send({ error: 'Incorrect PIN' });
    return;
  }
}

async function vaultRoutes(app, options) {
  app.post('/vault/unlock', async (req, res) => {
    const { pin } = req.body;
    const match = await bcrypt.compare(pin, config.VAULT_PIN_HASH);
    if (match) {
      res.send({ success: true });
    } else {
      res.status(401).send({ error: 'Incorrect PIN' });
    }
  });

  app.post('/vault/add-from-url', { preHandler: [verifyPin] }, async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).send({ error: 'URL is required' });
    }

    try {
      const response = await fetch(url);

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE_BYTES) {
        return res.status(400).send({ error: 'File size exceeds the 100MB limit' });
      }

      const originalName = path.basename(new URL(url).pathname);
      const uniqueName = `${uuidv4()}${path.extname(originalName)}`;
      const filePath = path.join(config.UPLOADS_PATH, uniqueName);

      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
        return res.status(400).send({ error: 'File size exceeds the 100MB limit' });
      }

      await fs.promises.writeFile(filePath, Buffer.from(buffer));

      const file = {
        name: uniqueName,
        original_name: originalName,
        path: filePath,
        url: url,
        created_at: Date.now()
      };

      db.prepare('INSERT INTO vault (name, original_name, path, url, created_at) VALUES (?, ?, ?, ?, ?)').run(file.name, file.original_name, file.path, file.url, file.created_at);

      res.send({ success: true, file });
    } catch (error) {
      app.log.error(error);
      res.status(500).send({ error: 'Failed to add file from URL' });
    }
  });

  app.post('/vault/files', { preHandler: [verifyPin] }, async (req, res) => {
    try {
      const files = db.prepare('SELECT * FROM vault').all();
      res.send(files);
    } catch (error) {
      app.log.error(error);
      res.status(500).send({ error: 'Failed to retrieve vault files' });
    }
  });
}

export default vaultRoutes;
