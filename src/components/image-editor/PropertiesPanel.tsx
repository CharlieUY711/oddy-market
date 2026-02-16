import { EditorLayer } from "./types";
import { FlipHorizontal, FlipVertical } from "lucide-react";

interface PropertiesPanelProps {
  layer: EditorLayer | null;
  onLayerUpdate: (updates: Partial<EditorLayer>) => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
}

export function PropertiesPanel({
  layer,
  onLayerUpdate,
  onFlipHorizontal,
  onFlipVertical,
}: PropertiesPanelProps) {
  if (!layer) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 flex items-center justify-center">
        <p className="text-sm text-gray-500">Selecciona una capa</p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Propiedades</h2>
        <p className="text-xs text-gray-500 mt-1">{layer.name}</p>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Opacidad */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Opacidad: {layer.opacity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={layer.opacity}
            onChange={(e) => onLayerUpdate({ opacity: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Posición */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
            <input
              type="number"
              value={Math.round(layer.position.x)}
              onChange={(e) =>
                onLayerUpdate({
                  position: { ...layer.position, x: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
            <input
              type="number"
              value={Math.round(layer.position.y)}
              onChange={(e) =>
                onLayerUpdate({
                  position: { ...layer.position, y: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Propiedades específicas por tipo */}
        {layer.type === "image" && layer.image && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700">Imagen</h3>
            <div className="flex gap-2">
              {onFlipHorizontal && (
                <button
                  onClick={onFlipHorizontal}
                  className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <FlipHorizontal size={16} />
                  Voltear H
                </button>
              )}
              {onFlipVertical && (
                <button
                  onClick={onFlipVertical}
                  className="flex-1 px-3 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <FlipVertical size={16} />
                  Voltear V
                </button>
              )}
            </div>
          </div>
        )}

        {layer.type === "text" && layer.text && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700">Texto</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contenido</label>
              <textarea
                value={layer.text.content || ""}
                onChange={(e) =>
                  onLayerUpdate({
                    text: { ...layer.text, content: e.target.value },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño</label>
              <input
                type="number"
                value={layer.text.fontSize || 20}
                onChange={(e) =>
                  onLayerUpdate({
                    text: { ...layer.text, fontSize: parseInt(e.target.value) || 20 },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="8"
                max="200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={layer.text.color || "#000000"}
                onChange={(e) =>
                  onLayerUpdate({
                    text: { ...layer.text, color: e.target.value },
                  })
                }
                className="w-full h-10 border border-gray-300 rounded"
              />
            </div>
          </div>
        )}

        {layer.type === "shape" && layer.shape && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700">Forma</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color de relleno</label>
              <input
                type="color"
                value={layer.shape.fill || "#FF6B35"}
                onChange={(e) =>
                  onLayerUpdate({
                    shape: { ...layer.shape, fill: e.target.value },
                  })
                }
                className="w-full h-10 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color de borde</label>
              <input
                type="color"
                value={layer.shape.stroke || "#000000"}
                onChange={(e) =>
                  onLayerUpdate({
                    shape: { ...layer.shape, stroke: e.target.value },
                  })
                }
                className="w-full h-10 border border-gray-300 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
