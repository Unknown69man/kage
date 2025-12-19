import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Film, X, Play, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "@/components/video/VideoPlayer";

interface LocalVideo {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

export default function LocalVideoPlayer() {
  const [localVideos, setLocalVideos] = useState<LocalVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<LocalVideo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const videoFiles = Array.from(files).filter((file) =>
      file.type.startsWith("video/")
    );

    requestAnimationFrame(() => {
      const newVideos: LocalVideo[] = videoFiles.map((file) => ({
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: formatFileSize(file.size),
        type: file.type,
      }));

      setLocalVideos((prev) => [...prev, ...newVideos]);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeVideo = (id: string) => {
    const video = localVideos.find((v) => v.id === id);
    if (video) {
      URL.revokeObjectURL(video.url);
    }
    setLocalVideos((prev) => prev.filter((v) => v.id !== id));
    if (currentVideo?.id === id) {
      setCurrentVideo(null);
    }
  };

  const playVideo = (video: LocalVideo) => {
    setCurrentVideo(video);
  };

  if (currentVideo) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <VideoPlayer
          videoUrl={currentVideo.url}
          onBack={() => setCurrentVideo(null)}
          metadata={{
            title: currentVideo.name,
            subtitle: `${currentVideo.size} • ${currentVideo.type}`,
          }}
        />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">
              <Film className="w-5 h-5 text-purple-400" />
            </div>
            Local Video Player
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Load and play local video files directly in the browser
          </p>
        </div>

        <Card
          className={cn(
            "border-2 border-dashed transition-all cursor-pointer",
            isDragging
              ? "border-purple-500 bg-purple-500/10"
              : "border-border hover:border-purple-500/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-12 text-center">
            <Upload
              className={cn(
                "w-12 h-12 mx-auto mb-4 transition-colors",
                isDragging ? "text-purple-400" : "text-muted-foreground"
              )}
            />
            <h3 className="text-lg font-semibold mb-2">
              {isDragging ? "Drop videos here" : "Add Local Videos"}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Drag and drop video files or click to browse
            </p>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Browse Files
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </Card>

        {localVideos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Loaded Videos ({localVideos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localVideos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="group overflow-hidden hover:border-purple-500/50 transition-colors">
                    <div
                      className="aspect-video bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center cursor-pointer relative"
                      onClick={() => playVideo(video)}
                    >
                      <Film className="w-16 h-16 text-purple-400/50" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate" title={video.name}>
                            {video.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {video.size}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVideo(video.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
