import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Building2,
  Package,
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Tag,
  Check,
  X,
  Loader2,
  MoreVertical,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Entity {
  id: string;
  type: "client" | "provider" | "collaborator";
  name: string;
  email: string;
  phone?: string;
  address?: string;
  fiscalId?: string;
  company?: string;
  notes?: string;
  tags?: string[];
  status: "active" | "inactive" | "pending";
  createdAt: string;
  totalOrders?: number;
  totalRevenue?: number;
}

export function EntityManagement() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"client" | "provider" | "collaborator">("client");
  const [showForm, setShowForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadEntities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, activeTab, statusFilter, entities]);

  async function loadEntities() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/entities`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEntities(data.entities || []);
      }
    } catch (error) {
      console.error("Error loading entities:", error);
      toast.error("Error al cargar entidades");
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = entities.filter((e) => e.type === activeTab);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.company?.toLowerCase().includes(query) ||
          e.fiscalId?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    setFilteredEntities(filtered);
  }

  async function deleteEntity(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta entidad?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/entities/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Entidad eliminada");
        loadEntities();
      } else {
        toast.error("Error al eliminar entidad");
      }
    } catch (error) {
      console.error("Error deleting entity:", error);
      toast.error("Error al eliminar entidad");
    }
  }

  const tabs = [
    { id: "client" as const, label: "Clientes", icon: Users, color: "text-blue-600" },
    { id: "provider" as const, label: "Proveedores", icon: Package, color: "text-orange-600" },
    { id: "collaborator" as const, label: "Colaboradores", icon: Building2, color: "text-green-600" },
  ];

  const stats = {
    client: {
      total: entities.filter((e) => e.type === "client").length,
      active: entities.filter((e) => e.type === "client" && e.status === "active").length,
      revenue: entities
        .filter((e) => e.type === "client")
        .reduce((sum, e) => sum + (e.totalRevenue || 0), 0),
    },
    provider: {
      total: entities.filter((e) => e.type === "provider").length,
      active: entities.filter((e) => e.type === "provider" && e.status === "active").length,
    },
    collaborator: {
      total: entities.filter((e) => e.type === "collaborator").length,
      active: entities.filter((e) => e.type === "collaborator" && e.status === "active").length,
    },
  };

  if (showForm) {
    return (
      <EntityForm
        entity={editingEntity}
        type={activeTab}
        onSave={() => {
          setShowForm(false);
          setEditingEntity(null);
          loadEntities();
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingEntity(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Entidades</h2>
          <p className="text-muted-foreground mt-1">
            Clientes, Proveedores y Colaboradores
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEntity(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nueva Entidad</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-border rounded-lg p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {stats[tab.id].active}/{stats[tab.id].total}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{stats[activeTab].total}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Activos</span>
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">{stats[activeTab].active}</p>
        </div>

        {activeTab === "client" && (
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Ingresos Totales</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">${stats.client.revenue.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, empresa, RUT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border border-border rounded-lg transition-colors ${
              showFilters ? "bg-primary text-white" : "hover:bg-muted"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Entities List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredEntities.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-border rounded-lg p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">
            No hay {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? "No se encontraron resultados"
              : "Comienza agregando tu primera entidad"}
          </p>
          <button
            onClick={() => {
              setEditingEntity(null);
              setShowForm(true);
            }}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Agregar {tabs.find((t) => t.id === activeTab)?.label.slice(0, -1)}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEntities.map((entity) => (
            <motion.div
              key={entity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-muted rounded-lg">
                    {activeTab === "client" && <Users className="w-6 h-6 text-blue-600" />}
                    {activeTab === "provider" && <Package className="w-6 h-6 text-orange-600" />}
                    {activeTab === "collaborator" && <Building2 className="w-6 h-6 text-green-600" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{entity.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          entity.status === "active"
                            ? "bg-green-100 text-green-700"
                            : entity.status === "inactive"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {entity.status === "active"
                          ? "Activo"
                          : entity.status === "inactive"
                          ? "Inactivo"
                          : "Pendiente"}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      {entity.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{entity.email}</span>
                        </div>
                      )}
                      {entity.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{entity.phone}</span>
                        </div>
                      )}
                      {entity.company && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span className="truncate">{entity.company}</span>
                        </div>
                      )}
                      {entity.fiscalId && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{entity.fiscalId}</span>
                        </div>
                      )}
                    </div>

                    {activeTab === "client" && entity.totalOrders && (
                      <div className="flex items-center gap-6 mt-3 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{entity.totalOrders} órdenes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            ${(entity.totalRevenue || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {entity.tags && entity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {entity.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingEntity(entity);
                      setShowForm(true);
                    }}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEntity(entity.id)}
                    className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// EntityForm Component (simplified inline)
function EntityForm({ entity, type, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: entity?.name || "",
    email: entity?.email || "",
    phone: entity?.phone || "",
    address: entity?.address || "",
    fiscalId: entity?.fiscalId || "",
    company: entity?.company || "",
    notes: entity?.notes || "",
    status: entity?.status || "active",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const entityData = {
        ...formData,
        id: entity?.id || `entity:${type}:${Date.now()}`,
        type,
        createdAt: entity?.createdAt || new Date().toISOString(),
      };

      const url = entity
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/entities/${entity.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/entities`;

      const response = await fetch(url, {
        method: entity ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entityData),
      });

      if (response.ok) {
        toast.success(entity ? "Entidad actualizada" : "Entidad creada");
        onSave();
      } else {
        toast.error("Error al guardar entidad");
      }
    } catch (error) {
      console.error("Error saving entity:", error);
      toast.error("Error al guardar entidad");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {entity ? "Editar" : "Nueva"} Entidad - {type === "client" ? "Cliente" : type === "provider" ? "Proveedor" : "Colaborador"}
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-muted rounded-lg">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">RUT/CUIT/ID Fiscal</label>
            <input
              type="text"
              value={formData.fiscalId}
              onChange={(e) => setFormData({ ...formData, fiscalId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Empresa</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Dirección</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
