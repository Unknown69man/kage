const fetch = globalThis.fetch ?? (await import('node-fetch')).default;
import { URLSearchParams } from 'url';
import db from '../db/index.js';

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130";

function extractSurl(url) {
  try {
    const u = new URL(url);
    let surl = u.searchParams.get("surl");
    if (!surl) {
      const m = u.pathname.match(/\/s\/([A-Za-z0-9_-]+)/);
      if (m) surl = m[1];
    }
    if (!surl) return null;
    return surl.startsWith("1") ? surl.slice(1) : surl;
  } catch {
    return null;
  }
}

function cookiesToHeader(cookies) {
  return cookies
    .filter(c => c.domain.includes("1024tera") || c.domain.includes("terabox"))
    .map(c => `${c.name}=${c.value}`)
    .join("; ");
}

async function fetchList({ surl, jsToken, cookie, dir = "" }) {
  const params = new URLSearchParams({
    app_id: "250528",
    web: "1",
    channel: "dubox",
    clienttype: "0",
    shorturl: surl,
    jsToken,
    page: "1",
    num: "100",
    order: "asc",
    by: "name",
    site_referer: "https://www.1024tera.com/"
  });

  if (dir) params.set("dir", dir);
  else params.set("root", "1");

  const url = "https://dm.1024tera.com/share/list?" + params.toString();

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Cookie": cookie,
      "Referer": `https://www.1024tera.com/sharing/link?surl=${surl}`,
      "Origin": "https://www.1024tera.com",
      "X-Requested-With": "XMLHttpRequest"
    }
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Failed to parse auth response: verify credentials and jsToken.");
  }
}

export async function resolveTeraBoxAuth(shareUrl) {
  const authRow = db.prepare("SELECT value FROM settings WHERE key = 'terabox_auth'").get();
  if (!authRow || !authRow.value) {
    throw new Error("TeraBox authentication not configured.");
  }
  const auth = JSON.parse(authRow.value);
  const surl = extractSurl(shareUrl);
  const cookie = cookiesToHeader(auth.cookies);

  if (!surl) {
    throw new Error("Could not extract surl from share URL.");
  }

  const root = await fetchList({ surl, jsToken: auth.jsToken, cookie });
  if (root.errno !== 0 || !root.list) {
    throw new Error(`Failed to fetch authenticated list: ${root.errmsg || 'Unknown error'}`);
  }

  // If the API call was successful, update the timestamp
  auth.last_successful_usage_at = new Date().toISOString();
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    .run('terabox_auth', JSON.stringify(auth));


  let items = root.list;
  if (items.length === 1 && items[0].isdir === "1") {
    const inner = await fetchList({ surl, jsToken: auth.jsToken, cookie, dir: items[0].path });
    if (inner.list) items = inner.list;
  }

  // Normalize to the format expected by the database update logic.
  const fileMap = {};
  items.forEach(f => {
    if (f.isdir !== "1") {
      fileMap[f.fs_id] = {
        dlink: f.dlink || null,
        stream_url: f.dlink, // Use dlink as the stream URL.
        streams: f.thumbs, // Store thumbnails as 'streams' for potential future use.
      };
    }
  });

  return fileMap;
}
