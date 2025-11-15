'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import * as THREE from 'three';

interface IslandProps {
  position: [number, number, number];
  islandNumber: number;
  isAccessible: boolean;
  onClick?: () => void;
}

function Island({ position, islandNumber, isAccessible, onClick }: IslandProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={position}>
      {/* Island base */}
      <mesh
        ref={meshRef}
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
        <cylinderGeometry args={[1, 1.2, 0.5, 32]} />
        <meshStandardMaterial
          color={isAccessible ? '#4ade80' : '#9ca3af'}
          roughness={0.3}
        />
      </mesh>

      {/* Island top decoration */}
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.5, 0.8, 8]} />
        <meshStandardMaterial
          color={isAccessible ? '#22c55e' : '#6b7280'}
          roughness={0.4}
        />
      </mesh>

      {/* Island number floating above */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={isAccessible ? '#fbbf24' : '#d1d5db'}
          emissive={isAccessible ? '#fbbf24' : '#000000'}
          emissiveIntensity={isAccessible ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}

function Path() {
  const points = [
    new THREE.Vector3(-8, 0.5, -2),
    new THREE.Vector3(-4, 0.5, -1),
    new THREE.Vector3(0, 0.5, 0),
    new THREE.Vector3(4, 0.5, 1),
    new THREE.Vector3(8, 0.5, 2),
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.15, 8, false);

  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial color="#8b5cf6" roughness={0.5} />
    </mesh>
  );
}

function Ocean() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#3b82f6" roughness={0.1} metalness={0.3} />
    </mesh>
  );
}

export default function GameBoard() {
  const router = useRouter();

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

  return (
    <div className="w-full h-screen relative">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Math Adventure
          </h1>
          <button
            onClick={() => router.push('/help')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-colors"
          >
            Help
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
        <div className="text-center text-white drop-shadow-lg">
          <p className="text-lg">Click on Islands 1, 2, or 3 to start your adventure!</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 8, 12]} />
        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, 5, -5]} intensity={0.5} color="#fbbf24" />

        {/* Scene elements */}
        <Ocean />
        <Path />

        {/* Islands */}
        {islandPositions.map((pos, index) => (
          <Island
            key={index}
            position={pos}
            islandNumber={index + 1}
            isAccessible={index === 0 || index === 1 || index === 2} // First three islands are accessible
            onClick={() => handleIslandClick(index + 1)}
          />
        ))}
      </Canvas>
    </div>
  );
}
