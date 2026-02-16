import { X, Square, Circle, Minus, ArrowRight, Triangle } from "lucide-react";

interface ShapesPanelProps {
  onShapeSelect: (shapeType: "rectangle" | "circle" | "line" | "arrow" | "triangle") => void;
  onClose: () => void;
}

export function ShapesPanel({ onShapeSelect, onClose }: ShapesPanelProps) {
  const shapes = [
    { type: "rectangle" as const, icon: Square, label: "Rectángulo" },
    { type: "circle" as const, icon: Circle, label: "Círculo" },
    { type: "line" as const, icon: Minus, label: "Línea" },
    { type: "arrow" as const, icon: ArrowRight, label: "Flecha" },
    { type: "triangle" as const, icon: Triangle, label: "Triángulo" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Formas</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {shapes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => {
                  onShapeSelect(type);
                  onClose();
                }}
                className="p-6 rounded-lg border-2 border-gray-200 hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-colors flex flex-col items-center gap-2"
              >
                <Icon size={32} className="text-[#FF6B35]" />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
