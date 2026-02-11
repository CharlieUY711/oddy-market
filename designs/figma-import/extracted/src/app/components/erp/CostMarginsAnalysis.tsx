import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  Package,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface ProductAnalysis {
  id: string;
  name: string;
  sku: string;
  unitCost: number;
  unitPrice: number;
  margin: number;
  marginPercentage: number;
  soldUnits: number;
  revenue: number;
  profit: number;
}

export function CostMarginsAnalysis() {
  const [products, setProducts] = useState<ProductAnalysis[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [costMethod, setCostMethod] = useState<"average" | "fifo" | "lifo">("average");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/inventory`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const analyzed = data.inventory?.map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          unitCost: item.unitCost || 0,
          unitPrice: item.unitPrice || 0,
          margin: (item.unitPrice || 0) - (item.unitCost || 0),
          marginPercentage:
            item.unitPrice > 0
              ? (((item.unitPrice - item.unitCost) / item.unitPrice) * 100)
              : 0,
          soldUnits: Math.floor(Math.random() * 50), // Mock data
          revenue: 0,
          profit: 0,
        }));

        setProducts(analyzed || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    avgMargin: products.reduce((sum, p) => sum + p.marginPercentage, 0) / (products.length || 1),
    totalProfit: products.reduce((sum, p) => sum + p.profit, 0),
    totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
    highMarginProducts: products.filter((p) => p.marginPercentage > 50).length,
  };

  const marginDistribution = [
    { name: "0-20%", count: products.filter((p) => p.marginPercentage <= 20).length },
    { name: "21-40%", count: products.filter((p) => p.marginPercentage > 20 && p.marginPercentage <= 40).length },
    { name: "41-60%", count: products.filter((p) => p.marginPercentage > 40 && p.marginPercentage <= 60).length },
    { name: "61-80%", count: products.filter((p) => p.marginPercentage > 60 && p.marginPercentage <= 80).length },
    { name: "81-100%", count: products.filter((p) => p.marginPercentage > 80).length },
  ];

  const COLORS = ["#ef4444", "#f97316", "#22c55e", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold">Análisis de Costos y Márgenes</h3>
        <p className="text-sm text-muted-foreground">
          Control de rentabilidad y pricing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <Percent className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{stats.avgMargin.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Margen Promedio</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">${stats.totalProfit.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Ganancia Total</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Ingresos Totales</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{stats.highMarginProducts}</div>
              <div className="text-sm text-muted-foreground">Margen Alto (&gt;50%)</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cost Method Selector */}
      <div className="bg-white p-4 rounded-lg border border-border">
        <label className="block text-sm font-medium mb-2">
          Método de Costeo
        </label>
        <select
          value={costMethod}
          onChange={(e) => setCostMethod(e.target.value as any)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="average">Costo Promedio</option>
          <option value="fifo">FIFO (First In, First Out)</option>
          <option value="lifo">LIFO (Last In, First Out)</option>
        </select>
        <p className="text-sm text-muted-foreground mt-2">
          {costMethod === "average" && "Promedio ponderado de todos los costos de compra"}
          {costMethod === "fifo" && "Primeras entradas son las primeras salidas"}
          {costMethod === "lifo" && "Últimas entradas son las primeras salidas"}
        </p>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-border">
          <h4 className="font-bold mb-4">Distribución de Márgenes</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={marginDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#fb923c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <h4 className="font-bold mb-4">Productos por Margen</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={marginDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {marginDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Producto</th>
                <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Costo</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Precio</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Margen $</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Margen %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-sm font-mono">{product.sku}</td>
                  <td className="px-4 py-3 text-sm">${product.unitCost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    ${product.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    ${product.margin.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold ${
                        product.marginPercentage > 50
                          ? "text-green-600"
                          : product.marginPercentage > 30
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.marginPercentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron productos
          </div>
        )}
      </div>
    </div>
  );
}
