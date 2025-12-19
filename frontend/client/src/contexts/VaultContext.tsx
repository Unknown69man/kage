import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useLocation } from "wouter";

interface VaultContextType {
  isVaultVisible: boolean;
  setVaultVisible: (visible: boolean) => void;
  isVaultUnlocked: boolean;
  setVaultUnlocked: (unlocked: boolean) => void;
  handlePanicLock: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isVaultVisible, setVaultVisible] = useState(false);
  const [isVaultUnlocked, setVaultUnlocked] = useState(false);
  const [, navigate] = useLocation();

  // Ctrl+Shift+S - Toggle vault visibility in sidebar
  useHotkeys("ctrl+shift+s", (e) => {
    e.preventDefault();
    setVaultVisible((prev) => !prev);
  });

  const handlePanicLock = useCallback(() => {
    setVaultUnlocked(false);
    setVaultVisible(false);
    navigate("/");
  }, [navigate]);

  const value: VaultContextType = {
    isVaultVisible,
    setVaultVisible,
    isVaultUnlocked,
    setVaultUnlocked,
    handlePanicLock,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
