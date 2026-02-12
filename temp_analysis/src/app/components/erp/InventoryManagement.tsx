import { useState, useEffect } from "react";
import {
  Warehouse,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
  Edit,
  History,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  unitPrice: number;
  location: string;
  warehouse: string;
  lastMovement: string;
  status: "normal" | "low" | "critical" | "overstock";
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference: string;
  user: string;
  date: string;
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [movementForm, setMovementForm] = useState({
    itemId: "",
    type: "in" as "in" | "out" | "adjustment",
    quantity: 0,
    reason: "",
    reference: "",
  });

  useEffect(() => {
    loadInventory();
    loadMovements();
  }, []);

  async function loadInventory() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/inventory`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory || []);
      }
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
  }

  async function loadMovements() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/inventory/movements`,
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
    }
  }

  async function saveMovement() {
    if (!movementForm.itemId || !movementForm.quantity) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/inventory/movements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(movementForm),
        }
      );

      if (response.ok) {
        toast.success("Movimiento registrado");
        loadInventory();
        loadMovements();
        setShowMovementModal(false);
        setMovementForm({
          itemId: "",
          type: "in",
          quantity: 0,
          reason: "",
          reference: "",
        });
      } else {
        toast.error("Error al registrar movimiento");
      }
    } catch (error) {
      console.error("Error saving movement:", error);
      toast.error("Error al registrar movimiento");
    }
  }

  function getStatusColor(status: InventoryItem["status"]) {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "low":
        return "bg-yellow-100 text-yellow-700";
      case "overstock":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-green-100 text-green-700";
    }
  }

  function getStatusLabel(status: InventoryItem["status"]) {
    switch (status) {
      case "critical":
        return "Crítico";
      case "low":
        return "Bajo";
      case "overstock":
        return "Exceso";
      default:
        return "Normal";
    }
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter((i) => i.status === "low" || i.status === "critical").length,
    totalValue: inventory.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0),
    criticalItems: inventory.filter((i) => i.status === "critical").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold">Control de Inventario</h3>
        <p className="text-sm text-muted-foreground">
          Gestión avanzada de stock y movimientos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <div className="text-sm text-muted-foreground">Productos</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">{stats.lowStock}</div>
              <div className="text-sm text-muted-foreground">Stock Bajo</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">
                ${stats.totalValue.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Valor Total</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{stats.criticalItems}</div>
              <div className="text-sm text-muted-foreground">Críticos</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos</option>
          <option value="normal">Normal</option>
          <option value="low">Stock Bajo</option>
          <option value="critical">Crítico</option>
          <option value="overstock">Exceso</option>
        </select>
        <button
          onClick={() => setShowMovementModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Registrar Movimiento
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Producto</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Mín/Máx</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Ubicación</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono">{item.sku}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-lg">{item.currentStock}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {item.minStock} / {item.maxStock}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <p>{item.location}</p>
                    <p className="text-xs text-muted-foreground">{item.warehouse}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    ${(item.currentStock * item.unitCost).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowHistoryModal(true);
                      }}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Ver historial"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Movement Modal */}
      <AnimatePresence>
        {showMovementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMovementModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold">Registrar Movimiento</h2>
                <button
                  onClick={() => setShowMovementModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Producto *
                  </label>
                  <select
                    value={movementForm.itemId}
                    onChange={(e) =>
                      setMovementForm({ ...movementForm, itemId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seleccionar...</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Stock: {item.currentStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Movimiento *
                  </label>
                  <select
                    value={movementForm.type}
                    onChange={(e) =>
                      setMovementForm({
                        ...movementForm,
                        type: e.target.value as "in" | "out" | "adjustment",
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="in">Entrada</option>
                    <option value="out">Salida</option>
                    <option value="adjustment">Ajuste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={movementForm.quantity}
                    onChange={(e) =>
                      setMovementForm({
                        ...movementForm,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Motivo</label>
                  <input
                    type="text"
                    value={movementForm.reason}
                    onChange={(e) =>
                      setMovementForm({ ...movementForm, reason: e.target.value })
                    }
                    placeholder="Ej: Compra, Venta, Devolución..."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Referencia
                  </label>
                  <input
                    type="text"
                    value={movementForm.reference}
                    onChange={(e) =>
                      setMovementForm({
                        ...movementForm,
                        reference: e.target.value,
                      })
                    }
                    placeholder="Ej: OC-001, Venta #123..."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveMovement}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Registrar
                  </button>
                  <button
                    onClick={() => setShowMovementModal(false)}
                    className="flex-1 border border-border py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white p-6 border-b border-border flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold">{selectedItem.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Historial de Movimientos
                  </p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {movements
                    .filter((m) => m.itemId === selectedItem.id)
                    .map((movement) => (
                      <div
                        key={movement.id}
                        className="flex items-start gap-3 p-3 border border-border rounded-lg"
                      >
                        {movement.type === "in" ? (
                          <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {movement.type === "in" ? "Entrada" : "Salida"}:{" "}
                              {movement.quantity} unidades
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(movement.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Stock: {movement.previousStock} → {movement.newStock}
                          </p>
                          {movement.reason && (
                            <p className="text-sm mt-1">{movement.reason}</p>
                          )}
                          {movement.reference && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {movement.reference}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {movements.filter((m) => m.itemId === selectedItem.id).length ===
                  0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay movimientos registrados
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
