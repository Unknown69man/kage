import fs from 'fs';
import { pipeline } from 'stream/promises';
import fetch from 'node-fetch';

export default async function streamRoutes(app) {
  app.get('/stream/:fileId', async (req, reply) => {
    const { fileId } = req.params;
    const file = app.db.prepare('SELECT * FROM files WHERE id = ?').get(fileId);

    if (!file) {
      return reply.code(404).send({ error: 'File not found' });
    }

    if (file.provider === 'local' && file.local_path) {
      return streamLocalFile(req, reply, file.local_path);
    }

    if (file.provider === 'terabox' && file.stream_url) {
      return proxyRemoteStream(req, reply, file.stream_url);
    }

    return reply.code(400).send({ error: 'File not streamable' });
  });
}

async function streamLocalFile(req, reply, filePath) {
  if (!fs.existsSync(filePath)) {
    return reply.code(404).send({ error: 'Local file not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    reply.code(206).headers(head).send(file);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    reply.code(200).headers(head).send(fs.createReadStream(filePath));
  }
}

async function proxyRemoteStream(req, reply, remoteUrl) {
  try {
    const requestHeaders = {
      'User-Agent': req.headers['user-agent'],
      'Range': req.headers.range,
    };

    const response = await fetch(remoteUrl, { headers: requestHeaders });

    if (!response.ok) {
        // special handling for expired terabox links.
      if (response.status === 403) {
        return reply.code(410).send({ error: 'remote_link_expired' });
      }
      return reply.code(response.status).send({ error: 'remote_stream_failed' });
    }

    const responseHeaders = {
      'Content-Type': response.headers.get('content-type'),
      'Content-Length': response.headers.get('content-length'),
      'Content-Range': response.headers.get('content-range'),
      'Accept-Ranges': response.headers.get('accept-ranges'),
    };

    reply.code(response.status).headers(responseHeaders);

    await pipeline(response.body, reply.raw);

  } catch (error) {
    console.error('Proxy stream error:', error);
    reply.code(500).send({ error: 'internal_proxy_error' });
  }
}
