import { useState } from "react";
import {
  CheckSquare,
  Square,
  Trash2,
  Edit,
  Copy,
  Tag,
  Package,
  DollarSign,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface BatchItem {
  id: string;
  type: "product" | "category" | "department";
  name: string;
  selected: boolean;
}

interface BatchActionsManagerProps {
  items: BatchItem[];
  onItemsUpdated: () => void;
}

export function BatchActionsManager({
  items,
  onItemsUpdated,
}: BatchActionsManagerProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showActions, setShowActions] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [batchData, setBatchData] = useState<any>({});
  const [processing, setProcessing] = useState(false);

  const selectedCount = selectedItems.size;
  const allSelected = selectedItems.size === items.length && items.length > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  }

  function toggleSelectItem(itemId: string) {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  }

  async function applyBatchAction() {
    if (!actionType) {
      toast.error("Selecciona una acción");
      return;
    }

    if (selectedItems.size === 0) {
      toast.error("Selecciona al menos un elemento");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/batch-actions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: actionType,
            itemIds: Array.from(selectedItems),
            data: batchData,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(`Acción aplicada a ${result.updated} elementos`);
        setSelectedItems(new Set());
        setShowActions(false);
        setActionType(null);
        setBatchData({});
        onItemsUpdated();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      console.error("Error applying batch action:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  }

  function cancelBatchAction() {
    setShowActions(false);
    setActionType(null);
    setBatchData({});
  }

  return (
    <div className="space-y-4">
      {/* Selection Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-5 h-5 text-orange-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
              </span>
            </button>
            {selectedCount > 0 && (
              <span className="text-sm text-gray-600">
                {selectedCount} elemento(s) seleccionado(s)
              </span>
            )}
          </div>

          {selectedCount > 0 && (
            <button
              onClick={() => setShowActions(!showActions)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2"
            >
              Acciones en lote
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showActions ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Items List with Checkboxes */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
              selectedItems.has(item.id)
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleSelectItem(item.id)}
                className="flex-shrink-0"
              >
                {selectedItems.has(item.id) ? (
                  <CheckSquare className="w-5 h-5 text-orange-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500 capitalize">{item.type}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Batch Actions Panel */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Acciones en Lote
                </h3>
                <button
                  onClick={cancelBatchAction}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Acción
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setActionType("update-price")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      actionType === "update-price"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Actualizar Precio
                    </p>
                  </button>

                  <button
                    onClick={() => setActionType("update-category")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      actionType === "update-category"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Tag className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Cambiar Categoría
                    </p>
                  </button>

                  <button
                    onClick={() => setActionType("update-stock")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      actionType === "update-stock"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Package className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Ajustar Stock
                    </p>
                  </button>

                  <button
                    onClick={() => setActionType("update-sync")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      actionType === "update-sync"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Globe className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Sincronización
                    </p>
                  </button>

                  <button
                    onClick={() => setActionType("visibility")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      actionType === "visibility"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Eye className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Visibilidad
                    </p>
                  </button>

                  <button
                    onClick={() => setActionType("duplicate")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      actionType === "duplicate"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Copy className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Duplicar
                    </p>
                  </button>

                  <button
                    onClick={() => setActionType("edit-tags")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      actionType === "edit-tags"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Tag className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Editar Tags
                    </p>
                  </button>

                  <button
                    onClick={() => setActionType("delete")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      actionType === "delete"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Trash2 className="w-6 h-6 mx-auto mb-2 text-red-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Eliminar
                    </p>
                  </button>
                </div>
              </div>

              {/* Action-specific Forms */}
              {actionType === "update-price" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Precio
                    </label>
                    <select
                      value={batchData.priceType || ""}
                      onChange={(e) =>
                        setBatchData({ ...batchData, priceType: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="principal">Principal</option>
                      <option value="oferta">Oferta</option>
                      <option value="alternativo">Alternativo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Acción
                    </label>
                    <select
                      value={batchData.priceAction || ""}
                      onChange={(e) =>
                        setBatchData({ ...batchData, priceAction: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="set">Establecer precio fijo</option>
                      <option value="increase-percent">Aumentar %</option>
                      <option value="decrease-percent">Disminuir %</option>
                      <option value="increase-amount">Aumentar monto</option>
                      <option value="decrease-amount">Disminuir monto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor
                    </label>
                    <input
                      type="number"
                      value={batchData.priceValue || ""}
                      onChange={(e) =>
                        setBatchData({ ...batchData, priceValue: e.target.value })
                      }
                      placeholder="Ingresa el valor"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {actionType === "update-category" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Categoría
                  </label>
                  <select
                    value={batchData.category || ""}
                    onChange={(e) =>
                      setBatchData({ ...batchData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría...</option>
                    <option value="electronics">Electrónica</option>
                    <option value="clothing">Ropa</option>
                    <option value="home">Hogar</option>
                    <option value="sports">Deportes</option>
                  </select>
                </div>
              )}

              {actionType === "update-stock" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Acción de Stock
                    </label>
                    <select
                      value={batchData.stockAction || ""}
                      onChange={(e) =>
                        setBatchData({ ...batchData, stockAction: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="set">Establecer cantidad</option>
                      <option value="add">Agregar</option>
                      <option value="subtract">Restar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      value={batchData.stockValue || ""}
                      onChange={(e) =>
                        setBatchData({ ...batchData, stockValue: e.target.value })
                      }
                      placeholder="Ingresa la cantidad"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {actionType === "update-sync" && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canales de Sincronización
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={batchData.syncMercadoLibre || false}
                        onChange={(e) =>
                          setBatchData({
                            ...batchData,
                            syncMercadoLibre: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Mercado Libre</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={batchData.syncFacebook || false}
                        onChange={(e) =>
                          setBatchData({
                            ...batchData,
                            syncFacebook: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Facebook Shops</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={batchData.syncInstagram || false}
                        onChange={(e) =>
                          setBatchData({
                            ...batchData,
                            syncInstagram: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Instagram Shopping</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={batchData.syncWhatsApp || false}
                        onChange={(e) =>
                          setBatchData({
                            ...batchData,
                            syncWhatsApp: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">WhatsApp Business</span>
                    </label>
                  </div>
                </div>
              )}

              {actionType === "visibility" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Visibilidad
                  </label>
                  <select
                    value={batchData.visibility || ""}
                    onChange={(e) =>
                      setBatchData({ ...batchData, visibility: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="visible">Visible</option>
                    <option value="hidden">Oculto</option>
                  </select>
                </div>
              )}

              {actionType === "edit-tags" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={batchData.tags || ""}
                    onChange={(e) =>
                      setBatchData({ ...batchData, tags: e.target.value })
                    }
                    placeholder="nuevo, promoción, destacado"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}

              {actionType === "delete" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">
                    ⚠️ Esta acción eliminará permanentemente {selectedCount} elemento(s).
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={cancelBatchAction}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyBatchAction}
                  disabled={processing || !actionType}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-all disabled:opacity-50 ${
                    actionType === "delete"
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  }`}
                >
                  {processing
                    ? "Procesando..."
                    : `Aplicar a ${selectedCount} elemento(s)`}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
