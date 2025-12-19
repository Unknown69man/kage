// Placeholder images for demo purposes
const cinematic = "https://images.unsplash.com/photo-1534996858221-380b92700493?w=400&h=300&fit=crop";
const abstract = "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=300&fit=crop";
const nature = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop";
const interior = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop";
const tearsOfSteel = "https://images.unsplash.com/photo-1535016120754-e32375c9dbab?w=400&h=300&fit=crop";

export interface MediaItem {
  id: string;
  title: string;
  thumbnail: string;
  type: "video" | "image" | "folder";
  status: "playable" | "error" | "loading" | "expired";
  fileCount?: number;
  size: string;
  duration?: string;
  category?: string;
  tags?: string[];
  genre?: string;
  accentColor?: string;
  subtitle?: string;
  videoUrl?: string;
  cast?: string[];
}

export const GENRES = [
  { name: "Sci-Fi", icon: "🚀", color: "cyan" },
  { name: "Nature", icon: "🌿", color: "emerald" },
  { name: "Architecture", icon: "🏛️", color: "blue" },
  { name: "Technology", icon: "⚙️", color: "purple" },
  { name: "Abstract", icon: "✨", color: "pink" }
];

export const MOCK_LIBRARY: MediaItem[] = [
  {
    id: "video-hls",
    title: "Tears of Steel",
    subtitle: "Open Source Film",
    thumbnail: tearsOfSteel,
    type: "video",
    status: "playable",
    size: "1.8 GB",
    duration: "00:12:14",
    category: "Films",
    tags: ["Open Source", "4K", "Demo"],
    genre: "Sci-Fi",
    accentColor: "from-amber-500 to-red-600",
    cast: ["Tycho", "Shelley", "Yadira", "Jerome"],
    videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"
  },
  {
    id: "1",
    title: "Blade Runner Aesthetics",
    thumbnail: cinematic,
    type: "video",
    status: "playable",
    size: "2.4 GB",
    duration: "02:14:00",
    category: "Movies",
    tags: ["Cyberpunk", "Sci-Fi", "Classic"],
    genre: "Sci-Fi",
    cast: ["Harrison Ford", "Sean Young", "Rutger Hauer"],
    accentColor: "from-cyan-500 to-blue-600"
  },
  {
    id: "2",
    title: "Project Data Archive",
    thumbnail: abstract,
    type: "folder",
    status: "playable",
    fileCount: 142,
    size: "850 MB",
    category: "Collections",
    tags: ["Data", "Archive", "Important"],
    genre: "Technology",
    accentColor: "from-purple-500 to-pink-600"
  },
  {
    id: "3",
    title: "National Geographic: Mountains",
    thumbnail: nature,
    type: "video",
    status: "playable",
    size: "1.2 GB",
    duration: "00:45:30",
    category: "Documentaries",
    tags: ["Nature", "Travel", "Documentary"],
    genre: "Nature",
    cast: ["David Attenborough"],
    accentColor: "from-emerald-500 to-teal-600"
  },
  {
    id: "4",
    title: "Architecture Ref 2025",
    thumbnail: interior,
    type: "image",
    status: "playable",
    size: "15 MB",
    category: "References",
    tags: ["Design", "Interior", "Modern"],
    genre: "Architecture",
    accentColor: "from-blue-500 to-indigo-600"
  },
  {
    id: "5",
    title: "Corrupted Sector",
    thumbnail: abstract,
    type: "video",
    status: "error",
    size: "0 B",
    duration: "--:--",
    category: "Errors",
    tags: ["Damaged", "Recovery"],
    genre: "Abstract",
    accentColor: "from-red-500 to-orange-600"
  },
  {
    id: "6",
    title: "Pending Downloads",
    thumbnail: cinematic,
    type: "folder",
    status: "loading",
    fileCount: 3,
    size: "450 MB",
    category: "Downloads",
    tags: ["Queue", "Processing"],
    genre: "Technology",
    accentColor: "from-yellow-500 to-orange-600"
  }
];
