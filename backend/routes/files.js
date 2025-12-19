export default async function filesRoutes(app) {
  app.get('/containers/:id/files', (req) => {
    return app.db.prepare(`
      SELECT * FROM files WHERE container_id = ?
      ORDER BY file_index
    `).all(req.params.id);
  });

  app.post('/containers/:id/files', (req) => {
    const now = Date.now();
    const files = req.body;

    const stmt = app.db.prepare(`
      INSERT OR IGNORE INTO files (
        container_id, provider, name, original_path,
        size_bytes, duration, mime_type,
        thumbnail_url, fingerprint,
        is_primary, is_playable, file_index, created_at
      ) VALUES (
        @container_id, @provider, @name, @original_path,
        @size_bytes, @duration, @mime_type,
        @thumbnail_url, @fingerprint,
        @is_primary, @is_playable, @file_index, @created_at
      )
    `);

    let count = 0;
    for (const f of files) {
      stmt.run({
        ...f,
        container_id: req.params.id,
        created_at: now
      });
      count++;
    }

    return { inserted: count };
  });
}
