"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  DEMO_HIGHLIGHT_IDS,
  GRAPH_EDGES,
  GRAPH_NODES,
  TIER_NODE_IDS,
  type GraphNode,
} from "./entity-graph-data";
import { createCardTexture } from "./screenshot-texture";

export type GraphPhase = "idle" | "typing" | "highlight" | "converge" | "answer";

type Tier = "full" | "reduced" | "minimal";

function useResponsiveTier(): Tier {
  const [tier, setTier] = useState<Tier>("full");
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setTier(w < 640 ? "minimal" : w < 1024 ? "reduced" : "full");
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return tier;
}

function Card({
  node,
  index,
  highlighted,
  pullTarget,
  reducedMotion,
  cheap,
}: {
  node: GraphNode;
  index: number;
  highlighted: boolean;
  pullTarget: THREE.Vector3;
  reducedMotion: boolean;
  cheap: boolean;
}) {
  const texture = useMemo(() => createCardTexture(node), [node]);
  const group = useRef<THREE.Group>(null);
  const glowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef(0);
  const pull = useRef(0);
  const base = useMemo(() => new THREE.Vector3(...node.position), [node.position]);
  const phaseOffset = useMemo(() => index * 1.37, [index]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    glow.current = THREE.MathUtils.damp(glow.current, highlighted ? 1 : 0, 4, delta);
    pull.current = THREE.MathUtils.damp(pull.current, highlighted ? 1 : 0, 3, delta);

    const drift = reducedMotion
      ? new THREE.Vector3()
      : new THREE.Vector3(
          Math.sin(t * 0.35 + phaseOffset) * 0.14,
          Math.cos(t * 0.3 + phaseOffset) * 0.16,
          Math.sin(t * 0.25 + phaseOffset) * 0.1
        ).multiplyScalar(1 - pull.current * 0.5);

    const pulled = base.clone().lerp(pullTarget, pull.current * 0.32);

    group.current.position.copy(pulled).add(drift);
    if (!reducedMotion) {
      group.current.rotation.y = Math.sin(t * 0.2 + phaseOffset) * 0.06;
      group.current.rotation.x = Math.cos(t * 0.18 + phaseOffset) * 0.04;
    }
    group.current.scale.setScalar(1 + glow.current * 0.06);

    if (glowMaterial.current) {
      glowMaterial.current.opacity = glow.current * 0.5;
    }
  });

  return (
    <group ref={group} position={node.position}>
      {!cheap && (
        <mesh position={[0, 0, -0.03]} scale={1.16}>
          <planeGeometry args={[1.6, 1.0]} />
          <meshBasicMaterial
            ref={glowMaterial}
            color="#A6C5DA"
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      )}
      <mesh>
        <planeGeometry args={[1.6, 1.0]} />
        {cheap ? (
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        ) : (
          <meshPhysicalMaterial
            map={texture}
            transparent
            roughness={0.5}
            metalness={0}
            clearcoat={0.3}
            clearcoatRoughness={0.6}
            transmission={0.08}
            thickness={0.3}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>
    </group>
  );
}

function Threads({
  nodes,
  edges,
  demoEdge,
  glowActive,
}: {
  nodes: GraphNode[];
  edges: [string, string][];
  demoEdge: [string, string];
  glowActive: boolean;
}) {
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <>
      {edges.map(([a, b]) => {
        const na = byId.get(a);
        const nb = byId.get(b);
        if (!na || !nb) return null;
        const isDemo = a === demoEdge[0] && b === demoEdge[1];
        const active = isDemo && glowActive;
        return (
          <Line
            key={`${a}-${b}`}
            points={[na.position, nb.position]}
            color={active ? "#8DB4CC" : "#A6C5DA"}
            transparent
            opacity={active ? 0.85 : 0.22}
            lineWidth={active ? 2.2 : 1}
          />
        );
      })}
    </>
  );
}

function Scene({
  tier,
  phase,
  reducedMotion,
}: {
  tier: Tier;
  phase: GraphPhase;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const cheap = tier !== "full";

  const nodes = useMemo(
    () => GRAPH_NODES.filter((n) => TIER_NODE_IDS[tier].includes(n.id)),
    [tier]
  );
  const edges = useMemo(() => {
    const ids = new Set(nodes.map((n) => n.id));
    return GRAPH_EDGES.filter(([a, b]) => ids.has(a) && ids.has(b));
  }, [nodes]);

  const demoEdge = DEMO_HIGHLIGHT_IDS as [string, string];
  const highlightActive = phase === "highlight" || phase === "converge" || phase === "answer";

  const pullTarget = useMemo(() => {
    const a = GRAPH_NODES.find((n) => n.id === demoEdge[0]);
    const b = GRAPH_NODES.find((n) => n.id === demoEdge[1]);
    if (!a || !b) return new THREE.Vector3();
    return new THREE.Vector3(...a.position).add(new THREE.Vector3(...b.position)).multiplyScalar(0.5);
  }, [demoEdge]);

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return;
    const targetY = pointer.x * 0.18;
    const targetX = -pointer.y * 0.12;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3, delta);
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 5, 6]} intensity={1.1} />
      <pointLight position={[-4, -3, 3]} intensity={0.4} color="#A6C5DA" />

      <Threads nodes={nodes} edges={edges} demoEdge={demoEdge} glowActive={highlightActive} />

      {nodes.map((node, i) => (
        <Card
          key={node.id}
          node={node}
          index={i}
          highlighted={highlightActive && demoEdge.includes(node.id)}
          pullTarget={pullTarget}
          reducedMotion={reducedMotion}
          cheap={cheap}
        />
      ))}
    </group>
  );
}

export default function EntityGraph({
  phase,
  reducedMotion = false,
  active = true,
}: {
  phase: GraphPhase;
  reducedMotion?: boolean;
  active?: boolean;
}) {
  const tier = useResponsiveTier();

  return (
    <Canvas
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      dpr={tier === "full" ? [1, 1.8] : [1, 1.2]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      frameloop={!active ? "never" : reducedMotion ? "demand" : "always"}
      aria-hidden="true"
    >
      <AdaptiveDpr pixelated={false} />
      <Scene tier={tier} phase={reducedMotion ? "answer" : phase} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
