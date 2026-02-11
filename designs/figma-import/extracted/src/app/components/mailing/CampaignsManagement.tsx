import { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Send,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  htmlContent: string;
  status: "draft" | "scheduled" | "sent" | "sending";
  segment?: string;
  lists: string[];
  scheduledFor?: string;
  sentAt?: string;
  stats: {
    sent: number;
    delivered: number;
    opens: number;
    clicks: number;
    bounces: number;
    unsubscribes: number;
  };
  createdAt: string;
}

export function CampaignsManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/campaigns`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  }

  function getStatusColor(status: Campaign["status"]) {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-700";
      case "sending":
        return "bg-blue-100 text-blue-700";
      case "scheduled":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function getStatusLabel(status: Campaign["status"]) {
    switch (status) {
      case "sent":
        return "Enviada";
      case "sending":
        return "Enviando";
      case "scheduled":
        return "Programada";
      default:
        return "Borrador";
    }
  }

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter((c) => c.status === "sent").length,
    scheduled: campaigns.filter((c) => c.status === "scheduled").length,
    drafts: campaigns.filter((c) => c.status === "draft").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">
            Total Campañas
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Enviadas</div>
          <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Programadas</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.scheduled}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground mb-1">Borradores</div>
          <div className="text-2xl font-bold text-gray-600">{stats.drafts}</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Gestión de Campañas</h3>
        <button
          onClick={() => toast.info("Funcionalidad en desarrollo")}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Campaña
        </button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg border border-border"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-lg">{campaign.name}</h4>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {getStatusLabel(campaign.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {campaign.subject}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {campaign.sentAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Enviado: {new Date(campaign.sentAt).toLocaleDateString()}
                    </span>
                  )}
                  {campaign.scheduledFor && campaign.status === "scheduled" && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Programado:{" "}
                      {new Date(campaign.scheduledFor).toLocaleDateString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {campaign.stats.sent} enviados
                  </span>
                </div>
              </div>

              {/* Stats */}
              {campaign.status === "sent" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:min-w-[400px]">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Aperturas</div>
                    <div className="text-lg font-bold">
                      {campaign.stats.sent > 0
                        ? (
                            (campaign.stats.opens / campaign.stats.sent) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {campaign.stats.opens}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Clicks</div>
                    <div className="text-lg font-bold">
                      {campaign.stats.sent > 0
                        ? (
                            (campaign.stats.clicks / campaign.stats.sent) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {campaign.stats.clicks}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Bounces</div>
                    <div className="text-lg font-bold text-red-600">
                      {campaign.stats.bounces}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">
                      Unsubscribes
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      {campaign.stats.unsubscribes}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toast.info("Vista previa en desarrollo")}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Vista previa"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {campaign.status === "draft" && (
                  <>
                    <button
                      onClick={() => toast.info("Edición en desarrollo")}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toast.info("Envío en desarrollo")}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Enviar"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay campañas creadas. ¡Crea tu primera campaña!
        </div>
      )}
    </div>
  );
}
