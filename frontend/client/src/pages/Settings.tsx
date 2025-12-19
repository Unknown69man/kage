import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Monitor, 
  Shield, 
  HardDrive, 
  Palette,
  Lock,
  X,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSettings, saveSettings, AppSettings, handleImageUpload, handleVideoUpload } from "@/lib/settingsContext";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "privacy" | "storage">("profile");
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [profilePicture, setProfilePicture] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cardImageInputRef = useRef<HTMLInputElement>(null);
  const cardVideoInputRef = useRef<HTMLInputElement>(null);
  const sidebarImageInputRef = useRef<HTMLInputElement>(null);
  const sidebarVideoInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = () => {
    saveSettings(settings);
    window.dispatchEvent(new Event("settingsChanged"));
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await handleImageUpload(file);
        setSettings({...settings, appBackgroundImage: dataUrl, appBackgroundVideo: ''});
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to upload image');
      }
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await handleVideoUpload(file);
        setSettings({...settings, appBackgroundVideo: dataUrl, appBackgroundImage: ''});
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to upload video');
      }
    }
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await handleImageUpload(file);
        setSettings({...settings, cardBackgroundImage: dataUrl, cardBackgroundVideo: ''});
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to upload image');
      }
    }
  };

  const handleCardVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await handleVideoUpload(file);
        setSettings({...settings, cardBackgroundVideo: dataUrl, cardBackgroundImage: ''});
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to upload video');
      }
    }
  };

  const handleSidebarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await handleImageUpload(file);
        setSettings({...settings, sidebarBackgroundImage: dataUrl, sidebarBackgroundVideo: ''});
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to upload image');
      }
    }
  };

  const handleSidebarVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await handleVideoUpload(file);
        setSettings({...settings, sidebarBackgroundVideo: dataUrl, sidebarBackgroundImage: ''});
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to upload video');
      }
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          alert('Invalid format. Please use JPG, PNG, WebP, or GIF.');
          return;
        }
        const dataUrl = await handleImageUpload(file);
        setProfilePicture(dataUrl);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to upload profile picture');
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Account Profile</h3>
              <p className="text-sm text-muted-foreground">Customize your profile information and avatar.</p>
            </div>
            <Separator />
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-full shadow-lg flex-shrink-0",
                  profilePicture 
                    ? "bg-cover bg-center" 
                    : "bg-gradient-to-br from-cyan-500 to-blue-600"
                )}
                style={profilePicture ? { backgroundImage: `url(${profilePicture})` } : {}}
                />
                <div className="flex-1">
                  <h4 className="font-medium">Profile Avatar</h4>
                  <p className="text-sm text-muted-foreground">Upload JPG, PNG, WebP, or GIF (max 5MB)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => profilePicInputRef.current?.click()}
                  variant="outline"
                  className="gap-2 text-cyan-400 hover:text-cyan-300 border-cyan-500/30"
                >
                  <Upload className="w-4 h-4" /> Upload
                </Button>
                {profilePicture && (
                  <Button
                    onClick={() => setProfilePicture("")}
                    variant="outline"
                    className="gap-2 text-red-400 hover:text-red-300 border-red-500/30"
                  >
                    <X className="w-4 h-4" /> Clear
                  </Button>
                )}
                <input
                  ref={profilePicInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleProfilePicUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        );
      
      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Appearance & Theming</h3>
              <p className="text-sm text-muted-foreground">Customize colors, themes, and background styling.</p>
            </div>
            <Separator />
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark theme for comfortable viewing</p>
                </div>
                <Switch 
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Primary Accent Color</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred UI accent color</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSettings({...settings, accentColor: 'cyan'})}
                    className={settings.accentColor === 'cyan' ? "w-8 h-8 rounded-full bg-cyan-500 cursor-pointer transition-all hover:scale-110 ring-2 ring-white ring-offset-2 ring-offset-background" : "w-8 h-8 rounded-full bg-cyan-500 cursor-pointer transition-all hover:scale-110"}
                  />
                  <button
                    onClick={() => setSettings({...settings, accentColor: 'purple'})}
                    className={settings.accentColor === 'purple' ? "w-8 h-8 rounded-full bg-purple-500 cursor-pointer transition-all hover:scale-110 ring-2 ring-white ring-offset-2 ring-offset-background" : "w-8 h-8 rounded-full bg-purple-500 cursor-pointer transition-all hover:scale-110"}
                  />
                  <button
                    onClick={() => setSettings({...settings, accentColor: 'pink'})}
                    className={settings.accentColor === 'pink' ? "w-8 h-8 rounded-full bg-pink-500 cursor-pointer transition-all hover:scale-110 ring-2 ring-white ring-offset-2 ring-offset-background" : "w-8 h-8 rounded-full bg-pink-500 cursor-pointer transition-all hover:scale-110"}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Media Detail View Background</Label>
                  <p className="text-sm text-muted-foreground">Background style for media cards and details</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSettings({...settings, modalBackground: 'light'})}
                    className={settings.modalBackground === 'light' ? "px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-cyan-600/20 text-cyan-300 border border-cyan-500/50" : "px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-secondary hover:bg-secondary/80 text-muted-foreground"}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setSettings({...settings, modalBackground: 'dark'})}
                    className={settings.modalBackground === 'dark' ? "px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-cyan-600/20 text-cyan-300 border border-cyan-500/50" : "px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-secondary hover:bg-secondary/80 text-muted-foreground"}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setSettings({...settings, modalBackground: 'gradient'})}
                    className={settings.modalBackground === 'gradient' ? "px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-cyan-600/20 text-cyan-300 border border-cyan-500/50" : "px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-secondary hover:bg-secondary/80 text-muted-foreground"}
                  >
                    Gradient
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Animations</Label>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and hover effects</p>
                </div>
                <Switch 
                  checked={settings.animations}
                  onCheckedChange={(checked) => setSettings({...settings, animations: checked})}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Main Application Background</Label>
                  <p className="text-sm text-muted-foreground">Choose the base theme for the entire app</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSettings({...settings, appBackground: 'dark', appBackgroundImage: '', appBackgroundVideo: ''})}
                    className={settings.appBackground === 'dark' && !settings.appBackgroundImage && !settings.appBackgroundVideo ? "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 text-left" : "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-secondary hover:bg-secondary/80 text-muted-foreground text-left"}
                  >
                    <div className="font-medium">Dark</div>
                    <div className="text-xs opacity-75">Solid black background</div>
                  </button>
                  <button
                    onClick={() => setSettings({...settings, appBackground: 'cyber', appBackgroundImage: '', appBackgroundVideo: ''})}
                    className={settings.appBackground === 'cyber' && !settings.appBackgroundImage && !settings.appBackgroundVideo ? "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 text-left" : "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-secondary hover:bg-secondary/80 text-muted-foreground text-left"}
                  >
                    <div className="font-medium">Cyber</div>
                    <div className="text-xs opacity-75">Dark gradient</div>
                  </button>
                  <button
                    onClick={() => setSettings({...settings, appBackground: 'purple', appBackgroundImage: '', appBackgroundVideo: ''})}
                    className={settings.appBackground === 'purple' && !settings.appBackgroundImage && !settings.appBackgroundVideo ? "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 text-left" : "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-secondary hover:bg-secondary/80 text-muted-foreground text-left"}
                  >
                    <div className="font-medium">Purple</div>
                    <div className="text-xs opacity-75">Purple tinted dark</div>
                  </button>
                  <button
                    onClick={() => setSettings({...settings, appBackground: 'gradient-cyber', appBackgroundImage: '', appBackgroundVideo: ''})}
                    className={settings.appBackground === 'gradient-cyber' && !settings.appBackgroundImage && !settings.appBackgroundVideo ? "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 text-left" : "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-secondary hover:bg-secondary/80 text-muted-foreground text-left"}
                  >
                    <div className="font-medium">Cyber Gradient</div>
                    <div className="text-xs opacity-75">Cyan to purple blend</div>
                  </button>
                  <button
                    onClick={() => setSettings({...settings, appBackground: 'gradient-nature', appBackgroundImage: '', appBackgroundVideo: ''})}
                    className={settings.appBackground === 'gradient-nature' && !settings.appBackgroundImage && !settings.appBackgroundVideo ? "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-cyan-600/20 text-cyan-300 border border-cyan-500/50 text-left" : "px-4 py-3 rounded-lg text-sm font-medium transition-all bg-secondary hover:bg-secondary/80 text-muted-foreground text-left"}
                  >
                    <div className="font-medium">Nature</div>
                    <div className="text-xs opacity-75">Green to blue gradient</div>
                  </button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Background Image</Label>
                  <p className="text-sm text-muted-foreground">Custom image overlay for main app background</p>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={settings.appBackgroundImage}
                      onChange={(e) => setSettings({...settings, appBackgroundImage: e.target.value, appBackgroundVideo: ''})}
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Button
                      onClick={() => imageInputRef.current?.click()}
                      variant="outline"
                      className="gap-2 text-cyan-400 hover:text-cyan-300 border-cyan-500/30"
                    >
                      <Upload className="w-4 h-4" /> Upload
                    </Button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </div>
                  {settings.appBackgroundImage && (
                    <div className="flex items-center gap-2">
                      <div className="h-12 flex-1 rounded border border-border/50 overflow-hidden">
                        <img src={settings.appBackgroundImage} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => setSettings({...settings, appBackgroundImage: ''})}
                        className="p-2 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                        data-testid="button-clear-background-image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Background Video</Label>
                  <p className="text-sm text-muted-foreground">Upload from your computer or paste a URL</p>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/video.mp4"
                      value={settings.appBackgroundVideo}
                      onChange={(e) => setSettings({...settings, appBackgroundVideo: e.target.value, appBackgroundImage: ''})}
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Button
                      onClick={() => videoInputRef.current?.click()}
                      variant="outline"
                      className="gap-2 text-cyan-400 hover:text-cyan-300 border-cyan-500/30"
                    >
                      <Upload className="w-4 h-4" /> Upload
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleVideoFileUpload}
                      className="hidden"
                    />
                  </div>
                  {settings.appBackgroundVideo && (
                    <div className="flex items-center gap-2">
                      <div className="h-12 flex-1 rounded border border-border/50 overflow-hidden bg-black/20">
                        <video src={settings.appBackgroundVideo} className="w-full h-full object-cover" preload="metadata" />
                      </div>
                      <button
                        onClick={() => setSettings({...settings, appBackgroundVideo: ''})}
                        className="p-2 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                        data-testid="button-clear-background-video"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {(settings.appBackgroundImage || settings.appBackgroundVideo) && (
                <Button
                  onClick={() => {
                    setSettings({...settings, appBackgroundImage: '', appBackgroundVideo: '', appBackground: 'dark'});
                  }}
                  variant="destructive"
                  className="w-full"
                  data-testid="button-clear-all-backgrounds"
                >
                  Clear All Backgrounds
                </Button>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Media Card Detail Background Image</Label>
                  <p className="text-sm text-muted-foreground">Custom background for detail view cards</p>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={settings.cardBackgroundImage}
                      onChange={(e) => setSettings({...settings, cardBackgroundImage: e.target.value, cardBackgroundVideo: ''})}
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Button
                      onClick={() => cardImageInputRef.current?.click()}
                      variant="outline"
                      className="gap-2 text-cyan-400 hover:text-cyan-300 border-cyan-500/30"
                    >
                      <Upload className="w-4 h-4" /> Upload
                    </Button>
                    <input
                      ref={cardImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleCardImageUpload}
                      className="hidden"
                    />
                  </div>
                  {settings.cardBackgroundImage && (
                    <div className="flex items-center gap-2">
                      <div className="h-12 flex-1 rounded border border-border/50 overflow-hidden">
                        <img src={settings.cardBackgroundImage} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => setSettings({...settings, cardBackgroundImage: ''})}
                        className="p-2 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Media Card Detail Background Video</Label>
                  <p className="text-sm text-muted-foreground">Custom video background for detail view cards</p>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/video.mp4"
                      value={settings.cardBackgroundVideo}
                      onChange={(e) => setSettings({...settings, cardBackgroundVideo: e.target.value, cardBackgroundImage: ''})}
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Button
                      onClick={() => cardVideoInputRef.current?.click()}
                      variant="outline"
                      className="gap-2 text-cyan-400 hover:text-cyan-300 border-cyan-500/30"
                    >
                      <Upload className="w-4 h-4" /> Upload
                    </Button>
                    <input
                      ref={cardVideoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleCardVideoUpload}
                      className="hidden"
                    />
                  </div>
                  {settings.cardBackgroundVideo && (
                    <div className="flex items-center gap-2">
                      <div className="h-12 flex-1 rounded border border-border/50 overflow-hidden bg-black/20">
                        <video src={settings.cardBackgroundVideo} className="w-full h-full object-cover" preload="metadata" />
                      </div>
                      <button
                        onClick={() => setSettings({...settings, cardBackgroundVideo: ''})}
                        className="p-2 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Sidebar Background Image</Label>
                  <p className="text-sm text-muted-foreground">Custom background for sidebar navigation</p>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={settings.sidebarBackgroundImage}
                      onChange={(e) => setSettings({...settings, sidebarBackgroundImage: e.target.value, sidebarBackgroundVideo: ''})}
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Button
                      onClick={() => sidebarImageInputRef.current?.click()}
                      variant="outline"
                      className="gap-2 text-cyan-400 hover:text-cyan-300 border-cyan-500/30"
                    >
                      <Upload className="w-4 h-4" /> Upload
                    </Button>
                    <input
                      ref={sidebarImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleSidebarImageUpload}
                      className="hidden"
                    />
                  </div>
                  {settings.sidebarBackgroundImage && (
                    <div className="flex items-center gap-2">
                      <div className="h-12 flex-1 rounded border border-border/50 overflow-hidden">
                        <img src={settings.sidebarBackgroundImage} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => setSettings({...settings, sidebarBackgroundImage: ''})}
                        className="p-2 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Sidebar Background Video</Label>
                  <p className="text-sm text-muted-foreground">Custom video background for sidebar navigation</p>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/video.mp4"
                      value={settings.sidebarBackgroundVideo}
                      onChange={(e) => setSettings({...settings, sidebarBackgroundVideo: e.target.value, sidebarBackgroundImage: ''})}
                      className="bg-secondary/50 border-border/50 text-sm"
                    />
                    <Button
                      onClick={() => sidebarVideoInputRef.current?.click()}
                      variant="outline"
                      className="gap-2 text-cyan-400 hover:text-cyan-300 border-cyan-500/30"
                    >
                      <Upload className="w-4 h-4" /> Upload
                    </Button>
                    <input
                      ref={sidebarVideoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleSidebarVideoUpload}
                      className="hidden"
                    />
                  </div>
                  {settings.sidebarBackgroundVideo && (
                    <div className="flex items-center gap-2">
                      <div className="h-12 flex-1 rounded border border-border/50 overflow-hidden bg-black/20">
                        <video src={settings.sidebarBackgroundVideo} className="w-full h-full object-cover" preload="metadata" />
                      </div>
                      <button
                        onClick={() => setSettings({...settings, sidebarBackgroundVideo: ''})}
                        className="p-2 rounded hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Privacy & Vault</h3>
              <p className="text-sm text-muted-foreground">Control how your data is displayed and secured.</p>
            </div>
            <Separator />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Panic Mode Blur</Label>
                  <p className="text-sm text-muted-foreground">Apply strong blur when Panic Mode (Tab) is active</p>
                </div>
                <Switch 
                  checked={settings.panicModeBlur}
                  onCheckedChange={(checked) => setSettings({...settings, panicModeBlur: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Lock Vault</Label>
                  <p className="text-sm text-muted-foreground">Lock vault immediately when window loses focus</p>
                </div>
                <Switch 
                  checked={settings.autoLockVault}
                  onCheckedChange={(checked) => setSettings({...settings, autoLockVault: checked})}
                />
              </div>

              <Separator />
              <div className="p-4 bg-secondary/30 border border-border/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Vault PIN: ••••</p>
                    <p className="text-muted-foreground mt-1">Change your vault access PIN to ensure maximum security.</p>
                    <Button variant="outline" size="sm" className="mt-3">Change Vault PIN</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "storage":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Storage & Cache</h3>
              <p className="text-sm text-muted-foreground">Manage local storage and cache settings.</p>
            </div>
            <Separator />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Local Thumbnail Cache</Label>
                  <p className="text-sm text-muted-foreground">Store generated thumbnails on disk for faster loading</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Cleanup Cache</Label>
                  <p className="text-sm text-muted-foreground">Automatically remove cache older than 30 days</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cache Size</span>
                  <span className="text-sm text-cyan-400 font-mono">2.4 GB / 5.0 GB</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
                </div>
                <Button variant="outline" size="sm">Clear Cache</Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-display">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and vault security.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button 
              onClick={handleSaveSettings}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              Save Changes (Ctrl+S)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Settings Nav */}
          <nav className="space-y-2">
            <SettingsTab 
              icon={User} 
              label="Profile" 
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
            <SettingsTab 
              icon={Palette} 
              label="Appearance" 
              active={activeTab === "appearance"}
              onClick={() => setActiveTab("appearance")}
            />
            <SettingsTab 
              icon={Shield} 
              label="Privacy & Vault" 
              active={activeTab === "privacy"}
              onClick={() => setActiveTab("privacy")}
            />
            <SettingsTab 
              icon={HardDrive} 
              label="Storage" 
              active={activeTab === "storage"}
              onClick={() => setActiveTab("storage")}
            />
          </nav>

          {/* Settings Content */}
          <div className="md:col-span-4 space-y-6 bg-gradient-to-br from-card to-secondary/20 p-8 rounded-xl border border-border/50 shadow-lg overflow-y-auto max-h-[calc(100vh-200px)]">
            {renderContent()}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SettingsTab({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={active ? "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left text-sm font-medium bg-cyan-600/20 text-cyan-300 border border-cyan-600/30 shadow-lg shadow-cyan-600/10" : "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"}
    >
      <Icon className={active ? "w-4 h-4 flex-shrink-0 text-cyan-400" : "w-4 h-4 flex-shrink-0 text-muted-foreground"} />
      {label}
    </button>
  );
}
