import { useState } from "react";
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Image as ImageIcon,
  Package,
  Tag,
  DollarSign,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface ProductInfo {
  name: string;
  description: string;
  category: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  price?: number;
  cost?: number;
  images?: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  source: string;
}

interface ProductInfoFinderProps {
  onDataAccepted: (data: Partial<ProductInfo>) => void;
  initialQuery?: string;
}

export function ProductInfoFinder({
  onDataAccepted,
  initialQuery = "",
}: ProductInfoFinderProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ProductInfo[]>([]);
  const [selectedResult, setSelectedResult] = useState<ProductInfo | null>(null);
  const [showResults, setShowResults] = useState(false);

  async function searchProduct() {
    if (!query.trim()) {
      toast.error("Por favor ingresa un término de búsqueda");
      return;
    }

    setSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/product-search`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        
        if (data.results.length === 0) {
          toast.info("No se encontraron resultados");
        } else {
          toast.success(`Se encontraron ${data.results.length} resultados`);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      console.error("Error searching product:", error);
      toast.error(`Error en búsqueda: ${error.message}`);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function selectResult(result: ProductInfo) {
    setSelectedResult(result);
  }

  function acceptData() {
    if (!selectedResult) return;

    const dataToAccept: Partial<ProductInfo> = {
      name: selectedResult.name,
      description: selectedResult.description,
      category: selectedResult.category,
      brand: selectedResult.brand,
      sku: selectedResult.sku,
      barcode: selectedResult.barcode,
      price: selectedResult.price,
      cost: selectedResult.cost,
      images: selectedResult.images,
      specifications: selectedResult.specifications,
      tags: selectedResult.tags,
    };

    onDataAccepted(dataToAccept);
    toast.success("Información aplicada al producto");
    setShowResults(false);
    setSelectedResult(null);
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchProduct()}
            placeholder="Buscar información del producto (nombre, SKU, código de barras...)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={searchProduct}
          disabled={searching}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {searching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Buscar
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {searching ? (
              <div className="p-8 text-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Buscando información exhaustiva...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No se encontraron resultados</p>
                <p className="text-sm text-gray-500">
                  Intenta con otro término de búsqueda
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Results List */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">
                    {results.length} resultados encontrados - Selecciona uno para ver detalles
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-gray-200">
                  {/* Results List */}
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => selectResult(result)}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedResult === result
                            ? "bg-orange-50 border-l-4 border-orange-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            {result.images && result.images[0] ? (
                              <img
                                src={result.images[0]}
                                alt={result.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate mb-1">
                              {result.name}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {result.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="px-2 py-1 bg-gray-100 rounded">
                                {result.source}
                              </span>
                              {result.price && (
                                <span className="font-medium text-orange-600">
                                  ${result.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Selected Result Details */}
                  <div className="p-6 bg-gray-50 max-h-96 overflow-y-auto">
                    {selectedResult ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {selectedResult.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedResult.description}
                          </p>
                        </div>

                        {/* Images */}
                        {selectedResult.images && selectedResult.images.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Imágenes ({selectedResult.images.length})
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {selectedResult.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`${selectedResult.name} ${idx + 1}`}
                                  className="w-full h-20 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                          {selectedResult.brand && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Marca
                              </label>
                              <p className="text-sm text-gray-900">{selectedResult.brand}</p>
                            </div>
                          )}
                          {selectedResult.category && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Categoría
                              </label>
                              <p className="text-sm text-gray-900">{selectedResult.category}</p>
                            </div>
                          )}
                          {selectedResult.sku && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                SKU
                              </label>
                              <p className="text-sm text-gray-900">{selectedResult.sku}</p>
                            </div>
                          )}
                          {selectedResult.barcode && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Código de Barras
                              </label>
                              <p className="text-sm text-gray-900">{selectedResult.barcode}</p>
                            </div>
                          )}
                          {selectedResult.price && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Precio
                              </label>
                              <p className="text-sm font-medium text-orange-600">
                                ${selectedResult.price}
                              </p>
                            </div>
                          )}
                          {selectedResult.cost && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Costo
                              </label>
                              <p className="text-sm font-medium text-gray-900">
                                ${selectedResult.cost}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Specifications */}
                        {selectedResult.specifications && Object.keys(selectedResult.specifications).length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Especificaciones
                            </label>
                            <div className="space-y-2">
                              {Object.entries(selectedResult.specifications).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{key}:</span>
                                  <span className="text-gray-900 font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {selectedResult.tags && selectedResult.tags.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Etiquetas
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {selectedResult.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Source */}
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Fuente: <span className="font-medium">{selectedResult.source}</span>
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={acceptData}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aceptar y Aplicar
                          </button>
                          <button
                            onClick={() => setSelectedResult(null)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">
                          Selecciona un resultado para ver los detalles
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
