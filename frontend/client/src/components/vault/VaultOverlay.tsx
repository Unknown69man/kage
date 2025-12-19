import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VaultOverlayProps {
  isOpen: boolean;
  isUnlocked: boolean;
  onUnlock: () => void;
  onClose: () => void;
}

export function VaultOverlay({ isOpen, isUnlocked, onUnlock, onClose }: VaultOverlayProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && !isUnlocked) {
      setPin("");
      setError(false);
      setTimeout(() => document.getElementById("vault-pin")?.focus(), 100);
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
          <div className="w-full max-w-6xl h-[80vh] border border-border/50 rounded-xl bg-card/50 shadow-2xl overflow-hidden flex flex-col relative">
             <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  Close Vault (ESC)
                </Button>
             </div>
             
             <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground">
                <Unlock className="w-16 h-16 mb-4 opacity-20" />
                <h2 className="text-xl font-mono font-medium">Vault Unlocked</h2>
                <p className="text-sm opacity-60 mt-2">Private content would appear here.</p>
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
                  id="vault-pin"
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
