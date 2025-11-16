'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface IslandProps {
  position: [number, number, number];
  islandNumber: number;
  isAccessible: boolean;
  onClick?: () => void;
}

// Palm Tree component
function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.6, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Palm leaves */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI * 2) / 5) * 0.05,
            0.65,
            Math.sin((i * Math.PI * 2) / 5) * 0.05
          ]}
          rotation={[
            Math.cos((i * Math.PI * 2) / 5) * 0.6,
            (i * Math.PI * 2) / 5,
            0
          ]}
        >
          <boxGeometry args={[0.4, 0.02, 0.15]} />
          <meshStandardMaterial color="#228B22" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// Rock component
function Rock({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  return (
    <mesh position={position} rotation={[Math.random() * 0.5, Math.random() * Math.PI, 0]}>
      <dodecahedronGeometry args={[0.1 * scale, 0]} />
      <meshStandardMaterial color="#696969" roughness={0.9} />
    </mesh>
  );
}

// Tower component for island center
function Tower({ isAccessible, islandNumber }: { isAccessible: boolean, islandNumber: number }) {
  const colors = ['#DC143C', '#FF69B4', '#4169E1', '#9370DB', '#FFD700'];
  const roofColor = colors[islandNumber - 1] || '#DC143C';

  return (
    <group position={[0, 0.8, 0]}>
      {/* Tower base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.6, 8]} />
        <meshStandardMaterial color={isAccessible ? '#A0A0A0' : '#606060'} roughness={0.5} />
      </mesh>

      {/* Tower roof */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.35, 0.5, 8]} />
        <meshStandardMaterial
          color={isAccessible ? roofColor : '#808080'}
          roughness={0.4}
          emissive={isAccessible ? roofColor : '#000000'}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Number sphere */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color={isAccessible ? '#FFD700' : '#A0A0A0'}
          emissive={isAccessible ? '#FFD700' : '#000000'}
          emissiveIntensity={isAccessible ? 0.6 : 0}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

// Enhanced Island with multiple terrain layers
function Island({ position, islandNumber, isAccessible, onClick }: IslandProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColor = isAccessible ? '#7CFC00' : '#8B8B83';
  const beachColor = '#F4A460';

  return (
    <group position={position}>
      {/* Wooden platform base */}
      <mesh position={[0, -0.35, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.8, 1.85, 0.15, 32]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Beach/sand layer */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.15, 32]} />
        <meshStandardMaterial color={beachColor} roughness={0.7} />
      </mesh>

      {/* Bottom grass layer */}
      <mesh
        ref={meshRef}
        position={[0, -0.1, 0]}
        onClick={isAccessible ? onClick : undefined}
        onPointerOver={(e) => {
          if (isAccessible) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[1.2, 1.4, 0.25, 32]} />
        <meshStandardMaterial color={baseColor} roughness={0.6} />
      </mesh>

      {/* Middle terrain layer */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 0.3, 32]} />
        <meshStandardMaterial
          color={isAccessible ? '#6B8E23' : '#787878'}
          roughness={0.7}
        />
      </mesh>

      {/* Top terrain layer */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.3, 32]} />
        <meshStandardMaterial
          color={isAccessible ? '#556B2F' : '#696969'}
          roughness={0.8}
        />
      </mesh>

      {/* Central tower */}
      <Tower isAccessible={isAccessible} islandNumber={islandNumber} />

      {/* Palm trees */}
      {isAccessible && (
        <>
          <PalmTree position={[0.8, 0.05, 0.6]} />
          <PalmTree position={[-0.7, 0.05, -0.8]} />
          <PalmTree position={[0.9, 0.05, -0.5]} />
        </>
      )}

      {/* Decorative rocks */}
      {isAccessible && (
        <>
          <Rock position={[0.5, 0.25, 0.3]} scale={0.8} />
          <Rock position={[-0.4, 0.25, 0.5]} scale={1} />
          <Rock position={[0.3, 0.25, -0.6]} scale={0.9} />
          <Rock position={[-0.6, 0.25, -0.3]} scale={0.7} />
          <Rock position={[0.6, 0.5, 0]} scale={0.6} />
        </>
      )}

      {/* Small white pebbles on beach */}
      {isAccessible && (
        <>
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 1.3 + Math.random() * 0.2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  -0.2,
                  Math.sin(angle) * radius
                ]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#FFFAFA" roughness={0.8} />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
}

// Enhanced path with bridge-like appearance
function Path() {
  const points = [
    new THREE.Vector3(-8, -0.1, -2),
    new THREE.Vector3(-4, -0.05, -1),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(4, -0.05, 1),
    new THREE.Vector3(8, -0.1, 2),
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.2, 16, false);

  return (
    <group>
      {/* Main path */}
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color="#D2691E"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Decorative supports */}
      {points.slice(0, -1).map((point, i) => {
        const nextPoint = points[i + 1];
        const midPoint = new THREE.Vector3().lerpVectors(point, nextPoint, 0.5);
        return (
          <mesh key={i} position={[midPoint.x, midPoint.y - 0.3, midPoint.z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

// Enhanced ocean with better colors
function Ocean() {
  return (
    <group>
      {/* Main ocean surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[50, 50, 32, 32]} />
        <meshStandardMaterial
          color="#1E90FF"
          roughness={0.2}
          metalness={0.4}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* Deeper water layer for depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#006994"
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

// Terrain backdrop bordering the sea
function TerrainBackdrop() {
  // Create terrain segments around the perimeter
  const segments = [];
  const terrainHeight = 3;
  const terrainDepth = 4;
  const distance = 20;

  // Back terrain (mountains in the distance)
  segments.push(
    <group key="back" position={[0, 0, -distance]}>
      {/* Main mountain range */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <mesh key={i} position={[x, terrainHeight / 2 - 0.5, 0]}>
          <coneGeometry args={[3 + Math.random(), terrainHeight + Math.random() * 2, 8]} />
          <meshStandardMaterial
            color="#8B7355"
            roughness={0.9}
            flatShading={true}
          />
        </mesh>
      ))}
      {/* Lower hills */}
      {[-10, -6, -2, 2, 6, 10].map((x, i) => (
        <mesh key={`hill-${i}`} position={[x, 0.8, 1]}>
          <coneGeometry args={[2 + Math.random() * 0.5, 1.5 + Math.random(), 8]} />
          <meshStandardMaterial
            color="#A0826D"
            roughness={0.85}
            flatShading={true}
          />
        </mesh>
      ))}
      {/* Grassy base */}
      <mesh position={[0, -0.3, 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[40, 1.5, terrainDepth]} />
        <meshStandardMaterial
          color="#6B8E23"
          roughness={0.8}
        />
      </mesh>
    </group>
  );

  // Left terrain
  segments.push(
    <group key="left" position={[-distance, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      {[-6, -3, 0, 3, 6].map((z, i) => (
        <mesh key={i} position={[z, terrainHeight / 2 - 0.5, 0]}>
          <coneGeometry args={[2.5 + Math.random() * 0.5, terrainHeight + Math.random(), 8]} />
          <meshStandardMaterial
            color="#8B7355"
            roughness={0.9}
            flatShading={true}
          />
        </mesh>
      ))}
      {/* Grassy base */}
      <mesh position={[0, -0.3, 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[30, 1.5, terrainDepth]} />
        <meshStandardMaterial
          color="#6B8E23"
          roughness={0.8}
        />
      </mesh>
    </group>
  );

  // Right terrain
  segments.push(
    <group key="right" position={[distance, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {[-6, -3, 0, 3, 6].map((z, i) => (
        <mesh key={i} position={[z, terrainHeight / 2 - 0.5, 0]}>
          <coneGeometry args={[2.5 + Math.random() * 0.5, terrainHeight + Math.random(), 8]} />
          <meshStandardMaterial
            color="#8B7355"
            roughness={0.9}
            flatShading={true}
          />
        </mesh>
      ))}
      {/* Grassy base */}
      <mesh position={[0, -0.3, 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[30, 1.5, terrainDepth]} />
        <meshStandardMaterial
          color="#6B8E23"
          roughness={0.8}
        />
      </mesh>
    </group>
  );

  return <group>{segments}</group>;
}

// Sky gradient background
function Sky() {
  return (
    <mesh>
      <sphereGeometry args={[40, 32, 32]} />
      <meshBasicMaterial
        color="#3C2886"
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Floating clouds for atmosphere
function Cloud({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} roughness={1} />
      </mesh>
      <mesh position={[0.4, 0.1, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} roughness={1} />
      </mesh>
      <mesh position={[-0.4, 0.05, 0.1]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} roughness={1} />
      </mesh>
    </group>
  );
}

export default function GameBoard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<{ [key: number]: { completed: boolean; score: number } }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/progress');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const islandPositions: [number, number, number][] = [
    [-8, 0, -2],
    [-4, 0, -1],
    [0, 0, 0],
    [4, 0, 1],
    [8, 0, 2],
  ];

  const handleIslandClick = (islandNumber: number) => {
    router.push(`/island/${islandNumber}`);
  };

  // Determine which islands are accessible based on progress
  const isIslandAccessible = (islandNumber: number) => {
    // First island is always accessible
    if (islandNumber === 1) return true;
    
    // Other islands are accessible if the previous one is completed
    const previousIsland = islandNumber - 1;
    return progress[previousIsland]?.completed || false;
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-sky-300 via-sky-200 to-blue-100">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-lg">
              Math Adventure Islands
            </h1>
            {user && (
              <p className="text-lg font-semibold text-purple-700 mt-2">
                Welcome, {user.username}! {user.isTeacher && '👨‍🏫'}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/help')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
            >
              Help
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
        <div className="text-center">
          <p className="text-xl font-semibold text-purple-800 bg-white/80 backdrop-blur-sm inline-block px-8 py-3 rounded-full shadow-lg">
            🏝️ Click on an island to begin your math adventure! 🏝️
          </p>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 8, 14]} />
        <OrbitControls
          enablePan={false}
          minDistance={10}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2.5}
        />

        {/* Enhanced Lighting for adventure atmosphere */}
        <ambientLight intensity={0.6} />

        {/* Main sun light */}
        <directionalLight
          position={[15, 20, 10]}
          intensity={1.2}
          castShadow
          color="#FFF8DC"
        />

        {/* Warm fill light */}
        <directionalLight
          position={[-10, 10, -5]}
          intensity={0.4}
          color="#FFE4B5"
        />

        {/* Colorful accent lights */}
        <pointLight position={[-8, 3, -2]} intensity={0.8} color="#FF69B4" distance={8} />
        <pointLight position={[0, 3, 0]} intensity={0.8} color="#9370DB" distance={8} />
        <pointLight position={[8, 3, 2]} intensity={0.8} color="#FFD700" distance={8} />

        {/* Rim light for depth */}
        <pointLight position={[0, 1, -15]} intensity={0.5} color="#87CEEB" />

        {/* Background */}
        <Sky />

        {/* Terrain backdrop */}
        <TerrainBackdrop />

        {/* Floating clouds */}
        <Cloud position={[-15, 8, -10]} />
        <Cloud position={[12, 10, -12]} />
        <Cloud position={[5, 9, -15]} />
        <Cloud position={[-8, 11, -8]} />

        {/* Scene elements */}
        <Ocean />
        <Path />

        {/* Islands */}
        {islandPositions.map((pos, index) => (
          <Island
            key={index}
            position={pos}
            islandNumber={index + 1}
            isAccessible={isIslandAccessible(index + 1)}
            onClick={() => handleIslandClick(index + 1)}
          />
        ))}
      </Canvas>
    </div>
  );
}
