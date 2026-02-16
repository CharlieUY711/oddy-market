import { GripVertical, Eye, EyeOff, Lock, Unlock, Trash2, Plus } from "lucide-react";
import { EditorLayer } from "./types";

interface LayersPanelProps {
  layers: EditorLayer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerAdd: () => void;
  onLayerDelete: (layerId: string) => void;
  onLayerToggleVisibility: (layerId: string) => void;
  onLayerToggleLock: (layerId: string) => void;
}

export function LayersPanel({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerAdd,
  onLayerDelete,
  onLayerToggleVisibility,
  onLayerToggleLock,
}: LayersPanelProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Capas</h2>
        <button
          onClick={onLayerAdd}
          className="p-1 rounded hover:bg-gray-100 text-gray-600"
          title="Agregar capa"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Lista de capas */}
      <div className="flex-1 overflow-y-auto p-2">
        {layers.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            <p>No hay capas</p>
            <p className="text-xs mt-2">Agrega una imagen o texto</p>
          </div>
        ) : (
          <div className="space-y-1">
            {[...layers].reverse().map((layer) => (
              <div
                key={layer.id}
                onClick={() => onLayerSelect(layer.id)}
                className={`
                  p-2 rounded cursor-pointer transition-colors flex items-center gap-2 group
                  ${
                    selectedLayerId === layer.id
                      ? "bg-[#FF6B35]/10 border border-[#FF6B35]"
                      : "hover:bg-gray-50 border border-transparent"
                  }
                `}
              >
                <GripVertical size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{layer.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{layer.type}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleVisibility(layer.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600"
                    title={layer.visible ? "Ocultar" : "Mostrar"}
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerToggleLock(layer.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600"
                    title={layer.locked ? "Desbloquear" : "Bloquear"}
                  >
                    {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDelete(layer.id);
                    }}
                    className="p-1 rounded hover:bg-red-100 text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
