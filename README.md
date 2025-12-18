# WebStorage Frontend

Web client for the WebStorage cloud storage system built with Next.js, React, and TypeScript.

## Features

- **Authentication:** JWT token-based login/register with automatic refresh
- **File Management:** Upload, download, delete, move files with progress tracking
- **Folder Management:** Create, navigate, and manage folder hierarchies
- **Dashboard:** Storage quota, recent files, and user statistics
- **Real-time Updates:** Automatic background refetching of data
- **Responsive UI:** Works on mobile, tablet, and desktop

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **TanStack React Query** - Server state management
- **Axios** - HTTP client
- **shadcn/ui** - UI components
- **React Hook Form + Zod** - Form handling and validation

## Installation

**Prerequisites:** Node.js 18+ and the backend API running on `http://localhost:5226`

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5226/api" > .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
npm run start
```
