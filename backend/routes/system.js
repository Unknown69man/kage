import fs from 'fs'

export default async function systemRoutes(app) {
  // Trigger a manual scan for local files. Marks non-existing local files as not playable.
  app.get('/system/scan-local', async (req, reply) => {
    const rows = app.db.prepare("SELECT id, local_path, is_playable FROM files WHERE provider = 'local'").all();
    let updated = 0;

    for (const r of rows) {
      if (!r.local_path) continue;
      const exists = fs.existsSync(r.local_path);
      if (!exists && r.is_playable !== 0) {
        app.db.prepare("UPDATE files SET is_playable = 0, updated_at = ? WHERE id = ?").run(Date.now(), r.id);
        updated++;
      }
      if (exists && r.is_playable !== 1) {
        app.db.prepare("UPDATE files SET is_playable = 1, updated_at = ? WHERE id = ?").run(Date.now(), r.id);
        updated++;
      }
    }

    return { checked: rows.length, updated };
  });
}
