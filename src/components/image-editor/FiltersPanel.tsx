import { useState } from "react";
import { X, RotateCcw } from "lucide-react";

interface Filter {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
}

interface FiltersPanelProps {
  onApply: (filters: Filter) => void;
  onClose: () => void;
  initialFilters?: Filter;
}

export function FiltersPanel({ onApply, onClose, initialFilters }: FiltersPanelProps) {
  const [filters, setFilters] = useState<Filter>(initialFilters || {});

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApply(filters);
  };

  const presetFilters = {
    vintage: { brightness: -10, contrast: 15, saturation: -20, sepia: true },
    warm: { brightness: 5, saturation: 20, hue: 10 },
    cool: { brightness: 5, saturation: 15, hue: -15 },
    dramatic: { contrast: 30, saturation: 25 },
    bw: { grayscale: true, contrast: 10 },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filtros y Efectos</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Ajustes Básicos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Ajustes Básicos</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Brillo</label>
                  <span className="text-xs text-gray-500">{filters.brightness || 0}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.brightness || 0}
                  onChange={(e) => setFilters({ ...filters, brightness: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Contraste</label>
                  <span className="text-xs text-gray-500">{filters.contrast || 0}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.contrast || 0}
                  onChange={(e) => setFilters({ ...filters, contrast: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Saturación</label>
                  <span className="text-xs text-gray-500">{filters.saturation || 0}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.saturation || 0}
                  onChange={(e) => setFilters({ ...filters, saturation: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Tono</label>
                  <span className="text-xs text-gray-500">{filters.hue || 0}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={filters.hue || 0}
                  onChange={(e) => setFilters({ ...filters, hue: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Efectos Avanzados */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Efectos Avanzados</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Desenfoque</label>
                  <span className="text-xs text-gray-500">{filters.blur || 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filters.blur || 0}
                  onChange={(e) => setFilters({ ...filters, blur: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sharpen || false}
                    onChange={(e) => setFilters({ ...filters, sharpen: e.target.checked })}
                    className="w-4 h-4 text-[#FF6B35] rounded"
                  />
                  <span className="text-sm text-gray-700">Nitidez</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.grayscale || false}
                    onChange={(e) => setFilters({ ...filters, grayscale: e.target.checked })}
                    className="w-4 h-4 text-[#FF6B35] rounded"
                  />
                  <span className="text-sm text-gray-700">Escala de Grises</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sepia || false}
                    onChange={(e) => setFilters({ ...filters, sepia: e.target.checked })}
                    className="w-4 h-4 text-[#FF6B35] rounded"
                  />
                  <span className="text-sm text-gray-700">Sepia</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.invert || false}
                    onChange={(e) => setFilters({ ...filters, invert: e.target.checked })}
                    className="w-4 h-4 text-[#FF6B35] rounded"
                  />
                  <span className="text-sm text-gray-700">Invertir</span>
                </label>
              </div>
            </div>
          </div>

          {/* Filtros Predefinidos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtros Predefinidos</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(presetFilters).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => setFilters(preset)}
                  className="px-3 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 capitalize"
                >
                  {name === "bw" ? "B&W" : name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Resetear
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
