import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, AlertCircle, File, Folder } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VAULT_TEST_FILES } from "@/lib/vaultData";

interface VaultModalProps {
  isOpen: boolean;
  isUnlocked: boolean;
  onUnlock: () => void;
  onClose: () => void;
}

export function VaultModal({ isOpen, isUnlocked, onUnlock, onClose }: VaultModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && !isUnlocked) {
      setPin("");
      setError(false);
      setTimeout(() => document.getElementById("vault-pin-modal")?.focus(), 100);
    }
  }, [isOpen, isUnlocked]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      onUnlock();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
      >
        {isUnlocked ? (
          <div className="w-full max-w-5xl max-h-[80vh] border border-border/50 rounded-xl bg-card/50 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                  <Unlock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Secure Vault - Unlocked</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                Close (ESC)
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VAULT_TEST_FILES.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-secondary/20 border border-border/50 rounded-lg p-4 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {file.type === "file" ? (
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
                        {file.type === "file" ? "File" : "Folder"}
                      </div>
                    </div>

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
            </div>
          </div>
        ) : (
          <motion.div
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border shadow-inner">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Secure Vault</h2>
              <p className="text-muted-foreground mt-2 text-sm">Enter PIN to access protected content</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  id="vault-pin-modal"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className={cn(
                    "text-center text-3xl tracking-[1em] h-16 font-mono bg-secondary/50 border-border focus:ring-primary focus:border-primary transition-all",
                    error && "border-destructive text-destructive placeholder:text-destructive/50"
                  )}
                  maxLength={4}
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Incorrect PIN</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button type="button" variant="outline" onClick={onClose} className="w-full h-12">
                  Cancel
                </Button>
                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90">
                  Unlock
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
