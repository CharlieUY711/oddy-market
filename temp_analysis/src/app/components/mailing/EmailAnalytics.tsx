import { useState, useEffect } from "react";
import {
  Mail,
  TrendingUp,
  MousePointer,
  UserX,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export function EmailAnalytics() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/analytics?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  }

  // Mock data
  const performanceData = [
    { month: "Ene", sent: 1200, opens: 480, clicks: 96 },
    { month: "Feb", sent: 1400, opens: 560, clicks: 112 },
    { month: "Mar", sent: 1300, opens: 520, clicks: 104 },
    { month: "Abr", sent: 1600, opens: 640, clicks: 128 },
    { month: "May", sent: 1500, opens: 600, clicks: 120 },
    { month: "Jun", sent: 1800, opens: 720, clicks: 144 },
  ];

  const deviceData = [
    { name: "Desktop", value: 45, color: "#3b82f6" },
    { name: "Mobile", value: 40, color: "#fb923c" },
    { name: "Tablet", value: 15, color: "#8b5cf6" },
  ];

  const topCampaigns = [
    {
      name: "Promoción Verano",
      opens: 850,
      clicks: 170,
      conversions: 45,
      openRate: 42.5,
    },
    {
      name: "Newsletter Semanal",
      opens: 720,
      clicks: 144,
      conversions: 38,
      openRate: 40.0,
    },
    {
      name: "Recuperación Carrito",
      opens: 680,
      clicks: 136,
      conversions: 52,
      openRate: 38.5,
    },
    {
      name: "Bienvenida Nuevos",
      opens: 620,
      clicks: 124,
      conversions: 42,
      openRate: 36.5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Analíticas de Email Marketing</h3>
        <div className="flex gap-2">
          {(["week", "month", "quarter"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-primary text-white"
                  : "bg-white border border-border hover:bg-muted"
              }`}
            >
              {range === "week"
                ? "Semana"
                : range === "month"
                ? "Mes"
                : "Trimestre"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-8 h-8 text-blue-600" />
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <div className="text-2xl font-bold">8,800</div>
          <div className="text-sm text-muted-foreground">Emails Enviados</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-xs text-green-600 font-medium">+5%</span>
          </div>
          <div className="text-2xl font-bold">40.2%</div>
          <div className="text-sm text-muted-foreground">Tasa de Apertura</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <MousePointer className="w-8 h-8 text-purple-600" />
            <span className="text-xs text-green-600 font-medium">+8%</span>
          </div>
          <div className="text-2xl font-bold">8.2%</div>
          <div className="text-sm text-muted-foreground">Tasa de Click</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <UserX className="w-8 h-8 text-red-600" />
            <span className="text-xs text-red-600 font-medium">-2%</span>
          </div>
          <div className="text-2xl font-bold">0.8%</div>
          <div className="text-sm text-muted-foreground">Desuscripciones</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h4 className="font-bold mb-4">Rendimiento en el Tiempo</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sent"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Enviados"
              />
              <Line
                type="monotone"
                dataKey="opens"
                stroke="#22c55e"
                strokeWidth={2}
                name="Aperturas"
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#fb923c"
                strokeWidth={2}
                name="Clicks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h4 className="font-bold mb-4">Aperturas por Dispositivo</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Campaigns */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h4 className="font-bold mb-4">Campañas con Mejor Rendimiento</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Campaña
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Aperturas
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Clicks</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Conversiones
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Open Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topCampaigns.map((campaign, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{campaign.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{campaign.opens}</td>
                  <td className="px-4 py-3">{campaign.clicks}</td>
                  <td className="px-4 py-3 font-bold text-green-600">
                    {campaign.conversions}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${campaign.openRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {campaign.openRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Health Score */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h4 className="font-bold mb-4">Email Health Score</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Deliverability</span>
              <span className="text-2xl font-bold text-green-600">98.5%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: "98.5%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Excelente tasa de entrega
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Engagement</span>
              <span className="text-2xl font-bold text-blue-600">85%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "85%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Muy buena interacción
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">List Health</span>
              <span className="text-2xl font-bold text-orange-600">72%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: "72%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Considera limpiar lista
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Recomendaciones
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              Tu tasa de apertura está por encima del promedio de la industria
              (35%). ¡Sigue así!
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              Considera enviar emails los martes y jueves a las 10 AM para mejor
              engagement.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>
              Limpia tu lista de suscriptores inactivos (&gt;6 meses sin abrir) para
              mejorar deliverability.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
