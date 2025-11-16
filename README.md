# Mathilde - Math Adventure Game

An interactive 3D math game platform for schools built with Next.js and Three.js.

## Overview

Mathilde features an immersive 3D gameboard where students navigate through five unique islands, each offering a different math challenge. The application uses React Three Fiber to create engaging 3D visualizations that make learning math fun and interactive.

## Features

- **3D Interactive Gameboard**: Navigate a beautiful 3D scene with orbital camera controls
- **Five Math Games**: Complete collection of engaging math challenges
  - Pattern Wizard (sequences)
  - Bubble Pop (addition)
  - Fraction Pizza (fractions)
  - Number Target (multi-operation)
  - Shape Quest (geometry)
- **User Authentication**: Secure login system with JWT sessions
- **Progress Tracking**: Database-backed progress saves and island unlocking
- **Progressive Unlocking**: Complete each island to unlock the next
- **Responsive Design**: Works across different screen sizes

## Getting Started

### Prerequisites

- Node.js 18+
- MariaDB/MySQL database

### Setup

1. Install dependencies:

```bash
npm install
```

2. Set up the database (see `schema.sql`)

3. Create `.env.local` with:

```env
DB_HOST=localhost
DB_USER=mathilde
DB_PASSWORD=your_password
DB_NAME=mathilde
JWT_SECRET=your_secret_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

See `SETUP_AUTH.md` for detailed authentication setup instructions.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **Tailwind CSS** - Utility-first styling

## Project Structure

- `/app/page.tsx` - Main gameboard page
- `/app/components/GameBoard.tsx` - 3D gameboard component
- `/app/components/games/` - All five math game components
- `/app/island/[id]/page.tsx` - Individual island game pages
- `/app/login/page.tsx` - Login page
- `/app/register/page.tsx` - Registration page
- `/app/api/auth/` - Authentication API routes
- `/app/api/progress/` - Progress tracking API
- `/lib/auth.ts` - Authentication utilities
- `/lib/db.ts` - Database connection
- `/middleware.ts` - Route protection

## Current Status

- ✅ 3D gameboard with 5 islands
- ✅ Interactive camera controls
- ✅ Navigation system with route protection
- ✅ All 5 math games implemented
- ✅ User authentication (MariaDB + JWT)
- ✅ Progress tracking and island unlocking
- ✅ Teacher accounts and student management

## Development

Build for production:

```bash
npm run build
```

Run production build:

```bash
npm start
```

Lint code:

```bash
npm run lint
```
