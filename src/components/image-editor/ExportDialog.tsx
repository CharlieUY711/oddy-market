import { useState } from "react";
import { X, Download } from "lucide-react";

interface ExportDialogProps {
  onExport: (config: {
    format: "png" | "jpg" | "webp";
    quality: number;
    scale: number;
    width?: number;
    height?: number;
  }) => void;
  onClose: () => void;
  currentWidth: number;
  currentHeight: number;
}

export function ExportDialog({
  onExport,
  onClose,
  currentWidth,
  currentHeight,
}: ExportDialogProps) {
  const [format, setFormat] = useState<"png" | "jpg" | "webp">("png");
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(1);
  const [customSize, setCustomSize] = useState(false);
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [maintainAspect, setMaintainAspect] = useState(true);

  const handleExport = () => {
    onExport({
      format,
      quality,
      scale,
      width: customSize ? width : undefined,
      height: customSize ? height : undefined,
    });
    onClose();
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspect) {
      const aspectRatio = currentHeight / currentWidth;
      setHeight(Math.round(newWidth * aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspect) {
      const aspectRatio = currentWidth / currentHeight;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Exportar Imagen</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <div className="grid grid-cols-3 gap-2">
              {(["png", "jpg", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`
                    px-4 py-2 rounded border-2 text-sm font-medium transition-colors
                    ${format === fmt
                      ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"}
                  `}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {(format === "jpg" || format === "webp") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Calidad</label>
                <span className="text-xs text-gray-500">{quality}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Escala</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`
                    px-3 py-2 rounded border-2 text-sm font-medium transition-colors
                    ${scale === s
                      ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"}
                  `}
                >
                  {s}x
                </button>
              ))}
              <input
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                className="px-3 py-2 rounded border-2 border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="Custom"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={customSize}
                onChange={(e) => setCustomSize(e.target.checked)}
                className="w-4 h-4 text-[#FF6B35] rounded focus:ring-[#FF6B35]"
              />
              <span className="text-sm font-medium text-gray-700">Tamaño personalizado</span>
            </label>
            {customSize && (
              <div className="space-y-3 pl-6">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-12">Ancho</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    min="1"
                  />
                  <span className="text-xs text-gray-500">px</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-12">Alto</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    min="1"
                  />
                  <span className="text-xs text-gray-500">px</span>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                    className="w-4 h-4 text-[#FF6B35] rounded focus:ring-[#FF6B35]"
                  />
                  <span className="text-xs text-gray-500">Mantener proporción</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90 flex items-center gap-2"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
}
