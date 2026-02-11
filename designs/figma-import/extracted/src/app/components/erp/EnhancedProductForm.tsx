import { useState, useEffect } from "react";
import {
  Package,
  DollarSign,
  Calendar,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ProductInfoFinder } from "./ProductInfoFinder";

interface PriceEntry {
  id: string;
  type: "principal" | "oferta" | "alternativo";
  amount: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

interface SyncChannels {
  mercadolibre: boolean;
  facebook: boolean;
  instagram: boolean;
  whatsapp: boolean;
  fullSync: boolean;
}

interface EnhancedProductFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function EnhancedProductForm({
  initialData,
  onSave,
  onCancel,
}: EnhancedProductFormProps) {
  const [showInfoFinder, setShowInfoFinder] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    brand: initialData?.brand || "",
    sku: initialData?.sku || "",
    barcode: initialData?.barcode || "",
    stock: initialData?.stock || 0,
    cost: initialData?.cost || 0,
    images: initialData?.images || [],
    tags: initialData?.tags || [],
  });

  const [prices, setPrices] = useState<PriceEntry[]>(
    initialData?.prices || [
      {
        id: "1",
        type: "principal",
        amount: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        active: true,
      },
      {
        id: "2",
        type: "oferta",
        amount: 0,
        startDate: "",
        endDate: "",
        active: false,
      },
      {
        id: "3",
        type: "alternativo",
        amount: 0,
        startDate: "",
        endDate: "",
        active: false,
      },
    ]
  );

  const [syncChannels, setSyncChannels] = useState<SyncChannels>(
    initialData?.syncChannels || {
      mercadolibre: true,
      facebook: false,
      instagram: false,
      whatsapp: false,
      fullSync: false,
    }
  );

  // Auto-toggle fullSync
  useEffect(() => {
    const allChannelsEnabled =
      syncChannels.mercadolibre &&
      syncChannels.facebook &&
      syncChannels.instagram &&
      syncChannels.whatsapp;

    if (allChannelsEnabled !== syncChannels.fullSync) {
      setSyncChannels((prev) => ({ ...prev, fullSync: allChannelsEnabled }));
    }
  }, [
    syncChannels.mercadolibre,
    syncChannels.facebook,
    syncChannels.instagram,
    syncChannels.whatsapp,
  ]);

  function handleFullSyncToggle() {
    const newFullSync = !syncChannels.fullSync;
    setSyncChannels({
      mercadolibre: newFullSync,
      facebook: newFullSync,
      instagram: newFullSync,
      whatsapp: newFullSync,
      fullSync: newFullSync,
    });
  }

  function addPrice() {
    if (prices.length >= 9) {
      toast.error("Máximo 9 precios permitidos");
      return;
    }

    const newPrice: PriceEntry = {
      id: Date.now().toString(),
      type: "alternativo",
      amount: 0,
      startDate: "",
      endDate: "",
      active: false,
    };

    setPrices([...prices, newPrice]);
  }

  function removePrice(priceId: string) {
    if (prices.length <= 1) {
      toast.error("Debe haber al menos un precio");
      return;
    }

    setPrices(prices.filter((p) => p.id !== priceId));
  }

  function updatePrice(priceId: string, updates: Partial<PriceEntry>) {
    setPrices(
      prices.map((p) => (p.id === priceId ? { ...p, ...updates } : p))
    );
  }

  function handleInfoFinderData(data: any) {
    setFormData((prev) => ({
      ...prev,
      name: data.name || prev.name,
      description: data.description || prev.description,
      category: data.category || prev.category,
      brand: data.brand || prev.brand,
      sku: data.sku || prev.sku,
      barcode: data.barcode || prev.barcode,
      images: data.images || prev.images,
      tags: data.tags || prev.tags,
    }));

    if (data.price) {
      updatePrice(prices[0].id, { amount: data.price });
    }

    if (data.cost) {
      setFormData((prev) => ({ ...prev, cost: data.cost }));
    }

    setShowInfoFinder(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("El nombre del producto es requerido");
      return;
    }

    if (prices.filter((p) => p.active).length === 0) {
      toast.error("Debe haber al menos un precio activo");
      return;
    }

    const productData = {
      ...formData,
      prices,
      syncChannels,
      updatedAt: new Date().toISOString(),
    };

    onSave(productData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Info Finder */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              Buscador de Información
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowInfoFinder(!showInfoFinder)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {showInfoFinder ? "Cerrar" : "Buscar Información"}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Busca información exhaustiva del producto y valida antes de aplicar
        </p>

        {showInfoFinder && (
          <div className="mt-4">
            <ProductInfoFinder
              onDataAccepted={handleInfoFinderData}
              initialQuery={formData.name || formData.sku || ""}
            />
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-600" />
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Barras
            </label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Actual
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Multiple Prices */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            Precios ({prices.length}/9)
          </h3>
          <button
            type="button"
            onClick={addPrice}
            disabled={prices.length >= 9}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Precio
          </button>
        </div>

        <div className="space-y-4">
          {prices.map((price, index) => (
            <motion.div
              key={price.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <select
                      value={price.type}
                      onChange={(e) =>
                        updatePrice(price.id, {
                          type: e.target.value as any,
                        })
                      }
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="principal">Principal</option>
                      <option value="oferta">Oferta</option>
                      <option value="alternativo">Alternativo</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={price.active}
                      onChange={(e) =>
                        updatePrice(price.id, { active: e.target.checked })
                      }
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Activo</span>
                  </label>
                  {prices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrice(price.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Monto
                  </label>
                  <input
                    type="number"
                    value={price.amount}
                    onChange={(e) =>
                      updatePrice(price.id, {
                        amount: parseFloat(e.target.value),
                      })
                    }
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={price.startDate}
                    onChange={(e) =>
                      updatePrice(price.id, { startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={price.endDate}
                    onChange={(e) =>
                      updatePrice(price.id, { endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sync Channels */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-orange-600" />
          Sincronización de Canales
        </h3>

        <div className="space-y-3">
          {/* Full Sync Toggle */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={syncChannels.fullSync}
                onChange={handleFullSyncToggle}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <div>
                <span className="font-semibold text-gray-900">
                  Sincronización Completa
                </span>
                <p className="text-sm text-gray-600">
                  Sincronizar en todos los canales
                </p>
              </div>
            </label>
          </div>

          {/* Individual Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncChannels.mercadolibre}
                  onChange={(e) =>
                    setSyncChannels({
                      ...syncChannels,
                      mercadolibre: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Mercado Libre</span>
                  <p className="text-xs text-gray-600">Por defecto activado</p>
                </div>
              </label>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncChannels.facebook}
                  onChange={(e) =>
                    setSyncChannels({
                      ...syncChannels,
                      facebook: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Facebook Shops</span>
                  <p className="text-xs text-gray-600">Catálogo de productos</p>
                </div>
              </label>
            </div>

            <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncChannels.instagram}
                  onChange={(e) =>
                    setSyncChannels({
                      ...syncChannels,
                      instagram: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">
                    Instagram Shopping
                  </span>
                  <p className="text-xs text-gray-600">Tienda de Instagram</p>
                </div>
              </label>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncChannels.whatsapp}
                  onChange={(e) =>
                    setSyncChannels({
                      ...syncChannels,
                      whatsapp: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-900">
                    WhatsApp Business
                  </span>
                  <p className="text-xs text-gray-600">Catálogo de WhatsApp</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Guardar Producto
        </button>
      </div>
    </form>
  );
}
