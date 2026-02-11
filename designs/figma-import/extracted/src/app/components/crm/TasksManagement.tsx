import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Check,
  Clock,
  AlertCircle,
  User,
  Tag,
  X,
  Save,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Task {
  id: string;
  title: string;
  description: string;
  type: "call" | "meeting" | "email" | "follow-up" | "demo" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  dueDate: string;
  assignedTo: string;
  relatedTo?: string;
  relatedType?: "lead" | "customer";
  completedAt?: string;
  createdAt: string;
}

export function TasksManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "call" as Task["type"],
    priority: "medium" as Task["priority"],
    status: "pending" as Task["status"],
    dueDate: new Date().toISOString().split("T")[0],
    assignedTo: "Sin asignar",
    relatedTo: "",
    relatedType: "lead" as "lead" | "customer",
  });

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/tasks`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  }

  async function saveTask() {
    if (!formData.title) {
      toast.error("El título es requerido");
      return;
    }

    setLoading(true);
    try {
      const url = editingTask
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/tasks/${editingTask.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/tasks`;

      const response = await fetch(url, {
        method: editingTask ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingTask ? "Tarea actualizada" : "Tarea creada");
        loadTasks();
        closeModal();
      } else {
        toast.error("Error al guardar tarea");
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Error al guardar tarea");
    } finally {
      setLoading(false);
    }
  }

  async function completeTask(id: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/tasks/${id}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Tarea completada");
        loadTasks();
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Error al completar tarea");
    }
  }

  async function deleteTask(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Tarea eliminada");
        loadTasks();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Error al eliminar tarea");
    }
  }

  function openModal(task?: Task) {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
        relatedTo: task.relatedTo || "",
        relatedType: task.relatedType || "lead",
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      type: "call",
      priority: "medium",
      status: "pending",
      dueDate: new Date().toISOString().split("T")[0],
      assignedTo: "Sin asignar",
      relatedTo: "",
      relatedType: "lead",
    });
  }

  function getPriorityColor(priority: Task["priority"]) {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-gray-100 text-gray-700";
    }
  }

  function getStatusColor(status: Task["status"]) {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getTypeLabel(type: Task["type"]) {
    const labels = {
      call: "Llamada",
      meeting: "Reunión",
      email: "Email",
      "follow-up": "Seguimiento",
      demo: "Demo",
      other: "Otro",
    };
    return labels[type];
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const todayTasks = tasks.filter(
    (task) =>
      task.dueDate === new Date().toISOString().split("T")[0] &&
      task.status !== "completed"
  );
  const overdueTasks = tasks.filter(
    (task) =>
      new Date(task.dueDate) < new Date() && task.status !== "completed"
  );
  const completedToday = tasks.filter(
    (task) =>
      task.completedAt &&
      task.completedAt.split("T")[0] === new Date().toISOString().split("T")[0]
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Para Hoy</div>
          <div className="text-2xl font-bold text-blue-600">
            {todayTasks.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Atrasadas</div>
          <div className="text-2xl font-bold text-red-600">
            {overdueTasks.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Completadas Hoy</div>
          <div className="text-2xl font-bold text-green-600">
            {completedToday.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Total Tareas</div>
          <div className="text-2xl font-bold">{tasks.length}</div>
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in-progress">En Progreso</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todas las prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap ml-auto"
        >
          <Plus className="w-5 h-5" />
          Nueva Tarea
        </button>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">
            Tienes {overdueTasks.length} tarea(s) atrasada(s) que requieren
            atención.
          </p>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const isOverdue =
            new Date(task.dueDate) < new Date() && task.status !== "completed";
          const isToday =
            task.dueDate === new Date().toISOString().split("T")[0];

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white p-6 rounded-lg border-2 transition-colors ${
                isOverdue
                  ? "border-red-200"
                  : isToday
                  ? "border-blue-200"
                  : "border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => completeTask(task.id)}
                  disabled={task.status === "completed"}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    task.status === "completed"
                      ? "bg-green-500 border-green-500"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {task.status === "completed" && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4
                        className={`font-bold ${
                          task.status === "completed"
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openModal(task)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeLabel(task.type)}`}>
                      {getTypeLabel(task.type)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority === "urgent"
                        ? "Urgente"
                        : task.priority === "high"
                        ? "Alta"
                        : task.priority === "medium"
                        ? "Media"
                        : "Baja"}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status === "completed"
                        ? "Completada"
                        : task.status === "in-progress"
                        ? "En Progreso"
                        : task.status === "cancelled"
                        ? "Cancelada"
                        : "Pendiente"}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                      {isOverdue && " (Atrasada)"}
                      {isToday && " (Hoy)"}
                    </span>
                    {task.assignedTo !== "Sin asignar" && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignedTo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron tareas
        </div>
      )}

      {/* Modal */}
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
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">
                  {editingTask ? "Editar Tarea" : "Nueva Tarea"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as Task["type"],
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="call">Llamada</option>
                      <option value="meeting">Reunión</option>
                      <option value="email">Email</option>
                      <option value="follow-up">Seguimiento</option>
                      <option value="demo">Demo</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prioridad
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as Task["priority"],
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Task["status"],
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in-progress">En Progreso</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Asignado a
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveTask}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "Guardando..." : "Guardar"}
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
    </div>
  );
}
