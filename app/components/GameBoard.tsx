'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface IslandProps {
  position: [number, number, number];
  islandNumber: number;
  isAccessible: boolean;
  onClick?: () => void;
  progress?: { completed: boolean; score: number };
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
function Tower({
  isAccessible,
  islandNumber,
  progress,
}: {
  isAccessible: boolean;
  islandNumber: number;
  progress?: { completed: boolean; score: number };
}) {
  const colors = ['#DC143C', '#FF69B4', '#4169E1', '#9370DB', '#FFD700'];
  const roofColor = colors[islandNumber - 1] || '#DC143C';
  const sphereRef = useRef<THREE.Mesh>(null);

  // Determine sphere status
  let sphereStatus: 'completed' | 'in-progress' | 'not-started' | 'locked';
  let sphereColor = '#A0A0A0'; // Grey for locked
  let sphereEmissive = '#000000';
  let sphereEmissiveIntensity = 0;

  if (isAccessible) {
    if (progress?.completed) {
      sphereStatus = 'completed';
      sphereColor = '#00FF00'; // Green
      sphereEmissive = '#00FF00';
      sphereEmissiveIntensity = 0.4;
    } else if (progress && progress.score > 0) {
      sphereStatus = 'in-progress';
      sphereColor = '#FFD700'; // Yellow
      sphereEmissive = '#FFD700';
      sphereEmissiveIntensity = 0.6;
    } else {
      sphereStatus = 'not-started';
      sphereColor = '#FFD700'; // Yellow
      sphereEmissive = '#FFD700';
    }
  } else {
    sphereStatus = 'locked';
  }

  // Blinking effect for 'not-started' islands
  useFrame(({ clock }) => {
    if (sphereStatus === 'not-started' && sphereRef.current) {
      const material = sphereRef.current.material as THREE.MeshStandardMaterial;
      // Create a blinking effect by checking if the time is in an even or odd second
      const blink = Math.floor(clock.getElapsedTime() * 2) % 2 === 0;
      material.emissiveIntensity = blink ? 1.2 : 0.2;
    }
  });

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
      <mesh ref={sphereRef} position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color={sphereColor}
          emissive={sphereEmissive}
          emissiveIntensity={sphereEmissiveIntensity}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

// Enhanced Island with multiple terrain layers
function Island({ position, islandNumber, isAccessible, onClick, progress }: IslandProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColor = isAccessible ? '#7CFC00' : '#8B8B83';
  const beachColor = '#F4A460';

  return (
    <group
      position={position}
      onClick={isAccessible ? onClick : undefined}
      onPointerOver={(e) => {
        if (isAccessible) {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
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
      <mesh ref={meshRef} position={[0, -0.1, 0]}>
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
      <Tower isAccessible={isAccessible} islandNumber={islandNumber} progress={progress} />

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

// Bridge component with railings and posts
function BridgePath() {
  const points = [
    new THREE.Vector3(-6, -0.1, 7),
    new THREE.Vector3(-4.5, 0, 5.5),
    new THREE.Vector3(-3, 0.1, 4),
    new THREE.Vector3(-0.5, 0.05, 2.5),
    new THREE.Vector3(2, -0.05, 1),
    new THREE.Vector3(3, 0.1, -0.5),
    new THREE.Vector3(4, 0.2, -2),
    new THREE.Vector3(2, 0.15, -3.5),
    new THREE.Vector3(0, 0.05, -5),
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const numPoints = 100;
  const curvePoints = curve.getPoints(numPoints);

  // Create a flat bridge path
  const shape = new THREE.Shape();
  const width = 0.4;
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, 0.05);
  shape.lineTo(-width / 2, 0.05);
  shape.lineTo(-width / 2, 0);

  const extrudeSettings = {
    steps: numPoints,
    bevelEnabled: false,
    extrudePath: curve,
  };

  const bridgeGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  return (
    <group>
      {/* Bridge walkway */}
      <mesh geometry={bridgeGeom}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Bridge posts and ropes */}
      {curvePoints.map((point, i) => {
        if (i % 5 !== 0) return null; // Place a post every 5 points
        const tangent = curve.getTangentAt(i / numPoints).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();

        const postHeight = 0.4;
        const postOffset = 0.25;

        return (
          <group key={i} position={point}>
            {[-1, 1].map((side) => (
              <mesh key={side} position={binormal.clone().multiplyScalar(postOffset * side).add(new THREE.Vector3(0, postHeight / 2 - 0.05, 0))}>
                <cylinderGeometry args={[0.04, 0.04, postHeight, 6]} />
                <meshStandardMaterial color="#A0522D" roughness={0.9} />
              </mesh>
            ))}
          </group>
        );
      })}
      {[0.15, 0.3].map((ropeHeight) => {
        const ropeCurve = new THREE.CatmullRomCurve3(curvePoints.map(p => p.clone().add(new THREE.Vector3(0, ropeHeight, 0))));
        const ropeGeom = new THREE.TubeGeometry(ropeCurve, numPoints, 0.02, 8, false);
        return (
          <group key={ropeHeight}>
            {[-1, 1].map((side) => {
               const sideOffset = 0.25;
               const ropeSideCurve = new THREE.CatmullRomCurve3(curvePoints.map(p => {
                  const tangent = curve.getTangentAt(curvePoints.indexOf(p) / numPoints).normalize();
                  const up = new THREE.Vector3(0, 1, 0);
                  const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
                  return p.clone().add(binormal.multiplyScalar(sideOffset * side)).add(new THREE.Vector3(0, ropeHeight, 0));
               }));
               const ropeSideGeom = new THREE.TubeGeometry(ropeSideCurve, numPoints, 0.02, 8, false);
               return (
                <mesh key={side} geometry={ropeSideGeom}>
                    <meshStandardMaterial color="#DEB887" roughness={0.7} />
                </mesh>
               )
            })}
          </group>
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

// Pine Tree component for mountains
function PineTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 6]} />
        <meshStandardMaterial color="#654321" roughness={0.8} />
      </mesh>
      {/* Leaves */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.25, 0.5, 8]} />
        <meshStandardMaterial color="#2E8B57" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Snow cap for mountains
function SnowCap({ position, radius, height }: { position: [number, number, number], radius: number, height: number }) {
  return (
    <mesh position={position}>
      <coneGeometry args={[radius, height, 8]} />
      <meshStandardMaterial
        color="#FFFAFA"
        roughness={0.8}
        flatShading={true}
      />
    </mesh>
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
      {[-8, -4, 0, 4, 8].map((x, i) => {
        const mountainHeight = terrainHeight + Math.random() * 2;
        const mountainRadius = 3 + Math.random();
        const snowLine = mountainHeight * 0.6;
        const snowCapHeight = mountainHeight - snowLine;
        const snowCapRadius = mountainRadius * (snowCapHeight / mountainHeight);

        return (
          <group key={i} position={[x, -0.5, 0]}>
            <mesh position={[0, mountainHeight / 2, 0]}>
              <coneGeometry args={[mountainRadius, mountainHeight, 8]} />
              <meshStandardMaterial color="#8B7355" roughness={0.9} flatShading={true} />
            </mesh>
            <SnowCap position={[0, snowLine + snowCapHeight / 2, 0]} radius={snowCapRadius} height={snowCapHeight} />
            <PineTree position={[mountainRadius * 0.3, mountainHeight * 0.2, 1]} />
            <PineTree position={[-mountainRadius * 0.4, mountainHeight * 0.3, 1.2]} />
          </group>
        );
      })}
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
    [-6, 0, 7],     // Island 1: Bottom left front
    [-3, 0.2, 4],   // Island 2: Curve up-right
    [2, 0, 1],      // Island 3: Middle right
    [4, 0.3, -2],   // Island 4: Top right
    [0, 0.1, -5],   // Island 5: Top center back
  ];

  const handleIslandClick = (islandNumber: number) => {
    // Play a sound effect on click
    const clickSound = new Audio('/sounds/island-click.mp3');
    clickSound.play().catch(error => {
      // Autoplay can be blocked by the browser, log error if it happens
      console.error("Error playing sound:", error);
    });

    // Navigate after a short delay to allow the sound to start playing
    setTimeout(() => router.push(`/island/${islandNumber}`), 100);
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
            {user?.isTeacher && (
              <button
                onClick={() => router.push('/stats')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
              >
                📊 Stats
              </button>
            )}
            <button
              onClick={() => router.push('/progress')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105"
            >
              Progress
            </button>
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
        <PerspectiveCamera makeDefault position={[0, 8, 20]} />
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
        <BridgePath />

        {/* Islands */}
        {islandPositions.map((pos, index) => (
          (() => {
            const islandNumber = index + 1;
            return <Island
              key={index}
              position={pos}
              islandNumber={islandNumber}
              isAccessible={isIslandAccessible(islandNumber)}
              onClick={() => handleIslandClick(islandNumber)}
              progress={progress[islandNumber]}
            />;
          })()))}
      </Canvas>
    </div>
  );
}
