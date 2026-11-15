import type { Stroke } from "./types";

export function renderDrawing(canvas: HTMLCanvasElement, strokes: Stroke[], draft: Stroke | null) {
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.round(bounds.width * pixelRatio);
  const height = Math.round(bounds.height * pixelRatio);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, bounds.width, bounds.height);
  context.lineCap = "round";
  context.lineJoin = "round";

  for (const stroke of draft ? [...strokes, draft] : strokes) {
    const first = stroke.points[0];
    if (!first) continue;
    context.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.width * bounds.width;
    context.beginPath();
    context.moveTo(first.x * bounds.width, first.y * bounds.height);
    if (stroke.points.length === 1) context.lineTo(first.x * bounds.width + 0.01, first.y * bounds.height);
    else for (const point of stroke.points.slice(1)) context.lineTo(point.x * bounds.width, point.y * bounds.height);
    context.stroke();
  }
  context.globalCompositeOperation = "source-over";
}
