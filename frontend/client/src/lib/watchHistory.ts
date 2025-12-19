export interface WatchHistoryItem {
  id: string;
  title: string;
  lastWatchTime: number;
  duration: string;
  thumbnail: string;
  watchedAt: number;
}

export function getWatchHistory(): WatchHistoryItem[] {
  const stored = localStorage.getItem("watchHistory");
  return stored ? JSON.parse(stored) : [];
}

export function saveWatchProgress(id: string, title: string, watchTime: number, duration: string, thumbnail: string) {
  const history = getWatchHistory();
  const existingIndex = history.findIndex((item) => item.id === id);
  
  const item: WatchHistoryItem = {
    id,
    title,
    lastWatchTime: watchTime,
    duration,
    thumbnail,
    watchedAt: Date.now(),
  };

  if (existingIndex > -1) {
    history[existingIndex] = item;
  } else {
    history.unshift(item);
  }

  localStorage.setItem("watchHistory", JSON.stringify(history.slice(0, 50)));
}

export function getWatchProgress(id: string): number {
  const history = getWatchHistory();
  const item = history.find((h) => h.id === id);
  return item ? item.lastWatchTime : 0;
}

export function formatWatchTime(seconds: number): string {
  if (!seconds) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}
