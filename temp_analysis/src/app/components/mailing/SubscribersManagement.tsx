import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Tag,
  List,
  Edit,
  Trash2,
  X,
  Save,
  Download,
  Upload,
  UserPlus,
  FolderPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Subscriber {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: "subscribed" | "unsubscribed" | "bounced";
  lists: string[];
  tags: string[];
  customFields: Record<string, any>;
  subscribedAt: string;
  lastEmailSent?: string;
  opens: number;
  clicks: number;
}

interface MailingList {
  id: string;
  name: string;
  description: string;
  subscriberCount: number;
  createdAt: string;
}

export function SubscribersManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [lists, setLists] = useState<MailingList[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [listFilter, setListFilter] = useState<string>("all");
  const [showAddSubscriber, setShowAddSubscriber] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<"subscribers" | "lists">("subscribers");

  const [subscriberForm, setSubscriberForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    lists: [] as string[],
    tags: [] as string[],
    customFields: {} as Record<string, any>,
  });

  const [listForm, setListForm] = useState({
    name: "",
    description: "",
  });

  const availableTags = [
    "VIP",
    "Cliente",
    "Prospecto",
    "Activo",
    "Inactivo",
    "Comprador Frecuente",
    "Alto Valor",
    "Newsletter",
  ];

  useEffect(() => {
    loadSubscribers();
    loadLists();
  }, []);

  async function loadSubscribers() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/subscribers`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error("Error loading subscribers:", error);
    }
  }

  async function loadLists() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/lists`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLists(data.lists || []);
      }
    } catch (error) {
      console.error("Error loading lists:", error);
    }
  }

  async function saveSubscriber() {
    if (!subscriberForm.email || !subscriberForm.firstName) {
      toast.error("Email y nombre son requeridos");
      return;
    }

    setLoading(true);
    try {
      const url = editingSubscriber
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/subscribers/${editingSubscriber.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/subscribers`;

      const response = await fetch(url, {
        method: editingSubscriber ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(subscriberForm),
      });

      if (response.ok) {
        toast.success(
          editingSubscriber ? "Suscriptor actualizado" : "Suscriptor agregado"
        );
        loadSubscribers();
        loadLists(); // Reload to update counts
        closeSubscriberModal();
      } else {
        toast.error("Error al guardar suscriptor");
      }
    } catch (error) {
      console.error("Error saving subscriber:", error);
      toast.error("Error al guardar suscriptor");
    } finally {
      setLoading(false);
    }
  }

  async function saveList() {
    if (!listForm.name) {
      toast.error("El nombre de la lista es requerido");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/lists`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(listForm),
        }
      );

      if (response.ok) {
        toast.success("Lista creada");
        loadLists();
        closeListModal();
      } else {
        toast.error("Error al crear lista");
      }
    } catch (error) {
      console.error("Error saving list:", error);
      toast.error("Error al crear lista");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSubscriber(id: string) {
    if (!confirm("¿Estás seguro de eliminar este suscriptor?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/subscribers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Suscriptor eliminado");
        loadSubscribers();
        loadLists();
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast.error("Error al eliminar suscriptor");
    }
  }

  async function deleteList(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta lista?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/lists/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Lista eliminada");
        loadLists();
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Error al eliminar lista");
    }
  }

  function openSubscriberModal(subscriber?: Subscriber) {
    if (subscriber) {
      setEditingSubscriber(subscriber);
      setSubscriberForm({
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        phone: subscriber.phone || "",
        lists: subscriber.lists,
        tags: subscriber.tags,
        customFields: subscriber.customFields,
      });
    }
    setShowAddSubscriber(true);
  }

  function closeSubscriberModal() {
    setShowAddSubscriber(false);
    setEditingSubscriber(null);
    setSubscriberForm({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      lists: [],
      tags: [],
      customFields: {},
    });
  }

  function closeListModal() {
    setShowAddList(false);
    setListForm({
      name: "",
      description: "",
    });
  }

  function toggleList(listId: string) {
    setSubscriberForm({
      ...subscriberForm,
      lists: subscriberForm.lists.includes(listId)
        ? subscriberForm.lists.filter((l) => l !== listId)
        : [...subscriberForm.lists, listId],
    });
  }

  function toggleTag(tag: string) {
    setSubscriberForm({
      ...subscriberForm,
      tags: subscriberForm.tags.includes(tag)
        ? subscriberForm.tags.filter((t) => t !== tag)
        : [...subscriberForm.tags, tag],
    });
  }

  function getStatusColor(status: Subscriber["status"]) {
    switch (status) {
      case "subscribed":
        return "bg-green-100 text-green-700";
      case "unsubscribed":
        return "bg-gray-100 text-gray-700";
      case "bounced":
        return "bg-red-100 text-red-700";
    }
  }

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesList =
      listFilter === "all" || sub.lists.includes(listFilter);
    return matchesSearch && matchesStatus && matchesList;
  });

  const stats = {
    total: subscribers.length,
    subscribed: subscribers.filter((s) => s.status === "subscribed").length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
    bounced: subscribers.filter((s) => s.status === "bounced").length,
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView("subscribers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeView === "subscribers"
              ? "bg-primary text-white"
              : "bg-white border border-border hover:bg-muted"
          }`}
        >
          <Users className="w-5 h-5" />
          Suscriptores
        </button>
        <button
          onClick={() => setActiveView("lists")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeView === "lists"
              ? "bg-primary text-white"
              : "bg-white border border-border hover:bg-muted"
          }`}
        >
          <List className="w-5 h-5" />
          Listas
        </button>
      </div>

      {activeView === "subscribers" ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">
                Total Suscriptores
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Activos</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.subscribed}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">
                Desuscritos
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {stats.unsubscribed}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground mb-1">Bounced</div>
              <div className="text-2xl font-bold text-red-600">
                {stats.bounced}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar suscriptores..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos los estados</option>
              <option value="subscribed">Suscritos</option>
              <option value="unsubscribed">Desuscritos</option>
              <option value="bounced">Bounced</option>
            </select>
            <select
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas las listas</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => openSubscriberModal()}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-5 h-5" />
              Agregar Suscriptor
            </button>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Suscriptor
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Listas
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Etiquetas
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Engagement
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">
                            {subscriber.firstName} {subscriber.lastName}
                          </p>
                          {subscriber.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {subscriber.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{subscriber.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            subscriber.status
                          )}`}
                        >
                          {subscriber.status === "subscribed"
                            ? "Suscrito"
                            : subscriber.status === "unsubscribed"
                            ? "Desuscrito"
                            : "Bounced"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{subscriber.lists.length}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {subscriber.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 bg-muted rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {subscriber.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{subscriber.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-muted-foreground">
                          <p>Opens: {subscriber.opens}</p>
                          <p>Clicks: {subscriber.clicks}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openSubscriberModal(subscriber)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSubscriber(subscriber.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSubscribers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron suscriptores
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Lists View */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddList(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
              Nueva Lista
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-lg border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{list.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {list.description}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteList(list.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {list.subscriberCount} suscriptores
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(list.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {lists.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No hay listas creadas
            </div>
          )}
        </>
      )}

      {/* Add Subscriber Modal */}
      <AnimatePresence>
        {showAddSubscriber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeSubscriberModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">
                  {editingSubscriber ? "Editar Suscriptor" : "Nuevo Suscriptor"}
                </h2>
                <button
                  onClick={closeSubscriberModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={subscriberForm.email}
                      onChange={(e) =>
                        setSubscriberForm({
                          ...subscriberForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={subscriberForm.phone}
                      onChange={(e) =>
                        setSubscriberForm({
                          ...subscriberForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={subscriberForm.firstName}
                      onChange={(e) =>
                        setSubscriberForm({
                          ...subscriberForm,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={subscriberForm.lastName}
                      onChange={(e) =>
                        setSubscriberForm({
                          ...subscriberForm,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Listas</label>
                  <div className="flex flex-wrap gap-2">
                    {lists.map((list) => (
                      <button
                        key={list.id}
                        type="button"
                        onClick={() => toggleList(list.id)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          subscriberForm.lists.includes(list.id)
                            ? "bg-primary text-white border-primary"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {list.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          subscriberForm.tags.includes(tag)
                            ? "bg-primary text-white border-primary"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveSubscriber}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={closeSubscriberModal}
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

      {/* Add List Modal */}
      <AnimatePresence>
        {showAddList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeListModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold">Nueva Lista</h2>
                <button
                  onClick={closeListModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre de la Lista *
                  </label>
                  <input
                    type="text"
                    value={listForm.name}
                    onChange={(e) =>
                      setListForm({ ...listForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={listForm.description}
                    onChange={(e) =>
                      setListForm({ ...listForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveList}
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? "Creando..." : "Crear Lista"}
                  </button>
                  <button
                    onClick={closeListModal}
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
    </div>
  );
}
