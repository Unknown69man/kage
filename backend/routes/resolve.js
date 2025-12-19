import { resolveTeraBoxAuth } from '../resolvers/terabox-auth.js'
import { resolverQueue } from '../queue/resolverQueue.js'

export default async function resolveRoutes(app) {

  app.post('/resolve/:containerId', async (req, reply) => {
    const { containerId } = req.params

    const container = app.db.prepare(
      `SELECT * FROM containers WHERE id = ?`
    ).get(containerId)

    if (!container || container.type !== 'terabox') {
      return reply.code(404).send({ error: 'Invalid container' })
    }

    const now = Date.now();
    app.db.prepare("UPDATE containers SET status = 'resolving', updated_at = ? WHERE id = ?").run(now, container.id);

    // 👇 Queue the resolver job
    const result = await resolverQueue.enqueue(async () => {
      try {
        const authData = await resolveTeraBoxAuth(container.source)

        const now = Date.now()
        const stmt = app.db.prepare(`
          UPDATE files SET
            stream_url = ?,
            fast_stream_url = ?,
            download_url = ?,
            auth_fetched_at = ?
          WHERE container_id = ? AND fs_id = ?
        `)

        let updated = 0

        for (const [fs_id, v] of Object.entries(authData)) {
          const res = stmt.run(
            v.stream_url || null,
            JSON.stringify(v.streams || null),
            v.dlink || null,
            now,
            containerId,
            fs_id,
          )
          if (res.changes > 0) updated++
        }

        app.db.prepare("UPDATE containers SET status = 'resolved', resolved_at = ?, updated_at = ? WHERE id = ?").run(now, now, container.id);
        return { updated }

      } catch (err) {
        app.db.prepare("UPDATE containers SET status = 'error', error_message = ?, updated_at = ? WHERE id = ?").run(err.message, Date.now(), container.id);
        throw err;
      }
    })

    return {
      success: true,
      ...result,
      queue: resolverQueue.status()
    }
  })

  app.get('/resolve/status', (req, reply) => {
    return resolverQueue.status()
  })

  // Check whether auth links are stale for a container (TTL: 4h)
  app.get('/resolve/stale/:containerId', (req, reply) => {
    const { containerId } = req.params

    const row = app.db.prepare(`
      SELECT MAX(auth_fetched_at) AS auth_fetched_at FROM files WHERE container_id = ?
    `).get(containerId)

    const ts = row?.auth_fetched_at || null
    const stale = !ts || (Date.now() - ts > 4 * 60 * 60 * 1000)

    return { stale, auth_fetched_at: ts }
  })
}
