import db from '../db/index.js';

export default async function (fastify) {

  // Create container
  fastify.post('/containers', async (req, reply) => {
    const { type, source, title } = req.body || {};

    if (!type || !source || !title) {
      return reply.code(400).send({
        error: 'type, source, and title are required'
      });
    }

    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO containers (type, source, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(type, source, title, now, now);

    return {
      id: result.lastInsertRowid,
      type,
      source,
      title,
      created_at: now
    };
  });

  // List containers
  fastify.get('/containers', async () => {
    const rows = db.prepare(`
      SELECT * FROM containers
      ORDER BY created_at DESC
    `).all();

    return rows;
  });

  // Get container by ID
  fastify.get('/containers/:id', async (req, reply) => {
    const { id } = req.params;

    const row = db.prepare(`
      SELECT * FROM containers WHERE id = ?
    `).get(id);

    if (!row) {
      return reply.code(404).send({ error: 'Container not found' });
    }

    return row;
  });

  // Rename container
  fastify.patch('/containers/:id', async (req, reply) => {
    const { id } = req.params;
    const { title } = req.body || {};

    if (!title) {
      return reply.code(400).send({ error: 'title is required' });
    }

    const result = db.prepare(`
      UPDATE containers
      SET title = ?, updated_at = ?
      WHERE id = ?
    `).run(title, Date.now(), id);

    if (result.changes === 0) {
      return reply.code(404).send({ error: 'Container not found' });
    }

    return { success: true };
  });

  // Delete container
  fastify.delete('/containers/:id', async (req, reply) => {
    const { id } = req.params;

    const result = db.prepare(`
      DELETE FROM containers WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      return reply.code(404).send({ error: 'Container not found' });
    }

    return { success: true };
  });

  fastify.post('/containers/:id/refetch', async (req, reply) => {
    const { id } = req.params;

    const stmt = db.prepare(`
      UPDATE containers
      SET status = 'idle', error_message = NULL, updated_at = ?
      WHERE id = ?
    `);
    const result = stmt.run(Date.now(), id);

    if (result.changes === 0) {
      return reply.code(404).send({ error: 'Container not found' });
    }

    return { success: true };
  });
}
