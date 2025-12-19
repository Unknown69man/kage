export default async function historyRoutes(app) {
  app.post('/files/:fileId/progress', async (req, reply) => {
    const { fileId } = req.params;
    const { position, progress } = req.body;

    if (typeof position === 'undefined' || typeof progress === 'undefined') {
      return reply.code(400).send({ error: 'position and progress are required' });
    }

    const now = Date.now();
    try {
      const stmt = app.db.prepare(`
        UPDATE files
        SET
          last_position_secs = ?,
          watch_progress_percent = ?,
          last_watched_at = ?,
          updated_at = ?
        WHERE id = ?
      `);
      const result = stmt.run(position, progress, now, now, fileId);

      if (result.changes === 0) {
        return reply.code(404).send({ error: 'File not found' });
      }

      return { success: true };
    } catch (error) {
      console.error('History update error:', error);
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });
}
