import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  BarChart3,
  Target,
  Sparkles,
  Save,
  RotateCw,
  Settings,
  CheckCircle2,
  Grid3x3,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: "stats" | "charts" | "lists";
  roles: string[];
}

interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  icon: any;
  widgets: string[];
}

interface DashboardConfigProps {
  session: any;
  onSave: (config: string[]) => void;
  onClose: () => void;
}

export function DashboardConfig({ session, onSave, onClose }: DashboardConfigProps) {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDashboardConfig();
  }, []);

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
        if (data.widgets) {
          setSelectedWidgets(data.widgets);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard config:", error);
    }
  }

  async function saveDashboardConfig() {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/dashboard-config/${session?.user?.email || "default"}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ widgets: selectedWidgets }),
        }
      );

      if (response.ok) {
        toast.success("Configuración guardada exitosamente");
        onSave(selectedWidgets);
      } else {
        toast.error("Error al guardar configuración");
      }
    } catch (error) {
      console.error("Error saving dashboard config:", error);
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  }

  const availableWidgets: DashboardWidget[] = [
    {
      id: "total-sales",
      name: "Ventas Totales",
      description: "Total de ventas del período",
      icon: DollarSign,
      category: "stats",
      roles: ["admin", "editor", "provider"],
    },
    {
      id: "orders-count",
      name: "Cantidad de Órdenes",
      description: "Número de pedidos recibidos",
      icon: ShoppingCart,
      category: "stats",
      roles: ["admin", "editor"],
    },
    {
      id: "customers-count",
      name: "Clientes Activos",
      description: "Total de clientes registrados",
      icon: Users,
      category: "stats",
      roles: ["admin", "editor"],
    },
    {
      id: "products-count",
      name: "Productos Disponibles",
      description: "Inventario disponible",
      icon: Package,
      category: "stats",
      roles: ["admin", "editor", "provider"],
    },
    {
      id: "conversion-rate",
      name: "Tasa de Conversión",
      description: "Porcentaje de visitantes que compran",
      icon: Target,
      category: "stats",
      roles: ["admin", "editor"],
    },
    {
      id: "avg-order",
      name: "Ticket Promedio",
      description: "Valor promedio por orden",
      icon: TrendingUp,
      category: "stats",
      roles: ["admin", "editor"],
    },
    {
      id: "sales-chart",
      name: "Gráfico de Ventas",
      description: "Evolución de ventas mensuales",
      icon: BarChart3,
      category: "charts",
      roles: ["admin", "editor"],
    },
    {
      id: "orders-chart",
      name: "Tendencia de Órdenes",
      description: "Línea temporal de pedidos",
      icon: TrendingUp,
      category: "charts",
      roles: ["admin", "editor"],
    },
    {
      id: "recent-orders",
      name: "Órdenes Recientes",
      description: "Lista de últimos pedidos",
      icon: ShoppingCart,
      category: "lists",
      roles: ["admin", "editor"],
    },
    {
      id: "top-products",
      name: "Productos Más Vendidos",
      description: "Ranking de productos estrella",
      icon: Sparkles,
      category: "lists",
      roles: ["admin", "editor", "provider"],
    },
    {
      id: "low-stock",
      name: "Alertas de Stock",
      description: "Productos con inventario bajo",
      icon: Package,
      category: "lists",
      roles: ["admin", "provider"],
    },
  ];

  const presets: DashboardPreset[] = [
    {
      id: "sales-focused",
      name: "Enfoque en Ventas",
      description: "Ideal para gerentes de ventas y comerciales",
      icon: DollarSign,
      widgets: [
        "total-sales",
        "orders-count",
        "avg-order",
        "conversion-rate",
        "sales-chart",
        "recent-orders",
        "top-products",
      ],
    },
    {
      id: "operations",
      name: "Operaciones",
      description: "Para gestión operativa y logística",
      icon: Settings,
      widgets: [
        "orders-count",
        "products-count",
        "recent-orders",
        "low-stock",
      ],
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Métricas de conversión y engagement",
      icon: Target,
      widgets: [
        "customers-count",
        "conversion-rate",
        "avg-order",
        "sales-chart",
        "top-products",
      ],
    },
    {
      id: "provider",
      name: "Proveedor",
      description: "Vista simplificada para proveedores",
      icon: Package,
      widgets: [
        "total-sales",
        "products-count",
        "top-products",
        "low-stock",
      ],
    },
    {
      id: "executive",
      name: "Ejecutivo",
      description: "Vista general para toma de decisiones",
      icon: LayoutDashboard,
      widgets: [
        "total-sales",
        "orders-count",
        "customers-count",
        "conversion-rate",
        "sales-chart",
        "orders-chart",
      ],
    },
  ];

  function applyPreset(preset: DashboardPreset) {
    setSelectedWidgets(preset.widgets);
    toast.success(`Preset "${preset.name}" aplicado`);
  }

  function toggleWidget(widgetId: string) {
    setSelectedWidgets((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  }

  const categorizedWidgets = {
    stats: availableWidgets.filter((w) => w.category === "stats"),
    charts: availableWidgets.filter((w) => w.category === "charts"),
    lists: availableWidgets.filter((w) => w.category === "lists"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurar Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Personalizá tu vista principal según tus necesidades
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedWidgets([])}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
          <button
            onClick={saveDashboardConfig}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar"}</span>
          </button>
        </div>
      </div>

      {/* Presets */}
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Grid3x3 className="w-5 h-5" />
          Plantillas Predefinidas
        </h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {presets.map((preset) => (
            <motion.button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-4 rounded-lg border border-border hover:border-primary transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <preset.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h4 className="font-bold text-sm mb-1">{preset.name}</h4>
              <p className="text-xs text-muted-foreground">{preset.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Widget Selection */}
      <div className="space-y-6">
        {/* Stats Widgets */}
        <div>
          <h3 className="font-bold mb-3">📊 Métricas y Estadísticas</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedWidgets.stats.map((widget) => (
              <motion.button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedWidgets.includes(widget.id)
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedWidgets.includes(widget.id)
                          ? "bg-primary text-white"
                          : "bg-muted"
                      }`}
                    >
                      <widget.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{widget.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  {selectedWidgets.includes(widget.id) && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Charts Widgets */}
        <div>
          <h3 className="font-bold mb-3">📈 Gráficos y Tendencias</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {categorizedWidgets.charts.map((widget) => (
              <motion.button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedWidgets.includes(widget.id)
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedWidgets.includes(widget.id)
                          ? "bg-primary text-white"
                          : "bg-muted"
                      }`}
                    >
                      <widget.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{widget.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  {selectedWidgets.includes(widget.id) && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Lists Widgets */}
        <div>
          <h3 className="font-bold mb-3">📋 Listas y Detalles</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedWidgets.lists.map((widget) => (
              <motion.button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedWidgets.includes(widget.id)
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedWidgets.includes(widget.id)
                          ? "bg-primary text-white"
                          : "bg-muted"
                      }`}
                    >
                      <widget.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{widget.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  {selectedWidgets.includes(widget.id) && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="font-semibold mb-2">
          ✨ Widgets seleccionados: {selectedWidgets.length}
        </h3>
        <p className="text-sm text-muted-foreground">
          Hacé clic en "Guardar" para aplicar los cambios a tu dashboard principal.
          Podés volver a configurarlo cuando quieras desde el botón de configuración.
        </p>
      </div>
    </div>
  );
}
