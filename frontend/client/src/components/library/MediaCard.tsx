import { motion } from "framer-motion";
import { Play, Info, Folder, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaItem } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

interface MediaCardProps {
  item: MediaItem;
  onSelect: () => void;
  onPlay: () => void;
}

export function MediaCard({ item, onSelect, onPlay }: MediaCardProps) {
  const getStatusIcon = () => {
    switch (item.status) {
      case "playable": return <Play className="w-3 h-3 text-emerald-400" fill="currentColor" />;
      case "error": return <XCircle className="w-3 h-3 text-destructive" />;
      case "loading": return <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />;
      case "expired": return <AlertTriangle className="w-3 h-3 text-orange-400" />;
      default: return null;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative aspect-[2.5/3.5] rounded-xl overflow-hidden bg-card border border-border/60 shadow-md hover:shadow-2xl transition-all cursor-pointer",
        "bg-gradient-to-br from-card to-secondary/50"
      )}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="absolute inset-0 bg-muted">
        <img 
          src={item.thumbnail} 
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115 opacity-75 group-hover:opacity-100" 
        />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-75 transition-opacity",
          item.accentColor && `via-${item.accentColor.split(' ')[1]}/20`
        )} />
      </div>

      {/* Status Badge */}
      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md border border-white/20 rounded-full p-1.5 flex items-center justify-center shadow-lg hover:bg-black/80 transition-colors">
        {item.fileCount ? (
           <div className="flex items-center gap-1 px-1">
             <Folder className="w-3 h-3 text-blue-400" />
             <span className="text-[9px] font-mono font-bold text-blue-300">{item.fileCount}</span>
           </div>
        ) : (
          getStatusIcon()
        )}
      </div>

      {/* Genre Badge */}
      {item.genre && (
        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1 flex items-center text-[9px] font-semibold text-cyan-300 uppercase tracking-wider shadow-lg">
          {item.genre}
        </div>
      )}

      {/* Hover Actions */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 backdrop-blur-sm">
        {item.status === 'playable' && (
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full w-11 h-11 bg-white/15 hover:bg-white/25 border-white/20 backdrop-blur-md text-white hover:scale-110 transition-all shadow-lg"
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
          >
            <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
          </Button>
        )}
        <Button 
          size="icon" 
          variant="secondary" 
          className="rounded-full w-11 h-11 bg-white/15 hover:bg-white/25 border-white/20 backdrop-blur-md text-white hover:scale-110 transition-all shadow-lg"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
        <h3 className="font-semibold text-white text-xs line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
          <span className="text-[8px] text-zinc-400 font-mono uppercase tracking-wider">{item.type}</span>
          <span className="text-[8px] text-zinc-400 font-mono font-semibold">{item.size}</span>
        </div>
      </div>
    </motion.div>
  );
}
