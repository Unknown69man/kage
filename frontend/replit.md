# Media Vault

## Overview
Media Vault is a secure media library access application built with React (frontend) and Express (backend). It provides a sleek dark-themed interface for managing and viewing media content.

## Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS, Radix UI components, Wouter for routing
- **Backend**: Express.js with TypeScript (tsx runtime)
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack React Query

## Project Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components (layout, library, ui, vault)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities, mock data, query client
│   │   └── pages/       # Page components
│   └── public/          # Static assets
├── server/          # Express backend
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API routes
│   ├── storage.ts   # Data storage abstraction
│   ├── static.ts    # Static file serving
│   └── vite.ts      # Vite dev middleware
├── shared/          # Shared types and schemas
│   └── schema.ts    # Drizzle schema definitions
└── script/          # Build scripts
```

## Development
- Run `npm run dev` to start the development server (serves both frontend and backend on port 5000)
- Run `npm run db:push` to push database schema changes

## Production
- Run `npm run build` to build both frontend and backend
- Run `npm run start` to start the production server

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `PORT`: Server port (defaults to 5000)

## Recent Changes
- December 18, 2025 (Latest): New Features Added
  - **Duplicate Management Page** (`/duplicates`): Backend detects duplicate URLs, list/delete/ignore duplicates
  - **Enhanced Secure Vault**: Upload files directly, save images from URLs, delete files
  - **Local Video Player** (`/local-player`): Load and play local video files in the built-in player
  - Added new sidebar navigation items for Duplicates and Local Player

- December 18, 2025: Powerful Video Player Added
  - Created VideoPlayer component matching professional player UI
  - Full playback controls: play/pause, skip 10s, volume control
  - Interactive progress bar with time display and hover preview
  - Fullscreen support with automatic control hiding
  - Header with back button and title/subtitle display
  - Settings and more options buttons for future extensibility
  - VideoDetail page for complete video viewing experience
  - Route: `/video/:id` for individual video playback
  - Seamless integration with existing app architecture

## Secure Vault Feature
The secure vault is a **protected page** with unrestricted free navigation:

**How to Access:**
1. Log in: `demo@vault.app` / `demo1234`
2. Press **Ctrl+Shift+S** → "Secure Vault" appears in sidebar
3. Click "Secure Vault" → Vault page with lock screen
4. Enter PIN: **1234** → Vault unlocked, see test items

**Free Navigation (True Free Traveling):**
- Click Library, History, Settings, Downloads in sidebar anytime
- Vault remains **unlocked** while navigating between pages
- Navigate back to Secure Vault → still unlocked
- State persists because it uses shared Context API
- **No auto-lock when leaving vault page**

**Vault Contents:**
- Secret_Project_2025.pdf (2.4 MB)
- Private_Notes.txt (145 KB)
- Confidential_Folder (8 items)
- Archive_2024.zip (156 MB)
- Plus any uploaded files or saved image URLs

**Adding Files to Vault:**
- **Upload Button**: Click "Upload" to select files from your device
- **Drag & Drop**: Drag files into the vault drop zone
- **Save from URL**: Click "Save from URL" to add images from URLs (great for saving media card images)

**Panic Lock (Instant Security):**
- Red "Panic Lock" button in top bar (visible when vault unlocked)
- Single click to instantly lock vault
- Hides all secure content
- Redirects to Library
- No confirmation dialogs - immediate action

**Hide Vault Navigation:**
- Press **Ctrl+Shift+S** again → "Secure Vault" disappears from sidebar

## State Management Architecture
- **VaultContext** (`client/src/contexts/VaultContext.tsx`) - Shared context for vault state
- **VaultProvider** - Wraps entire app in App.tsx for global access
- **useVault()** - Hook used by both AppLayout and Vault pages
- **Keyboard shortcuts** - Ctrl+Shift+S (toggle visibility), plus shortcuts in useGlobalShortcuts

## Video Player Features
- **Professional Controls:**
  - Play/Pause button (center and controls)
  - Skip backward/forward 10 seconds
  - Volume control with mute toggle
  - Progress bar with interactive scrubbing
  - Time display (current/total duration)
  - Fullscreen toggle
  - Settings and more options buttons

- **Auto-hide Controls:**
  - Controls fade out during playback
  - Reappear on mouse movement
  - Header shows title and subtitle

- **Video Detail Page:**
  - Complete video information
  - Cast and genre info
  - Rating and duration
  - Download and share buttons
  - Responsive layout

## Duplicate Management Feature
- **Route**: `/duplicates`
- **How it works**: Backend scans media items for duplicate URLs
- Click "Scan for Duplicates" to detect duplicates
- For each duplicate: Delete it or mark as Ignored
- Ignored duplicates are hidden but can still be deleted

## Local Video Player Feature
- **Route**: `/local-player`
- Load videos from your local device
- Drag & drop or click to browse
- Videos play in the built-in professional video player
- Manage multiple local videos with remove functionality

## Files
- Vault page: `client/src/pages/Vault.tsx` (file upload + URL saving)
- Vault context: `client/src/contexts/VaultContext.tsx` (shared state)
- Duplicate page: `client/src/pages/Duplicate.tsx` (duplicate management)
- Local player: `client/src/pages/LocalVideoPlayer.tsx` (local video playback)
- Video player: `client/src/components/video/VideoPlayer.tsx` (player component)
- Video detail: `client/src/pages/VideoDetail.tsx` (video page)
- Layout: `client/src/components/layout/AppLayout.tsx` (Panic Lock button)
- Vault data: `client/src/lib/vaultData.ts` (test items)
- API routes: `server/routes.ts` (duplicates, vault files, media)
- Storage: `server/storage.ts` (in-memory storage with CRUD operations)
