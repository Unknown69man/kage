const fetch = globalThis.fetch ?? (await import('node-fetch')).default
import crypto from 'crypto'
import { URL, URLSearchParams } from 'url'

/* -------------------- CONSTANTS -------------------- */

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'X-Requested-With': 'XMLHttpRequest',
}

const VIDEO_EXT = ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.wmv', '.webm', '.m4v']

/* -------------------- HELPERS -------------------- */

function sha1(input) {
  return crypto.createHash('sha1').update(input).digest('hex')
}

function humanSize(bytes) {
  if (!bytes) return null
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(2)} ${units[i]}`
}

function guessType(file) {
  if (file.isdir === '1' || file.isdir === 1) return 'folder';
  if (file.category === '1') return 'video';
  if (file.category === '3') return 'image';

  // Fallback for safety
  const name = file.server_filename || '';
  const lower = name.toLowerCase();
  if (VIDEO_EXT.some(ext => lower.endsWith(ext))) return 'video';
  return 'other';
}

function extractSurl(url) {
  try {
    const u = new URL(url)
    if (u.searchParams.get('surl')) return u.searchParams.get('surl')
    const m = u.pathname.match(/\/s\/([A-Za-z0-9_-]+)/)
    if (m) return m[1]
  } catch {}
  return null
}

async function resolveFinalUrl(url) {
  const r = await fetch(url, { headers: HEADERS, redirect: 'follow' })
  return r.url
}

/* -------------------- API CALL -------------------- */

function pickApiBase(hostname) {
    hostname = (hostname || "").toLowerCase();
    if (hostname.includes("1024tera.com")) return "https://www.1024tera.com/share/list";
    if (hostname.includes("terabox.app")) return "https://www.terabox.app/share/list";
    if (hostname.includes("terabox.com")) return "https://www.terabox.com/share/list";
    return "https://www.terabox.app/share/list";
}

async function shareList(apiUrl, surl, referrer, folderFsid) {
    const baseData = new URLSearchParams({
        app_id: "250528",
        web: "1",
        channel: "0",
        clienttype: "0",
        shorturl: surl,
        root: "1",
    });

    const headers = { ...HEADERS };
    if (referrer) {
        headers["Referer"] = referrer;
        headers["Origin"] = referrer.split("/sharing/")[0] || referrer;
    }
    if (folderFsid) {
        baseData.set("fs_id", folderFsid);
        baseData.delete("root");
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: baseData,
        });
        const j = await response.json();
        if (j && j.errno === 0 && Array.isArray(j.list)) {
            return j;
        }
    } catch (e) {
        console.error("Share list error:", e);
    }
    return null;
}

async function fetchFolderContents(surl, dir = "", cookie = "") {
    try {
        const params = new URLSearchParams({
            app_id: "250528",
            web: "1",
            channel: "dubox",
            clienttype: "0",
            shorturl: surl,
            page: "1",
            num: "100",
            order: "asc",
            by: "name"
        });

        if (!dir || dir === "/") {
            params.set("root", "1");
        } else {
            params.set("dir", dir);
        }

        const apiUrl = "https://dm.terabox.app/share/list?" + params.toString();

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                ...HEADERS,
                "Cookie": cookie,
                "Referer": "https://dm.terabox.app/",
                "Origin": "https://dm.terabox.app"
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Folder fetch error:", error);
        throw error;
    }
}


function getFolderName(filePath) {
  if (!filePath) return null
  const parts = filePath.split('/').filter(p => p.length > 0)
  if (parts.length > 1) {
    // The last part is the filename, the one before is the folder.
    return parts[parts.length - 2]
  }
  return null
}

/* -------------------- NORMALIZATION -------------------- */

function normalizePreview(apiData, sourceUrl) {
  const files = (apiData.list || []).filter(f => f.isdir !== '1' && f.isdir !== 1);

  let totalSize = 0
  let hasVideo = false

  const normalizedFiles = files.map((f, idx) => {
    const size = f.size ? Number(f.size) : null
    if (size) totalSize += size

    const type = guessType(f)
    if (type === 'video') hasVideo = true

    const fingerprint = sha1(
      [
        'terabox',
        f.server_filename,
        f.size,
        f.md5 || '',
      ].join('|')
    )

    return {
      provider: 'terabox',
      provider_file_id: String(f.fs_id),
      name: f.server_filename,
      original_path: f.path || null,
      folder_name: getFolderName(f.path),
      size_bytes: size,
      size_human: humanSize(size),
      mime_type: type === 'video' ? 'video/mp4' : (type === 'image' ? 'image/jpeg' : null),
      thumbnail_url:
        f.thumbs?.url3 ||
        f.thumbs?.url2 ||
        f.thumbs?.url1 ||
        f.thumbs?.icon ||
        null,
      is_playable: type === 'video',
      is_primary: idx === 0,
      fingerprint,
    }
  })

  // container title logic
  const folderNames = new Set(normalizedFiles.map(f => f.folder_name).filter(Boolean));

  let title;
  if (normalizedFiles.length === 0) {
    title = apiData.title || apiData.share_username || 'Empty TeraBox Share';
  } else if (apiData.fcount > 1) {
     if (folderNames.size === 1) {
      title = folderNames.values().next().value; // Use common folder name
    } else if (apiData.title) {
      title = apiData.title; // Use share title from API
    } else {
      title = `${apiData.share_username}'s Share`; // Fallback
    }
  } else {
    title = normalizedFiles[0].name;
  }


  return {
    provider: 'terabox',
    source_url: sourceUrl,
    container_type:
      normalizedFiles.length === 1 ? 'single' : 'multi',
    title,
    file_count: normalizedFiles.length,
    total_size_bytes: totalSize || null,
    total_size_human: humanSize(totalSize),
    has_video: hasVideo,
    files: normalizedFiles,
  }
}

/* -------------------- MAIN EXPORT / UNIFIED RESOLVER -------------------- */

export async function resolveTeraBoxPreview(url, cookie = "") {
    // 1. Resolve final URL and extract surl
    const finalUrl = await resolveFinalUrl(url);
    const surl = extractSurl(finalUrl) || extractSurl(url);
    if (!surl) {
        throw new Error("Could not parse surl from URL");
    }

    // 2. Try GET method first (good for folders and multi-file shares)
    const getResult = await fetchFolderContents(surl, "", cookie);

    if (getResult && getResult.errno === 0 && getResult.list) {
        let apiData = getResult;
        // If the result is a single folder, we must fetch its contents.
        if (apiData.list.length === 1 && apiData.list[0].isdir === "1") {
            const folder = apiData.list[0];
            const folderContents = await fetchFolderContents(surl, folder.path, cookie);
            // The API response for folder contents is the new base `apiData`
            apiData = folderContents;
            // We preserve the folder name as the title for the container.
            apiData.title = folder.server_filename;
        }
        return normalizePreview(apiData, finalUrl);
    }

    // 3. Fallback to POST method (good for single files and some shares)
    const apiUrl = pickApiBase(new URL(finalUrl).hostname);
    const postResult = await shareList(apiUrl, surl, finalUrl);

    if (postResult && postResult.errno === 0 && postResult.list) {
        let items = postResult.list;
        let title = postResult.share_username; // Use share username as a fallback title
        let depth = 0;

        // Unwrap nested single folders
        while (depth < 3 && items.length === 1 && items[0]?.isdir === 1) {
            const folder = items[0];
            title = folder.server_filename; // The title is the folder name
            const folderId = folder.fs_id;
            const innerResult = await shareList(apiUrl, surl, finalUrl, folderId);
            if (!innerResult || !innerResult.list) break;
            items = innerResult.list;
            depth += 1;
        }

        const apiData = { ...postResult, list: items, title: title };
        return normalizePreview(apiData, finalUrl);
    }

    throw new Error("Failed to fetch content from TeraBox via any method.");
}
