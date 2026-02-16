import { useState } from "react";
import { X, Search } from "lucide-react";

interface Sticker {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface StickersPanelProps {
  onStickerSelect: (sticker: Sticker) => void;
  onClose: () => void;
}

const STICKER_CATEGORIES = ["emoji", "shape", "icon", "decoration", "badge", "arrow", "frame"];

const EXAMPLE_STICKERS: Sticker[] = [
  { id: "emoji-1", name: "😀", url: "😀", category: "emoji" },
  { id: "emoji-2", name: "😊", url: "😊", category: "emoji" },
  { id: "emoji-3", name: "❤️", url: "❤️", category: "emoji" },
  { id: "emoji-4", name: "⭐", url: "⭐", category: "emoji" },
  { id: "emoji-5", name: "🎉", url: "🎉", category: "emoji" },
  { id: "emoji-6", name: "🔥", url: "🔥", category: "emoji" },
  { id: "shape-1", name: "Corazón", url: "❤️", category: "shape" },
  { id: "shape-2", name: "Estrella", url: "⭐", category: "shape" },
  { id: "icon-1", name: "Check", url: "✓", category: "icon" },
  { id: "icon-2", name: "X", url: "✗", category: "icon" },
];

export function StickersPanel({ onStickerSelect, onClose }: StickersPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredStickers = EXAMPLE_STICKERS.filter((sticker) => {
    const matchesSearch = sticker.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || sticker.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Stickers y Elementos</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar stickers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedCategory === null
                  ? "bg-[#FF6B35] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            {STICKER_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded text-sm font-medium capitalize ${
                  selectedCategory === category
                    ? "bg-[#FF6B35] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredStickers.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No se encontraron stickers</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-4">
              {filteredStickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => {
                    onStickerSelect(sticker);
                    onClose();
                  }}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-colors flex flex-col items-center justify-center aspect-square"
                  title={sticker.name}
                >
                  <span className="text-4xl mb-2">{sticker.url}</span>
                  <span className="text-xs text-gray-600 text-center truncate w-full">
                    {sticker.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
