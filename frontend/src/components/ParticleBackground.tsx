"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function DataHighway({ onIntroComplete }: { onIntroComplete: () => void }) {
  const { camera } = useThree();
  const speedNodeRef = useRef<THREE.Group>(null);
  const gridHelperRef = useRef<THREE.GridHelper>(null);
  const introFinishedRef = useRef(false);

  // The sleek aerodynamic data node
  const sleekMetal = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#e2e8f0",
    metalness: 1,
    roughness: 0.1,
    flatShading: true
  }), []);

  // Set initial camera far back for the tracking shot
  useEffect(() => {
    camera.position.set(0, 3, 25);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Simulate high speed moving grid by scrolling the grid material
    if (gridHelperRef.current) {
      gridHelperRef.current.position.z = (t * 50) % 10; // Endless loop effect
    }

    if (speedNodeRef.current) {
      // Hovering physics on the data node
      speedNodeRef.current.position.y = Math.sin(t * 10) * 0.1 + 0.5;
      // Slight banking left and right
      speedNodeRef.current.rotation.z = Math.sin(t * 3) * 0.1;
      speedNodeRef.current.rotation.y = Math.cos(t * 2) * 0.05;
    }

    // Immediately notify that the background is ready so the UI snaps in right after the Cinematic Flash
    if (!introFinishedRef.current) {
      introFinishedRef.current = true;
      onIntroComplete();
    } else {
      // Post intro resting phase - gentle parallax
      const targetX = Math.sin(t * 0.2) * 2;
      const targetY = 1 + Math.sin(t * 0.3) * 1;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
      camera.lookAt(0, 0, -10);
    }
  });

  return (
    <group>
      {/* The Speeding Node */}
      <group ref={speedNodeRef} position={[0, 0, 5]}>
        <mesh material={sleekMetal}>
          <coneGeometry args={[1, 3, 4]} />
          <meshPhysicalMaterial color="#3b82f6" metalness={0.9} roughness={0.1} flatShading />
        </mesh>
        {/* Engine Thrust / Data stream coming off the back */}
        <mesh position={[0, -1.8, 0]}>
          <cylinderGeometry args={[0.01, 0.5, 1, 8]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* The Digital Highway Grid */}
      <gridHelper 
        ref={gridHelperRef} 
        args={[100, 100, "#3b82f6", "#1e293b"]} 
        position={[0, -1, 0]} 
      />
      
      {/* Dynamic speeding side pillars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <Pillar key={i} index={i} />
      ))}
    </group>
  );
}

// Small pillars flashing by to increase the sense of immense speed
function Pillar({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const xOffset = index % 2 === 0 ? 8 : -8;
  const initialZ = -100 + (index * 5); // Spread them out
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.z += delta * 50; // Match grid speed
      if (meshRef.current.position.z > 20) {
        meshRef.current.position.z = -80; // Reset back down the line
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[xOffset, 1, initialZ]}>
      <boxGeometry args={[0.2, 4, 10]} />
      <meshBasicMaterial color="#1e3a8a" />
    </mesh>
  );
}

export default function ParticleBackground({ onIntroComplete }: { onIntroComplete?: () => void }) {
  // If no callback is passed (e.g. from tests or fast refreshes), just auto-fire it so we don't break
  const handleComplete = onIntroComplete || (() => {});

  return (
    <Canvas 
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", background: "#020617" }}
      gl={{ powerPreference: "high-performance", antialias: true }}
    >
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 10, 50]} /> {/* Heavy fog so the track fades beautifully into nothing */}
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 0]} intensity={2} color="#60a5fa" />
      
      <DataHighway onIntroComplete={handleComplete} />
    </Canvas>
  );
}
