import crypto from 'crypto';

function sha1(input) {
  return crypto.createHash('sha1').update(input).digest('hex');
}

function getFolderName(filePath) {
  if (!filePath) return null;
  const parts = filePath.split('/').filter(p => p.length > 0);
  if (parts.length > 1) {
    return parts[parts.length - 2];
  }
  return null;
}

export function normalizeAndGroupFiles(files) {
  const groupedByFolder = {};

  files.forEach(file => {
    const folderName = getFolderName(file.original_path) || 'root';
    if (!groupedByFolder[folderName]) {
      groupedByFolder[folderName] = [];
    }
    groupedByFolder[folderName].push(file);
  });

  if (Object.keys(groupedByFolder).length === 1 && groupedByFolder.root) {
    return [{
      title: 'root',
      is_virtual: false,
      files: groupedByFolder.root
    }];
  }

  return Object.entries(groupedByFolder).map(([folderName, files]) => ({
    title: folderName,
    is_virtual: true,
    files,
  }));
}
