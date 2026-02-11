import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Eye,
  MousePointer,
  Plus,
  Play,
  Pause,
  BarChart3,
  Settings,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: "active" | "paused" | "ended";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  startDate: string;
  endDate?: string;
}

export function GoogleAdsManager() {
  const [campaigns, setCampaigns] = useState<GoogleAdsCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<GoogleAdsCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const performanceData = [
    { date: "1 Feb", impressions: 1200, clicks: 45, conversions: 8 },
    { date: "2 Feb", impressions: 1500, clicks: 58, conversions: 12 },
    { date: "3 Feb", impressions: 1800, clicks: 72, conversions: 15 },
    { date: "4 Feb", impressions: 1350, clicks: 51, conversions: 9 },
    { date: "5 Feb", impressions: 2100, clicks: 84, conversions: 18 },
    { date: "6 Feb", impressions: 1900, clicks: 76, conversions: 16 },
    { date: "7 Feb", impressions: 2400, clicks: 96, conversions: 21 },
  ];

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/marketing/google-ads/campaigns`,
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
    } finally {
      setLoading(false);
    }
  }

  async function toggleCampaignStatus(campaignId: string, newStatus: "active" | "paused") {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/marketing/google-ads/campaigns/${campaignId}/status`,
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
        toast.success(`Campaña ${newStatus === "active" ? "activada" : "pausada"}`);
        loadCampaigns();
      } else {
        toast.error("Error al actualizar campaña");
      }
    } catch (error) {
      console.error("Error toggling campaign:", error);
      toast.error("Error al procesar solicitud");
    }
  }

  const totalStats = campaigns.reduce(
    (acc, campaign) => ({
      budget: acc.budget + campaign.budget,
      spent: acc.spent + campaign.spent,
      impressions: acc.impressions + campaign.impressions,
      clicks: acc.clicks + campaign.clicks,
      conversions: acc.conversions + campaign.conversions,
    }),
    { budget: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  const avgCTR = totalStats.impressions > 0 ? (totalStats.clicks / totalStats.impressions) * 100 : 0;
  const avgROAS = totalStats.spent > 0 ? (totalStats.conversions * 100) / totalStats.spent : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Google Ads Manager
          </h2>
          <p className="text-muted-foreground">Gestiona tus campañas publicitarias</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Campaña
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalStats.spent.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Gastado</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            de ${totalStats.budget.toFixed(2)} presupuesto
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStats.impressions.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Impresiones</p>
            </div>
          </div>
          <p className="text-xs text-green-600">+15% vs mes anterior</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MousePointer className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStats.clicks.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Clicks</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">CTR: {avgCTR.toFixed(2)}%</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgROAS.toFixed(1)}x</p>
              <p className="text-sm text-muted-foreground">ROAS</p>
            </div>
          </div>
          <p className="text-xs text-purple-600">Excelente rendimiento</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h3 className="font-bold mb-4">Rendimiento Últimos 7 Días</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="impressions"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Impresiones"
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Clicks"
            />
            <Line
              type="monotone"
              dataKey="conversions"
              stroke="#10B981"
              strokeWidth={2}
              name="Conversiones"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold">Campañas Activas</h3>
        </div>
        <div className="divide-y divide-border">
          {campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No hay campañas</p>
              <p className="text-sm text-muted-foreground mb-4">
                Crea tu primera campaña de Google Ads
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Campaña
              </button>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold">{campaign.name}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          campaign.status === "active"
                            ? "bg-green-100 text-green-700"
                            : campaign.status === "paused"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {campaign.status === "active"
                          ? "Activa"
                          : campaign.status === "paused"
                          ? "Pausada"
                          : "Finalizada"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Presupuesto</p>
                        <p className="font-medium">${campaign.budget}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gastado</p>
                        <p className="font-medium">${campaign.spent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Impresiones</p>
                        <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicks</p>
                        <p className="font-medium">{campaign.clicks}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CTR</p>
                        <p className="font-medium">{campaign.ctr.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROAS</p>
                        <p className="font-medium text-green-600">{campaign.roas.toFixed(1)}x</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                      title="Ver detalles"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        toggleCampaignStatus(
                          campaign.id,
                          campaign.status === "active" ? "paused" : "active"
                        )
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        campaign.status === "active"
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      title={campaign.status === "active" ? "Pausar" : "Activar"}
                    >
                      {campaign.status === "active" ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                      title="Configurar"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg text-white">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Conecta tu cuenta de Google Ads</h3>
            <p className="text-sm text-blue-800 mb-4">
              Para ver y gestionar tus campañas reales, conecta tu cuenta de Google Ads usando la
              API oficial.
            </p>
            <a
              href="https://ads.google.com/intl/es_es/home/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Ir a Google Ads
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Nueva Campaña de Google Ads</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la Campaña</label>
                <input
                  type="text"
                  placeholder="Ej: Campaña Verano 2026"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Presupuesto Diario</label>
                  <input
                    type="number"
                    placeholder="50"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Campaña</label>
                  <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                    <option>Búsqueda</option>
                    <option>Display</option>
                    <option>Shopping</option>
                    <option>Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Palabras Clave</label>
                <textarea
                  placeholder="Ingresa palabras clave separadas por comas"
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL de Destino</label>
                <input
                  type="url"
                  placeholder="https://oddy-market.com/products"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    toast.success("Campaña creada (demo)");
                    setShowCreateModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Campaña
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
