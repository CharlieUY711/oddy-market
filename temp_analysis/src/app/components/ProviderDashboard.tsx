import { useState, useEffect } from "react";
import { 
  X, Package, TrendingUp, DollarSign, Eye, Edit2, Plus,
  AlertCircle, CheckCircle, Clock, XCircle, BarChart3,
  Upload, Image as ImageIcon, Truck, FileText, Filter
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface ProviderDashboardProps {
  user: any;
  session: any;
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  sold: number;
  revenue: number;
  status: "active" | "inactive" | "pending_approval";
  image: string;
  category: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  items: any[];
  total: number;
  deliveryStatus?: string;
}

interface AccountMovement {
  id: string;
  type: "sale" | "commission" | "payment" | "refund";
  amount: number;
  date: string;
  description: string;
  orderId?: string;
}

export function ProviderDashboard({ user, session, onClose }: ProviderDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [accountMovements, setAccountMovements] = useState<AccountMovement[]>([]);
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingApproval: 0,
    totalSales: 0,
    totalRevenue: 0,
    accountBalance: 0,
    pendingOrders: 0,
  });

  // UI states
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadProviderData();
  }, []);

  async function loadProviderData() {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchAccountMovements(),
        fetchStatistics(),
      ]);
    } catch (error) {
      console.error("Error loading provider data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/provider/products`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  async function fetchOrders() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/provider/orders`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  async function fetchAccountMovements() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/provider/account`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAccountMovements(data.movements || []);
      }
    } catch (error) {
      console.error("Error fetching account:", error);
    }
  }

  async function fetchStatistics() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/provider/statistics`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics || statistics);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }

  async function requestProductPublication(productId: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/provider/products/${productId}/request-publication`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        toast.success("Solicitud enviada. Pendiente de aprobación del administrador.");
        fetchProducts();
      } else {
        toast.error("Error al enviar solicitud");
      }
    } catch (error) {
      console.error("Error requesting publication:", error);
      toast.error("Error al enviar solicitud");
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/provider/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      
      if (response.ok) {
        toast.success("Estado actualizado");
        fetchOrders();
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Error al actualizar estado");
    }
  }

  const tabs = [
    { id: "overview", label: "Resumen", icon: BarChart3 },
    { id: "products", label: "Mis Productos", icon: Package },
    { id: "orders", label: "Pedidos", icon: Truck },
    { id: "account", label: "Cuenta Corriente", icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Proveedor</h1>
              <p className="text-white/90 mt-1">
                {user?.user_metadata?.company || user?.user_metadata?.name || user?.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 -mx-6 px-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-white text-primary font-medium"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Resumen General</h2>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Package className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-900">
                          {statistics.activeProducts}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">Productos Activos</p>
                      {statistics.pendingApproval > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          +{statistics.pendingApproval} pendientes
                        </p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        <span className="text-2xl font-bold text-green-900">
                          ${statistics.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-green-700 font-medium">Ingresos Totales</p>
                      <p className="text-xs text-green-600 mt-1">
                        {statistics.totalSales} ventas
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-900">
                          ${statistics.accountBalance.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-purple-700 font-medium">Saldo Actual</p>
                      <p className="text-xs text-purple-600 mt-1">Cuenta corriente</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Truck className="w-8 h-8 text-orange-600" />
                        <span className="text-2xl font-bold text-orange-900">
                          {statistics.pendingOrders}
                        </span>
                      </div>
                      <p className="text-sm text-orange-700 font-medium">Pedidos Pendientes</p>
                      <p className="text-xs text-orange-600 mt-1">Requieren acción</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-muted rounded-lg p-6">
                    <h3 className="font-bold mb-4">Acciones Rápidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          setShowAddProduct(true);
                          setActiveTab("products");
                        }}
                        className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:shadow-lg transition-all"
                      >
                        <Plus className="w-5 h-5 text-primary" />
                        <span className="font-medium">Agregar Producto</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("orders")}
                        className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:shadow-lg transition-all"
                      >
                        <Truck className="w-5 h-5 text-primary" />
                        <span className="font-medium">Ver Pedidos</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("account")}
                        className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:shadow-lg transition-all"
                      >
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium">Estado de Cuenta</span>
                      </button>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-yellow-900 mb-1">
                          Publicaciones y Sincronizaciones
                        </p>
                        <p className="text-sm text-yellow-800">
                          Todos los productos nuevos y solicitudes de sincronización deben ser aprobados 
                          por el administrador antes de publicarse en la tienda. Recibirás una notificación 
                          cuando tu solicitud sea revisada.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Mis Productos</h2>
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg bg-white"
                      >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                        <option value="pending_approval">Pendientes</option>
                      </select>
                      <button
                        onClick={() => setShowAddProduct(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Nuevo Producto
                      </button>
                    </div>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No tienes productos registrados</p>
                      <button
                        onClick={() => setShowAddProduct(true)}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Crear mi primer producto
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products
                        .filter(p => filterStatus === "all" || p.status === filterStatus)
                        .map((product) => (
                          <div
                            key={product.id}
                            className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="w-20 h-20 bg-muted rounded flex-shrink-0" />

                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-bold text-lg">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                                  </div>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      product.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : product.status === "pending_approval"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {product.status === "active" && "Activo"}
                                    {product.status === "inactive" && "Inactivo"}
                                    {product.status === "pending_approval" && "Pendiente Aprobación"}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Precio</p>
                                    <p className="font-bold text-lg">${product.price.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Stock</p>
                                    <p className="font-bold text-lg">{product.stock}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Vendidos</p>
                                    <p className="font-bold text-lg">{product.sold}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Ingresos</p>
                                    <p className="font-bold text-lg text-green-600">
                                      ${product.revenue.toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={() => setEditingProduct(product)}
                                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                  </button>

                                  {product.status === "inactive" && (
                                    <button
                                      onClick={() => requestProductPublication(product.id)}
                                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                                    >
                                      <Upload className="w-4 h-4" />
                                      Solicitar Publicación
                                    </button>
                                  )}

                                  <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                                    <Eye className="w-4 h-4" />
                                    Ver Estadísticas
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Gestión de Pedidos</h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <Truck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No tienes pedidos aún</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-bold text-lg">{order.orderNumber}</span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    order.status === "delivered"
                                      ? "bg-green-100 text-green-700"
                                      : order.status === "shipped"
                                      ? "bg-blue-100 text-blue-700"
                                      : order.status === "processing"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {order.status === "pending" && "Pendiente"}
                                  {order.status === "processing" && "Procesando"}
                                  {order.status === "shipped" && "Enviado"}
                                  {order.status === "delivered" && "Entregado"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">Cliente: {order.customerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.date).toLocaleDateString('es-AR')}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary mb-2">
                                ${order.total.toLocaleString()}
                              </p>

                              {order.status === "pending" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "processing")}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                  >
                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                    Aceptar
                                  </button>
                                  <button
                                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                  >
                                    <XCircle className="w-4 h-4 inline mr-1" />
                                    Rechazar
                                  </button>
                                </div>
                              )}

                              {order.status === "processing" && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, "shipped")}
                                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                                >
                                  <Truck className="w-4 h-4 inline mr-1" />
                                  Marcar como Enviado
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="pt-3 border-t border-border">
                            <p className="text-sm font-medium mb-2">Productos ({order.items.length}):</p>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="text-sm text-muted-foreground">
                                  • {item.name} × {item.quantity}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Cuenta Corriente</h2>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Saldo Actual</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${statistics.accountBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {accountMovements.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay movimientos aún</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {accountMovements.map((movement) => (
                        <div
                          key={movement.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                movement.type === "sale"
                                  ? "bg-green-100 text-green-600"
                                  : movement.type === "commission"
                                  ? "bg-red-100 text-red-600"
                                  : movement.type === "payment"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">{movement.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(movement.date).toLocaleString('es-AR')}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${
                                movement.type === "sale" || movement.type === "refund"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {movement.type === "sale" || movement.type === "refund" ? "+" : "-"}
                              ${movement.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                      <FileText className="w-5 h-5 inline mr-2" />
                      Descargar Estado de Cuenta
                    </button>
                    <button className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium">
                      <Download className="w-5 h-5 inline mr-2" />
                      Solicitar Pago
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
