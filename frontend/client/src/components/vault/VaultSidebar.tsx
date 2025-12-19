import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, AlertCircle, File, Folder } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VAULT_TEST_FILES } from "@/lib/vaultData";

interface VaultSidebarProps {
  isOpen: boolean;
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
}

export function VaultSidebar({ isOpen, isUnlocked, onUnlock, onLock }: VaultSidebarProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [showPinInput, setShowPinInput] = useState(!isUnlocked && isOpen);

  useEffect(() => {
    if (!isOpen && !isUnlocked) {
      setPin("");
      setError(false);
      setShowPinInput(false);
    } else if (isOpen && !isUnlocked) {
      setShowPinInput(true);
      setTimeout(() => document.getElementById("vault-pin-sidebar")?.focus(), 100);
    }
  }, [isOpen, isUnlocked]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setShowPinInput(false);
      setPin("");
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
      <div className="border-t border-sidebar-border/50 p-4 space-y-4">
        {isUnlocked ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
                  <Unlock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Secure Vault
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onLock}
                className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Lock className="w-3 h-3 mr-1" />
                Lock
              </Button>
            </div>

            <div className="bg-secondary/20 rounded-md p-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {VAULT_TEST_FILES.map((file) => (
                <div key={file.id} className="flex items-center gap-2 p-2 rounded hover:bg-secondary/30 cursor-pointer transition-colors group/file">
                  {file.type === "file" ? (
                    <File className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <Folder className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-foreground/80 group-hover/file:text-foreground">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {file.size} • {file.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Secure Vault
              </span>
            </div>

            {showPinInput && (
              <form onSubmit={handlePinSubmit} className="space-y-2">
                <motion.div
                  animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    id="vault-pin-sidebar"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN"
                    className={cn(
                      "text-center text-lg tracking-[0.5em] h-10 font-mono bg-secondary/50 border-border focus:ring-primary focus:border-primary transition-all text-xs",
                      error && "border-destructive text-destructive placeholder:text-destructive/50"
                    )}
                    maxLength={4}
                    autoComplete="off"
                  />
                </motion.div>

                {error && (
                  <div className="flex items-center justify-center gap-1 text-destructive text-xs font-medium animate-in fade-in">
                    <AlertCircle className="w-3 h-3" />
                    <span>Incorrect PIN</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowPinInput(false);
                      setPin("");
                    }}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 text-xs bg-primary hover:bg-primary/90"
                  >
                    Unlock
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
