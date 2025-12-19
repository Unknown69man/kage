import db from '../db/index.js';

async function castRoutes(app, options) {
  app.get('/cast/:fileId', async (req, res) => {
    const { fileId } = req.params;

    try {
      const cast = db.prepare('SELECT name FROM cast WHERE file_id = ?').all(fileId);
      res.send(cast.map(c => c.name));
    } catch (error) {
      app.log.error(error);
      res.status(500).send({ error: 'Failed to retrieve cast members' });
    }
  });
}

export default castRoutes;
