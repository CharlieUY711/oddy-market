// Admin Dashboard - ODDY Market System
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Tag,
  Mail,
  FileText,
  Image,
  QrCode,
  Sparkles,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Receipt,
  Store,
  Warehouse,
  Share2,
  Truck,
  Printer,
  Shield,
  Menu,
  X,
  Target,
  Database,
  Eye,
  Clock,
  Plug,
  MessageSquare,
  Brain,
  Grid3x3,
  Ticket,
  RotateCw,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Integrations } from "./Integrations";
import { BillingManagement } from "./BillingManagement";
import { CRMManagement } from "./CRMManagement";
import { MailingManagement } from "./MailingManagement";
import { ERPManagement } from "./ERPManagement";
import { SocialMediaManagement } from "./SocialMediaManagement";
import { ShippingManager } from "./shipping/ShippingManager";
import { SecondHandAdmin } from "./secondhand/SecondHandAdmin";
import { PrintModule } from "./tools/PrintModule";
import { DocumentGenerator } from "./tools/DocumentGenerator";
import { ImageEditor } from "./tools/ImageEditor";
import { DepartmentListManager } from "./tools/DepartmentListManager";
import { SpinWheel } from "./marketing/SpinWheel";
import { GoogleAdsManager } from "./marketing/GoogleAdsManager";
import { CouponsManager } from "./marketing/CouponsManager";
import { LoyaltyProgram } from "./marketing/LoyaltyProgram";
import { PopupBannerManager } from "./marketing/PopupBannerManager";
import { ABTestingManager } from "./marketing/ABTestingManager";
import { CampaignsManager } from "./marketing/CampaignsManager";
import { TwilioWhatsAppManager } from "./integrations/TwilioWhatsAppManager";
import { MediaLibrary } from "./MediaLibrary";
import { EntityManagement } from "./EntityManagement";
import { ArticleCatalog } from "./ArticleCatalog";
import { DashboardConfig } from "./DashboardConfig";
import { AITools } from "./AITools";
import { AuditLogs } from "./AuditLogs";
import { RoleManagement } from "./RoleManagement";
import { ViewConfiguration } from "./ViewConfiguration";
import SystemAudit from "./SystemAudit";
import SystemHealthWidget from "./SystemHealthWidget";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface DashboardProps {
  onClose: () => void;
  session?: any;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color?: string;
  description?: string;
}

export function AdminDashboard({ onClose, session }: DashboardProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardWidgets, setDashboardWidgets] = useState<string[]>([
    "total-sales",
    "orders-count",
    "customers-count",
    "articles-count",
    "sales-chart",
    "orders-chart",
    "recent-orders",
    "top-articles",
  ]);
  const [loadingWidgets, setLoadingWidgets] = useState(true);
  const [kpis, setKpis] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardConfig();
    loadRealKpis();
    loadSalesChart();
    loadTopProducts();
    loadRecentOrders();
  }, [session]);

  async function loadDashboardConfig() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/dashboard-config/${session?.user?.email || "default"}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.widgets && data.widgets.length > 0) {
          setDashboardWidgets(data.widgets);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard config:", error);
    } finally {
      setLoadingWidgets(false);
    }
  }

  async function loadRealKpis() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/analytics/kpis`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setKpis(data.kpis);
      }
    } catch (error) {
      console.error("Error loading KPIs:", error);
    }
  }

  async function loadSalesChart() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/analytics/sales-chart`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSalesData(data.data || []);
      }
    } catch (error) {
      console.error("Error loading sales chart:", error);
    }
  }

  async function loadTopProducts() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/analytics/top-products`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTopProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error loading top products:", error);
    }
  }

  async function loadRecentOrders() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/analytics/recent-orders`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecentOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error loading recent orders:", error);
    }
  }

  function handleDashboardConfigSave(widgets: string[]) {
    setDashboardWidgets(widgets);
    setActiveModule(null);
  }

  const menuSections = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "ecommerce", label: "eCommerce", icon: ShoppingBag },
    { id: "marketing", label: "Marketing", icon: Target },
    { id: "tools", label: "Herramientas", icon: Settings },
    { id: "management", label: "Gestión", icon: Database },
    { id: "system", label: "Sistema", icon: Grid3x3 },
  ];

  const sectionModules: Record<string, MenuItem[]> = {
    ecommerce: [
      { id: "articles", label: "Artículos", icon: Package, color: "from-orange-50 to-orange-100 border-orange-200", description: "Gestión de catálogo y sincronización multi-canal" },
      { id: "media-library", label: "Biblioteca (Imágenes y Archivos)", icon: Image, color: "from-purple-50 to-purple-100 border-purple-200", description: "Gestión centralizada de medios con acceso a editores" },
      { id: "orders", label: "Pedidos", icon: ShoppingCart, color: "from-blue-50 to-blue-100 border-blue-200", description: "Administración de órdenes de compra" },
      { id: "shipping", label: "Envíos", icon: Truck, color: "from-cyan-50 to-cyan-100 border-cyan-200", description: "Sistema completo de logística y tracking" },
    ],
    marketing: [
      { id: "crm", label: "CRM", icon: Users, color: "from-purple-50 to-purple-100 border-purple-200", description: "Gestión de clientes y relaciones" },
      { id: "mailing", label: "Mailing", icon: Mail, color: "from-green-50 to-green-100 border-green-200", description: "Campañas de email con Resend" },
      { id: "social", label: "Redes Sociales", icon: Share2, color: "from-pink-50 to-pink-100 border-pink-200", description: "Meta, Facebook, Instagram, WhatsApp" },
      { id: "wheel", label: "Rueda de Sorteos", icon: RotateCw, color: "from-orange-50 to-orange-100 border-orange-200", description: "Gamificación y engagement" },
      { id: "google-ads", label: "Google Ads", icon: TrendingUp, color: "from-blue-50 to-blue-100 border-blue-200", description: "Campañas publicitarias" },
      { id: "coupons", label: "Cupones", icon: Ticket, color: "from-green-50 to-green-100 border-green-200", description: "Descuentos y promociones" },
      { id: "loyalty", label: "Fidelización", icon: Target, color: "from-purple-50 to-purple-100 border-purple-200", description: "Programa de puntos" },
      { id: "popups", label: "Pop-ups & Banners", icon: MessageSquare, color: "from-yellow-50 to-yellow-100 border-yellow-200", description: "Mensajes promocionales" },
      { id: "ab-testing", label: "A/B Testing", icon: BarChart3, color: "from-indigo-50 to-indigo-100 border-indigo-200", description: "Optimización continua" },
      { id: "campaigns", label: "Campañas", icon: Sparkles, color: "from-pink-50 to-pink-100 border-pink-200", description: "Automatización marketing" },
    ],
    tools: [
      { id: "image-editor", label: "Editor de Imágenes", icon: Image, color: "from-green-50 to-green-100 border-green-200", description: "Edición, filtros y optimización con IA" },
      { id: "document-generator", label: "Generador de Documentos", icon: FileText, color: "from-blue-50 to-blue-100 border-blue-200", description: "Crea facturas, contratos y más con IA" },
      { id: "print", label: "Impresión", icon: Printer, color: "from-purple-50 to-purple-100 border-purple-200", description: "Documentos, etiquetas y códigos de barras" },
      { id: "qr-generator", label: "Generador de QR", icon: QrCode, color: "from-orange-50 to-orange-100 border-orange-200", description: "Códigos QR personalizados con tracking" },
      { id: "ai-tools", label: "Herramientas IA", icon: Brain, color: "from-pink-50 to-purple-100 border-purple-200", description: "Inteligencia artificial y machine learning" },
    ],
    management: [
      { id: "erp", label: "ERP", icon: Warehouse, color: "from-blue-50 to-blue-100 border-blue-200", description: "Sistema completo de gestión empresarial" },
      { id: "inventory", label: "Inventario", icon: Tag, color: "from-cyan-50 to-cyan-100 border-cyan-200", description: "Control de stock y movimientos" },
      { id: "billing", label: "Facturación", icon: Receipt, color: "from-green-50 to-green-100 border-green-200", description: "Emisión de facturas y remitos" },
      { id: "purchase-orders", label: "Órdenes de Compra", icon: FileText, color: "from-yellow-50 to-yellow-100 border-yellow-200", description: "Gestión de compras a proveedores" },
      { id: "secondhand-admin", label: "Second Hand (Moderación)", icon: RotateCw, color: "from-orange-50 to-orange-100 border-orange-200", description: "Aprobar/rechazar publicaciones de segunda mano" },
      { id: "roles", label: "Usuarios (Roles y Permisos)", icon: Shield, color: "from-red-50 to-red-100 border-red-200", description: "Sistema de roles y aprobaciones" },
    ],
    system: [
      { id: "system-audit", label: "Auditoría del Sistema", icon: Shield, color: "from-blue-50 to-blue-100 border-blue-200", description: "Evaluación completa de funcionalidades" },
      { id: "departments", label: "Departamentos", icon: Store, color: "from-cyan-50 to-cyan-100 border-cyan-200", description: "Gestión de departamentos y categorías" },
      { id: "analytics", label: "Analíticas", icon: BarChart3, color: "from-indigo-50 to-indigo-100 border-indigo-200", description: "Reportes avanzados y métricas" },
      { id: "audit", label: "Auditoría y Logs", icon: Clock, color: "from-purple-50 to-purple-100 border-purple-200", description: "Historial de acciones del sistema" },
      { id: "integrations", label: "Integraciones", icon: Plug, color: "from-green-50 to-green-100 border-green-200", description: "RRSS, Mercado Libre, Pagos y más" },
      { id: "api-config", label: "Configurar APIs", icon: Settings, color: "from-orange-50 to-orange-100 border-orange-200", description: "Claves y configuración de servicios" },
      { id: "view-config", label: "Configurar Vistas", icon: Eye, color: "from-pink-50 to-pink-100 border-pink-200", description: "Permisos de visualización por rol" },
    ],
  };

  // Stats se generan dinámicamente desde los KPIs reales
  const stats = kpis ? [
    { 
      label: "Ventas Totales", 
      value: kpis.totalSales.formatted, 
      change: kpis.totalSales.change >= 0 ? `+${kpis.totalSales.change}%` : `${kpis.totalSales.change}%`, 
      icon: DollarSign, 
      color: "text-green-600",
      trend: kpis.totalSales.trend
    },
    { 
      label: "Órdenes", 
      value: kpis.totalOrders.formatted, 
      change: kpis.totalOrders.change >= 0 ? `+${kpis.totalOrders.change}%` : `${kpis.totalOrders.change}%`, 
      icon: ShoppingCart, 
      color: "text-primary",
      trend: kpis.totalOrders.trend
    },
    { 
      label: "Artículos", 
      value: kpis.totalArticles.formatted, 
      change: kpis.totalArticles.new > 0 ? `+${kpis.totalArticles.new}` : "0", 
      icon: Package, 
      color: "text-secondary",
      trend: kpis.totalArticles.trend
    },
    { 
      label: "Clientes", 
      value: kpis.totalCustomers.formatted, 
      change: kpis.totalCustomers.new > 0 ? `+${kpis.totalCustomers.new}` : "0", 
      icon: Users, 
      color: "text-purple-600",
      trend: kpis.totalCustomers.trend
    },
  ] : [
    { label: "Ventas Totales", value: "Cargando...", change: "...", icon: DollarSign, color: "text-green-600" },
    { label: "Órdenes", value: "Cargando...", change: "...", icon: ShoppingCart, color: "text-primary" },
    { label: "Artículos", value: "Cargando...", change: "...", icon: Package, color: "text-secondary" },
    { label: "Clientes", value: "Cargando...", change: "...", icon: Users, color: "text-purple-600" },
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setActiveModule(null);
    setMobileMenuOpen(false);
  };

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const getCurrentPageTitle = () => {
    if (activeModule) {
      for (const modules of Object.values(sectionModules)) {
        const module = modules.find((m) => m.id === activeModule);
        if (module) return module.label;
      }
    }
    const section = menuSections.find((s) => s.id === activeSection);
    return section?.label || "Dashboard";
  };

  const renderModuleCards = (sectionId: string) => {
    const modules = sectionModules[sectionId] || [];
    
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => (
          <motion.button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 bg-gradient-to-br ${module.color} border-2 rounded-lg text-left transition-all hover:shadow-lg`}
          >
            <module.icon className="w-10 h-10 mb-4" style={{ color: 'inherit' }} />
            <h3 className="font-bold text-lg mb-2">{module.label}</h3>
            <p className="text-sm opacity-75">{module.description}</p>
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="w-72 bg-white border-r border-border min-h-screen p-4 hidden lg:block overflow-y-auto">
          <div className="mb-8 pb-6 border-b border-border">
            <h2 className="text-2xl font-bold text-primary mb-1">ODDY Market</h2>
            <p className="text-sm text-muted-foreground">Panel de Administración</p>
          </div>

          <nav className="space-y-2">
            {menuSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === section.id
                    ? "bg-primary text-white shadow-md"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Tip del día
            </h3>
            <p className="text-sm text-muted-foreground">
              Usá las herramientas de IA para optimizar tus descripciones de productos automáticamente
            </p>
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg border border-border"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-border p-4 z-50 overflow-y-auto"
              >
                <div className="mb-8 pb-6 border-b border-border pt-16">
                  <h2 className="text-2xl font-bold text-primary mb-1">ODDY Market</h2>
                  <p className="text-sm text-muted-foreground">Panel de Administración</p>
                </div>

                <nav className="space-y-2">
                  {menuSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{getCurrentPageTitle()}</h1>
              <p className="text-muted-foreground">
                {activeSection === "overview" 
                  ? "Vista general del sistema"
                  : activeModule 
                  ? "Gestión y administración"
                  : "Seleccioná un módulo para comenzar"}
              </p>
            </div>
            <div className="flex gap-3">
              {activeSection === "overview" && !activeModule && (
                <button
                  onClick={() => setActiveModule("dashboard-config")}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Personalizar Dashboard</span>
                </button>
              )}
              {activeModule && (
                <button
                  onClick={() => setActiveModule(null)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  ← Volver
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors hidden lg:block"
              >
                Volver a la tienda
              </button>
            </div>
          </div>

          {/* Overview Dashboard */}
          {activeSection === "overview" && !activeModule && (
            <div className="space-y-6">
              {loadingWidgets ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando tu dashboard personalizado...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  {dashboardWidgets.some(w => ["total-sales", "orders-count", "customers-count", "articles-count", "conversion-rate", "avg-order"].includes(w)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {stats
                        .filter((stat) => {
                          const widgetMap: Record<string, string> = {
                            "Ventas Totales": "total-sales",
                            "Órdenes": "orders-count",
                            "Clientes": "customers-count",
                            "Artículos": "articles-count",
                          };
                          return dashboardWidgets.includes(widgetMap[stat.label]);
                        })
                        .map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-lg border border-border"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                              </div>
                              <span className="text-sm font-medium text-green-600">
                                {stat.change}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                          </motion.div>
                        ))}
                    </div>
                  )}

                  {/* System Health Widget */}
                  <div className="lg:col-span-1">
                    <SystemHealthWidget onViewFullAudit={() => setActiveModule("system-audit")} />
                  </div>

                  {/* Charts */}
                  {(dashboardWidgets.includes("sales-chart") || dashboardWidgets.includes("orders-chart")) && (
                    <div className="grid lg:grid-cols-2 gap-6">
                      {dashboardWidgets.includes("sales-chart") && (
                        <div className="bg-white p-6 rounded-lg border border-border">
                          <h3 className="text-lg font-bold mb-4">Ventas Mensuales</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={salesData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="ventas" fill="#ff6b35" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {dashboardWidgets.includes("orders-chart") && (
                        <div className="bg-white p-6 rounded-lg border border-border">
                          <h3 className="text-lg font-bold mb-4">Tendencia de Órdenes</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={salesData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="ordenes" stroke="#4ecdc4" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recent Orders & Top Products */}
                  {(dashboardWidgets.includes("recent-orders") || dashboardWidgets.includes("top-products")) && (
                    <div className="grid lg:grid-cols-2 gap-6">
                      {dashboardWidgets.includes("recent-orders") && (
                        <div className="bg-white p-6 rounded-lg border border-border">
                          <h3 className="text-lg font-bold mb-4">Órdenes Recientes</h3>
                          <div className="space-y-3">
                            {recentOrders.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No hay órdenes recientes</p>
                              </div>
                            ) : (
                              recentOrders.map((order) => (
                                <div
                                  key={order.id}
                                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium">{order.id}</p>
                                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-primary">
                                      ${order.total.toLocaleString()}
                                    </p>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        order.status === "Completado"
                                          ? "bg-green-100 text-green-700"
                                          : order.status === "Pendiente"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {order.status}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {dashboardWidgets.includes("top-products") && (
                        <div className="bg-white p-6 rounded-lg border border-border">
                          <h3 className="text-lg font-bold mb-4">Productos Más Vendidos</h3>
                          <div className="space-y-3">
                            {topProducts.map((product, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border border-border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center font-bold text-secondary">
                                    #{index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {product.sales} ventas
                                    </p>
                                  </div>
                                </div>
                                <p className="font-bold text-primary">
                                  ${product.revenue.toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty State */}
                  {dashboardWidgets.length === 0 && (
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-dashed border-primary/20 rounded-lg p-12 text-center">
                      <LayoutDashboard className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Dashboard Personalizado</h3>
                      <p className="text-muted-foreground mb-6">
                        No tenés widgets seleccionados. Hacé clic en "Personalizar Dashboard" para elegir qué métricas querés ver.
                      </p>
                      <button
                        onClick={() => setActiveModule("dashboard-config")}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                      >
                        <Settings className="w-5 h-5" />
                        Configurar Dashboard
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Section Module Cards */}
          {activeSection !== "overview" && !activeModule && renderModuleCards(activeSection)}

          {/* Individual Module Views */}
          {activeModule === "articles" && <ArticleCatalog />}

          {activeModule === "orders" && (
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-lg font-bold mb-4">Gestión de Pedidos</h3>
              <p className="text-muted-foreground">Administrá todas las órdenes del sistema</p>
            </div>
          )}

          {activeModule === "shipping" && <ShippingManager onClose={() => setActiveModule(null)} />}
          {activeModule === "crm" && <CRMManagement />}
          {activeModule === "mailing" && <MailingManagement />}
          {activeModule === "social" && <SocialMediaManagement />}
          {activeModule === "wheel" && <SpinWheel />}
          {activeModule === "google-ads" && <GoogleAdsManager />}
          {activeModule === "coupons" && <CouponsManager />}
          {activeModule === "loyalty" && <LoyaltyProgram />}
          {activeModule === "popups" && <PopupBannerManager />}
          {activeModule === "ab-testing" && <ABTestingManager />}
          {activeModule === "campaigns" && <CampaignsManager />}
          {activeModule === "secondhand-admin" && (
            <SecondHandAdmin 
              session={session} 
              onClose={() => setActiveModule(null)} 
            />
          )}

          {activeModule === "media-library" && (
            <MediaLibrary
              onSelectImageEditor={() => setActiveModule("image-editor")}
              onSelectDocumentEditor={() => setActiveModule("document-generator")}
            />
          )}
          {activeModule === "image-editor" && <ImageEditor onClose={() => setActiveModule(null)} />}
          {activeModule === "document-generator" && <DocumentGenerator onClose={() => setActiveModule(null)} />}
          {activeModule === "print" && <PrintModule onClose={() => setActiveModule(null)} />}
          
          {activeModule === "qr-generator" && (
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-lg font-bold mb-4">Generador de QR</h3>
              <p className="text-muted-foreground">Funcionalidad en desarrollo...</p>
            </div>
          )}

          {activeModule === "ai-tools" && <AITools session={session} />}
          {activeModule === "erp" && <ERPManagement />}
          
          {activeModule === "inventory" && (
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-lg font-bold mb-4">Gestión de Inventario</h3>
              <p className="text-muted-foreground">Control de stock y movimientos</p>
            </div>
          )}

          {activeModule === "billing" && <BillingManagement />}
          
          {activeModule === "purchase-orders" && (
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-lg font-bold mb-4">Órdenes de Compra</h3>
              <p className="text-muted-foreground">Gestión de compras a proveedores</p>
            </div>
          )}

          {activeModule === "roles" && <RoleManagement session={session} />}
          {activeModule === "entities" && <EntityManagement />}
          {activeModule === "departments" && <DepartmentListManager onClose={() => setActiveModule(null)} />}
          
          {activeModule === "analytics" && (
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-lg font-bold mb-4">Analíticas Avanzadas</h3>
              <p className="text-muted-foreground">Reportes y métricas detalladas</p>
            </div>
          )}

          {activeModule === "audit" && <AuditLogs session={session} />}
          {activeModule === "system-audit" && <SystemAudit />}
          {activeModule === "integrations" && <Integrations />}
          {activeModule === "dashboard-config" && (
            <DashboardConfig
              session={session}
              onSave={handleDashboardConfigSave}
              onClose={() => setActiveModule(null)}
            />
          )}
          
          {activeModule === "api-config" && (
            <div className="bg-white p-6 rounded-lg border border-border">
              <h3 className="text-lg font-bold mb-4">Configuración de APIs</h3>
              <p className="text-muted-foreground">
                Configurá las integraciones con servicios externos (Mercado Libre, Meta, Google Ads, etc.)
              </p>
            </div>
          )}

          {activeModule === "view-config" && <ViewConfiguration />}
        </main>
      </div>
    </div>
  );
}
