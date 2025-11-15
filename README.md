# Mathilde - Math Adventure Game

An interactive 3D math game platform for schools built with Next.js and Three.js.

## Overview

Mathilde features an immersive 3D gameboard where students navigate through five unique islands, each offering a different math challenge. The application uses React Three Fiber to create engaging 3D visualizations that make learning math fun and interactive.

## Features

- **3D Interactive Gameboard**: Navigate a beautiful 3D scene with orbital camera controls
- **Five Island Challenges**: Each island represents a unique math game (games to be implemented)
- **Progressive Unlocking**: Students start with Island 1 and unlock subsequent islands
- **Responsive Design**: Works across different screen sizes
- **No Login Required**: Simple access for classroom use (authentication can be added later)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the gameboard.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **Tailwind CSS** - Utility-first styling

## Project Structure

- `/app/page.tsx` - Main gameboard page
- `/app/components/GameBoard.tsx` - 3D gameboard component
- `/app/island/[id]/page.tsx` - Individual island game pages
- `/app/help/page.tsx` - Help and instructions

## Current Status

- ✅ 3D gameboard with 5 islands
- ✅ Interactive camera controls
- ✅ Navigation system
- ⏳ Individual math games (not yet implemented)
- ⏳ User authentication (not yet implemented)
- ⏳ Progress tracking (not yet implemented)

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
