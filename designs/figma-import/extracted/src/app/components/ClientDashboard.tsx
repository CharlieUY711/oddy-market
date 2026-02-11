import { useState, useEffect } from "react";
import { 
  X, Package, MapPin, Heart, Bell, Download, 
  ChevronRight, Truck, Star, Plus, Trash2, Edit2,
  AlertCircle, TrendingDown, Mail, Clock, FileText,
  Settings, List, Filter, Search, Calendar
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface ClientDashboardProps {
  user: any;
  session: any;
  onClose: () => void;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: any[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  priceAlert?: number;
  stockAlert?: boolean;
}

interface CustomList {
  id: string;
  name: string;
  description: string;
  items: WishlistItem[];
  createdAt: string;
}

interface Notification {
  id: string;
  type: "stock" | "price" | "marketing" | "order" | "delivery";
  title: string;
  message: string;
  read: boolean;
  date: string;
  productId?: string;
}

export function ClientDashboard({ user, session, onClose }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [marketingHistory, setMarketingHistory] = useState<any[]>([]);
  
  // UI states
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Settings states
  const [notificationSettings, setNotificationSettings] = useState({
    emailOrders: true,
    emailMarketing: true,
    emailPriceAlerts: true,
    emailStockAlerts: true,
    pushEnabled: false,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchAddresses(),
        fetchWishlist(),
        fetchCustomLists(),
        fetchNotifications(),
        fetchMarketingHistory(),
        fetchNotificationSettings(),
      ]);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/users/orders`,
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

  async function fetchAddresses() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/users/addresses`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }

  async function fetchWishlist() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/users/wishlist`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }

  async function fetchCustomLists() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/users/lists`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCustomLists(data.lists || []);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  }

  async function fetchNotifications() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/users/notifications`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  async function fetchMarketingHistory() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/users/marketing-history`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMarketingHistory(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching marketing history:", error);
    }
  }

  async function fetchNotificationSettings() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/users/notification-settings`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.settings || notificationSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }

  async function downloadOrderInvoice(orderId: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/users/orders/${orderId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Factura descargada");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Error al descargar factura");
    }
  }

  async function saveNotificationSettings() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/users/notification-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
          body: JSON.stringify(notificationSettings),
        }
      );
      
      if (response.ok) {
        toast.success("Preferencias guardadas");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error al guardar preferencias");
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: "orders", label: "Mis Órdenes", icon: Package },
    { id: "tracking", label: "Envíos", icon: Truck },
    { id: "wishlist", label: "Favoritos", icon: Heart },
    { id: "lists", label: "Mis Listas", icon: List },
    { id: "addresses", label: "Direcciones", icon: MapPin },
    { id: "notifications", label: "Notificaciones", icon: Bell, badge: unreadNotifications },
    { id: "marketing", label: "Marketing", icon: Mail },
    { id: "settings", label: "Ajustes", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mi Cuenta</h1>
              <p className="text-white/90 mt-1">
                {user?.user_metadata?.name || user?.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs - Mobile Scrollable */}
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
                  {tab.badge && tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
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
              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Historial de Órdenes</h2>
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-border rounded-lg bg-white"
                      >
                        <option value="all">Todos</option>
                        <option value="pending">Pendiente</option>
                        <option value="processing">Procesando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No tienes órdenes aún</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders
                        .filter(order => filterStatus === "all" || order.status === filterStatus)
                        .map((order) => (
                          <div
                            key={order.id}
                            className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-bold text-lg">
                                    {order.orderNumber}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      order.status === "delivered"
                                        ? "bg-green-100 text-green-700"
                                        : order.status === "shipped"
                                        ? "bg-blue-100 text-blue-700"
                                        : order.status === "processing"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : order.status === "cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {order.status === "pending" && "Pendiente"}
                                    {order.status === "processing" && "Procesando"}
                                    {order.status === "shipped" && "Enviado"}
                                    {order.status === "delivered" && "Entregado"}
                                    {order.status === "cancelled" && "Cancelado"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {new Date(order.date).toLocaleDateString('es-AR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right mr-4">
                                  <p className="text-2xl font-bold text-primary">
                                    ${order.total.toLocaleString()}
                                  </p>
                                </div>

                                <button
                                  onClick={() => downloadOrderInvoice(order.id)}
                                  className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                                  title="Descargar factura"
                                >
                                  <Download className="w-5 h-5" />
                                </button>

                                {order.trackingNumber && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setActiveTab("tracking");
                                    }}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                                  >
                                    <Truck className="w-4 h-4" />
                                    Rastrear
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {order.items.slice(0, 4).map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <div className="w-12 h-12 bg-muted rounded flex-shrink-0" />
                                    <div className="text-xs">
                                      <p className="font-medium line-clamp-1">{item.name}</p>
                                      <p className="text-muted-foreground">x{item.quantity}</p>
                                    </div>
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

              {/* Tracking Tab */}
              {activeTab === "tracking" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Seguimiento de Envíos</h2>
                  
                  {selectedOrder ? (
                    <div className="bg-white border border-border rounded-lg p-6">
                      <div className="mb-6">
                        <h3 className="text-lg font-bold mb-2">Orden {selectedOrder.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          Número de seguimiento: <span className="font-mono font-bold">{selectedOrder.trackingNumber}</span>
                        </p>
                      </div>

                      {/* Timeline */}
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                        
                        <div className="space-y-6">
                          <div className="relative pl-12">
                            <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-bold">Orden confirmada</p>
                              <p className="text-sm text-muted-foreground">{new Date(selectedOrder.date).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="relative pl-12">
                            <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Truck className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-bold">En camino</p>
                              <p className="text-sm text-muted-foreground">Estimado: {selectedOrder.estimatedDelivery}</p>
                            </div>
                          </div>

                          <div className="relative pl-12">
                            <div className="absolute left-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-muted-foreground">Entregado</p>
                              <p className="text-sm text-muted-foreground">Pendiente</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <Truck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Selecciona una orden con envío para rastrear</p>
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Lista de Deseos</h2>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                      Agregar a carrito todo
                    </button>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Tu lista de deseos está vacía</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map((item) => (
                        <div
                          key={item.id}
                          className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="aspect-square bg-muted" />
                          <div className="p-4">
                            <h3 className="font-bold mb-2 line-clamp-2">{item.name}</h3>
                            <p className="text-2xl font-bold text-primary mb-3">
                              ${item.price.toLocaleString()}
                            </p>
                            
                            {/* Stock Alert */}
                            {item.stock < 5 && (
                              <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mb-2">
                                <AlertCircle className="w-3 h-3" />
                                Quedan solo {item.stock} unidades
                              </div>
                            )}

                            {/* Price Alert */}
                            {item.priceAlert && item.price < item.priceAlert && (
                              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded mb-2">
                                <TrendingDown className="w-3 h-3" />
                                ¡Bajó de precio!
                              </div>
                            )}

                            <div className="flex gap-2 mt-3">
                              <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
                                Agregar al carrito
                              </button>
                              <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Lists Tab */}
              {activeTab === "lists" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Mis Listas Personalizadas</h2>
                    <button
                      onClick={() => setShowCreateList(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Nueva Lista
                    </button>
                  </div>

                  {customLists.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <List className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No tienes listas personalizadas</p>
                      <button
                        onClick={() => setShowCreateList(true)}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Crear mi primera lista
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customLists.map((list) => (
                        <div
                          key={list.id}
                          className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1">{list.name}</h3>
                              <p className="text-sm text-muted-foreground">{list.description}</p>
                            </div>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {list.items.length} productos
                            </span>
                            <button className="text-primary hover:underline flex items-center gap-1">
                              Ver lista
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Direcciones Guardadas</h2>
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Nueva Dirección
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No tienes direcciones guardadas</p>
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Agregar dirección
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 ${
                            address.isDefault
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold">{address.name}</h3>
                                {address.isDefault && (
                                  <span className="px-2 py-0.5 bg-primary text-white text-xs rounded">
                                    Por defecto
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.street}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Tel: {address.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                              Editar
                            </button>
                            <button className="px-3 py-2 border border-border rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors text-red-600 text-sm">
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Notificaciones</h2>
                    <button className="text-sm text-primary hover:underline">
                      Marcar todas como leídas
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No tienes notificaciones</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            notification.read
                              ? "bg-white border-border"
                              : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              notification.type === "stock"
                                ? "bg-orange-100 text-orange-600"
                                : notification.type === "price"
                                ? "bg-green-100 text-green-600"
                                : notification.type === "order"
                                ? "bg-blue-100 text-blue-600"
                                : notification.type === "delivery"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {notification.type === "stock" && <AlertCircle className="w-5 h-5" />}
                              {notification.type === "price" && <TrendingDown className="w-5 h-5" />}
                              {notification.type === "order" && <Package className="w-5 h-5" />}
                              {notification.type === "delivery" && <Truck className="w-5 h-5" />}
                              {notification.type === "marketing" && <Mail className="w-5 h-5" />}
                            </div>

                            <div className="flex-1">
                              <h3 className="font-bold mb-1">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(notification.date).toLocaleString()}
                              </p>
                            </div>

                            {!notification.read && (
                              <button className="px-3 py-1 text-xs text-primary hover:underline">
                                Marcar leída
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Marketing History Tab */}
              {activeTab === "marketing" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Historial de Participaciones</h2>

                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">Rueda de la Fortuna - Black Friday</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Participaste el 24 de noviembre, 2024
                          </p>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <span className="font-bold">Premio:</span>
                            15% de descuento
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center py-12 bg-muted rounded-lg">
                      <p className="text-muted-foreground">No hay más participaciones</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Configuración de Notificaciones</h2>

                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                      <h3 className="font-bold mb-4">Notificaciones por Email</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Órdenes y entregas</p>
                            <p className="text-sm text-muted-foreground">
                              Actualizaciones sobre tus pedidos
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailOrders}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailOrders: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Alertas de precio</p>
                            <p className="text-sm text-muted-foreground">
                              Cuando baja el precio de productos en tu lista
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailPriceAlerts}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailPriceAlerts: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Alertas de stock</p>
                            <p className="text-sm text-muted-foreground">
                              Cuando hay stock de productos que te interesan
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailStockAlerts}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailStockAlerts: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary rounded"
                          />
                        </label>

                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Ofertas y promociones</p>
                            <p className="text-sm text-muted-foreground">
                              Newsletters y campañas de marketing
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailMarketing}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                emailMarketing: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-primary rounded"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={saveNotificationSettings}
                      className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      Guardar Preferencias
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
