import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import * as fabric from "fabric";

interface CropToolProps {
  canvas: fabric.Canvas | null;
  onCropComplete: (cropData: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
}

export function CropTool({ canvas, onCropComplete, onCancel }: CropToolProps) {
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!canvas) return;

    // Crear rectángulo de crop
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      width: 200,
      height: 200,
      fill: "rgba(0,0,0,0.3)",
      stroke: "#FF6B35",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      hasControls: true,
      hasBorders: true,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();

    const updateCrop = () => {
      if (rect) {
        setCropRect({
          x: rect.left || 0,
          y: rect.top || 0,
          width: rect.width || 0,
          height: rect.height || 0,
        });
      }
    };

    canvas.on("object:modified", updateCrop);
    canvas.on("object:moving", updateCrop);

    return () => {
      canvas.off("object:modified", updateCrop);
      canvas.off("object:moving", updateCrop);
      canvas.remove(rect);
    };
  }, [canvas]);

  const handleComplete = () => {
    if (cropRect) {
      onCropComplete(cropRect);
    }
  };

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Recortar</h3>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <X size={16} />
          Cancelar
        </button>
        <button
          onClick={handleComplete}
          className="px-3 py-2 rounded bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 flex items-center gap-2"
        >
          <Check size={16} />
          Aplicar
        </button>
      </div>
    </div>
  );
}
