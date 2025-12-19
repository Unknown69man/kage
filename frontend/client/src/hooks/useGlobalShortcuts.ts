import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useLocation } from "wouter";

export function useGlobalShortcuts() {
  const [isPanicMode, setPanicMode] = useState(false);
  const [isVaultVisible, setVaultVisible] = useState(false);
  const [isVaultUnlocked, setVaultUnlocked] = useState(false);
  const [, navigate] = useLocation();

  // Panic Mode - Tab
  useHotkeys("tab", (e) => {
    e.preventDefault();
    setPanicMode((prev) => !prev);
  }, { enableOnFormTags: true });

  // Vault - Ctrl+Shift+S (Toggle visibility in sidebar)
  useHotkeys("ctrl+shift+s", (e) => {
    e.preventDefault();
    setVaultVisible((prev) => !prev);
  });

  // Search - Ctrl+F
  useHotkeys("ctrl+f", (e) => {
    e.preventDefault();
    const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
    searchInput?.focus();
  });

  // Settings - Ctrl+,
  useHotkeys("ctrl+,", (e) => {
    e.preventDefault();
    navigate("/settings");
  });

  const handlePanicLock = () => {
    setVaultUnlocked(false);
    setVaultVisible(false);
    navigate("/");
  };

  return {
    isPanicMode,
    isVaultVisible,
    isVaultUnlocked,
    setPanicMode,
    setVaultVisible,
    setVaultUnlocked,
    handlePanicLock,
  };
}
