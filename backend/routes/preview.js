import { resolveTeraBoxPreview } from '../resolvers/terabox-preview.js';
import { normalizeAndGroupFiles } from '../normalizers/index.js';

function cookiesToHeader(cookies) {
  if (!Array.isArray(cookies)) return "";
  return cookies
    .filter(c => c.domain.includes("1024tera") || c.domain.includes("terabox"))
    .map(c => `${c.name}=${c.value}`)
    .join("; ");
}

export default async function previewRoutes(app) {
  app.post('/preview', async (req, reply) => {
    const { url, container_id, useAuth } = req.body;
    if (!url || !container_id) {
      return reply.code(400).send({ error: 'url and container_id are required' });
    }

    const now = Date.now();
    app.db.prepare("UPDATE containers SET status = 'previewing', updated_at = ? WHERE id = ?").run(now, container_id);

    try {
      let cookie = "";
      if (useAuth) {
        // Fetch credentials from DB
        const authRow = app.db.prepare("SELECT value FROM settings WHERE key = 'terabox_auth'").get();
        if (authRow && authRow.value) {
            const auth = JSON.parse(authRow.value);
            cookie = cookiesToHeader(auth.cookies);
            app.log.info("Using authenticated cookies for preview");
        } else {
            app.log.warn("Auth requested but no credentials found in settings");
        }
      }

      const data = await resolveTeraBoxPreview(url, cookie);
      const groups = normalizeAndGroupFiles(data.files);

      if (groups.length === 1 && !groups[0].is_virtual) {
        app.db.prepare("UPDATE containers SET title = ? WHERE id = ?").run(groups[0].title, container_id);
        insertFiles(app.db, container_id, data.files);
      } else {
        // Create virtual containers for each folder
        groups.forEach(g => {
          const result = app.db.prepare(
            "INSERT INTO containers (type, source, title, is_virtual, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
          ).run('terabox', url, g.title, 1, now, now);
          const virtual_container_id = result.lastInsertRowid;
          insertFiles(app.db, virtual_container_id, g.files);
        });
      }

      app.db.prepare("UPDATE containers SET status = 'previewed', previewed_at = ?, updated_at = ? WHERE id = ?").run(now, now, container_id);

      reply.send({ success: true, groups });

    } catch (err) {
      app.db.prepare("UPDATE containers SET status = 'error', error_message = ?, updated_at = ? WHERE id = ?").run(err.message, now, container_id);
      reply.code(500).send({
        error: 'internal_error',
        message: err.message,
      });
    }
  });
}

function insertFiles(db, container_id, files) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO files (
        container_id, provider, fs_id, local_path, original_path,
        name, folder_name, size_bytes, duration, mime_type,
        thumbnail_url, is_primary, is_playable, file_index, fingerprint,
        created_at, updated_at
      ) VALUES (
        @container_id, @provider, @fs_id, @local_path, @original_path,
        @name, @folder_name, @size_bytes, @duration, @mime_type,
        @thumbnail_url, @is_primary, @is_playable, @file_index, @fingerprint,
        @created_at, @updated_at
      )
    `);

    const now = Date.now();
    files.forEach((f, idx) => {
        stmt.run({
            container_id,
            provider: 'terabox',
            fs_id: f.provider_file_id,
            local_path: null,
            original_path: f.original_path,
            name: f.name,
            folder_name: f.folder_name,
            size_bytes: f.size_bytes,
            duration: null,
            mime_type: f.mime_type,
            thumbnail_url: f.thumbnail_url,
            is_primary: idx === 0,
            is_playable: f.is_playable,
            file_index: idx,
            fingerprint: f.fingerprint,
            created_at: now,
            updated_at: now,
        });
    });
}
