import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { EditorProject, EditorLayer, ActiveTool } from "./types";

interface EditorCanvasProps {
  project: EditorProject;
  selectedLayerId: string | null;
  activeTool: ActiveTool;
  zoom: number;
  onLayerSelect: (layerId: string | null) => void;
  onLayerUpdate: (layerId: string, updates: Partial<EditorLayer>) => void;
  onCanvasReady: (canvas: fabric.Canvas | null) => void;
}

export function EditorCanvas({
  project,
  selectedLayerId,
  activeTool,
  zoom,
  onLayerSelect,
  onLayerUpdate,
  onCanvasReady,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: project.canvas.width,
      height: project.canvas.height,
      backgroundColor: project.canvas.backgroundColor,
    });

    fabricCanvasRef.current = canvas;
    onCanvasReady(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Actualizar dimensiones del canvas
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.width = project.canvas.width;
    fabricCanvasRef.current.height = project.canvas.height;
    fabricCanvasRef.current.backgroundColor = project.canvas.backgroundColor;
    fabricCanvasRef.current.renderAll();
  }, [project.canvas.width, project.canvas.height, project.canvas.backgroundColor]);

  // Actualizar zoom
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [zoom]);

  // Cargar capas
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    
    // Limpiar canvas
    canvas.clear();
    canvas.backgroundColor = project.canvas.backgroundColor;

    // Cargar cada capa
    project.layers
      .filter((layer) => layer.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach((layer) => {
        let fabricObject: fabric.Object | null = null;

        if (layer.type === "image" && layer.image) {
          fabric.Image.fromURL(
            layer.image.src,
            (img) => {
              img.set({
                left: layer.position.x,
                top: layer.position.y,
                opacity: layer.opacity / 100,
                flipX: layer.image?.flipX || false,
                flipY: layer.image?.flipY || false,
                angle: layer.image?.rotation || 0,
              });

              // Aplicar filtros CSS
              if (layer.image.filters) {
                const filters: string[] = [];
                if (layer.image.filters.brightness !== undefined) {
                  filters.push(`brightness(${100 + layer.image.filters.brightness}%)`);
                }
                if (layer.image.filters.contrast !== undefined) {
                  filters.push(`contrast(${100 + layer.image.filters.contrast}%)`);
                }
                if (layer.image.filters.saturation !== undefined) {
                  filters.push(`saturate(${100 + layer.image.filters.saturation}%)`);
                }
                if (layer.image.filters.hue !== undefined) {
                  filters.push(`hue-rotate(${layer.image.filters.hue}deg)`);
                }
                if (layer.image.filters.blur !== undefined) {
                  filters.push(`blur(${layer.image.filters.blur}px)`);
                }
                if (layer.image.filters.grayscale) {
                  filters.push("grayscale(100%)");
                }
                if (layer.image.filters.sepia) {
                  filters.push("sepia(100%)");
                }
                if (layer.image.filters.invert) {
                  filters.push("invert(100%)");
                }
                if (filters.length > 0) {
                  (img.getElement() as HTMLImageElement).style.filter = filters.join(" ");
                }
              }

              canvas.add(img);
              canvas.renderAll();
            },
            { crossOrigin: "anonymous" }
          );
        } else if (layer.type === "text" && layer.text) {
          const text = new fabric.Text(layer.text.content || "", {
            left: layer.position.x,
            top: layer.position.y,
            fontSize: layer.text.fontSize || 20,
            fontFamily: layer.text.fontFamily || "Arial",
            fill: layer.text.color || "#000000",
            fontWeight: layer.text.fontWeight || "normal",
            fontStyle: layer.text.fontStyle || "normal",
            textAlign: layer.text.textAlign || "left",
            underline: layer.text.underline || false,
            opacity: layer.opacity / 100,
          });
          canvas.add(text);
          fabricObject = text;
        } else if (layer.type === "shape" && layer.shape) {
          let shape: fabric.Object | null = null;
          const shapeProps = {
            left: layer.position.x,
            top: layer.position.y,
            fill: layer.shape.fill || "#FF6B35",
            stroke: layer.shape.stroke || "#000000",
            strokeWidth: layer.shape.strokeWidth || 2,
            opacity: layer.opacity / 100,
          };

          switch (layer.shape.shapeType) {
            case "rectangle":
              shape = new fabric.Rect({
                ...shapeProps,
                width: layer.shape.width || 100,
                height: layer.shape.height || 100,
              });
              break;
            case "circle":
              shape = new fabric.Circle({
                ...shapeProps,
                radius: layer.shape.radius || 50,
              });
              break;
            case "line":
              shape = new fabric.Line(
                [
                  layer.position.x,
                  layer.position.y,
                  (layer.position.x || 0) + (layer.shape.width || 100),
                  layer.position.y,
                ],
                {
                  ...shapeProps,
                  fill: "",
                }
              );
              break;
            case "arrow":
              // Usar línea con flecha (simplificado)
              shape = new fabric.Line(
                [
                  layer.position.x,
                  layer.position.y,
                  (layer.position.x || 0) + (layer.shape.width || 100),
                  layer.position.y,
                ],
                {
                  ...shapeProps,
                  fill: "",
                }
              );
              break;
            case "triangle":
              shape = new fabric.Triangle({
                ...shapeProps,
                width: layer.shape.width || 100,
                height: layer.shape.height || 100,
              });
              break;
          }
          if (shape) {
            canvas.add(shape);
            fabricObject = shape;
          }
        }

        if (fabricObject) {
          fabricObject.set("data", { layerId: layer.id });
        }
      });

    canvas.renderAll();
  }, [project.layers, project.canvas.backgroundColor]);

  // Manejar selección
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;

    const handleSelection = (e: fabric.IEvent) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && (activeObject as any).data?.layerId) {
        onLayerSelect((activeObject as any).data.layerId);
      } else {
        onLayerSelect(null);
      }
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => onLayerSelect(null));

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared");
    };
  }, [onLayerSelect]);

  // Manejar movimiento y actualización
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;

    const handleObjectModified = (e: fabric.IEvent) => {
      const obj = e.target;
      if (obj && (obj as any).data?.layerId) {
        const layerId = (obj as any).data.layerId;
        onLayerUpdate(layerId, {
          position: {
            x: obj.left || 0,
            y: obj.top || 0,
          },
        });
      }
    };

    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:moving", handleObjectModified);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:moving", handleObjectModified);
    };
  }, [onLayerUpdate]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-auto p-4">
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <canvas ref={canvasRef} className="shadow-lg" />
      </div>
    </div>
  );
}
