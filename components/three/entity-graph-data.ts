export type NodeKind =
  | "flight"
  | "receipt"
  | "product"
  | "price"
  | "warranty"
  | "calendar"
  | "chat"
  | "note";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  title: string;
  tag?: string;
  position: [number, number, number];
  person?: string;
}

export const GRAPH_NODES: GraphNode[] = [
  {
    id: "flight-rahul",
    kind: "flight",
    title: "Flight · DEL → SFO",
    tag: "Nov 14",
    position: [-2.5, 1.25, -0.3],
    person: "Rahul",
  },
  {
    id: "dinner-rahul",
    kind: "receipt",
    title: "Dinner · Roka",
    tag: "$186.00",
    position: [-1.55, -1.05, 0.55],
    person: "Rahul",
  },
  {
    id: "adidas-order",
    kind: "product",
    title: "Adidas · Order #4471",
    tag: "$128.00",
    position: [2.35, 1.5, -0.2],
  },
  {
    id: "headphones-price",
    kind: "price",
    title: "Sony WH-1000XM6",
    tag: "−$40 drop",
    position: [3.05, -0.35, 0.4],
  },
  {
    id: "laptop-warranty",
    kind: "warranty",
    title: "MacBook Air · Warranty",
    tag: "Exp. 2027",
    position: [0.45, 2.15, -0.75],
  },
  {
    id: "dentist-cal",
    kind: "calendar",
    title: "Dentist Appointment",
    tag: "Thu · 10:00",
    position: [-0.55, -2.05, -0.5],
  },
  {
    id: "mom-chat",
    kind: "chat",
    title: "Mom",
    tag: "3 new",
    position: [1.15, -1.85, 0.75],
  },
  {
    id: "trip-note",
    kind: "note",
    title: "SF trip ideas",
    position: [-3.05, -0.15, -0.85],
  },
];

export const GRAPH_EDGES: [string, string][] = [
  ["flight-rahul", "dinner-rahul"],
  ["flight-rahul", "trip-note"],
  ["adidas-order", "headphones-price"],
  ["laptop-warranty", "adidas-order"],
  ["dentist-cal", "mom-chat"],
];

export const TIER_NODE_IDS: Record<"full" | "reduced" | "minimal", string[]> = {
  full: GRAPH_NODES.map((n) => n.id),
  reduced: [
    "flight-rahul",
    "dinner-rahul",
    "adidas-order",
    "headphones-price",
    "mom-chat",
    "laptop-warranty",
  ],
  minimal: ["flight-rahul", "dinner-rahul", "adidas-order", "mom-chat"],
};
