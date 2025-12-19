import { resolveTeraBoxPreview, getSingleFileInfo } from '../resolvers/teraboxPreviewResolver.js'
import { normalizeTeraBoxPreview } from '../utils/normalize.js'

export default async function previewResolveRoutes(app) {

  app.post('/resolve/preview/container', async (req, reply) => {
    const { container_id } = req.body

    if (!container_id) {
      return reply.code(400).send({ error: 'container_id required' })
    }

    const container = app.db.prepare(
      `SELECT * FROM containers WHERE id = ?`
    ).get(container_id)

    if (!container || container.type !== 'terabox') {
      return reply.code(404).send({ error: 'Invalid container' })
    }

    const raw = await resolveTeraBoxPreview(container.source)
    const normalized = normalizeTeraBoxPreview(raw)

    const insert = app.db.prepare(`
      INSERT OR IGNORE INTO files (
        container_id, provider, name, original_path,
        size_bytes, duration, mime_type,
        thumbnail_url, fingerprint,
        is_primary, is_playable, file_index, created_at, updated_at
      ) VALUES (
        @container_id, @provider, @name, @original_path,
        @size_bytes, @duration, @mime_type,
        @thumbnail_url, @fingerprint,
        @is_primary, @is_playable, @file_index, @created_at, @updated_at
      )
    `)

    const now = Date.now()
    let inserted = 0
    for (const f of normalized.files) {
      const bind = {
        container_id,
        provider: 'terabox',
        name: f.name || null,
        original_path: f.original_path || null,
        size_bytes: typeof f.size_bytes === 'number' ? f.size_bytes : (f.size_bytes ? Number(f.size_bytes) : null),
        duration: (typeof f.duration === 'number') ? f.duration : (f.duration ? Number(f.duration) : null),
        mime_type: f.mime_type || null,
        thumbnail_url: f.thumbnail_url || null,
        fingerprint: f.fingerprint || null,
        is_primary: f.is_primary ? 1 : 0,
        is_playable: f.is_playable ? 1 : 0,
        file_index: typeof f.file_index === 'number' ? f.file_index : 0,
        created_at: now,
        updated_at: now
      }

      try {
        const res = insert.run(bind)
        if (res.changes > 0) inserted++
      } catch (err) {
        app.log.error({ msg: 'Error inserting file (preview/container)', err, bind })
        throw err
      }
    }

    app.db.prepare(`
      UPDATE containers SET
        title = COALESCE(title, ?),
        is_virtual = ?
      WHERE id = ?
    `).run(
      normalized.container.title || container.title,
      normalized.container.is_virtual ? 1 : 0,
      container_id
    )

    return {
      success: true,
      inserted_files: inserted,
      total_files: normalized.files.length,
      is_virtual: normalized.container.is_virtual
    }
  })

  // Single-file preview metadata (HTTP-only scraper)
  app.post('/resolve/preview/single', async (req, reply) => {
    const { url } = req.body || {}
    if (!url) return reply.code(400).send({ error: 'url required' })

    try {
      const data = await getSingleFileInfo(url)
      return reply.send(data)
    } catch (err) {
      app.log.error({ msg: 'getSingleFileInfo failed', err, url })
      return reply.code(500).send({ error: 'internal_error', message: err.message })
    }
  })
}

