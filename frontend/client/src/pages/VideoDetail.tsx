import { useState } from "react";
import { useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { useLocation } from "wouter";
import { Download, Share2, MoreVertical, Plus, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SAMPLE_VIDEOS = [
  {
    id: "video-hls",
    title: "Tears of Steel",
    subtitle: "Open Source Film Demo",
    url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    poster: "https://images.unsplash.com/photo-1535016120754-e32375c9dbab?w=800&h=450&fit=crop",
    description: "Tears of Steel is an open-source film. It follows the paths of characters confronted by a postapocalyptic world. Shot in 4K using professional cameras and production techniques.",
    rating: 8.2,
    duration: "12 min",
    year: 2012,
    genre: ["Sci-Fi", "Action", "Open Source"],
    cast: ["Tycho", "Shelley", "Yadira", "Jerome"],
  },
  {
    id: "1",
    title: "Arcane: Season 2",
    subtitle: "Episode 4: Paint The Town Blue",
    url: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4",
    poster: "https://images.unsplash.com/photo-1533613220915-92f66b5b6251?w=800&h=450&fit=crop",
    description: "An action-packed episode with stunning visuals and compelling storytelling.",
    rating: 8.9,
    duration: "45 min",
    year: 2024,
    genre: ["Animation", "Action", "Drama"],
    cast: ["Hailee Steinfeld", "Ella Purnell", "Kevin Alexandre"],
  },
];

export default function VideoDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const video = SAMPLE_VIDEOS.find((v) => v.id === params.id) || SAMPLE_VIDEOS[0];
  
  const [cast, setCast] = useState<string[]>(video.cast);
  const [newCastMember, setNewCastMember] = useState("");
  const [isAddCastOpen, setIsAddCastOpen] = useState(false);

  const handleAddCast = () => {
    if (newCastMember.trim() && !cast.includes(newCastMember.trim())) {
      setCast([...cast, newCastMember.trim()]);
      setNewCastMember("");
      setIsAddCastOpen(false);
    }
  };

  const handleRemoveCast = (actor: string) => {
    setCast(cast.filter((c) => c !== actor));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCast();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Video Player */}
        <VideoPlayer
          videoUrl={video.url}
          poster={video.poster}
          onBack={() => navigate("/")}
          metadata={{
            title: video.title,
            subtitle: video.subtitle,
            rating: video.rating,
            duration: video.duration,
            year: video.year,
            genre: video.genre,
            description: video.description,
            cast: cast,
          }}
        />

        {/* Video Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{video.title}</h1>
              <p className="text-muted-foreground text-lg">{video.subtitle}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">About</h3>
              <p className="text-muted-foreground leading-relaxed">
                {video.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Cast</h3>
              <div className="flex flex-wrap gap-2">
                {cast.map((actor) => (
                  <div
                    key={actor}
                    className="group flex items-center gap-1 px-3 py-1 rounded bg-secondary/50 text-sm hover:bg-secondary/70 transition-colors"
                  >
                    <button
                      onClick={() => navigate(`/metadata/cast/${encodeURIComponent(actor)}`)}
                      className="hover:underline cursor-pointer"
                      data-testid={`button-cast-${actor}`}
                    >
                      {actor}
                    </button>
                    <button
                      onClick={() => handleRemoveCast(actor)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/20 rounded"
                      title="Remove cast member"
                      data-testid={`button-remove-cast-${actor}`}
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                ))}
                {cast.length === 0 && (
                  <p className="text-muted-foreground text-sm">No cast members added yet.</p>
                )}
                <Dialog open={isAddCastOpen} onOpenChange={setIsAddCastOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Plus className="w-4 h-4" />
                      Add Cast
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Cast Member</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2 mt-4">
                      <Input
                        placeholder="Enter cast member name"
                        value={newCastMember}
                        onChange={(e) => setNewCastMember(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                      <Button onClick={handleAddCast} disabled={!newCastMember.trim()}>
                        Add
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
            >
              <MoreVertical className="w-4 h-4" />
              More Options
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
