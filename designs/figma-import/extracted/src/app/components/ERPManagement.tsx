import { useState } from "react";
import {
  Package,
  Truck,
  ShoppingCart,
  Warehouse,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  Users,
  BarChart3,
  Globe,
  CheckSquare,
  Layers,
} from "lucide-react";
import { motion } from "motion/react";
import { SuppliersManagement } from "./erp/SuppliersManagement";
import { PurchaseOrdersManagement } from "./erp/PurchaseOrdersManagement";
import { InventoryManagement } from "./erp/InventoryManagement";
import { CostMarginsAnalysis } from "./erp/CostMarginsAnalysis";
import { FinancialReports } from "./erp/FinancialReports";
import { StockMovementsManagement } from "./erp/StockMovementsManagement";
import { CatalogSyncManager } from "./erp/CatalogSyncManager";
import { EnhancedProductsManagement } from "./erp/EnhancedProductsManagement";

type ERPTab = "overview" | "products" | "suppliers" | "purchases" | "inventory" | "stock-movements" | "costs" | "reports" | "catalog-sync";

export function ERPManagement() {
  const [activeTab, setActiveTab] = useState<ERPTab>("overview");

  const tabs = [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Productos Avanzado", icon: Layers },
    { id: "suppliers", label: "Proveedores", icon: Users },
    { id: "purchases", label: "Órdenes de Compra", icon: ShoppingCart },
    { id: "inventory", label: "Inventario", icon: Warehouse },
    { id: "stock-movements", label: "Movimientos Stock", icon: FileText },
    { id: "catalog-sync", label: "Sincronización Catálogos", icon: Globe },
    { id: "costs", label: "Costos y Márgenes", icon: TrendingUp },
    { id: "reports", label: "Reportes Financieros", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-8 h-8 text-primary" />
          ERP Completo
        </h2>
        <p className="text-muted-foreground mt-1">
          Sistema de planificación de recursos empresariales
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ERPTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "overview" && <ERPOverview setActiveTab={setActiveTab} />}
        {activeTab === "products" && <EnhancedProductsManagement />}
        {activeTab === "suppliers" && <SuppliersManagement />}
        {activeTab === "purchases" && <PurchaseOrdersManagement />}
        {activeTab === "inventory" && <InventoryManagement />}
        {activeTab === "stock-movements" && <StockMovementsManagement />}
        {activeTab === "catalog-sync" && <CatalogSyncManager />}
        {activeTab === "costs" && <CostMarginsAnalysis />}
        {activeTab === "reports" && <FinancialReports />}
      </motion.div>
    </div>
  );
}

function ERPOverview({ setActiveTab }: { setActiveTab: (tab: ERPTab) => void }) {
  const stats = [
    {
      label: "Proveedores Activos",
      value: "0",
      icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Órdenes Pendientes",
      value: "0",
      icon: ShoppingCart,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Productos en Stock",
      value: "0",
      icon: Package,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Alertas de Stock",
      value: "0",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Valor del Inventario",
      value: "$0",
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Margen Promedio",
      value: "0%",
      icon: TrendingUp,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg border border-border"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h3 className="font-bold text-lg mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            onClick={() => setActiveTab("suppliers")}
            className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Nuevo Proveedor</span>
          </button>
          <button 
            onClick={() => setActiveTab("stock-movements")}
            className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Ingresar Factura/Remito</span>
          </button>
          <button 
            onClick={() => setActiveTab("stock-movements")}
            className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Package className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium">Ajuste de Stock</span>
          </button>
          <button 
            onClick={() => setActiveTab("reports")}
            className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Ver Reportes</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h3 className="font-bold text-lg mb-4">Actividad Reciente</h3>
        <div className="text-center py-8 text-muted-foreground">
          No hay actividad reciente
        </div>
      </div>
    </div>
  );
}
