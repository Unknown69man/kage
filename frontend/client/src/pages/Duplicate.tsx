import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Trash2, EyeOff, AlertTriangle, CheckCircle, RefreshCw, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DuplicateItem {
  id: string;
  originalId: string;
  duplicateId: string;
  url: string;
  title?: string;
  thumbnail?: string;
  ignored: boolean;
  createdAt: string;
}

export default function Duplicate() {
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const fetchDuplicates = async () => {
    try {
      const response = await fetch("/api/duplicates");
      if (response.ok) {
        const data = await response.json();
        setDuplicates(data);
      }
    } catch (error) {
      console.error("Failed to fetch duplicates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch("/api/duplicates/scan", { method: "POST" });
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Scan Complete",
          description: `Found ${result.count} duplicate URLs`,
        });
        fetchDuplicates();
      }
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Could not complete duplicate scan",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/duplicates/${id}`, { method: "DELETE" });
      if (response.ok) {
        setDuplicates((prev) => prev.filter((d) => d.id !== id));
        toast({
          title: "Deleted",
          description: "Duplicate entry removed successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete duplicate",
        variant: "destructive",
      });
    }
  };

  const handleIgnore = async (id: string) => {
    try {
      const response = await fetch(`/api/duplicates/${id}/ignore`, { method: "PATCH" });
      if (response.ok) {
        setDuplicates((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ignored: true } : d))
        );
        toast({
          title: "Ignored",
          description: "Duplicate marked as ignored",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ignore duplicate",
        variant: "destructive",
      });
    }
  };

  const activeDuplicates = duplicates.filter((d) => !d.ignored);
  const ignoredDuplicates = duplicates.filter((d) => d.ignored);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center">
                <Copy className="w-5 h-5 text-orange-400" />
              </div>
              Duplicate Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Detect and manage duplicate URLs in your library
            </p>
          </div>

          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500"
          >
            <RefreshCw className={cn("w-4 h-4", isScanning && "animate-spin")} />
            {isScanning ? "Scanning..." : "Scan for Duplicates"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : duplicates.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Duplicates Found</h3>
            <p className="text-muted-foreground mb-6">
              Your library is clean! Click "Scan for Duplicates" to check for new duplicates.
            </p>
            <Button onClick={handleScan} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Run Scan
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {activeDuplicates.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <h2 className="text-lg font-semibold">
                    Active Duplicates ({activeDuplicates.length})
                  </h2>
                </div>

                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {activeDuplicates.map((duplicate) => (
                      <motion.div
                        key={duplicate.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        layout
                      >
                        <Card className="p-4 hover:border-orange-500/50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                              <Copy className="w-6 h-6 text-orange-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-orange-400 border-orange-400/30">
                                  Duplicate URL
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground truncate mb-2" title={duplicate.url}>
                                {duplicate.url}
                              </p>

                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Original: {duplicate.originalId.slice(0, 8)}...</span>
                                <span>•</span>
                                <span>Duplicate: {duplicate.duplicateId.slice(0, 8)}...</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleIgnore(duplicate.id)}
                                className="gap-1"
                              >
                                <EyeOff className="w-4 h-4" />
                                Ignore
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(duplicate.id)}
                                className="gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {ignoredDuplicates.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-muted-foreground">
                    Ignored ({ignoredDuplicates.length})
                  </h2>
                </div>

                <div className="grid gap-4 opacity-60">
                  {ignoredDuplicates.map((duplicate) => (
                    <Card key={duplicate.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Copy className="w-6 h-6 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Badge variant="secondary" className="mb-1">
                            Ignored
                          </Badge>
                          <p className="text-sm text-muted-foreground truncate" title={duplicate.url}>
                            {duplicate.url}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(duplicate.id)}
                          className="gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
