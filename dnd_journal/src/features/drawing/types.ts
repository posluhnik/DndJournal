export type DrawingTool = "pen" | "eraser";
export type Point = { x: number; y: number };
export type Stroke = {
  tool: DrawingTool;
  width: number;
  color: string;
  points: Point[];
};
export type DrawingHistory = {
  past: Stroke[][];
  present: Stroke[];
  future: Stroke[][];
};
