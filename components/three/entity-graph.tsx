"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Line } from "@react-three/drei";
import * as THREE from "three";
import { GRAPH_EDGES, GRAPH_NODES, TIER_NODE_IDS, type GraphNode } from "./entity-graph-data";
import { createCardTexture } from "./screenshot-texture";

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

function Card({ node, cheap }: { node: GraphNode; cheap: boolean }) {
  const texture = useMemo(() => createCardTexture(node), [node]);

  return (
    <group position={node.position}>
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

function Threads({ nodes, edges }: { nodes: GraphNode[]; edges: [string, string][] }) {
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <>
      {edges.map(([a, b]) => {
        const na = byId.get(a);
        const nb = byId.get(b);
        if (!na || !nb) return null;
        return (
          <Line
            key={`${a}-${b}`}
            points={[na.position, nb.position]}
            color="#A6C5DA"
            transparent
            opacity={0.22}
            lineWidth={1}
          />
        );
      })}
    </>
  );
}

function Scene({ tier }: { tier: Tier }) {
  const cheap = tier !== "full";

  const nodes = useMemo(
    () => GRAPH_NODES.filter((n) => TIER_NODE_IDS[tier].includes(n.id)),
    [tier]
  );
  const edges = useMemo(() => {
    const ids = new Set(nodes.map((n) => n.id));
    return GRAPH_EDGES.filter(([a, b]) => ids.has(a) && ids.has(b));
  }, [nodes]);

  return (
    <group>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 5, 6]} intensity={1.1} />
      <pointLight position={[-4, -3, 3]} intensity={0.4} color="#A6C5DA" />

      <Threads nodes={nodes} edges={edges} />

      {nodes.map((node) => (
        <Card key={node.id} node={node} cheap={cheap} />
      ))}
    </group>
  );
}

export default function EntityGraph({ active = true }: { active?: boolean }) {
  const tier = useResponsiveTier();

  return (
    <Canvas
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      dpr={tier === "full" ? [1, 1.8] : [1, 1.2]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      frameloop={!active ? "never" : "demand"}
      aria-hidden="true"
    >
      <AdaptiveDpr pixelated={false} />
      <Scene tier={tier} />
    </Canvas>
  );
}
