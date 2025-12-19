import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MediaItem } from "@/lib/mockData";
import { Play, Download, Trash2, File, Clock, HardDrive, Hash, ChevronRight, Tag, Folder, X, Settings, Edit2, RotateCcw, FolderOpen, Users, Film, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getSettings, getModalBackgroundClass } from "@/lib/settingsContext";
import { getWatchProgress, saveWatchProgress, formatWatchTime } from "@/lib/watchHistory";
import { useLocation } from "wouter";

interface DetailModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailModal({ item, isOpen, onClose }: DetailModalProps) {
  const [, navigate] = useLocation();
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [backgroundClass, setBackgroundClass] = useState("bg-white");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [watchProgress, setWatchProgress] = useState(0);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [cardBgStyle, setCardBgStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const settings = getSettings();
    setBackgroundClass(getModalBackgroundClass(settings.modalBackground));
    
    // Build card background style
    let style: React.CSSProperties = {};
    if (settings.cardBackgroundVideo) {
      style = { background: 'rgba(0, 0, 0, 0.7)' };
    } else if (settings.cardBackgroundImage) {
      style = {
        backgroundImage: `url('${settings.cardBackgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      };
    }
    setCardBgStyle(style);
  }, [isOpen]);

  useEffect(() => {
    if (item) {
      setDescription(
        item.type === 'folder' 
          ? `This folder contains ${item.fileCount} files organized for easy access. Last updated recently with high-quality media assets.`
          : `High-quality ${item.type} content with ${item.duration ? `duration of ${item.duration}` : 'detailed metadata'}. Perfect for viewing and download.`
      );
      
      if (item.type !== 'folder') {
        const progress = getWatchProgress(item.id);
        setWatchProgress(progress);
      }
    }
  }, [item]);

  if (!item) return null;

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePlay = () => {
    if (item.type !== 'folder') {
      if (item.videoUrl) {
        // Navigate to video detail page
        navigate(`/video/${item.id}`);
      } else {
        // Update watch progress for items without video URL
        saveWatchProgress(item.id, item.title, watchProgress + 50, item.duration || "00:00", item.thumbnail);
        setWatchProgress(watchProgress + 50);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden bg-card border-border/50 shadow-2xl">
        <DialogTitle className="sr-only">{item.title}</DialogTitle>
        {/* Card Background Video */}
        {getSettings().cardBackgroundVideo && (
          <video
            autoPlay
            muted
            loop
            className="fixed inset-0 w-full h-full object-cover -z-10"
            style={{ pointerEvents: 'none' }}
          >
            <source src={getSettings().cardBackgroundVideo} type="video/mp4" />
          </video>
        )}
        <div className="grid grid-cols-1 md:grid-cols-5 h-[700px]">
          {/* Left Panel - Preview & Actions */}
          <div className="md:col-span-3 relative flex flex-col flex-shrink-0 p-8 overflow-hidden bg-[#0d0d0f]" style={cardBgStyle}>
            {/* Noise/Grain texture overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noiseFilter)' opacity='0.3'/%3E%3C/svg%3E")`
            }} />

            {/* Gradient overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-cyan-500 via-transparent to-purple-500" />

            {/* Content wrapper with relative positioning */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Thumbnail Container - Increased height */}
              <div className="relative flex items-center justify-center rounded-2xl overflow-hidden flex-shrink-0 h-64 w-full mb-6 bg-secondary/10 border border-border/30 shadow-lg">
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
                
                {/* Placeholder when thumbnail fails */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/50 to-secondary/80">
                  <div className="text-center">
                    {item.type === 'video' && <Film className="w-16 h-16 text-cyan-400/60 mx-auto mb-2" />}
                    {item.type === 'image' && <ImageIcon className="w-16 h-16 text-purple-400/60 mx-auto mb-2" />}
                    {item.type === 'folder' && <Folder className="w-16 h-16 text-blue-400/60 mx-auto mb-2" />}
                    <p className="text-xs text-muted-foreground">Media unavailable</p>
                  </div>
                </div>
                
                {/* Large Round Play Button at Center */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="relative group">
                    <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity" />
                    <Button 
                      size="icon" 
                      className="w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 text-white shadow-2xl hover:scale-105 transition-all relative"
                    >
                      <Play className="w-8 h-8 ml-1.5" fill="currentColor" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Watch Progress Indicator */}
              {item.type !== 'folder' && watchProgress > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Resume from</span>
                    <span className="text-cyan-300 font-mono">{formatWatchTime(watchProgress)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden border border-border/50">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
                      style={{ width: `${Math.min(watchProgress, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Soft divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-6" />

              {/* Description Section */}
              <div className="flex-1 mb-6 bg-secondary/20 rounded-xl p-4 border border-border/30 overflow-y-auto backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Description</h4>
                  <button
                    onClick={() => setIsEditingDescription(!isEditingDescription)}
                    className="text-muted-foreground hover:text-cyan-400 transition-colors"
                    title="Edit description"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {isEditingDescription ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-full bg-secondary/50 border border-border/50 rounded p-2 text-sm text-foreground resize-none focus:outline-none focus:border-cyan-500/50"
                    placeholder="Enter description..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {/* Soft divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-6" />

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                {item.type === "folder" ? (
                  <>
                    <Button className="flex-1 gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg rounded-lg h-10 transition-all duration-300 hover:shadow-xl hover:scale-105 transform">
                      <Folder className="w-4 h-4" /> Open
                    </Button>
                    <Button className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg rounded-lg h-10 transition-all duration-300 hover:shadow-xl hover:scale-105 transform">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={handlePlay}
                      className="flex-1 gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg rounded-lg h-10 transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
                    >
                      <Play className="w-4 h-4" /> Play
                    </Button>
                    <Button className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg rounded-lg h-10 transition-all duration-300 hover:shadow-xl hover:scale-105 transform">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Metadata */}
          <div className="md:col-span-2 flex flex-col bg-gradient-to-b from-card to-secondary/20 border-l border-border/30">
            {/* Title & Status */}
            <div className="p-6 border-b border-border/30 space-y-3">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-2xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  {item.title}
                </h2>
                <Badge variant={item.status === 'playable' ? 'default' : 'destructive'} className="uppercase text-[9px] tracking-wider bg-cyan-600/30 text-cyan-300 border-cyan-500/50">
                  {item.status}
                </Badge>
              </div>
              
              {/* Meta Info */}
              <div className="space-y-3">
                <div className="flex gap-3 text-xs text-muted-foreground font-mono flex-wrap">
                  <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded border border-border/50">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300">{item.size || '_ / _'}</span>
                  </div>
                  {item.type !== 'folder' && (
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded border border-border/50">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-purple-300">{item.duration || '_ / _'}</span>
                    </div>
                  )}
                  {item.type === 'folder' && (
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded border border-border/50">
                      <Hash className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-pink-300">{item.fileCount || '0'} files</span>
                    </div>
                  )}
                </div>

                {/* Category & Genre */}
                {(item.category || item.genre) && (
                  <div className="flex gap-2 flex-wrap">
                    {item.category && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                        <Folder className="w-3 h-3 mr-1" /> {item.category}
                      </Badge>
                    )}
                    {item.genre && (
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                        {item.genre}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Soft divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

            {/* Cast Management */}
            {item.cast && item.cast.length > 0 && (
              <>
                <div className="px-6 py-4 border-b border-border/30 space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-orange-400" /> Cast
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {item.cast.map((actor) => (
                      <Badge key={actor} variant="outline" className="bg-orange-500/10 text-orange-300 border-orange-500/30 text-[11px] px-2 py-0.5">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Soft divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
              </>
            )}

            {/* Tags Management */}
            <div className="px-6 py-4 border-b border-border/30 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-cyan-400" /> Tags
              </h3>
              
              {/* Existing Tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[11px] px-2 py-0.5 flex items-center gap-1 group">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Add New Tag */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  className="h-8 text-xs bg-secondary/50 border-border/50"
                />
                <Button
                  size="sm"
                  onClick={handleAddTag}
                  className="h-8 px-2 bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Soft divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

            {/* Edit & Browse Files Actions */}
            <div className="px-6 py-4 border-b border-border/30 space-y-2">
              <Button variant="outline" className="w-full gap-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-600/10 border-cyan-500/30 h-9 justify-start transition-all duration-300 hover:scale-105 transform">
                <Settings className="w-4 h-4" />
                Edit Metadata
              </Button>
              <Popover open={isFilesOpen} onOpenChange={setIsFilesOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 border-purple-500/30 h-9 justify-start transition-all duration-300 hover:scale-105 transform">
                    <FolderOpen className="w-4 h-4" />
                    Browse Files ({item.fileCount})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-secondary/95 border-border/50 shadow-2xl">
                  <div className="space-y-2 p-4">
                    <h3 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2 uppercase tracking-widest">
                      <FolderOpen className="w-4 h-4" /> Contents
                    </h3>
                    <ScrollArea className="h-64 pr-4 space-y-1">
                      {Array.from({ length: item.fileCount || 1 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-secondary/80 cursor-pointer group transition-colors text-xs">
                          <File className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 transition-colors flex-shrink-0" />
                          <span className="flex-1 truncate font-mono opacity-75 group-hover:opacity-100">
                            {item.type === 'folder' ? `part_${String(i + 1).padStart(3, '0')}.rar` : `${item.title.toLowerCase().replace(/ /g, '_')}.mp4`}
                          </span>
                          <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Soft divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

            {/* Delete Button - Isolated */}
            <div className="p-4 border-t border-border/30 bg-secondary/10">
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 justify-start text-xs h-10 font-medium transition-all duration-300 hover:scale-105 transform">
                <Trash2 className="w-4 h-4" />
                Delete from Library
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
