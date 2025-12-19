import { AppLayout } from "@/components/layout/AppLayout";
import { Clock, Play, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function History() {
  const historyItems = [
    { id: 1, title: "Blade Runner Aesthetics", action: "Played", time: "2 hours ago", duration: "02:14:00" },
    { id: 2, title: "National Geographic: Mountains", action: "Played", time: "Yesterday", duration: "00:45:30" },
    { id: 3, title: "Project Data Archive", action: "Downloaded", time: "3 days ago", size: "850 MB" },
    { id: 4, title: "Architecture Ref 2025", action: "Viewed", time: "1 week ago", duration: "--" },
    { id: 5, title: "Blade Runner Aesthetics", action: "Played", time: "2 weeks ago", duration: "02:14:00" },
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case "Played": return <Play className="w-4 h-4 text-cyan-400" />;
      case "Downloaded": return <Download className="w-4 h-4 text-emerald-400" />;
      case "Viewed": return <Eye className="w-4 h-4 text-purple-400" />;
      default: return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-display mb-2">History</h1>
          <p className="text-muted-foreground">Your recent activity across the vault.</p>
        </div>

        <div className="space-y-3">
          {historyItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-lg hover:bg-secondary/30 hover:border-cyan-600/30 transition-all group">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-600/30 flex items-center justify-center">
                  {getActionIcon(item.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-cyan-300 transition-colors truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.action} • {item.time}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 ml-4">
                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                  {item.duration || item.size || "--"}
                </span>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-secondary/30 border border-border/50 rounded-lg text-center space-y-3">
          <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">History is cleared when you exit Panic Mode or lock the vault.</p>
          <Button variant="outline" size="sm">Clear History</Button>
        </div>
      </div>
    </AppLayout>
  );
}
