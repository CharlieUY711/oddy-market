import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Eye,
  Send,
  Check,
  X,
  Package,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: "draft" | "sent" | "confirmed" | "received" | "cancelled";
  orderDate: string;
  expectedDate: string;
  receivedDate?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  createdAt: string;
}

export function PurchaseOrdersManagement() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDate: "",
    items: [] as PurchaseOrderItem[],
    notes: "",
  });

  useEffect(() => {
    loadOrders();
    loadSuppliers();
  }, []);

  async function loadOrders() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/purchase-orders`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error loading purchase orders:", error);
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

  async function saveOrder() {
    if (!formData.supplierId || formData.items.length === 0) {
      toast.error("Selecciona un proveedor y agrega al menos un producto");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/purchase-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Orden de compra creada");
        loadOrders();
        closeModal();
      } else {
        toast.error("Error al crear orden");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Error al crear orden");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(id: string, status: PurchaseOrder["status"]) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/purchase-orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        toast.success("Estado actualizado");
        loadOrders();
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar estado");
    }
  }

  function addItem() {
    const newItem: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      productId: "",
      productName: "",
      quantity: 1,
      unitCost: 0,
      total: 0,
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  }

  function updateItem(id: string, updates: Partial<PurchaseOrderItem>) {
    setFormData({
      ...formData,
      items: formData.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.total = updated.quantity * updated.unitCost;
          return updated;
        }
        return item;
      }),
    });
  }

  function removeItem(id: string) {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== id),
    });
  }

  function closeModal() {
    setShowModal(false);
    setFormData({
      supplierId: "",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate: "",
      items: [],
      notes: "",
    });
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "sent":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-purple-100 text-purple-700";
      case "received":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "draft":
        return "Borrador";
      case "sent":
        return "Enviada";
      case "confirmed":
        return "Confirmada";
      case "received":
        return "Recibida";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.22; // 22% IVA Uruguay
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Órdenes de Compra</h3>
          <p className="text-sm text-muted-foreground">
            {filteredOrders.length} órdenes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Orden de Compra
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número o proveedor..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="sent">Enviada</option>
          <option value="confirmed">Confirmada</option>
          <option value="received">Recibida</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg border border-border"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-lg">{order.orderNumber}</h4>
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Proveedor: {order.supplierName}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {order.items.length} productos
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {order.status === "draft" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "sent")}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </button>
                )}
                {order.status === "sent" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "confirmed")}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Confirmar
                  </button>
                )}
                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "received")}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    Recibir
                  </button>
                )}
                <button
                  onClick={() => setViewingOrder(order)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron órdenes de compra
        </div>
      )}

      {/* Create Order Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">Nueva Orden de Compra</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proveedor *
                    </label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) =>
                        setFormData({ ...formData, supplierId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seleccionar...</option>
                      {suppliers.filter(s => s.active).map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fecha de Orden
                    </label>
                    <input
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) =>
                        setFormData({ ...formData, orderDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fecha Esperada
                    </label>
                    <input
                      type="date"
                      value={formData.expectedDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expectedDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">Productos</h3>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Producto
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-3 items-center p-3 border border-border rounded-lg"
                      >
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) =>
                            updateItem(item.id, { productName: e.target.value })
                          }
                          placeholder="Nombre del producto"
                          className="col-span-5 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, {
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="Cant."
                          className="col-span-2 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) =>
                            updateItem(item.id, {
                              unitCost: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Costo"
                          className="col-span-2 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                        <div className="col-span-2 text-sm font-medium">
                          ${item.total.toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {formData.items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No hay productos agregados
                    </div>
                  )}
                </div>

                {/* Totals */}
                {formData.items.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>IVA (22%):</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveOrder}
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : "Crear Orden"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 border border-border py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Order Modal */}
      <AnimatePresence>
        {viewingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold">{viewingOrder.orderNumber}</h2>
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(viewingOrder.status)}`}>
                    {getStatusLabel(viewingOrder.status)}
                  </span>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Proveedor</p>
                    <p className="font-medium">{viewingOrder.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fecha de Orden</p>
                    <p className="font-medium">
                      {new Date(viewingOrder.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-3">Productos</h3>
                  <div className="space-y-2">
                    {viewingOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x ${item.unitCost.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-bold">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${viewingOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
