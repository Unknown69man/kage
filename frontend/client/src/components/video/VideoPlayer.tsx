import { useRef, useState, useEffect, useCallback } from "react";
import HLS from "hls.js";
import {
  ChevronLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  Star,
  Check,
  ChevronRight,
  Captions,
  Gauge,
  Music2,
  MonitorPlay,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoMetadata {
  title: string;
  subtitle?: string;
  rating?: number;
  duration?: string;
  year?: number;
  genre?: string[];
  description?: string;
  cast?: string[];
}

interface VideoPlayerProps {
  videoUrl: string;
  onBack?: () => void;
  poster?: string;
  metadata?: VideoMetadata;
}

type SettingsPanel = "main" | "quality" | "speed" | "audio" | "subtitles" | null;

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const QUALITY_OPTIONS = ["Auto", "1080p", "720p", "480p", "360p"];

export function VideoPlayer({
  videoUrl,
  onBack,
  poster,
  metadata,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [thumbnailPosition, setThumbnailPosition] = useState({ x: 0, time: 0 });
  const [showSettings, setShowSettings] = useState<SettingsPanel>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [audioTrack, setAudioTrack] = useState("Default");
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [showMetadataExpanded, setShowMetadataExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hlsRef = useRef<HLS | null>(null);
  const [availableQualities, setAvailableQualities] = useState<string[]>(QUALITY_OPTIONS);
  const [availableAudioTracks, setAvailableAudioTracks] = useState<string[]>(["Default"]);
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);

  // Seek function - defined early to avoid reference errors
  const seekTo = useCallback((clientX: number) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    videoRef.current.currentTime = percent * duration;
    setCurrentTime(percent * duration);
  }, [duration]);

  // Initialize video and HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleVolumeChange = () => setVolume(video.volume);

    if (videoUrl.includes(".m3u8")) {
      if (HLS.isSupported()) {
        const hls = new HLS({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        
        hls.on(HLS.Events.MANIFEST_PARSED, (_event, data) => {
          const qualities = data.levels.map((level: any) => `${level.height}p`);
          const uniqueQualities = Array.from(new Set(qualities));
          setAvailableQualities(["Auto", ...uniqueQualities]);
          
          if (hls.audioTracks.length > 0) {
            setAvailableAudioTracks(hls.audioTracks.map((track: any) => track.name || `Track ${track.id}`));
          }
        });

        hls.on(HLS.Events.SUBTITLE_TRACKS_UPDATED, () => {
          // Handle subtitle tracks if available
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      }
    } else {
      video.src = videoUrl;
    }

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("volumechange", handleVolumeChange);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("volumechange", handleVolumeChange);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle subtitles
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = subtitlesEnabled ? "showing" : "hidden";
    }
  }, [subtitlesEnabled]);

  // Handle mouse up for drag end and global mouse move for smooth dragging
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && progressRef.current && videoRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        videoRef.current.currentTime = percent * duration;
        setCurrentTime(percent * duration);
      }
    };

    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleGlobalMouseMove);
      return () => {
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mousemove", handleGlobalMouseMove);
      };
    }
  }, [isDragging, duration]);

  // Auto-hide controls (but not metadata bar)
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(null);
      }, 4000);
    }
  }, [isPlaying]);

  // Generate preview frame for timeline hover
  const generatePreviewFrame = useCallback((time: number) => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tempVideo = document.createElement("video");
    tempVideo.src = video.src || videoUrl;
    tempVideo.crossOrigin = "anonymous";
    tempVideo.currentTime = time;
    
    tempVideo.onseeked = () => {
      canvas.width = 160;
      canvas.height = 90;
      ctx.drawImage(tempVideo, 0, 0, 160, 90);
      setPreviewFrame(canvas.toDataURL());
      tempVideo.remove();
    };
    
    tempVideo.onerror = () => {
      tempVideo.remove();
    };
  }, [videoUrl]);

  // Action callbacks - defined before keyboard effect
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    if (videoRef.current) {
      const currentVolume = videoRef.current.volume;
      const newVolume = Math.max(0, Math.min(1, currentVolume + delta));
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration || 0;
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoDuration, videoRef.current.currentTime + seconds)
      );
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Keyboard shortcuts - must come after callback definitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (onBack) {
            onBack();
          }
          break;
        case " ":
        case "k":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "j":
          skip(-10);
          break;
        case "l":
          skip(10);
          break;
        case "c":
          setSubtitlesEnabled(!subtitlesEnabled);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onBack, subtitlesEnabled, togglePlayPause, toggleMute, adjustVolume, skip, toggleFullscreen]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      seekTo(e.clientX);
      resetControlsTimeout();
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    seekTo(e.clientX);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = x / rect.width;
    const time = percent * duration;
    setThumbnailPosition({ x, time });
    setShowThumbnail(true);
    
    // Generate preview frame
    if (duration > 0) {
      generatePreviewFrame(time);
    }

    // Update position while dragging
    if (isDragging) {
      seekTo(e.clientX);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      if (value > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
    setShowSettings(null);
  };

  const changeQuality = (q: string) => {
    setQuality(q);
    if (hlsRef.current && q !== "Auto") {
      const levelIndex = hlsRef.current.levels.findIndex(
        (level: any) => `${level.height}p` === q
      );
      if (levelIndex >= 0) {
        hlsRef.current.currentLevel = levelIndex;
      }
    } else if (hlsRef.current) {
      hlsRef.current.currentLevel = -1;
    }
    setShowSettings(null);
  };

  const changeAudioTrack = (track: string) => {
    setAudioTrack(track);
    if (hlsRef.current) {
      const trackIndex = availableAudioTracks.indexOf(track);
      if (trackIndex >= 0) {
        hlsRef.current.audioTrack = trackIndex;
      }
    }
    setShowSettings(null);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const renderSettingsMenu = () => {
    if (!showSettings) return null;

    return (
      <div className="absolute bottom-32 right-4 bg-black/95 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden min-w-[220px] shadow-xl z-50">
        {showSettings === "main" && (
          <div className="py-1">
            <button
              onClick={() => setShowSettings("speed")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Gauge className="w-4 h-4" />
                <span>Playback Speed</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <span>{playbackSpeed}x</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
            <button
              onClick={() => setShowSettings("quality")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MonitorPlay className="w-4 h-4" />
                <span>Quality</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <span>{quality}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
            <button
              onClick={() => setShowSettings("audio")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Music2 className="w-4 h-4" />
                <span>Audio Track</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <span>{audioTrack}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
            <button
              onClick={() => setShowSettings("subtitles")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Captions className="w-4 h-4" />
                <span>Subtitles (C)</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <span>{subtitlesEnabled ? "On" : "Off"}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {showSettings === "speed" && (
          <div className="py-1">
            <button
              onClick={() => setShowSettings("main")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white/60 hover:bg-white/10 border-b border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Playback Speed</span>
            </button>
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => changePlaybackSpeed(speed)}
                className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
                {playbackSpeed === speed && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            ))}
          </div>
        )}

        {showSettings === "quality" && (
          <div className="py-1">
            <button
              onClick={() => setShowSettings("main")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white/60 hover:bg-white/10 border-b border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quality</span>
            </button>
            {availableQualities.map((q) => (
              <button
                key={q}
                onClick={() => changeQuality(q)}
                className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <span>{q}</span>
                {quality === q && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            ))}
          </div>
        )}

        {showSettings === "audio" && (
          <div className="py-1">
            <button
              onClick={() => setShowSettings("main")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white/60 hover:bg-white/10 border-b border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Audio Track</span>
            </button>
            {availableAudioTracks.map((track) => (
              <button
                key={track}
                onClick={() => changeAudioTrack(track)}
                className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <span>{track}</span>
                {audioTrack === track && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            ))}
          </div>
        )}

        {showSettings === "subtitles" && (
          <div className="py-1">
            <button
              onClick={() => setShowSettings("main")}
              className="w-full px-4 py-2 flex items-center gap-2 text-white/60 hover:bg-white/10 border-b border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Subtitles</span>
            </button>
            <button
              onClick={() => { setSubtitlesEnabled(false); setShowSettings(null); }}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <span>Off</span>
              {!subtitlesEnabled && <Check className="w-4 h-4 text-cyan-400" />}
            </button>
            <div className="px-4 py-2 text-white/40 text-sm italic">
              No subtitle tracks available
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-xl overflow-hidden group flex flex-col",
        isFullscreen && "rounded-none fixed inset-0 z-50"
      )}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
          setShowSettings(null);
        }
      }}
    >
      {/* Hidden canvas for preview generation */}
      <canvas ref={previewCanvasRef} className="hidden" />

      {/* Video Container */}
      <div 
        className="relative flex-1"
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "VIDEO") {
            togglePlayPause();
            resetControlsTimeout();
          }
        }}
        onMouseMove={resetControlsTimeout}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className={cn(
            "w-full h-full bg-black object-contain",
            !isFullscreen && "aspect-video"
          )}
          poster={poster}
          controls={false}
          playsInline
          crossOrigin="anonymous"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Overlay Controls */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center">
            {onBack && (
              <button
                onClick={(e) => { e.stopPropagation(); onBack(); }}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                title="Back (Esc)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {metadata && (
              <div className="flex-1 ml-2">
                <h2 className="text-lg font-semibold line-clamp-1">{metadata.title}</h2>
                {metadata.subtitle && (
                  <p className="text-sm text-white/70 line-clamp-1">{metadata.subtitle}</p>
                )}
              </div>
            )}
          </div>


          {/* Timeline Thumbnail Preview */}
          {showThumbnail && (
            <div
              className="absolute bottom-28 bg-black/95 rounded-lg px-2 py-2 pointer-events-none border border-white/20 shadow-xl z-40"
              style={{
                left: `${Math.max(90, Math.min(thumbnailPosition.x + 16, (progressRef.current?.offsetWidth || 300) - 90))}px`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="w-40 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded overflow-hidden mb-1">
                {previewFrame ? (
                  <img src={previewFrame} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white/30" />
                  </div>
                )}
              </div>
              <div className="text-center text-white font-mono text-sm font-medium">
                {formatTime(thumbnailPosition.time)}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="absolute bottom-20 left-0 right-0 px-4">
            <div
              ref={progressRef}
              onClick={(e) => { e.stopPropagation(); handleProgressClick(e); }}
              onMouseDown={(e) => { e.stopPropagation(); handleProgressMouseDown(e); }}
              onMouseMove={(e) => { handleProgressMouseMove(e); resetControlsTimeout(); }}
              onMouseLeave={() => { if (!isDragging) { setShowThumbnail(false); setPreviewFrame(null); } }}
              className={cn("relative h-1.5 bg-white/30 rounded-full cursor-pointer group/progress hover:h-3 transition-all", isDragging && "h-2.5")}
            >
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg -translate-y-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ left: `${progress}%`, marginLeft: "-8px" }}
              />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            {/* Time Display */}
            <div className="flex justify-between text-xs text-white/70 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                  title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); skip(-10); }}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                  title="Skip 10s back (← or J)"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); skip(10); }}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                  title="Skip 10s forward (→ or L)"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1 group/volume">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="p-2 hover:bg-white/20 rounded transition-colors"
                    title={isMuted ? "Unmute (M)" : "Mute (M)"}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-0 group-hover/volume:w-20 transition-all h-1 cursor-pointer accent-cyan-500"
                  />
                </div>

                {playbackSpeed !== 1 && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">{playbackSpeed}x</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setSubtitlesEnabled(!subtitlesEnabled); }}
                  className={cn("p-2 hover:bg-white/20 rounded transition-colors", subtitlesEnabled && "bg-white/20")}
                  title="Subtitles (C)"
                >
                  <Captions className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); setShowSettings(showSettings ? null : "main"); }}
                  className={cn("p-2 hover:bg-white/20 rounded transition-colors", showSettings && "bg-white/20")}
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                  title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {renderSettingsMenu()}
        </div>
      </div>

    </div>
  );
}
