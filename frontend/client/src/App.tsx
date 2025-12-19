import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Library from "@/pages/Library";
import Settings from "@/pages/Settings";
import History from "@/pages/History";
import Downloads from "@/pages/Downloads";
import AddNew from "@/pages/AddNew";
import FolderDetail from "@/pages/FolderDetail";
import ManageMetadata from "@/pages/ManageMetadata";
import Vault from "@/pages/Vault";
import VideoDetail from "@/pages/VideoDetail";
import MetadataListing from "@/pages/MetadataListing";
import Duplicate from "@/pages/Duplicate";
import LocalVideoPlayer from "@/pages/LocalVideoPlayer";
import { VaultProvider } from "@/contexts/VaultContext";

function AppContent() {
  const [location, navigate] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("isLoggedIn"));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const logged = !!localStorage.getItem("isLoggedIn");
      setIsLoggedIn(logged);
      
      // Redirect to login if not authenticated and not already on login page
      if (!logged && location !== "/login") {
        navigate("/login");
      }
    };

    checkAuth();
  }, [location, navigate]);

  // Listen for storage changes (when user logs in from another tab/component)
  useEffect(() => {
    const handleStorageChange = () => {
      const logged = !!localStorage.getItem("isLoggedIn");
      setIsLoggedIn(logged);
      if (logged && location === "/login") {
        navigate("/");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [location, navigate]);

  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/login" component={Login} />
      {isLoggedIn ? (
        <>
          <Route path="/" component={Library} />
          <Route path="/settings" component={Settings} />
          <Route path="/history" component={History} />
          <Route path="/downloads" component={Downloads} />
          <Route path="/add-new" component={AddNew} />
          <Route path="/folder/:id" component={FolderDetail} />
          <Route path="/manage-metadata" component={ManageMetadata} />
          <Route path="/vault" component={Vault} />
          <Route path="/video/:id" component={VideoDetail} />
          <Route path="/metadata/:type/:value" component={MetadataListing} />
          <Route path="/duplicates" component={Duplicate} />
          <Route path="/local-player" component={LocalVideoPlayer} />
          <Route component={NotFound} />
        </>
      ) : (
        <Route path="*" component={() => <Login />} />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <VaultProvider>
          <Toaster />
          <AppContent />
        </VaultProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
