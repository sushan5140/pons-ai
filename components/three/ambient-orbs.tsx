"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Orb({
  position,
  scale,
  color,
  speed,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const initial = useRef(position);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed;
    ref.current.position.y = initial.current[1] + Math.sin(t) * 0.4;
    ref.current.position.x = initial.current[0] + Math.cos(t * 0.6) * 0.25;
    ref.current.rotation.x = t * 0.15;
    ref.current.rotation.y = t * 0.2;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.05}
        transparent
        opacity={0.38}
      />
    </mesh>
  );
}

export default function AmbientOrbs({ className }: { className?: string }) {
  return (
    <div className={className} style={{ filter: "blur(30px)" }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <Orb position={[3.6, 1.8, -4]} scale={1.3} color="#A6C5DA" speed={0.4} />
        <Orb position={[-3.8, -1.6, -5]} scale={1.05} color="#3E6F88" speed={0.55} />
        <Orb position={[0.4, -2.8, -6]} scale={0.75} color="#2B5A7D" speed={0.35} />
      </Canvas>
    </div>
  );
}
