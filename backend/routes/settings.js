export default async function settingsRoutes(app) {
  // Get all settings
  app.get('/settings', async (req, reply) => {
    try {
      const rows = app.db.prepare('SELECT key, value FROM settings').all();
      const settings = rows.reduce((acc, row) => {
        try {
          acc[row.key] = JSON.parse(row.value);
        } catch {
          acc[row.key] = row.value;
        }
        return acc;
      }, {});
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // Update settings
  app.put('/settings', async (req, reply) => {
    const settings = req.body;
    if (typeof settings !== 'object' || settings === null) {
      return reply.code(400).send({ error: 'invalid_request_body' });
    }

    try {
      const stmt = app.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      for (const [key, value] of Object.entries(settings)) {
        stmt.run(key, JSON.stringify(value));
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });
}
