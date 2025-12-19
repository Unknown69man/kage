export interface AppSettings {
  modalBackground: 'light' | 'dark' | 'gradient';
  accentColor: 'cyan' | 'purple' | 'pink';
  darkMode: boolean;
  animations: boolean;
  panicModeBlur: boolean;
  autoLockVault: boolean;
  appBackground: 'dark' | 'cyber' | 'purple' | 'gradient-cyber' | 'gradient-nature';
  appBackgroundImage: string;
  appBackgroundVideo: string;
  cardBackgroundImage: string;
  cardBackgroundVideo: string;
  sidebarBackgroundImage: string;
  sidebarBackgroundVideo: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  modalBackground: 'light',
  accentColor: 'cyan',
  darkMode: true,
  animations: true,
  panicModeBlur: true,
  autoLockVault: true,
  appBackground: 'dark',
  appBackgroundImage: '',
  appBackgroundVideo: '',
  cardBackgroundImage: '',
  cardBackgroundVideo: '',
  sidebarBackgroundImage: '',
  sidebarBackgroundVideo: '',
};

export function getSettings(): AppSettings {
  const stored = localStorage.getItem('appSettings');
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

export function getModalBackgroundClass(background: string): string {
  switch (background) {
    case 'light':
      return 'bg-white';
    case 'dark':
      return 'bg-secondary';
    case 'gradient':
      return 'bg-gradient-to-br from-slate-100 to-slate-200';
    default:
      return 'bg-white';
  }
}

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function handleImageUpload(file: File): Promise<string> {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image format. Please use JPG, PNG, WebP, or GIF.');
  }
  return fileToDataUrl(file);
}

export async function handleVideoUpload(file: File): Promise<string> {
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid video format. Please use MP4, WebM, or OGG.');
  }
  return fileToDataUrl(file);
}

export function getAppBackgroundStyle(appBg: string, imageUrl?: string, videoUrl?: string): React.CSSProperties {
  if (videoUrl) {
    return { 
      background: 'transparent'
    };
  }

  if (imageUrl) {
    return {
      backgroundImage: `url('${imageUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    };
  }

  switch (appBg) {
    case 'dark':
      return { background: 'hsl(240 10% 3.9%)' };
    case 'cyber':
      return {
        background: 'linear-gradient(135deg, hsl(240 10% 3.9%) 0%, hsl(240 10% 8.9%) 100%)',
        backgroundAttachment: 'fixed'
      };
    case 'purple':
      return {
        background: 'linear-gradient(135deg, hsl(280 20% 8%) 0%, hsl(240 10% 3.9%) 100%)',
        backgroundAttachment: 'fixed'
      };
    case 'gradient-cyber':
      return {
        background: 'linear-gradient(135deg, hsl(0 0% 5%) 0%, hsl(200 80% 20%) 50%, hsl(280 80% 15%) 100%)',
        backgroundAttachment: 'fixed'
      };
    case 'gradient-nature':
      return {
        background: 'linear-gradient(135deg, hsl(150 50% 15%) 0%, hsl(200 60% 25%) 50%, hsl(270 40% 20%) 100%)',
        backgroundAttachment: 'fixed'
      };
    default:
      return { background: 'hsl(240 10% 3.9%)' };
  }
}
