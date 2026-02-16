/**
 * Tipos para el Editor de Imágenes Enterprise
 * Fase 1-4: Completado
 */

export interface EditorLayer {
  id: string;
  type: "image" | "text" | "shape" | "drawing" | "sticker";
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0-100
  position: { x: number; y: number };
  zIndex: number;
  // Propiedades específicas por tipo
  image?: {
    src: string;
    width?: number;
    height?: number;
    flipX?: boolean;
    flipY?: boolean;
    rotation?: number;
    crop?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    filters?: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      hue?: number;
      blur?: number;
      sharpen?: boolean;
      grayscale?: boolean;
      sepia?: boolean;
      invert?: boolean;
    };
  };
  text?: {
    content: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    textAlign?: "left" | "center" | "right" | "justify";
    underline?: boolean;
  };
  shape?: {
    shapeType: "rectangle" | "circle" | "line" | "arrow" | "triangle";
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    width?: number;
    height?: number;
    radius?: number; // Para círculo
  };
  sticker?: {
    stickerId: string;
    stickerUrl: string;
    category: string;
    name?: string;
  };
  drawing?: {
    paths: Array<{ x: number; y: number }>;
    brushSize: number;
    brushColor: string;
    brushType: "pen" | "brush" | "eraser";
  };
}

export interface EditorProject {
  id: string;
  name: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  layers: EditorLayer[];
  createdAt: string;
  updatedAt: string;
}

export type ActiveTool = 
  | "select" 
  | "move" 
  | "crop" 
  | "rotate" 
  | "text" 
  | "shape" 
  | "drawing" 
  | "filter"
  | "zoom" 
  | "pan";
