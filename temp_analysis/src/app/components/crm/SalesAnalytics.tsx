import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

export function SalesAnalytics() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">(
    "month"
  );
  const [leadsData, setLeadsData] = useState<any>(null);
  const [customersData, setCustomersData] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/crm/analytics?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeadsData(data.leads);
        setCustomersData(data.customers);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  }

  // Mock data for visualization
  const conversionFunnel = [
    { stage: "Leads", count: 150, percentage: 100 },
    { stage: "Contactados", count: 120, percentage: 80 },
    { stage: "Calificados", count: 90, percentage: 60 },
    { stage: "Propuestas", count: 60, percentage: 40 },
    { stage: "Negociación", count: 40, percentage: 27 },
    { stage: "Ganados", count: 25, percentage: 17 },
  ];

  const monthlyRevenue = [
    { month: "Ene", revenue: 45000, leads: 30 },
    { month: "Feb", revenue: 52000, leads: 35 },
    { month: "Mar", revenue: 48000, leads: 28 },
    { month: "Abr", revenue: 61000, leads: 40 },
    { month: "May", revenue: 55000, leads: 32 },
    { month: "Jun", revenue: 67000, leads: 45 },
  ];

  const leadSources = [
    { name: "Website", value: 40, color: "#fb923c" },
    { name: "Referidos", value: 25, color: "#3b82f6" },
    { name: "Redes Sociales", value: 20, color: "#8b5cf6" },
    { name: "Email", value: 10, color: "#22c55e" },
    { name: "Otros", value: 5, color: "#6b7280" },
  ];

  const topPerformers = [
    { name: "Juan Pérez", deals: 12, revenue: 145000, conversion: 45 },
    { name: "María García", deals: 10, revenue: 128000, conversion: 42 },
    { name: "Carlos López", deals: 8, revenue: 95000, conversion: 38 },
    { name: "Ana Martínez", deals: 6, revenue: 72000, conversion: 35 },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Analíticas de Ventas</h3>
        <div className="flex gap-2">
          {(["week", "month", "quarter", "year"] as const).map((range) => (
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
                : range === "quarter"
                ? "Trimestre"
                : "Año"}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <div className="text-2xl font-bold">$325,000</div>
          <div className="text-sm text-muted-foreground">Ingresos del Mes</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">+8%</span>
          </div>
          <div className="text-2xl font-bold">45</div>
          <div className="text-sm text-muted-foreground">Nuevos Leads</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">+5%</span>
          </div>
          <div className="text-2xl font-bold">24%</div>
          <div className="text-sm text-muted-foreground">Tasa de Conversión</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">Estable</span>
          </div>
          <div className="text-2xl font-bold">$13,500</div>
          <div className="text-sm text-muted-foreground">Ticket Promedio</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h4 className="font-bold mb-4">Ingresos Mensuales</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#fb923c"
                strokeWidth={2}
                name="Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Sources */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h4 className="font-bold mb-4">Fuentes de Leads</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={leadSources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {leadSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h4 className="font-bold mb-4">Embudo de Conversión</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={conversionFunnel} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#fb923c" name="Cantidad" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h4 className="font-bold mb-4">Mejores Vendedores</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Vendedor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Deals</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Ingresos</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Conversión
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topPerformers.map((performer, index) => (
                <tr key={performer.name} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{performer.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{performer.deals}</td>
                  <td className="px-4 py-3 font-bold text-green-600">
                    ${performer.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${performer.conversion}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {performer.conversion}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h4 className="font-bold mb-4">Actividad Reciente</h4>
        <div className="space-y-4">
          {[
            {
              action: "Deal cerrado",
              details: "Juan Pérez cerró un deal de $25,000",
              time: "Hace 1 hora",
              type: "success",
            },
            {
              action: "Nuevo lead",
              details: "Lead de alta prioridad desde website",
              time: "Hace 2 horas",
              type: "info",
            },
            {
              action: "Reunión completada",
              details: "María García completó demo con cliente",
              time: "Hace 3 horas",
              type: "info",
            },
            {
              action: "Lead perdido",
              details: "Oportunidad de $15,000 marcada como perdida",
              time: "Hace 5 horas",
              type: "warning",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === "success"
                    ? "bg-green-100 text-green-600"
                    : activity.type === "warning"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {activity.type === "success" ? (
                  <Award className="w-5 h-5" />
                ) : activity.type === "warning" ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.details}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
