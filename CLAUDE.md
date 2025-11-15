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
- ✅ Navigation to Island 1 and Help page
- ✅ Placeholder pages for island games
- ⏳ Individual math games (not yet implemented)
- ⏳ User authentication/login (not yet implemented)
- ⏳ Progress tracking (not yet implemented)

### Future Considerations

When implementing math games:
- Each island should have a unique math challenge
- Games should be implemented in `/app/island/[id]/page.tsx`
- Consider creating reusable game components in `/app/components/games/`
- Island accessibility logic should be updated based on game completion

When adding authentication:
- User progress should determine which islands are accessible
- Update the `isAccessible` logic in GameBoard component
- Store completion state for each island
