import * as THREE from "three";
import type { GraphNode, NodeKind } from "./entity-graph-data";

const INK = "#13212E";
const SECONDARY = "#5F7285";
const HEADER: Record<NodeKind, string> = {
  flight: "#DCE6EC",
  receipt: "#E4E9ED",
  product: "#DEE7EC",
  price: "#E1E8EC",
  warranty: "#E2E8EC",
  calendar: "#DFE7EB",
  chat: "#E3E9EC",
  note: "#E6EAEC",
};

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawIcon(ctx: CanvasRenderingContext2D, kind: NodeKind, cx: number, cy: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.72;

  switch (kind) {
    case "flight":
      ctx.beginPath();
      ctx.moveTo(-9, 3);
      ctx.lineTo(9, -3);
      ctx.lineTo(3, 4);
      ctx.lineTo(-2, 8);
      ctx.lineTo(-4, 3);
      ctx.lineTo(-9, 3);
      ctx.closePath();
      ctx.fill();
      break;
    case "receipt":
      roundRectPath(ctx, -8, -9, 16, 18, 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, -3);
      ctx.lineTo(4, -3);
      ctx.moveTo(-4, 2);
      ctx.lineTo(4, 2);
      ctx.stroke();
      break;
    case "product":
      roundRectPath(ctx, -8, -8, 16, 16, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "price":
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 9);
      ctx.moveTo(-6, 3);
      ctx.lineTo(0, 9);
      ctx.lineTo(6, 3);
      ctx.stroke();
      break;
    case "warranty":
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(8, -5);
      ctx.lineTo(8, 2);
      ctx.quadraticCurveTo(8, 8, 0, 10);
      ctx.quadraticCurveTo(-8, 8, -8, 2);
      ctx.lineTo(-8, -5);
      ctx.closePath();
      ctx.stroke();
      break;
    case "calendar":
      roundRectPath(ctx, -8, -7, 16, 15, 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.lineTo(8, -2);
      ctx.moveTo(-4, -10);
      ctx.lineTo(-4, -5);
      ctx.moveTo(4, -10);
      ctx.lineTo(4, -5);
      ctx.stroke();
      break;
    case "chat":
      roundRectPath(ctx, -9, -7, 18, 13, 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-3, 6);
      ctx.lineTo(-6, 10);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      break;
    case "note":
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(6, -6);
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.moveTo(-8, 6);
      ctx.lineTo(3, 6);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

export function createCardTexture(node: GraphNode): THREE.CanvasTexture {
  const w = 512;
  const h = 320;
  const r = 30;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  roundRectPath(ctx, 1, 1, w - 2, h - 2, r);
  ctx.clip();

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = HEADER[node.kind];
  ctx.fillRect(0, 0, w, 64);
  ctx.strokeStyle = "rgba(19,33,46,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 64);
  ctx.lineTo(w, 64);
  ctx.stroke();

  drawIcon(ctx, node.kind, 40, 32);

  ctx.fillStyle = INK;
  ctx.font = "600 22px Inter, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(node.title, 66, 34, w - 100);

  const ghostWidths = [0.78, 0.56, 0.66, 0.4];
  ghostWidths.forEach((frac, i) => {
    ctx.fillStyle = i === 0 ? "rgba(19,33,46,0.14)" : "rgba(19,33,46,0.09)";
    const y = 100 + i * 34;
    const bw = (w - 80) * frac;
    roundRectPath(ctx, 40, y, bw, 12, 6);
    ctx.fill();
  });

  if (node.tag) {
    ctx.font = "500 20px 'IBM Plex Mono', monospace";
    ctx.fillStyle = SECONDARY;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(node.tag, 40, h - 34);
  }

  if (node.person) {
    ctx.font = "500 15px Inter, sans-serif";
    ctx.fillStyle = "rgba(95,114,133,0.85)";
    ctx.textAlign = "right";
    ctx.fillText(node.person, w - 32, h - 34);
    ctx.textAlign = "left";
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
