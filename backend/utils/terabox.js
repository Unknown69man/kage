export function extractTeraBoxSurl(inputUrl) {
  try {
    const url = new URL(inputUrl)

    // Case 1: ?surl=XXXX
    const surl = url.searchParams.get('surl')
    if (surl) return surl

    // Case 2: /s/XXXX
    const match = url.pathname.match(/\/s\/([A-Za-z0-9_-]+)/)
    if (match) return match[1]

    return null
  } catch {
    return null
  }
}
