import { useState, useEffect } from "react";
import { 
  Shield, Activity, FileText, AlertTriangle, CheckCircle,
  Search, Filter, Download, Eye, Clock, User, Server,
  Lock, ShoppingCart, Package, Settings, Globe, Smartphone,
  TrendingUp, XCircle, RefreshCw, Database, Zap, Ban,
  Bell, BarChart3, PieChart, Users, AlertCircle, Trash2,
  Calendar, Award, LineChart as LineChartIcon, LayoutDashboard
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface AuditLogsProps {
  session: any;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: string;
  category: string;
  severity: "info" | "warning" | "error" | "critical";
  user?: string;
  userId?: string;
  action: string;
  details: any;
  ip?: string;
  userAgent?: string;
}

export function AuditLogs({ session }: AuditLogsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Stats
  const [stats, setStats] = useState({
    totalLogs: 0,
    errors: 0,
    warnings: 0,
    activeSessions: 0,
    failedLogins: 0,
    suspiciousActivity: 0,
  });

  // Advanced features
  const [analytics, setAnalytics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [securityChecks, setSecurityChecks] = useState<any>(null);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    } else if (activeTab === "overview") {
      fetchOverviewData();
    } else if (activeTab === "analytics") {
      fetchAnalytics();
    } else if (activeTab === "alerts") {
      fetchAlerts();
    } else if (activeTab === "compliance") {
      fetchCompliance();
    } else if (activeTab === "sessions") {
      fetchSessionData();
    } else if (activeTab === "integrations") {
      fetchIntegrationStatus();
    }
  }, [activeTab, filterCategory, filterSeverity]);

  async function fetchOverviewData() {
    setLoading(true);
    try {
      await Promise.all([
        fetchLogs(),
        fetchAlerts(),
        fetchPerformanceMetrics(),
      ]);
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (filterSeverity !== "all") params.append("severity", filterSeverity);
      if (searchTerm) params.append("search", searchTerm);
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/logs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Error al cargar logs");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/analytics`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAlerts() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/alerts`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }

  async function fetchCompliance() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/compliance`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCompliance(data.compliance);
      }
    } catch (error) {
      console.error("Error fetching compliance:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPerformanceMetrics() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/metrics`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPerformanceMetrics(data.performance);
        setSecurityChecks(data.security);
      }
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
    }
  }

  async function fetchSessionData() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/sessions`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchIntegrationStatus() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/integrations`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.integrations || []);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function exportLogs() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
          body: JSON.stringify({
            category: filterCategory,
            severity: filterSeverity,
            dateRange,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Logs exportados exitosamente");
      }
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast.error("Error al exportar logs");
    }
  }

  async function clearOldLogs(daysOld: number) {
    if (!confirm(`¿Estás seguro de eliminar todos los logs con más de ${daysOld} días?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/clear-old`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
          body: JSON.stringify({ daysOld }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deleted} logs eliminados exitosamente`);
        fetchLogs();
      }
    } catch (error) {
      console.error("Error clearing logs:", error);
      toast.error("Error al eliminar logs");
    }
  }

  async function generateSampleLogs() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/seed`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.created} logs de muestra creados`);
        fetchLogs();
      }
    } catch (error) {
      console.error("Error generating sample logs:", error);
      toast.error("Error al generar logs de muestra");
    }
  }

  const tabs = [
    { id: "overview", label: "Vista General", icon: LayoutDashboard },
    { id: "logs", label: "Logs", icon: FileText },
    { id: "analytics", label: "Analíticas", icon: BarChart3 },
    { id: "alerts", label: "Alertas", icon: Bell },
    { id: "compliance", label: "Compliance", icon: Award },
    { id: "sessions", label: "Sesiones", icon: User },
    { id: "integrations", label: "Integraciones", icon: Globe },
  ];

  const logCategories = [
    { value: "all", label: "Todos" },
    { value: "access", label: "Acceso" },
    { value: "error", label: "Errores" },
    { value: "transaction", label: "Transacciones" },
    { value: "auth", label: "Autenticación" },
    { value: "inventory", label: "Inventario" },
    { value: "admin", label: "Acciones Admin" },
    { value: "user_profile", label: "Perfiles" },
    { value: "order_status", label: "Estado Órdenes" },
    { value: "system", label: "Sistema" },
    { value: "integration", label: "Integraciones" },
  ];

  function getSeverityColor(severity: string) {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-700 border-red-300";
      case "error": return "bg-orange-100 text-orange-700 border-orange-300";
      case "warning": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default: return "bg-blue-100 text-blue-700 border-blue-300";
    }
  }

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "critical": return XCircle;
      case "error": return AlertTriangle;
      case "warning": return AlertTriangle;
      default: return CheckCircle;
    }
  }

  const COLORS = ['#ff6b35', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#48dbfb'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Auditoría y Logs</h2>
            <p className="text-muted-foreground">
              Monitoreo, seguridad y trazabilidad completa
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={generateSampleLogs}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Generar Datos Demo
          </button>
          <button
            onClick={() => clearOldLogs(90)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Limpiar Logs Antiguos
          </button>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-red-600 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-2">
                {alerts.length} {alerts.length === 1 ? "Alerta Activa" : "Alertas Activas"}
              </h4>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert: any) => (
                  <div key={alert.id} className="text-sm text-red-700">
                    <strong>{alert.title}:</strong> {alert.message}
                  </div>
                ))}
              </div>
              {alerts.length > 3 && (
                <button
                  onClick={() => setActiveTab("alerts")}
                  className="text-sm text-red-600 font-medium mt-2 hover:underline"
                >
                  Ver todas las alertas →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-muted-foreground">Total Logs</p>
          </div>
          <p className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-xs text-muted-foreground">Errores</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <p className="text-xs text-muted-foreground">Warnings</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-green-600" />
            <p className="text-xs text-muted-foreground">Sesiones Activas</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.activeSessions}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-orange-600" />
            <p className="text-xs text-muted-foreground">Logins Fallidos</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.failedLogins}</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-4 h-4 text-red-600" />
            <p className="text-xs text-muted-foreground">Actividad Sospechosa</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.suspiciousActivity}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "bg-muted hover:bg-muted-foreground/10"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          {performanceMetrics && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-green-900">Métricas de Performance</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Tiempo de Respuesta Promedio</p>
                  <p className="text-2xl font-bold text-green-900">{performanceMetrics.avgResponseTime}ms</p>
                  <p className="text-xs text-green-600 mt-1">
                    {performanceMetrics.responseTimeChange > 0 ? "↑" : "↓"} {Math.abs(performanceMetrics.responseTimeChange)}% vs ayer
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                  <p className="text-2xl font-bold text-green-900">{performanceMetrics.uptime.toFixed(2)}%</p>
                  <p className="text-xs text-green-600 mt-1">
                    {performanceMetrics.downtimeMinutes} min de downtime este mes
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Requests/min</p>
                  <p className="text-2xl font-bold text-green-900">{performanceMetrics.requestsPerMin}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Pico: {performanceMetrics.peakRequests} req/min
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Checks */}
          {securityChecks && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-red-900">Verificaciones de Seguridad</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {securityChecks.checks?.map((check: any, idx: number) => {
                  const Icon = check.passed ? CheckCircle : XCircle;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-4 rounded-lg ${
                        check.passed
                          ? "bg-green-100 border border-green-300"
                          : "bg-red-100 border border-red-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${check.passed ? "text-green-600" : "text-red-600"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${check.passed ? "text-green-900" : "text-red-900"}`}>
                          {check.name}
                        </p>
                        <p className={`text-sm ${check.passed ? "text-green-700" : "text-red-700"}`}>
                          {check.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-purple-900">Compliance SEO</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Meta tags optimizados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Sitemap actualizado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Schema markup implementado</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-900">Compliance Legal</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Política de privacidad publicada</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Términos y condiciones actualizados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>GDPR compliance activo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white border border-border rounded-lg p-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ID, usuario, acción..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoría</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {logCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Severidad</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todos</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={fetchLogs}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtrar
                </button>
                <button
                  onClick={exportLogs}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  title="Exportar logs"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Cargando logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay logs que coincidan con los filtros</p>
                <button
                  onClick={generateSampleLogs}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Generar Logs de Muestra
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {logs.map((log) => {
                  const SeverityIcon = getSeverityIcon(log.severity);
                  return (
                    <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getSeverityColor(log.severity)}`}>
                          <SeverityIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{log.action}</span>
                              <span className={`px-2 py-0.5 rounded text-xs border ${getSeverityColor(log.severity)}`}>
                                {log.severity}
                              </span>
                              <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                {log.category}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>

                          {log.user && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Usuario: <span className="font-medium">{log.user}</span>
                            </p>
                          )}

                          {log.details && (
                            <details className="text-sm text-muted-foreground">
                              <summary className="cursor-pointer hover:text-foreground">
                                Ver detalles
                              </summary>
                              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {log.ip && (
                              <span className="flex items-center gap-1">
                                <Server className="w-3 h-3" />
                                {log.ip}
                              </span>
                            )}
                            {log.userAgent && (
                              <span className="flex items-center gap-1">
                                <Smartphone className="w-3 h-3" />
                                {log.userAgent.includes("Mobile") ? "Mobile" : "Desktop"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Cargando analíticas...</p>
            </div>
          ) : analytics ? (
            <>
              {/* Summary Cards */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Logs</p>
                  <p className="text-2xl font-bold">{analytics.summary.total.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Últimas 24h</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.summary.last24h}</p>
                </div>
                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Últimos 7 días</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.summary.last7d}</p>
                </div>
                <div className="bg-white border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Tasa de Errores (24h)</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.summary.errorRate24h}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Logs by Hour */}
                <div className="bg-white border border-border rounded-lg p-6">
                  <h3 className="font-bold mb-4">Actividad por Hora (últimas 24h)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.logsByHour.map((count: number, idx: number) => ({
                      hour: `${idx}h`,
                      logs: count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="logs" fill="#4ecdc4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Logs by Severity */}
                <div className="bg-white border border-border rounded-lg p-6">
                  <h3 className="font-bold mb-4">Distribución por Severidad</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={Object.entries(analytics.logsBySeverity).map(([name, value]) => ({
                          name,
                          value
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.keys(analytics.logsBySeverity).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Users */}
              <div className="bg-white border border-border rounded-lg p-6">
                <h3 className="font-bold mb-4">Usuarios Más Activos</h3>
                <div className="space-y-2">
                  {analytics.topUsers.map((userStat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <span className="font-medium">{userStat.user}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{userStat.count} acciones</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Errors */}
              {analytics.topErrors.length > 0 && (
                <div className="bg-white border border-border rounded-lg p-6">
                  <h3 className="font-bold mb-4">Errores Más Frecuentes</h3>
                  <div className="space-y-2">
                    {analytics.topErrors.map((error: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <span className="text-sm font-medium text-red-900">{error.error}</span>
                        <span className="text-sm text-red-600">{error.count} veces</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={fetchAnalytics}
              className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Cargar Analíticas
            </button>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Cargando alertas...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-white border border-border rounded-lg p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Todo está funcionando correctamente</h3>
              <p className="text-muted-foreground">No hay alertas activas en este momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: any) => {
                const bgColor = alert.type === "critical" ? "bg-red-50 border-red-300" 
                  : alert.type === "error" ? "bg-orange-50 border-orange-300"
                  : "bg-yellow-50 border-yellow-300";
                
                const textColor = alert.type === "critical" ? "text-red-900" 
                  : alert.type === "error" ? "text-orange-900"
                  : "text-yellow-900";

                return (
                  <div key={alert.id} className={`border-2 rounded-lg p-4 ${bgColor}`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 ${textColor}`} />
                      <div className="flex-1">
                        <h4 className={`font-bold ${textColor}`}>{alert.title}</h4>
                        <p className={`text-sm ${textColor} opacity-90`}>{alert.message}</p>
                        <p className="text-xs opacity-75 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Ejecutando auditoría de compliance...</p>
            </div>
          ) : compliance ? (
            <>
              {/* Compliance Status */}
              <div className={`border-2 rounded-xl p-6 ${
                compliance.status === "compliant" 
                  ? "bg-green-50 border-green-300"
                  : "bg-yellow-50 border-yellow-300"
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <Award className={`w-8 h-8 ${
                    compliance.status === "compliant" ? "text-green-600" : "text-yellow-600"
                  }`} />
                  <div>
                    <h3 className="text-xl font-bold">
                      {compliance.status === "compliant" ? "Sistema Compliant" : "Requiere Atención"}
                    </h3>
                    <p className="text-sm opacity-75">
                      Última verificación: {new Date(compliance.lastCheck).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Total Logs</p>
                    <p className="text-lg font-bold">{compliance.stats.totalLogs.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Logs Antiguos (&gt;90d)</p>
                    <p className="text-lg font-bold">{compliance.stats.oldLogs.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Acceso a Datos (30d)</p>
                    <p className="text-lg font-bold">{compliance.stats.customerDataAccess}</p>
                  </div>
                </div>
              </div>

              {/* Compliance Checks */}
              <div className="bg-white border border-border rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Verificaciones de Compliance</h3>
                <div className="space-y-3">
                  {compliance.checks.map((check: any, idx: number) => {
                    const Icon = check.passed ? CheckCircle : XCircle;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-4 rounded-lg ${
                          check.passed
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mt-0.5 ${check.passed ? "text-green-600" : "text-red-600"}`} />
                        <div className="flex-1">
                          <p className={`font-medium ${check.passed ? "text-green-900" : "text-red-900"}`}>
                            {check.name}
                          </p>
                          <p className={`text-sm ${check.passed ? "text-green-700" : "text-red-700"}`}>
                            {check.description}
                          </p>
                          {!check.passed && check.recommendation && (
                            <p className="text-xs text-red-600 mt-2">
                              💡 Recomendación: {check.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={fetchCompliance}
              className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ejecutar Auditoría de Compliance
            </button>
          )}
        </div>
      )}

      {/* Sessions Tab - Placeholder */}
      {activeTab === "sessions" && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">Control de Sesiones</h3>
          <p className="text-muted-foreground">Gestión de tokens, actividad y detección de anomalías</p>
        </div>
      )}

      {/* Integrations Tab - Placeholder */}
      {activeTab === "integrations" && (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">Estado de Integraciones</h3>
          <p className="text-muted-foreground">Framework, conectores, adaptadores y sincronizaciones</p>
        </div>
      )}
    </div>
  );
}
