import { X, RotateCcw, RotateCw } from "lucide-react";

interface HistoryEntry {
  id: string;
  action: string;
  timestamp: Date;
  description: string;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  currentIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onRestore: (index: number) => void;
  onClose: () => void;
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export function HistoryPanel({
  history,
  currentIndex,
  onUndo,
  onRedo,
  onRestore,
  onClose,
}: HistoryPanelProps) {
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Historial</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              px-4 py-2 rounded flex items-center gap-2 text-sm font-medium
              ${canUndo
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"}
            `}
          >
            <RotateCcw size={16} />
            Deshacer
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              px-4 py-2 rounded flex items-center gap-2 text-sm font-medium
              ${canRedo
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"}
            `}
          >
            <RotateCw size={16} />
            Rehacer
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No hay historial</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry, index) => (
                <button
                  key={entry.id}
                  onClick={() => onRestore(index)}
                  className={`
                    w-full p-3 rounded-lg border-2 text-left transition-colors
                    ${index === currentIndex
                      ? "border-[#FF6B35] bg-[#FF6B35]/5"
                      : index < currentIndex
                      ? "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      : "border-gray-100 bg-gray-50 opacity-60"}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{entry.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{entry.description}</p>
                    </div>
                    <div className="text-xs text-gray-400 ml-4">
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                  {index === currentIndex && (
                    <div className="mt-2 text-xs text-[#FF6B35] font-medium">
                      Estado actual
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {history.length} acción{history.length !== 1 ? "es" : ""} en el historial
          </p>
        </div>
      </div>
    </div>
  );
}
