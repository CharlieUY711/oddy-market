import { useState } from "react";
import { X, Search } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
}

interface TemplatesGalleryProps {
  onTemplateSelect: (template: Template) => void;
  onClose: () => void;
}

const TEMPLATE_CATEGORIES = ["social", "banner", "product", "flyer", "card", "custom"];

const TEMPLATES: Template[] = [
  { id: "instagram-post", name: "Instagram Post", category: "social", width: 1080, height: 1080 },
  { id: "instagram-story", name: "Instagram Story", category: "social", width: 1080, height: 1920 },
  { id: "facebook-cover", name: "Facebook Cover", category: "social", width: 820, height: 312 },
  { id: "twitter-header", name: "Twitter Header", category: "social", width: 1500, height: 500 },
  { id: "banner-web", name: "Banner Web", category: "banner", width: 1200, height: 628 },
  { id: "product-square", name: "Producto Cuadrado", category: "product", width: 1080, height: 1080 },
  { id: "flyer-a4", name: "Volante A4", category: "flyer", width: 2480, height: 3508 },
  { id: "card-business", name: "Tarjeta de Negocio", category: "card", width: 1050, height: 600 },
];

export function TemplatesGallery({ onTemplateSelect, onClose }: TemplatesGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Plantillas</h2>
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
              placeholder="Buscar plantillas..."
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
              Todas
            </button>
            {TEMPLATE_CATEGORIES.map((category) => (
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
          {filteredTemplates.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No se encontraron plantillas</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onTemplateSelect(template);
                    onClose();
                  }}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-colors text-left"
                >
                  <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">
                      {template.width} × {template.height}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{template.category}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
