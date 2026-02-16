import { useState } from "react";
import { X, Pen, Highlighter, Eraser } from "lucide-react";

interface DrawingToolsProps {
  onClose: () => void;
  onToolSelect: (tool: "pen" | "brush" | "eraser", config: {
    size: number;
    color: string;
  }) => void;
}

export function DrawingTools({ onClose, onToolSelect }: DrawingToolsProps) {
  const [selectedTool, setSelectedTool] = useState<"pen" | "brush" | "eraser">("pen");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");

  const tools = [
    { id: "pen" as const, icon: Pen, label: "Lápiz" },
    { id: "brush" as const, icon: Highlighter, label: "Pincel" },
    { id: "eraser" as const, icon: Eraser, label: "Borrador" },
  ];

  const handleApply = () => {
    onToolSelect(selectedTool, {
      size: brushSize,
      color: selectedTool === "eraser" ? "#FFFFFF" : brushColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Herramientas de Dibujo</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Herramienta</label>
            <div className="grid grid-cols-3 gap-3">
              {tools.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTool(id)}
                  className={`
                    p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2
                    ${
                      selectedTool === id
                        ? "border-[#FF6B35] bg-[#FF6B35]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon size={24} className={selectedTool === id ? "text-[#FF6B35]" : "text-gray-600"} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Tamaño</label>
              <span className="text-xs text-gray-500">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {selectedTool !== "eraser" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
