import {
  MousePointer2,
  Move,
  Crop,
  RotateCw,
  Type,
  Shapes,
  Pencil,
  ZoomIn,
  ZoomOut,
  Hand,
  Upload,
  Download,
  Save,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Sparkles,
  Smile,
} from "lucide-react";
import { ActiveTool } from "./types";

interface EditorToolbarProps {
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onSave: () => void;
  zoom?: number;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onResizeCanvas?: () => void;
  onZoomFit?: () => void;
  onZoom100?: () => void;
  onShowTemplates?: () => void;
  onShowHistory?: () => void;
  onShowStickers?: () => void;
}

export function EditorToolbar({
  activeTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onUpload,
  onDownload,
  onSave,
  zoom = 1,
  onFlipHorizontal,
  onFlipVertical,
  onResizeCanvas,
  onZoomFit,
  onZoom100,
  onShowTemplates,
  onShowHistory,
  onShowStickers,
}: EditorToolbarProps) {
  const tools: { tool: ActiveTool | "sticker"; icon: any; label: string }[] = [
    { tool: "select", icon: MousePointer2, label: "Seleccionar" },
    { tool: "move", icon: Move, label: "Mover" },
    { tool: "crop", icon: Crop, label: "Recortar" },
    { tool: "rotate", icon: RotateCw, label: "Rotar" },
    { tool: "text", icon: Type, label: "Texto" },
    { tool: "shape", icon: Shapes, label: "Forma" },
    { tool: "filter", icon: Sparkles, label: "Filtros" },
    { tool: "drawing", icon: Pencil, label: "Dibujar" },
    { tool: "pan", icon: Hand, label: "Mover Canvas" },
  ];

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      {/* Herramientas principales */}
      <div className="flex items-center gap-1">
        {tools.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            onClick={() => {
              if (tool === "sticker" && onShowStickers) {
                onShowStickers();
              } else {
                onToolChange(tool as ActiveTool);
              }
            }}
            className={`
              px-3 py-2 rounded transition-colors flex items-center gap-2
              ${
                activeTool === tool
                  ? "bg-[#FF6B35] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }
            `}
            title={label}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="text-xs font-medium hidden sm:inline">{label}</span>
          </button>
        ))}
        {onShowStickers && (
          <button
            onClick={onShowStickers}
            className="px-3 py-2 rounded transition-colors flex items-center gap-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="Stickers"
          >
            <Smile size={18} className="flex-shrink-0" />
            <span className="text-xs font-medium hidden sm:inline">Stickers</span>
          </button>
        )}
      </div>

      {/* Transformaciones y Zoom */}
      <div className="flex items-center gap-2">
        {onFlipHorizontal && (
          <button
            onClick={onFlipHorizontal}
            className="px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title="Voltear Horizontal"
          >
            <FlipHorizontal size={16} />
            <span className="hidden sm:inline">Voltear H</span>
          </button>
        )}
        {onFlipVertical && (
          <button
            onClick={onFlipVertical}
            className="px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title="Voltear Vertical"
          >
            <FlipVertical size={16} />
            <span className="hidden sm:inline">Voltear V</span>
          </button>
        )}
        {onResizeCanvas && (
          <button
            onClick={onResizeCanvas}
            className="px-3 py-2 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title="Redimensionar Canvas"
          >
            <Maximize2 size={16} />
            <span className="hidden sm:inline">Tamaño</span>
          </button>
        )}
        <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-2">
          <button
            onClick={onZoomOut}
            className="p-2 rounded text-gray-600 hover:bg-gray-100"
            title="Alejar"
          >
            <ZoomOut size={18} />
          </button>
          <span className="px-2 text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-2 rounded text-gray-600 hover:bg-gray-100"
            title="Acercar"
          >
            <ZoomIn size={18} />
          </button>
          {onZoomFit && (
            <button
              onClick={onZoomFit}
              className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
              title="Ajustar"
            >
              Ajustar
            </button>
          )}
          {onZoom100 && (
            <button
              onClick={onZoom100}
              className="px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-100"
              title="100%"
            >
              100%
            </button>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {onShowTemplates && (
          <button
            onClick={onShowTemplates}
            className="px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title="Plantillas (Ctrl+T)"
          >
            <span className="text-lg">📐</span>
            <span className="hidden sm:inline">Plantillas</span>
          </button>
        )}
        {onShowHistory && (
          <button
            onClick={onShowHistory}
            className="px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            title="Historial (Ctrl+H)"
          >
            <span className="text-lg">🕐</span>
            <span className="hidden sm:inline">Historial</span>
          </button>
        )}
        <button
          onClick={onUpload}
          className="px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Cargar</span>
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1.5 rounded text-sm font-medium text-white bg-[#FF6B35] hover:bg-[#FF6B35]/90 flex items-center gap-2"
          title="Guardar (Ctrl+S)"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Guardar</span>
        </button>
        <button
          onClick={onDownload}
          className="px-3 py-1.5 rounded text-sm font-medium text-white bg-black hover:bg-gray-800 flex items-center gap-2"
          title="Exportar (Ctrl+E)"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>
    </div>
  );
}
