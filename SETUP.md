# Collaborative Editor App - Setup Guide

## Project Structure

This is a monorepo using Turborepo with the following structure:
- `apps/client` - React + Vite frontend
- `apps/server` - Node.js + Socket.IO backend
- `packages/shared-types` - Shared TypeScript types

## ✅ All Errors Fixed!

The following issues have been resolved:
1. ✅ Added `packageManager` field to package.json for Turborepo compatibility
2. ✅ Updated turbo.json to use `tasks` instead of deprecated `pipeline` field
3. ✅ Added vite-env.d.ts for proper TypeScript support of import.meta.env
4. ✅ Removed unused imports in App.tsx
5. ✅ Fixed __dirname issue in vite.config.ts for ES modules
6. ✅ Installed all dependencies

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Development

Start both client and server in development mode:

```bash
npm run dev
```

This will start:
- **Client on http://localhost:5173** ✅ Running
- **Server on http://localhost:3001** ✅ Running

## Manual Start

### Server Only
```bash
cd apps/server
npm run dev
```

### Client Only
```bash
cd apps/client
npm run dev
```

## Features Implemented

### Client-Side
- **Socket Connection**: Real-time communication via Socket.IO
- **Yjs Integration**: CRDT-based collaborative editing
- **State Management**: Zustand stores for rooms and users
- **Custom Hooks**:
  - `usePresence`: Track cursor positions and selections
  - `useRoom`: Room creation, joining, and management
  - `useYDoc`: Yjs document synchronization
- **Components**:
  - Room creation and listing
  - Collaborative editor with toolbar
  - Real-time cursor overlays
  - Participant avatars

### Server-Side
- **Room Management**: Create, join, leave, and update rooms
- **Presence Tracking**: Real-time user presence and cursor positions
- **Yjs Sync**: Document update distribution and storage
- **Socket.IO Handlers**: Type-safe event handling

### Shared Types
Complete TypeScript definitions for:
- Users and presence states
- Rooms and room operations
- Yjs updates and synchronization
- Socket.IO events (client ↔ server)

## Configuration

Environment variables are configured in `.env`:
- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Frontend URL for CORS
- `VITE_SERVER_URL` - Backend URL for client

## Building for Production

```bash
npm run build
```

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Zustand (state management)
- Socket.IO client
- Yjs

**Backend:**
- Node.js
- Express
- Socket.IO
- TypeScript

**Shared:**
- TypeScript types for type safety across the app

## Notes

- All module errors shown by IDE will resolve after running `npm install`
- The app uses path aliases for imports (`@collab-app/shared-types`)
- Hot reload is enabled for both client and server during development
