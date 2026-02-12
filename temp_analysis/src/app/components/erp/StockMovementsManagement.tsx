import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Plus,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Edit,
  Trash2,
  X,
  Check,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface StockMovement {
  id: string;
  type: "supplier_invoice" | "credit_note" | "delivery_note" | "adjustment";
  documentNumber: string;
  supplierId?: string;
  supplierName?: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    cost?: number;
  }[];
  totalAmount?: number;
  notes?: string;
  documentFile?: string;
  createdAt: string;
  createdBy: string;
}

export function StockMovementsManagement() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [formData, setFormData] = useState({
    type: "supplier_invoice" as StockMovement["type"],
    documentNumber: "",
    supplierId: "",
    supplierName: "",
    date: new Date().toISOString().split("T")[0],
    items: [] as { productId: string; productName: string; quantity: number; cost: number }[],
    totalAmount: 0,
    notes: "",
    documentFile: "",
  });

  useEffect(() => {
    loadMovements();
    loadSuppliers();
    loadProducts();
  }, []);

  async function loadMovements() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/stock-movements`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMovements(data.movements || []);
      }
    } catch (error) {
      console.error("Error loading movements:", error);
      toast.error("Error al cargar movimientos");
    } finally {
      setLoading(false);
    }
  }

  async function loadSuppliers() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/suppliers`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  }

  async function loadProducts() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/products`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "make-0dd48dc4-documents");
      formData.append("path", `stock-movements/${Date.now()}-${file.name}`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, documentFile: data.url });
        toast.success("Documento subido correctamente");
      } else {
        toast.error("Error al subir documento");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error al subir documento");
    } finally {
      setUploadingFile(false);
    }
  }

  function addItem() {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: "", productName: "", quantity: 1, cost: 0 },
      ],
    });
  }

  function updateItem(index: number, field: string, value: any) {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Update product name if product changed
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].cost = product.cost || 0;
      }
    }

    setFormData({ ...formData, items: updatedItems });
  }

  function removeItem(index: number) {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  }

  async function handleSubmit() {
    if (!formData.documentNumber) {
      toast.error("El número de documento es requerido");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Debe agregar al menos un item");
      return;
    }

    // Calculate total
    const totalAmount = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.cost,
      0
    );

    const movementData = {
      ...formData,
      totalAmount,
      supplierName:
        suppliers.find((s) => s.id === formData.supplierId)?.name || "",
    };

    try {
      const url = editingMovement
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/stock-movements/${editingMovement.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/stock-movements`;

      const response = await fetch(url, {
        method: editingMovement ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(movementData),
      });

      if (response.ok) {
        toast.success(
          editingMovement
            ? "Movimiento actualizado"
            : "Movimiento creado y stock actualizado"
        );
        closeModal();
        loadMovements();
      } else {
        toast.error("Error al guardar movimiento");
      }
    } catch (error) {
      console.error("Error saving movement:", error);
      toast.error("Error al guardar movimiento");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este movimiento? Esto revertirá el cambio de stock.")) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/stock-movements/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Movimiento eliminado");
        loadMovements();
      } else {
        toast.error("Error al eliminar movimiento");
      }
    } catch (error) {
      console.error("Error deleting movement:", error);
      toast.error("Error al eliminar movimiento");
    }
  }

  function openModal(movement?: StockMovement) {
    if (movement) {
      setEditingMovement(movement);
      setFormData({
        type: movement.type,
        documentNumber: movement.documentNumber,
        supplierId: movement.supplierId || "",
        supplierName: movement.supplierName || "",
        date: movement.date,
        items: movement.items,
        totalAmount: movement.totalAmount || 0,
        notes: movement.notes || "",
        documentFile: movement.documentFile || "",
      });
    } else {
      setEditingMovement(null);
      setFormData({
        type: "supplier_invoice",
        documentNumber: "",
        supplierId: "",
        supplierName: "",
        date: new Date().toISOString().split("T")[0],
        items: [],
        totalAmount: 0,
        notes: "",
        documentFile: "",
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingMovement(null);
  }

  const getTypeLabel = (type: StockMovement["type"]) => {
    const labels = {
      supplier_invoice: "Factura Proveedor",
      credit_note: "Nota de Crédito",
      delivery_note: "Remito",
      adjustment: "Ajuste Manual",
    };
    return labels[type];
  };

  const getTypeColor = (type: StockMovement["type"]) => {
    const colors = {
      supplier_invoice: "text-green-600 bg-green-50",
      credit_note: "text-red-600 bg-red-50",
      delivery_note: "text-blue-600 bg-blue-50",
      adjustment: "text-orange-600 bg-orange-50",
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Movimientos de Stock</h3>
          <p className="text-sm text-muted-foreground">
            Ingreso de documentos y ajustes de inventario
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Movimiento
        </button>
      </div>

      {/* Movements List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-border">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No hay movimientos registrados</p>
          <button
            onClick={() => openModal()}
            className="mt-4 text-primary hover:underline"
          >
            Crear primer movimiento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="bg-white p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getTypeColor(
                        movement.type
                      )}`}
                    >
                      {getTypeLabel(movement.type)}
                    </span>
                    <span className="font-bold text-lg">
                      {movement.documentNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(movement.date).toLocaleDateString()}
                    </div>
                    {movement.supplierName && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {movement.supplierName}
                      </div>
                    )}
                    {movement.totalAmount && (
                      <div className="flex items-center gap-1 font-medium text-green-600">
                        ${(movement.totalAmount / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {movement.documentFile && (
                    <a
                      href={movement.documentFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver documento"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => openModal(movement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(movement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium mb-2">
                  Items ({movement.items.length})
                </p>
                <div className="space-y-1">
                  {movement.items.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.productName}
                      </span>
                      <span className="font-medium">
                        {item.quantity > 0 ? "+" : ""}
                        {item.quantity} unidades
                        {item.cost && (
                          <span className="text-muted-foreground ml-2">
                            @ ${(item.cost / 100).toFixed(2)}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  {movement.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{movement.items.length - 3} items más
                    </p>
                  )}
                </div>
              </div>

              {movement.notes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">{movement.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full my-8"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingMovement
                    ? "Editar Movimiento"
                    : "Nuevo Movimiento de Stock"}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Type and Document Number */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tipo de Documento *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as StockMovement["type"],
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    >
                      <option value="supplier_invoice">Factura Proveedor</option>
                      <option value="credit_note">Nota de Crédito</option>
                      <option value="delivery_note">Remito</option>
                      <option value="adjustment">Ajuste Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      value={formData.documentNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, documentNumber: e.target.value })
                      }
                      placeholder="Ej: FAC-0001"
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    />
                  </div>
                </div>

                {/* Supplier and Date */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proveedor
                    </label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) =>
                        setFormData({ ...formData, supplierId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    >
                      <option value="">Seleccionar proveedor</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Adjuntar Documento (PDF, imagen)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.documentFile}
                      onChange={(e) =>
                        setFormData({ ...formData, documentFile: e.target.value })
                      }
                      placeholder="URL del documento"
                      className="flex-1 px-3 py-2 border border-border rounded-lg"
                    />
                    <label className="px-4 py-2 bg-secondary text-white rounded-lg cursor-pointer hover:bg-secondary/90 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {uploadingFile ? "..." : "Subir"}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                    </label>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Items *</label>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1 grid md:grid-cols-4 gap-2">
                          <div className="md:col-span-2">
                            <select
                              value={item.productId}
                              onChange={(e) =>
                                updateItem(index, "productId", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-border rounded text-sm"
                            >
                              <option value="">Seleccionar producto</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="Cantidad"
                              className="w-full px-2 py-1 border border-border rounded text-sm"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={item.cost / 100}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "cost",
                                  Math.round(parseFloat(e.target.value) * 100) || 0
                                )
                              }
                              placeholder="Costo"
                              step="0.01"
                              className="w-full px-2 py-1 border border-border rounded text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notas / Observaciones
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="Información adicional..."
                    className="w-full px-3 py-2 border border-border rounded-lg resize-none"
                  />
                </div>

                {/* Total Preview */}
                {formData.items.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total Estimado:</span>
                      <span className="text-green-600">
                        $
                        {(
                          formData.items.reduce(
                            (sum, item) => sum + item.quantity * item.cost,
                            0
                          ) / 100
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  {editingMovement ? "Actualizar" : "Crear Movimiento"}
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 border border-border py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
