import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Printer,
  Navigation,
  DollarSign,
  User,
  Phone,
  Mail,
  Calendar,
  Hash,
  Box,
  Map,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface Shipment {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  origin: {
    address: string;
    city: string;
    state: string;
    zip: string;
    lat?: number;
    lng?: number;
  };
  destination: {
    address: string;
    city: string;
    state: string;
    zip: string;
    lat?: number;
    lng?: number;
  };
  carrier: string;
  trackingNumber: string;
  status: "pending" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "failed";
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  cost: number;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    status: string;
    message: string;
    location: string;
    timestamp: string;
  }>;
}

interface ShippingManagerProps {
  onClose: () => void;
}

export function ShippingManager({ onClose }: ShippingManagerProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  async function loadShipments() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/shipping/list`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShipments(data.shipments || []);
      }
    } catch (error) {
      console.error("Error loading shipments:", error);
      toast.error("Error al cargar envíos");
    } finally {
      setLoading(false);
    }
  }

  async function createShipment(shipmentData: Partial<Shipment>) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/shipping/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(shipmentData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Envío creado exitosamente");
        loadShipments();
        setShowCreateForm(false);
        return data.shipment;
      } else {
        toast.error("Error al crear envío");
      }
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast.error("Error al crear envío");
    }
  }

  async function updateShipmentStatus(shipmentId: string, newStatus: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/shipping/${shipmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success("Estado actualizado");
        loadShipments();
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar estado");
    }
  }

  const statusConfig = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    picked_up: { label: "Recogido", color: "bg-blue-100 text-blue-800", icon: Package },
    in_transit: { label: "En Tránsito", color: "bg-purple-100 text-purple-800", icon: Truck },
    out_for_delivery: { label: "En Reparto", color: "bg-indigo-100 text-indigo-800", icon: Navigation },
    delivered: { label: "Entregado", color: "bg-green-100 text-green-800", icon: CheckCircle },
    failed: { label: "Fallido", color: "bg-red-100 text-red-800", icon: AlertCircle },
  };

  const carriers = ["UCA", "DAC", "Mirtrans", "Urupack", "Personalizado"];

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
    const matchesCarrier = carrierFilter === "all" || shipment.carrier === carrierFilter;

    return matchesSearch && matchesStatus && matchesCarrier;
  });

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === "pending").length,
    in_transit: shipments.filter(s => s.status === "in_transit" || s.status === "picked_up").length,
    delivered: shipments.filter(s => s.status === "delivered").length,
    failed: shipments.filter(s => s.status === "failed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (selectedShipment) {
    return (
      <ShipmentDetails
        shipment={selectedShipment}
        onBack={() => setSelectedShipment(null)}
        onUpdateStatus={updateShipmentStatus}
        onShowMap={() => setShowMap(true)}
      />
    );
  }

  if (showCreateForm) {
    return (
      <CreateShipmentForm
        onBack={() => setShowCreateForm(false)}
        onCreate={createShipment}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Envíos</h2>
          <p className="text-muted-foreground">Administra y rastrea todos los envíos</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Envío
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800">En Tránsito</p>
              <p className="text-2xl font-bold text-purple-900">{stats.in_transit}</p>
            </div>
            <Truck className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800">Entregados</p>
              <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-800">Fallidos</p>
              <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-border space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tracking, cliente o pedido..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="picked_up">Recogido</option>
            <option value="in_transit">En Tránsito</option>
            <option value="out_for_delivery">En Reparto</option>
            <option value="delivered">Entregado</option>
            <option value="failed">Fallido</option>
          </select>
          <select
            value={carrierFilter}
            onChange={(e) => setCarrierFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos los carriers</option>
            {carriers.map((carrier) => (
              <option key={carrier} value={carrier}>{carrier}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Tracking</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Destino</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Carrier</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Entrega Est.</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No hay envíos para mostrar
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const StatusIcon = statusConfig[shipment.status].icon;
                  return (
                    <tr key={shipment.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm font-medium">
                            {shipment.trackingNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{shipment.customerName}</p>
                          <p className="text-sm text-muted-foreground">{shipment.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{shipment.destination.city}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{shipment.carrier}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusConfig[shipment.status].color
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig[shipment.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedShipment(shipment)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Shipment Details Component
function ShipmentDetails({
  shipment,
  onBack,
  onUpdateStatus,
  onShowMap,
}: {
  shipment: Shipment;
  onBack: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onShowMap: () => void;
}) {
  const statusConfig = {
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    picked_up: { label: "Recogido", color: "bg-blue-100 text-blue-800" },
    in_transit: { label: "En Tránsito", color: "bg-purple-100 text-purple-800" },
    out_for_delivery: { label: "En Reparto", color: "bg-indigo-100 text-indigo-800" },
    delivered: { label: "Entregado", color: "bg-green-100 text-green-800" },
    failed: { label: "Fallido", color: "bg-red-100 text-red-800" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold">Detalles del Envío</h2>
            <p className="text-muted-foreground font-mono">#{shipment.trackingNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
          <button
            onClick={onShowMap}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Map className="w-5 h-5" />
            Ver en Mapa
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Status */}
          <div className="bg-white p-6 rounded-lg border border-border">
            <h3 className="font-bold mb-4">Estado Actual</h3>
            <div className="flex items-center justify-between mb-4">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  statusConfig[shipment.status].color
                }`}
              >
                {statusConfig[shipment.status].label}
              </span>
              <select
                value={shipment.status}
                onChange={(e) => onUpdateStatus(shipment.id, e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pending">Pendiente</option>
                <option value="picked_up">Recogido</option>
                <option value="in_transit">En Tránsito</option>
                <option value="out_for_delivery">En Reparto</option>
                <option value="delivered">Entregado</option>
                <option value="failed">Fallido</option>
              </select>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Historial</h4>
              {shipment.timeline.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {index < shipment.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">{event.message}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white p-6 rounded-lg border border-border">
            <h3 className="font-bold mb-4">Direcciones</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Origen
                </h4>
                <p className="text-sm">{shipment.origin.address}</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.origin.city}, {shipment.origin.state} {shipment.origin.zip}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  Destino
                </h4>
                <p className="text-sm">{shipment.destination.address}</p>
                <p className="text-sm text-muted-foreground">
                  {shipment.destination.city}, {shipment.destination.state}{" "}
                  {shipment.destination.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-6 rounded-lg border border-border">
            <h3 className="font-bold mb-4">Artículos</h3>
            <div className="space-y-2">
              {shipment.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-lg border border-border">
            <h3 className="font-bold mb-4">Cliente</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{shipment.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{shipment.customerEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{shipment.customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Shipment Info */}
          <div className="bg-white p-6 rounded-lg border border-border">
            <h3 className="font-bold mb-4">Información</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Carrier:</span>
                <span className="font-medium">{shipment.carrier}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Peso:</span>
                <span className="font-medium">{shipment.weight} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dimensiones:</span>
                <span className="font-medium">
                  {shipment.dimensions.length}x{shipment.dimensions.width}x
                  {shipment.dimensions.height} cm
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Costo:</span>
                <span className="font-medium">${shipment.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Creado:</span>
                <span className="font-medium">
                  {new Date(shipment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entrega Est.:</span>
                <span className="font-medium">
                  {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {shipment.notes && (
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="font-bold mb-4">Notas</h3>
              <p className="text-sm text-muted-foreground">{shipment.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Shipment Form Component
function CreateShipmentForm({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (data: Partial<Shipment>) => void;
}) {
  const [formData, setFormData] = useState({
    orderId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    originAddress: "",
    originCity: "",
    originState: "",
    originZip: "",
    destAddress: "",
    destCity: "",
    destState: "",
    destZip: "",
    carrier: "UCA",
    weight: "",
    length: "",
    width: "",
    height: "",
    notes: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const shipmentData: Partial<Shipment> = {
      orderId: formData.orderId,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      origin: {
        address: formData.originAddress,
        city: formData.originCity,
        state: formData.originState,
        zip: formData.originZip,
      },
      destination: {
        address: formData.destAddress,
        city: formData.destCity,
        state: formData.destState,
        zip: formData.destZip,
      },
      carrier: formData.carrier,
      weight: parseFloat(formData.weight),
      dimensions: {
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
      },
      notes: formData.notes,
    };

    onCreate(shipmentData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          ←
        </button>
        <div>
          <h2 className="text-2xl font-bold">Crear Nuevo Envío</h2>
          <p className="text-muted-foreground">Complete los datos del envío</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-border space-y-6">
        {/* Customer Info */}
        <div>
          <h3 className="font-bold mb-4">Información del Cliente</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              placeholder="ID del Pedido"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Nombre del Cliente"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder="Email"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder="Teléfono"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Origin Address */}
        <div>
          <h3 className="font-bold mb-4">Dirección de Origen</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.originAddress}
              onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
              placeholder="Dirección"
              required
              className="md:col-span-2 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={formData.originCity}
              onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
              placeholder="Ciudad"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={formData.originState}
              onChange={(e) => setFormData({ ...formData, originState: e.target.value })}
              placeholder="Departamento"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={formData.originZip}
              onChange={(e) => setFormData({ ...formData, originZip: e.target.value })}
              placeholder="Código Postal"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Destination Address */}
        <div>
          <h3 className="font-bold mb-4">Dirección de Destino</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.destAddress}
              onChange={(e) => setFormData({ ...formData, destAddress: e.target.value })}
              placeholder="Dirección"
              required
              className="md:col-span-2 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={formData.destCity}
              onChange={(e) => setFormData({ ...formData, destCity: e.target.value })}
              placeholder="Ciudad"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={formData.destState}
              onChange={(e) => setFormData({ ...formData, destState: e.target.value })}
              placeholder="Departamento"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={formData.destZip}
              onChange={(e) => setFormData({ ...formData, destZip: e.target.value })}
              placeholder="Código Postal"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Shipment Details */}
        <div>
          <h3 className="font-bold mb-4">Detalles del Envío</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <select
              value={formData.carrier}
              onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="UCA">UCA</option>
              <option value="DAC">DAC</option>
              <option value="Mirtrans">Mirtrans</option>
              <option value="Urupack">Urupack</option>
              <option value="Personalizado">Personalizado</option>
            </select>
            <input
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="Peso (kg)"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: e.target.value })}
              placeholder="Largo (cm)"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              placeholder="Ancho (cm)"
              required
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="Alto (cm)"
              required
              className="md:col-span-4 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="font-bold mb-4">Notas Adicionales</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Instrucciones especiales, restricciones horarias, etc."
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Crear Envío
        </button>
      </div>
    </form>
  );
}
