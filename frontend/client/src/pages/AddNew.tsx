import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link, Download, Folder, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddNew() {
  const [tab, setTab] = useState<"url" | "local">("url");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Videos");

  const handleAddUrl = () => {
    if (url && title) {
      console.log("Adding from URL:", { url, title, category });
      setUrl("");
      setTitle("");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-display mb-2">Add New Media</h1>
          <p className="text-muted-foreground">Import media from URLs or local sources.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-3 border-b border-border">
          <button
            onClick={() => setTab("url")}
            className={`pb-4 px-1 font-medium border-b-2 transition-all ${
              tab === "url"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link className="w-4 h-4 inline mr-2" /> From URL
          </button>
          <button
            onClick={() => setTab("local")}
            className={`pb-4 px-1 font-medium border-b-2 transition-all ${
              tab === "local"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Folder className="w-4 h-4 inline mr-2" /> Local File
          </button>
        </div>

        {/* Content Panels */}
        {tab === "url" ? (
          <div className="space-y-6 bg-card p-8 rounded-xl border border-border/50">
            <div>
              <h2 className="text-2xl font-bold mb-2">Import from URL</h2>
              <p className="text-muted-foreground">Add media by pasting a streaming URL or direct link.</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Media URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/media.mp4"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-cyan-500/50"
                />
                <p className="text-xs text-muted-foreground">Supports direct video/image links and streaming URLs</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="My Media Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border/50 rounded-md text-foreground focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                >
                  <option>Videos</option>
                  <option>Images</option>
                  <option>Collections</option>
                  <option>References</option>
                  <option>Documentaries</option>
                </select>
              </div>

              <Alert className="bg-cyan-600/10 border-cyan-600/30">
                <AlertCircle className="h-4 w-4 text-cyan-400" />
                <AlertDescription className="text-cyan-300 text-sm">
                  Media will be indexed and cached locally. Vault access requires PIN verification.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => { setUrl(""); setTitle(""); }}
                >
                  Clear
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                  onClick={handleAddUrl}
                  disabled={!url || !title}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add to Library
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 bg-card p-8 rounded-xl border border-border/50">
            <div>
              <h2 className="text-2xl font-bold mb-2">Import Local File</h2>
              <p className="text-muted-foreground">Add media from your local filesystem.</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-border/50 rounded-lg p-12 text-center hover:border-cyan-500/50 transition-colors cursor-pointer group"
              >
                <Download className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4 group-hover:text-cyan-400 transition-colors" />
                <h3 className="font-medium mb-1">Drop files here or click to browse</h3>
                <p className="text-sm text-muted-foreground">Supports MP4, MKV, JPG, PNG and more</p>
              </div>

              <Alert className="bg-amber-600/10 border-amber-600/30">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-300 text-sm">
                  Local imports are copied to the vault. Large files may take time to process.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* Recent Imports */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent Imports</h2>
          <div className="space-y-2">
            {[
              { title: "Blade Runner Aesthetics", date: "Today" },
              { title: "National Geographic: Mountains", date: "Yesterday" },
              { title: "Architecture Ref 2025", date: "3 days ago" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-card border border-border/50 rounded-lg hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
