import React, { useRef, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Low-poly 3D Civic Emblem & Ward Map Representation
const CivicEmblemModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const pinRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
    if (pinRef.current) {
      pinRef.current.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      {/* Base Grid Platform / Ward Floor */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.7, 0.2, 8]} />
        <meshStandardMaterial color="#0F4C5C" roughness={0.4} metalness={0.1} />
      </mesh>

      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[2.3, 2.3, 0.1, 8]} />
        <meshStandardMaterial color="#FAF8F5" roughness={0.6} />
      </mesh>

      {/* Low-Poly Municipal Buildings */}
      <mesh position={[-0.8, 0.4, -0.6]}>
        <boxGeometry args={[0.5, 0.8, 0.5]} />
        <meshStandardMaterial color="#1A535C" roughness={0.3} />
      </mesh>

      <mesh position={[0.7, 0.5, -0.4]}>
        <boxGeometry args={[0.6, 1.0, 0.6]} />
        <meshStandardMaterial color="#0A343F" roughness={0.3} />
      </mesh>

      <mesh position={[-0.6, 0.3, 0.7]}>
        <boxGeometry args={[0.5, 0.6, 0.5]} />
        <meshStandardMaterial color="#266B7B" roughness={0.3} />
      </mesh>

      {/* Floating Animated Map Pin (Terracotta Accent) */}
      <mesh ref={pinRef} position={[0, 1.2, 0]}>
        <coneGeometry args={[0.25, 0.6, 6]} />
        <meshStandardMaterial color="#C85A32" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Orbiting Civic Ring */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.8, 0.03, 8, 32]} />
        <meshStandardMaterial color="#C85A32" roughness={0.2} />
      </mesh>
    </group>
  );
};

// Static SVG Fallback for Reduced Motion or No-WebGL environments
const StaticFallback: React.FC = () => (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAF8F5',
      borderRadius: '12px',
      border: '1px solid #E2E6EA',
      p: 3,
    }}
  >
    <svg width="220" height="220" viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="90" fill="#F4F1EA" stroke="#0F4C5C" strokeWidth="4" />
      <polygon points="100,30 160,70 160,130 100,170 40,130 40,70" fill="#0F4C5C" opacity="0.15" />
      <rect x="70" y="80" width="60" height="70" rx="4" fill="#0F4C5C" />
      <rect x="80" y="60" width="40" height="30" rx="2" fill="#266B7B" />
      <path d="M100 25 L115 50 L85 50 Z" fill="#C85A32" />
      <circle cx="100" cy="100" r="8" fill="#FAF8F5" />
    </svg>
  </Box>
);

export const Civic3DHero: React.FC = () => {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setUseFallback(true);
      return;
    }

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setUseFallback(true);
      }
    } catch (e) {
      setUseFallback(true);
    }
  }, []);

  if (useFallback) {
    return <StaticFallback />;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: 280, sm: 360, md: 420 },
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #E2E6EA',
        backgroundColor: '#FAF8F5',
      }}
    >
      <Canvas
        camera={{ position: [0, 2, 4.5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        onError={() => setUseFallback(true)}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#E27D56" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <CivicEmblemModel />
        </Float>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>
    </Box>
  );
};

export default Civic3DHero;
