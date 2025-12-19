import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutGrid, 
  Download, 
  History, 
  Settings, 
  Search, 
  Plus, 
  Lock,
  EyeOff,
  Zap,
  LogOut,
  Copy,
  PlayCircle,
  Database
} from "lucide-react";
import { useVault } from "@/contexts/VaultContext";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AdvancedSearch } from "@/components/search/AdvancedSearch";
import { GENRES } from "@/lib/mockData";
import { useState, useEffect } from "react";
import { getSettings, getAppBackgroundStyle } from "@/lib/settingsContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({});
  const { isVaultVisible, isVaultUnlocked, handlePanicLock } = useVault();
  const { isPanicMode } = useGlobalShortcuts();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("isLoggedIn"));
  }, []);

  useEffect(() => {
    const settings = getSettings();
    setBackgroundStyle(getAppBackgroundStyle(settings.appBackground, settings.appBackgroundImage, settings.appBackgroundVideo));
  }, []);

  useEffect(() => {
    const handleSettingsChange = () => {
      const settings = getSettings();
      setBackgroundStyle(getAppBackgroundStyle(settings.appBackground, settings.appBackgroundImage, settings.appBackgroundVideo));
    };
    window.addEventListener("settingsChanged", handleSettingsChange);
    return () => window.removeEventListener("settingsChanged", handleSettingsChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const settings = getSettings();

  return (
    <div 
      className={cn(
        "min-h-screen text-foreground flex overflow-hidden font-sans relative",
        isPanicMode && "panic-mode-active"
      )}
      style={backgroundStyle}
    >
      {/* Background Video */}
      {settings.appBackgroundVideo && (
        <video
          autoPlay
          muted
          loop
          className="fixed inset-0 w-full h-full object-cover -z-10"
          style={{ pointerEvents: 'none' }}
        >
          <source src={settings.appBackgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Panic Mode Overlay */}
      {isPanicMode && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <EyeOff className="w-16 h-16 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-bold text-muted-foreground">Restricted Access</h1>
            <p className="text-muted-foreground/60">Press TAB to restore view</p>
          </div>
        </div>
      )}


      {/* Sidebar Background Video */}
      {settings.sidebarBackgroundVideo && (
        <video
          autoPlay
          muted
          loop
          className="fixed left-0 top-0 w-72 h-screen object-cover -z-10 group hover:opacity-100"
          style={{ pointerEvents: 'none', maxWidth: '288px' }}
        >
          <source src={settings.sidebarBackgroundVideo} type="video/mp4" />
        </video>
      )}

      {/* Sidebar */}
      <aside 
        className="w-16 hover:w-72 transition-all duration-300 ease-in-out border-r border-sidebar-border bg-sidebar flex flex-col z-20 group relative overflow-hidden"
        style={settings.sidebarBackgroundImage ? {
          backgroundImage: `url('${settings.sidebarBackgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        } : {}}
      >
        <div className="h-16 flex items-center justify-center group-hover:justify-start group-hover:px-6 transition-all border-b border-sidebar-border/50">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
            <Zap className="w-5 h-5" />
          </div>
          <span className="ml-3 font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap duration-200 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Vault UI
          </span>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-2">
          <NavItem href="/" icon={LayoutGrid} label="Library" active={location === "/"} />
          <NavItem href="/add-new" icon={Plus} label="Add New" active={location === "/add-new"} />
          <NavItem href="/downloads" icon={Download} label="Downloads" active={location === "/downloads"} />
          <NavItem href="/history" icon={History} label="History" active={location === "/history"} />
          <NavItem href="/duplicates" icon={Copy} label="Duplicates" active={location === "/duplicates"} />
          <NavItem href="/local-player" icon={PlayCircle} label="Local Player" active={location === "/local-player"} />
          <NavItem href="/manage-metadata" icon={Database} label="Metadata" active={location === "/manage-metadata"} />
          {isVaultVisible && (
            <NavItem href="/vault" icon={Lock} label="Secure Vault" active={location === "/vault"} />
          )}
        </nav>

        {/* Genres Section */}
        <div className="px-2 py-4 border-t border-sidebar-border/50 space-y-2 overflow-y-auto max-h-40">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 opacity-0 group-hover:opacity-100 transition-opacity">
            Genres
          </span>
          {GENRES.map((genre) => (
            <div key={genre.name} className={cn(
              "flex items-center h-8 px-3 rounded-md transition-all cursor-pointer group/item overflow-hidden whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-sm"
            )}>
              <span className="text-base">{genre.icon}</span>
              <span className="ml-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {genre.name}
              </span>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-sidebar-border/50 space-y-2">
          <NavItem href="/settings" icon={Settings} label="Settings" active={location === "/settings"} />
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center h-10 px-3 rounded-md transition-all text-muted-foreground hover:text-foreground hover:bg-secondary/50 group/item overflow-hidden whitespace-nowrap text-sm"
            >
              <LogOut className="min-w-5 w-5 h-5 text-muted-foreground" />
              <span className="ml-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Logout
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center px-6 justify-center bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="w-full max-w-md flex items-center gap-2">
            <Input 
              type="search" 
              placeholder="Search library... (Ctrl+F)" 
              className="pl-3 pt-[3px] pb-[3px] bg-secondary/50 border-transparent focus:border-cyan-500/50 focus:bg-secondary transition-all flex-1 focus:ring-cyan-500/20"
              data-testid="input-search"
            />
            <AdvancedSearch />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {isVaultUnlocked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePanicLock}
                      className="gap-2 text-red-400 hover:text-red-300 hover:border-red-400/50 border-red-400/30"
                    >
                      <Lock className="w-4 h-4" />
                      <span className="hidden sm:inline">Panic Lock</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Lock vault and return to Library (Instant)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Link href="/add-new">
              <Button size="sm" className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
              </Button>
            </Link>
            
            {isLoggedIn ? (
              <Link href="/settings">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border border-border hover:border-cyan-400 transition-colors cursor-pointer shadow-lg" />
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline" className="gap-1">
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center h-10 px-3 rounded-md transition-all cursor-pointer group/item overflow-hidden whitespace-nowrap",
        active 
          ? "bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      )}>
        <Icon className={cn("min-w-5 w-5 h-5 transition-colors", active ? "text-cyan-400" : "text-muted-foreground group-hover/item:text-foreground")} />
        <span className="ml-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {label}
        </span>
        {active && <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400 opacity-100" />}
      </div>
    </Link>
  );
}
