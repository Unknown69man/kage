import { AppLayout } from "@/components/layout/AppLayout";
import { Download, Pause, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Downloads() {
  const downloads = [
    { id: 1, title: "Large Project Archive", size: "4.2 GB", progress: 85, status: "downloading" as const },
    { id: 2, title: "Archive.part1.rar", size: "2.1 GB", progress: 100, status: "completed" as const },
    { id: 3, title: "Archive.part2.rar", size: "2.1 GB", progress: 45, status: "downloading" as const },
    { id: 4, title: "Corrupted Media File", size: "856 MB", progress: 0, status: "error" as const },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "downloading": return "text-cyan-400";
      case "completed": return "text-emerald-400";
      case "error": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className={`w-5 h-5 ${getStatusColor(status)}`} />;
      case "error": return <AlertCircle className={`w-5 h-5 ${getStatusColor(status)}`} />;
      default: return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-display mb-2">Downloads</h1>
          <p className="text-muted-foreground">Track and manage your download queue.</p>
        </div>

        <div className="space-y-3">
          {downloads.map((download) => (
            <div key={download.id} className="p-5 bg-card border border-border/50 rounded-lg hover:bg-secondary/30 hover:border-cyan-600/30 transition-all group">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-600/30 flex items-center justify-center flex-shrink-0">
                      <Download className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{download.title}</h3>
                      <p className="text-xs text-muted-foreground">{download.size}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusIcon(download.status)}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {download.status === "downloading" ? <Pause className="w-4 h-4" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${getStatusColor(download.status)}`}>
                    {download.status === "completed" && "Completed"}
                    {download.status === "downloading" && `${download.progress}% Downloaded`}
                    {download.status === "error" && "Failed"}
                  </span>
                  <span className="text-muted-foreground font-mono">{download.progress}%</span>
                </div>
                <Progress value={download.progress} className="h-1.5 bg-secondary" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-secondary/30 border border-border/50 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Download Queue Stats</h3>
              <p className="text-sm text-muted-foreground mt-1">3 total • 1 completed • 2 in progress</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-cyan-300 font-mono">8.4 GB / 9.2 GB</p>
              <p className="text-xs text-muted-foreground">91% complete</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
