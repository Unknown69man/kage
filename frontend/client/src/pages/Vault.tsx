import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, AlertCircle, File, Folder, Upload, Image, Trash2, Plus, Link as LinkIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VAULT_TEST_FILES, VaultFile } from "@/lib/vaultData";
import { useVault } from "@/contexts/VaultContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StoredVaultFile extends VaultFile {
  dataUrl?: string;
  sourceUrl?: string;
}

export default function Vault() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [, navigate] = useLocation();
  const { isVaultUnlocked, setVaultUnlocked } = useVault();
  const [vaultFiles, setVaultFiles] = useState<StoredVaultFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddUrlDialog, setShowAddUrlDialog] = useState(false);
  const [urlToAdd, setUrlToAdd] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isVaultUnlocked) {
      setPin("");
      setError(false);
      fetchVaultFiles();
    }
  }, [isVaultUnlocked]);

  const fetchVaultFiles = async () => {
    try {
      const response = await fetch("/api/vault/files");
      if (response.ok) {
        const serverFiles = await response.json();
        const serverFilesFormatted = serverFiles.map((f: any) => ({
          ...f,
          date: f.createdAt ? new Date(f.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown",
        }));
        setVaultFiles([...VAULT_TEST_FILES, ...serverFilesFormatted]);
      } else {
        setVaultFiles([...VAULT_TEST_FILES]);
      }
    } catch (error) {
      setVaultFiles([...VAULT_TEST_FILES]);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setVaultUnlocked(true);
      setPin("");
      setError(false);
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 500);
    }
  };

  const handleLock = () => {
    setVaultUnlocked(false);
    setPin("");
    setError(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const uploadFile = (file: File): Promise<void> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          try {
            const response = await fetch("/api/vault/files", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: file.name,
                type: "file",
                size: formatFileSize(file.size),
                mimeType: file.type,
                dataUrl,
              }),
            });

            if (response.ok) {
              toast({
                title: "File Added",
                description: `${file.name} has been securely stored`,
              });
              fetchVaultFiles();
            }
          } catch (error) {
            toast({
              title: "Error",
              description: `Failed to store ${file.name}`,
              variant: "destructive",
            });
          } finally {
            resolve();
          }
        };
        reader.onerror = () => {
          toast({
            title: "Error",
            description: `Failed to read ${file.name}`,
            variant: "destructive",
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    };

    const fileArray = Array.from(files);
    for (const file of fileArray) {
      await uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSaveFromUrl = async () => {
    if (!urlToAdd) return;

    try {
      const fileName = urlToAdd.split("/").pop() || "Saved Image";

      const response = await fetch("/api/vault/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fileName,
          type: "file",
          size: "External",
          sourceUrl: urlToAdd,
        }),
      });

      if (response.ok) {
        toast({
          title: "Image Saved",
          description: "Image URL has been added to your vault",
        });
        fetchVaultFiles();
      } else {
        throw new Error("Failed to save");
      }

      setUrlToAdd("");
      setShowAddUrlDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save image from URL",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (id.startsWith("vault-") && !id.startsWith("vault-upload") && !id.startsWith("vault-url")) {
      setVaultFiles((prev) => prev.filter((f) => f.id !== id));
      toast({
        title: "File Removed",
        description: "Test file has been hidden",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/vault/files/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast({
          title: "File Removed",
          description: "File has been removed from vault",
        });
        fetchVaultFiles();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="w-full">
        <AnimatePresence mode="wait">
          {!isVaultUnlocked ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[500px]"
            >
              <motion.div
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md px-6 py-8"
              >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-border shadow-inner">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Secure Vault</h2>
                <p className="text-muted-foreground mt-3 text-sm">Enter PIN to access protected content</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    id="vault-pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className={cn(
                      "text-center text-4xl tracking-[1.5em] h-20 font-mono bg-secondary/50 border-2 border-border focus:ring-primary focus:border-primary transition-all",
                      error && "border-destructive text-destructive placeholder:text-destructive/50"
                    )}
                    maxLength={4}
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="flex items-center justify-center gap-2 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Incorrect PIN</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="w-full h-12"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    Unlock
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                    <Unlock className="w-5 h-5 text-primary" />
                  </div>
                  Secure Vault
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Your private content is protected and accessible</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={showAddUrlDialog} onOpenChange={setShowAddUrlDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Save from URL
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Image from URL</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="Enter image URL..."
                        value={urlToAdd}
                        onChange={(e) => setUrlToAdd(e.target.value)}
                      />
                      <Button onClick={handleSaveFromUrl} className="w-full">
                        Save to Vault
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
                <Button
                  onClick={handleLock}
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-shrink-0"
                >
                  <Lock className="w-4 h-4" />
                  Lock
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all cursor-pointer",
                isDragging
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-border/50 hover:border-cyan-500/50"
              )}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className={cn("w-10 h-10 mx-auto mb-3", isDragging ? "text-cyan-400" : "text-muted-foreground")} />
              <p className="text-sm text-muted-foreground">
                {isDragging ? "Drop files here to add to vault" : "Drag files here or click to upload"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              {vaultFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-card border border-border/50 rounded-lg p-4 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10 relative"
                >
                  {file.id.startsWith("vault-") && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                      className="absolute top-2 right-2 p-1.5 rounded bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {file.sourceUrl ? (
                        <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center">
                          <Image className="w-5 h-5 text-purple-400" />
                        </div>
                      ) : file.type === "file" ? (
                        <div className="w-10 h-10 rounded bg-cyan-500/20 flex items-center justify-center">
                          <File className="w-5 h-5 text-cyan-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-yellow-500/20 flex items-center justify-center">
                          <Folder className="w-5 h-5 text-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-secondary/50 text-muted-foreground">
                      {file.sourceUrl ? "Image" : file.type === "file" ? "File" : "Folder"}
                    </div>
                  </div>

                  {file.sourceUrl && (
                    <div className="mb-3 rounded overflow-hidden bg-secondary/30 aspect-video">
                      <img src={file.sourceUrl} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {file.name}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{file.size}</span>
                    <span>{file.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AppLayout>
  );
}
