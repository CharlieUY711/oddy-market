import { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Users,
  Filter,
  ShoppingCart,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Segment {
  id: string;
  name: string;
  description: string;
  conditions: SegmentCondition[];
  subscriberCount: number;
  createdAt: string;
}

interface SegmentCondition {
  field: string;
  operator: string;
  value: any;
}

export function SegmentationManagement() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    conditions: [] as SegmentCondition[],
  });

  const availableFields = [
    { id: "email", label: "Email", type: "string" },
    { id: "firstName", label: "Nombre", type: "string" },
    { id: "lastName", label: "Apellido", type: "string" },
    { id: "status", label: "Estado", type: "select" },
    { id: "lists", label: "Listas", type: "array" },
    { id: "tags", label: "Etiquetas", type: "array" },
    { id: "totalPurchases", label: "Total Compras", type: "number" },
    { id: "totalSpent", label: "Total Gastado", type: "number" },
    { id: "lastPurchaseDate", label: "Última Compra", type: "date" },
    { id: "opens", label: "Aperturas", type: "number" },
    { id: "clicks", label: "Clicks", type: "number" },
    { id: "city", label: "Ciudad", type: "string" },
    { id: "country", label: "País", type: "string" },
    { id: "subscribedAt", label: "Fecha de Suscripción", type: "date" },
  ];

  const operators = {
    string: [
      { id: "equals", label: "Es igual a" },
      { id: "contains", label: "Contiene" },
      { id: "starts_with", label: "Empieza con" },
      { id: "ends_with", label: "Termina con" },
    ],
    number: [
      { id: "equals", label: "Es igual a" },
      { id: "greater", label: "Mayor que" },
      { id: "less", label: "Menor que" },
      { id: "between", label: "Entre" },
    ],
    date: [
      { id: "equals", label: "Es igual a" },
      { id: "before", label: "Antes de" },
      { id: "after", label: "Después de" },
      { id: "between", label: "Entre" },
      { id: "last_days", label: "Últimos X días" },
    ],
    array: [
      { id: "contains", label: "Contiene" },
      { id: "not_contains", label: "No contiene" },
    ],
    select: [
      { id: "equals", label: "Es igual a" },
      { id: "not_equals", label: "No es igual a" },
    ],
  };

  useEffect(() => {
    loadSegments();
  }, []);

  async function loadSegments() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/segments`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSegments(data.segments || []);
      }
    } catch (error) {
      console.error("Error loading segments:", error);
    }
  }

  async function saveSegment() {
    if (!formData.name || formData.conditions.length === 0) {
      toast.error("Nombre y al menos una condición son requeridos");
      return;
    }

    setLoading(true);
    try {
      const url = editingSegment
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/segments/${editingSegment.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/segments`;

      const response = await fetch(url, {
        method: editingSegment ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingSegment ? "Segmento actualizado" : "Segmento creado"
        );
        loadSegments();
        closeModal();
      } else {
        toast.error("Error al guardar segmento");
      }
    } catch (error) {
      console.error("Error saving segment:", error);
      toast.error("Error al guardar segmento");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSegment(id: string) {
    if (!confirm("¿Estás seguro de eliminar este segmento?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/segments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Segmento eliminado");
        loadSegments();
      }
    } catch (error) {
      console.error("Error deleting segment:", error);
      toast.error("Error al eliminar segmento");
    }
  }

  function openModal(segment?: Segment) {
    if (segment) {
      setEditingSegment(segment);
      setFormData({
        name: segment.name,
        description: segment.description,
        conditions: segment.conditions,
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingSegment(null);
    setFormData({
      name: "",
      description: "",
      conditions: [],
    });
  }

  function addCondition() {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        { field: "email", operator: "equals", value: "" },
      ],
    });
  }

  function removeCondition(index: number) {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  }

  function updateCondition(index: number, updates: Partial<SegmentCondition>) {
    setFormData({
      ...formData,
      conditions: formData.conditions.map((cond, i) =>
        i === index ? { ...cond, ...updates } : cond
      ),
    });
  }

  function getFieldIcon(fieldId: string) {
    if (fieldId.includes("purchase") || fieldId.includes("spent")) {
      return <ShoppingCart className="w-4 h-4" />;
    }
    if (fieldId.includes("Date") || fieldId.includes("At")) {
      return <Calendar className="w-4 h-4" />;
    }
    if (fieldId.includes("city") || fieldId.includes("country")) {
      return <MapPin className="w-4 h-4" />;
    }
    return <Filter className="w-4 h-4" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Segmentación Avanzada</h3>
          <p className="text-sm text-muted-foreground">
            Crea segmentos personalizados basados en comportamiento y demografía
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Segmento
        </button>
      </div>

      {/* Pre-built Segments Examples */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-bold mb-2 text-blue-900">
          Ejemplos de Segmentos Útiles:
        </h4>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="font-medium">🌟 Clientes VIP</p>
            <p className="text-xs text-muted-foreground">
              Total gastado &gt; $1000 y Compras &gt; 5
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="font-medium">😴 Inactivos</p>
            <p className="text-xs text-muted-foreground">
              Última compra &gt; 90 días
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="font-medium">📧 Engaged</p>
            <p className="text-xs text-muted-foreground">
              Aperturas &gt; 10 y Clicks &gt; 3
            </p>
          </div>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment) => (
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg border border-border"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-lg">{segment.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {segment.description}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(segment)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteSegment(segment.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-2 mb-4">
              {segment.conditions.slice(0, 3).map((condition, idx) => {
                const field = availableFields.find((f) => f.id === condition.field);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded"
                  >
                    {getFieldIcon(condition.field)}
                    <span className="font-medium">{field?.label}</span>
                    <span className="text-muted-foreground">
                      {condition.operator}
                    </span>
                    <span className="font-medium">{condition.value}</span>
                  </div>
                );
              })}
              {segment.conditions.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{segment.conditions.length - 3} condiciones más
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {segment.subscriberCount} suscriptores
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(segment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay segmentos creados. ¡Crea tu primer segmento!
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
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">
                  {editingSegment ? "Editar Segmento" : "Nuevo Segmento"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre del Segmento *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Clientes VIP"
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
                    rows={2}
                    placeholder="Describe este segmento..."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium">
                      Condiciones *
                    </label>
                    <button
                      onClick={addCondition}
                      className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Condición
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.conditions.map((condition, index) => {
                      const field = availableFields.find(
                        (f) => f.id === condition.field
                      );
                      const fieldType = field?.type || "string";

                      return (
                        <div
                          key={index}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="grid grid-cols-12 gap-3 items-start">
                            {/* Field */}
                            <div className="col-span-4">
                              <select
                                value={condition.field}
                                onChange={(e) =>
                                  updateCondition(index, { field: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              >
                                {availableFields.map((field) => (
                                  <option key={field.id} value={field.id}>
                                    {field.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Operator */}
                            <div className="col-span-3">
                              <select
                                value={condition.operator}
                                onChange={(e) =>
                                  updateCondition(index, {
                                    operator: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              >
                                {operators[fieldType as keyof typeof operators].map(
                                  (op) => (
                                    <option key={op.id} value={op.id}>
                                      {op.label}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            {/* Value */}
                            <div className="col-span-4">
                              <input
                                type={
                                  fieldType === "number"
                                    ? "number"
                                    : fieldType === "date"
                                    ? "date"
                                    : "text"
                                }
                                value={condition.value}
                                onChange={(e) =>
                                  updateCondition(index, { value: e.target.value })
                                }
                                placeholder="Valor"
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              />
                            </div>

                            {/* Remove */}
                            <div className="col-span-1 flex justify-end">
                              <button
                                onClick={() => removeCondition(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {formData.conditions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                      No hay condiciones. Agrega al menos una condición.
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveSegment}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "Guardando..." : "Guardar Segmento"}
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
