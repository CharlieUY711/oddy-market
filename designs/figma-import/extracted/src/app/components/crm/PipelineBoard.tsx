import { useState, useEffect } from "react";
import {
  Plus,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  ArrowRight,
  X,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: "lead" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  priority: "low" | "medium" | "high";
  source: string;
  assignedTo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

const stages = [
  { id: "lead", label: "Lead", color: "bg-gray-100 text-gray-700" },
  { id: "contacted", label: "Contactado", color: "bg-blue-100 text-blue-700" },
  { id: "qualified", label: "Calificado", color: "bg-purple-100 text-purple-700" },
  { id: "proposal", label: "Propuesta", color: "bg-cyan-100 text-cyan-700" },
  { id: "negotiation", label: "Negociación", color: "bg-orange-100 text-orange-700" },
  { id: "won", label: "Ganado", color: "bg-green-100 text-green-700" },
  { id: "lost", label: "Perdido", color: "bg-red-100 text-red-700" },
];

export function PipelineBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    value: 0,
    stage: "lead" as Lead["stage"],
    priority: "medium" as Lead["priority"],
    source: "",
    assignedTo: "Sin asignar",
    notes: "",
  });

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/leads`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Error loading leads:", error);
    }
  }

  async function saveLead() {
    if (!formData.name || !formData.email) {
      toast.error("Nombre y email son requeridos");
      return;
    }

    setLoading(true);
    try {
      const url = editingLead
        ? `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/leads/${editingLead.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/leads`;

      const response = await fetch(url, {
        method: editingLead ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingLead ? "Lead actualizado" : "Lead creado");
        loadLeads();
        closeModal();
      } else {
        toast.error("Error al guardar lead");
      }
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Error al guardar lead");
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStage(leadId: string, newStage: Lead["stage"]) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/leads/${leadId}/stage`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ stage: newStage }),
        }
      );

      if (response.ok) {
        toast.success("Etapa actualizada");
        loadLeads();
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Error al actualizar etapa");
    }
  }

  async function deleteLead(id: string) {
    if (!confirm("¿Estás seguro de eliminar este lead?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/leads/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Lead eliminado");
        loadLeads();
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Error al eliminar lead");
    }
  }

  function openModal(lead?: Lead) {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        value: lead.value,
        stage: lead.stage,
        priority: lead.priority,
        source: lead.source,
        assignedTo: lead.assignedTo,
        notes: lead.notes,
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingLead(null);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      value: 0,
      stage: "lead",
      priority: "medium",
      source: "",
      assignedTo: "Sin asignar",
      notes: "",
    });
  }

  function getLeadsByStage(stageId: string) {
    return leads.filter((lead) => lead.stage === stageId);
  }

  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const wonValue = leads
    .filter((lead) => lead.stage === "won")
    .reduce((sum, lead) => sum + lead.value, 0);
  const pipelineValue = leads
    .filter((lead) => !["won", "lost"].includes(lead.stage))
    .reduce((sum, lead) => sum + lead.value, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Total Leads</div>
          <div className="text-2xl font-bold">{leads.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">En Pipeline</div>
          <div className="text-2xl font-bold">${pipelineValue.toFixed(0)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Ganados</div>
          <div className="text-2xl font-bold text-green-600">
            ${wonValue.toFixed(0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Conversión</div>
          <div className="text-2xl font-bold">
            {leads.length > 0
              ? ((leads.filter((l) => l.stage === "won").length / leads.length) * 100).toFixed(1)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Add Lead Button */}
      <div className="flex justify-end">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Lead
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.slice(0, 5).map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);
            const stageValue = stageLeads.reduce((sum, lead) => sum + lead.value, 0);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold">{stage.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stageLeads.length} leads · ${stageValue.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold">{lead.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {lead.company}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openModal(lead)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm mb-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-lg font-bold text-primary">
                          ${lead.value.toLocaleString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            lead.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : lead.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {lead.priority === "high"
                            ? "Alta"
                            : lead.priority === "medium"
                            ? "Media"
                            : "Baja"}
                        </span>
                      </div>

                      {/* Move to next stage */}
                      {stage.id !== "won" && stage.id !== "lost" && (
                        <button
                          onClick={() => {
                            const currentIndex = stages.findIndex(
                              (s) => s.id === stage.id
                            );
                            const nextStage = stages[currentIndex + 1];
                            if (nextStage) {
                              updateLeadStage(lead.id, nextStage.id as Lead["stage"]);
                            }
                          }}
                          className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-primary hover:bg-primary/10 py-2 rounded-lg transition-colors"
                        >
                          Mover a siguiente etapa
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No hay leads en esta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Won/Lost Section */}
      <div className="grid md:grid-cols-2 gap-4">
        {stages.slice(5).map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          const stageValue = stageLeads.reduce((sum, lead) => sum + lead.value, 0);

          return (
            <div key={stage.id} className="bg-white p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{stage.label}</h3>
                <span className={`text-xs px-3 py-1 rounded-full ${stage.color}`}>
                  {stageLeads.length} leads · ${stageValue.toFixed(0)}
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                    </div>
                    <span className="font-bold">${lead.value.toLocaleString()}</span>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No hay leads {stage.id === "won" ? "ganados" : "perdidos"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
                  {editingLead ? "Editar Lead" : "Nuevo Lead"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre del Contacto *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Empresa</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Valor Potencial ($)
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Etapa</label>
                    <select
                      value={formData.stage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stage: e.target.value as Lead["stage"],
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prioridad</label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as Lead["priority"],
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fuente</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) =>
                        setFormData({ ...formData, source: e.target.value })
                      }
                      placeholder="Ej: Web, Referido, Evento..."
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
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
                </div>

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

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveLead}
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
