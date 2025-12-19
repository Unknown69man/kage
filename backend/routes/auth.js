export default async function authRoutes(app) {
  // Check the status of the TeraBox authentication
  app.get('/auth/status', async (req, reply) => {
    try {
      const row = app.db.prepare("SELECT value FROM settings WHERE key = 'terabox_auth'").get();
      if (row && row.value) {
        const authData = JSON.parse(row.value);
        const lastUsed = new Date(authData.last_successful_usage_at || authData.captured_at);
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

        return {
          hasAuth: true,
          captured_at: authData.captured_at,
          last_successful_usage_at: authData.last_successful_usage_at,
          is_likely_expired: lastUsed < fourHoursAgo,
        };
      }
      return { hasAuth: false };
    } catch (error) {
      console.error('Error fetching auth status:', error);
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // Save the terabox_auth.json content to the database
  app.post('/auth/save', async (req, reply) => {
    const authData = req.body;
    if (!authData || !authData.jsToken || !authData.cookies || !authData.captured_at) {
      return reply.code(400).send({ error: 'Invalid auth data format' });
    }

    // Initialize the last successful usage timestamp
    authData.last_successful_usage_at = authData.captured_at;

    try {
      const stmt = app.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      stmt.run('terabox_auth', JSON.stringify(authData));
      return { success: true, message: 'Authentication data saved.' };
    } catch (error) {
      console.error('Error saving auth data:', error);
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });
}
