"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

function WebGLCarScene({ phase }: { phase: string }) {
  const carRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state, delta) => {
    if (!carRef.current || !cameraRef.current || !gridRef.current) return;

    // Simulate high speed track moving
    gridRef.current.position.z += 100 * delta;
    if (gridRef.current.position.z > 50) {
      gridRef.current.position.z = 0;
    }

    if (phase === "running") {
      // Hover effect
      carRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.05 + 0.5;
      cameraRef.current.position.lerp(new THREE.Vector3(0, 3, -15), 0.05);
      cameraRef.current.lookAt(carRef.current.position);
    } 
    else if (phase === "drifting") {
      // Drift mechanics: car rotates sideways, slides slightly
      carRef.current.rotation.y = THREE.MathUtils.lerp(carRef.current.rotation.y, Math.PI / 4, 0.05);
      carRef.current.position.x = THREE.MathUtils.lerp(carRef.current.position.x, -2, 0.05);
      
      // Camera swings around to front-side view
      cameraRef.current.position.lerp(new THREE.Vector3(8, 2, 5), 0.05);
      cameraRef.current.lookAt(carRef.current.position);
    }
    else if (phase === "zooming") {
      // Camera rushes directly into the left headlight
      const headlightTarget = new THREE.Vector3();
      // The headlight is roughly at x: -0.6, y: 0.5, z: 2 inside the car group
      carRef.current.localToWorld(headlightTarget.set(-0.6, 0.5, 2.5));
      
      cameraRef.current.position.lerp(headlightTarget, 0.08); // fast zoom
      cameraRef.current.lookAt(headlightTarget);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 3, -15]} fov={60} />
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={2} />
      
      {/* Cyber Track Grid */}
      <gridHelper ref={gridRef} args={[200, 100, "#00D4FF", "#002040"]} position={[0, 0, 0]} />

      {/* Procedural Sports Car */}
      <group ref={carRef} position={[0, 0.5, 0]}>
        {/* Main Body (Wedge) */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 1, 5]} />
          <meshStandardMaterial color="#051020" roughness={0.1} metalness={0.9} />
        </mesh>
        
        {/* Cockpit / Window */}
        <mesh position={[0, 1.2, -0.5]}>
          <boxGeometry args={[1.6, 0.5, 2]} />
          <meshStandardMaterial color="#000000" roughness={0} metalness={1} />
        </mesh>

        {/* Left Headlight */}
        <mesh position={[-0.8, 0.5, 2.5]}>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshBasicMaterial color={[0.5, 2, 5]} toneMapped={false} />
        </mesh>
        <pointLight position={[-0.8, 0.5, 2.6]} color="#00D4FF" intensity={50} distance={10} />

        {/* Right Headlight */}
        <mesh position={[0.8, 0.5, 2.5]}>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshBasicMaterial color={[0.5, 2, 5]} toneMapped={false} />
        </mesh>
        <pointLight position={[0.8, 0.5, 2.6]} color="#00D4FF" intensity={50} distance={10} />

        {/* Tail lights */}
        <mesh position={[-0.8, 0.5, -2.5]}>
          <boxGeometry args={[0.6, 0.2, 0.1]} />
          <meshBasicMaterial color={[5, 0, 0]} toneMapped={false} />
        </mesh>
        <mesh position={[0.8, 0.5, -2.5]}>
          <boxGeometry args={[0.6, 0.2, 0.1]} />
          <meshBasicMaterial color={[5, 0, 0]} toneMapped={false} />
        </mesh>

        {/* Wheels */}
        {[-1, 1].map((x, i) =>
          [-1.5, 1.5].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x * 1.1, 0, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          ))
        )}
      </group>

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00D4FF" />
    </>
  );
}

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState("running"); // running -> drifting -> zooming -> flash -> complete

  useEffect(() => {
    // Timing logic for the cinematic sequence
    const t1 = setTimeout(() => setPhase("drifting"), 2000);
    const t2 = setTimeout(() => setPhase("zooming"), 4500);
    const t3 = setTimeout(() => setPhase("flash"), 5500);
    const t4 = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (phase === "complete") return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[100] bg-black overflow-hidden pointer-events-none"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} dpr={[1, 2]}>
           <WebGLCarScene phase={phase} />
        </Canvas>
        
        {/* The White/Blue Flash when the headlight hits the camera lens */}
        <motion.div 
          className="absolute inset-0 bg-white z-[101]"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "flash" ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeIn" }}
        />
        
        {/* Scanning grid overlay for cyber aesthetic */}
        <div className="absolute inset-0 z-50 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
      </motion.div>
    </AnimatePresence>
  );
}
