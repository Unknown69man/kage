# Media Vault - Full Stack Application

## Overview
Media Vault is a secure media library management application with both frontend (React) and backend (Fastify) components. The frontend provides a sleek interface for managing media content, while the backend handles data persistence and core operations.

## Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS, Radix UI, Wouter routing
- **Backend**: Fastify, Better SQLite3, Playwright, bcrypt for auth
- **Frontend Server**: Express.js (proxies to React + backend)
- **Database**: SQLite (backend) with proper schema management

## Project Architecture

### Frontend (port 5000)
```
frontend/
├── client/          # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
├── server/          # Express backend
│   ├── index.ts     # Server entry
│   ├── routes.ts    # Express routes
│   ├── vite.ts      # Vite dev middleware
│   └── storage.ts   # In-memory storage
└── shared/          # Shared types
```

### Backend (port 3880, localhost only)
```
backend/
├── routes/          # Fastify route handlers
│   ├── auth.js
│   ├── files.js
│   ├── history.js   # Watch progress tracking
│   ├── settings.js  # User settings management
│   ├── system.js    # System operations (file scanning)
│   ├── cast.js
│   ├── containers.js
│   ├── preview.js
│   ├── resolve.js
│   ├── stream.js
│   ├── vault.js     # Vault management
│   └── health.js
├── db/              # SQLite database
│   ├── app.db       # Main database
│   ├── migrations/  # Database migrations
│   └── schema.sql   # Schema definitions
├── resolvers/       # URL resolution logic
├── queue/           # Job queue
├── utils/           # Utilities
└── config.js        # Configuration
```

## Running the Project

### Development Mode
The frontend dev server runs on **port 5000** with Vite hot reload:
```bash
cd frontend && npm run dev
```

This starts:
1. Express server on port 5000 (frontend + proxies)
2. Vite dev server for React hot reload
3. Backend is separate - run manually if needed: `cd backend && npm run dev`

### Production Build
```bash
cd frontend && npm run build   # Builds React + bundles
cd frontend && npm start       # Runs Express with bundled frontend
```

## Key Features

### Frontend Features
- **Login Page**: Demo credentials `demo@vault.app` / `demo1234`
- **Media Library**: Browse and manage media items
- **Video Player**: Professional player with controls (play, skip, volume, fullscreen)
- **Secure Vault**: PIN-protected content storage with upload/delete
- **Duplicate Management**: Scan for and manage duplicate URLs
- **Local Video Player**: Load and play local video files
- **Watch History**: Track viewing progress
- **Settings**: Appearance customization, user preferences
- **Downloads**: Manage downloaded content

### Backend Features (Not Yet Integrated in Frontend)
- **File Management**: `/containers/:id/files` - Get/post files
- **Watch Progress Tracking**: `/files/:fileId/progress` - Track playback progress
- **Settings Sync**: `/settings` - Get/update user settings
- **System Monitoring**: `/system/scan-local` - Scan local files
- **Authentication**: User login and session management
- **Vault Operations**: File storage and retrieval
- **Streaming**: HLS/adaptive streaming support

## Configuration

### Environment Variables
- `PORT`: Server port (default: 5000 for frontend, 3880 for backend)
- `DATABASE_URL`: PostgreSQL connection (for when using Replit DB)
- `VAULT_PIN_HASH`: Bcrypt hash for vault PIN (default: hashed "1234")

### Frontend Vite Config
✅ **Properly configured for Replit:**
- `host: "0.0.0.0"` - Listens on all interfaces
- `allowedHosts: true` - Allows iframe proxy access
- Cache control headers - Prevents stale cache issues

## Frontend-Backend Integration Notes

The frontend and backend are separate services:
- **Frontend**: Express on port 5000, serves React app
- **Backend**: Fastify on port 3880 (localhost only)

Currently, the frontend uses in-memory storage for duplicates, vault files, and media items. To integrate with backend APIs:

1. **Settings Page** should connect to `/settings` endpoint
2. **History Tracking** should POST to `/files/:fileId/progress`
3. **File Management** should use `/containers/:id/files`
4. **System Scan** could trigger `/system/scan-local`

These integrations require updating the frontend to call backend APIs via a proxy or direct HTTP requests.

## Development Notes

- Login is currently localStorage-based (demo mode)
- Vault uses in-memory state with Context API
- Mock data is used for media library
- Backend database is SQLite (better-sqlite3)
- All authentication and API security is handled by the backend

## Deployment Configuration

✅ **Configured for Replit autoscale deployment:**
- **Build**: `npm run build`
- **Run**: `npm run start`
- **Type**: Autoscale (stateless)

The app will be available at `https://your-replit-url.replit.dev`

## Recent Changes
- December 19, 2025: Initial Replit import setup
  - Fixed missing asset image in Login page
  - Configured frontend workflow on port 5000
  - Set up deployment configuration
  - Node.js dependencies installed
  - TypeScript type checking passes
