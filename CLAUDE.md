# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mathilde** is a math game platform for schools built with Next.js. The application features an interactive 3D gameboard where students navigate through different islands, each representing a math game challenge.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js with React Three Fiber (@react-three/fiber, @react-three/drei)
- **Rendering**: React 19

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (starts on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## Architecture

### Route Structure

- `/` - Main gameboard with 3D island visualization
- `/island/[id]` - Individual island/game pages (dynamic route)
- `/help` - Help and instructions page

### Key Components

#### GameBoard Component (`app/components/GameBoard.tsx`)

The main interactive 3D scene featuring:
- **Islands**: 5 cylindrical islands positioned along a curved path, each representing a math game
- **Path**: A purple tube geometry connecting the islands using a Catmull-Rom curve
- **Ocean**: A blue plane serving as the water surface
- **Camera**: Orbital camera allowing users to rotate and zoom the scene
- **Interactivity**: Only the first island is currently accessible (shown in green), others are grayed out
- **UI Overlay**: Title and Help button positioned above the 3D canvas

The component uses React Three Fiber's Canvas with:
- OrbitControls for camera manipulation
- Custom lighting (ambient, directional, and point lights)
- Click handlers for accessible islands

#### Island Rendering

Each island consists of:
- Base cylinder (wider at bottom)
- Cone-shaped top decoration
- Floating sphere with the island number
- Color-coded accessibility (green = accessible, gray = locked)
- Hover states and cursor changes for interactive islands

### Current Implementation Status

- ✅ 3D gameboard with 5 islands along a curved path
- ✅ Interactive camera controls (orbit, zoom)
- ✅ Navigation system with route protection
- ✅ User authentication/login (Next.js + MariaDB + JWT)
- ✅ Progress tracking (database-backed)
- ✅ Progressive island unlocking based on completion
- ✅ All 5 math games fully implemented:
  - Island 1: Pattern Wizard (sequence pattern recognition)
  - Island 2: Bubble Pop (addition practice)
  - Island 3: Fraction Pizza (fraction visualization)
  - Island 4: Number Target (multi-operation arithmetic)
  - Island 5: Shape Quest (geometry identification)
- ✅ Game completion integration with progress tracking
- ✅ Progress update API endpoint (`/api/progress/update`)

### Authentication System

The application uses a secure authentication system with:

- **Database**: MariaDB with two main tables (`users`, `user_progress`)
- **Password Security**: Bcrypt hashing (10 rounds)
- **Session Management**: JWT tokens stored in HTTP-only cookies (7-day expiration)
- **Route Protection**: Middleware automatically redirects unauthenticated users to login
- **Progressive Unlocking**: Islands unlock sequentially as users complete previous ones

#### Key Files:
- `lib/db.ts` - MySQL connection pool
- `lib/auth.ts` - Authentication utilities (JWT, user session, progress tracking)
- `middleware.ts` - Route protection logic
- `app/api/auth/*` - Authentication API endpoints (register, login, logout, me)
- `app/api/progress/route.ts` - User progress API endpoint
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Registration page
- `schema.sql` - Database schema
- `SETUP_AUTH.md` - Detailed setup instructions

#### Environment Variables Required:
```env
DB_HOST=localhost
DB_USER=mathilde
DB_PASSWORD=mathilde
DB_NAME=mathilde
JWT_SECRET=<generated-secret>
```

### Math Games Implementation

All five math games are fully implemented with:
- Unique challenges for each island
- Game components in `/app/components/games/`
- Integration with progress tracking system
- Automatic unlocking of next island upon completion

#### Game Details:

**Island 1: Pattern Wizard** - Pattern sequence recognition
- Identify the next number in sequences
- Multiple difficulty levels
- Teaches arithmetic and geometric patterns

**Island 2: Bubble Pop** - Addition practice
- Pop bubbles to reach target sums
- Timed challenges
- Practices mental arithmetic

**Island 3: Fraction Pizza** - Fraction visualization
- Interactive pizza slice selection
- Visual representation of fractions
- Equivalent fraction recognition

**Island 4: Number Target** - Multi-operation arithmetic
- Use four operations to reach target numbers
- Strategic thinking required
- Combines addition, subtraction, multiplication, division

**Island 5: Shape Quest** - Geometry identification
- Identify 2D and 3D shapes
- Learn shape properties
- Visual geometry practice

#### Progress Integration:
- Each game calls `/api/progress/update` upon successful completion
- Score and completion status are saved to database
- GameBoard automatically reflects newly unlocked islands
- Users can replay completed islands to improve scores
