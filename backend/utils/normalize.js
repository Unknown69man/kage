import crypto from 'crypto';
import path from 'path';

function hash(s) {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function fingerprint(f) {
  if (f.md5) return `md5:${f.md5}`;
  if (f.size && f.server_filename)
    return `ns:${hash(f.server_filename + f.size)}`;
  return `fs:${f.fs_id}`;
}

export function normalizeTeraBoxPreview(raw) {
  const list = raw.list || [];
  const folders = new Set(
    list.map(f => path.posix.dirname(f.path || '')).filter(p => p !== '/')
  );

  const folder = folders.size === 1 ? [...folders][0].replace('/', '') : null;
  const is_virtual = list.length > 1 && !folder;

  const title = folder
    || (list.length > 1
      ? `${list[0].server_filename} (+${list.length - 1} files)`
      : list[0].server_filename);

  return {
    container: {
      title,
      is_virtual
    },
    files: list.map((f, i) => ({
      provider: 'terabox',
      name: f.server_filename,
      original_path: f.path,
      size_bytes: Number(f.size),
      duration: f.duration || null,
      mime_type: 'video/mp4',
      thumbnail_url: f.thumbs?.url3 || f.thumbs?.icon || '',
      fingerprint: fingerprint(f),
      is_primary: i === 0 ? 1 : 0,
      is_playable: 1,
      file_index: i
    }))
  };
}
