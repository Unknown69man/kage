import Fastify from 'fastify';
import cors from '@fastify/cors';
import fs from 'fs';
import db from './db/index.js';
import config from './config.js';

import containersRoutes from './routes/containers.js';
import filesRoutes from './routes/files.js';
import previewRoutes from './routes/preview.js';
import resolveRoutes from './routes/resolve.js';
import systemRoutes from './routes/system.js';
import streamRoutes from './routes/stream.js';
import historyRoutes from './routes/history.js';
import settingsRoutes from './routes/settings.js';
import authRoutes from './routes/auth.js';
import vaultRoutes from './routes/vault.js';
import castRoutes from './routes/cast.js';
import duplicatesRoutes from './routes/duplicates.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.decorate('db', db);

await app.register(containersRoutes);
await app.register(filesRoutes);
await app.register(previewRoutes);
await app.register(resolveRoutes);
await app.register(systemRoutes);
await app.register(streamRoutes);
await app.register(historyRoutes);
await app.register(settingsRoutes);
await app.register(authRoutes);
await app.register(vaultRoutes);
await app.register(castRoutes);
await app.register(duplicatesRoutes);

app.get('/health', () => ({ status: 'ok' }));

await app.listen({ port: config.PORT, host: config.HOST });

// Startup: scan local files and mark missing ones as not playable
async function scanLocalFiles(dbConn, logger) {
	try {
		const rows = dbConn.prepare("SELECT id, local_path, is_playable FROM files WHERE provider = 'local'").all();
		let changed = 0;
		for (const r of rows) {
			if (!r.local_path) continue;
			const exists = fs.existsSync(r.local_path);
			if (!exists && r.is_playable !== 0) {
				dbConn.prepare("UPDATE files SET is_playable = 0, updated_at = ? WHERE id = ?").run(Date.now(), r.id);
				changed++;
			}
			if (exists && r.is_playable !== 1) {
				dbConn.prepare("UPDATE files SET is_playable = 1, updated_at = ? WHERE id = ?").run(Date.now(), r.id);
				changed++;
			}
		}
		if (logger && changed) logger.info(`Local file scan updated ${changed} files`);
		return { checked: rows.length, updated: changed };
	} catch (err) {
		if (logger) logger.error('Error scanning local files', err);
		return { checked: 0, updated: 0, error: String(err) };
	}
}

// run initial scan
(async () => {
	// Ensure uploads directory exists
	if (!fs.existsSync(config.UPLOADS_PATH)) {
		fs.mkdirSync(config.UPLOADS_PATH, { recursive: true });
	}

	const res = await scanLocalFiles(app.db, app.log);
	app.log.info('Initial local file scan complete', res);
})();
