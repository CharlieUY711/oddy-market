import { useState } from "react";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Eye,
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
  LineChart,
  Line,
} from "recharts";

type ReportType =
  | "balance"
  | "income"
  | "cashflow"
  | "payables"
  | "receivables";

export function FinancialReports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("balance");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  // Mock data
  const cashflowData = [
    { month: "Ene", ingresos: 45000, egresos: 32000 },
    { month: "Feb", ingresos: 52000, egresos: 38000 },
    { month: "Mar", ingresos: 48000, egresos: 35000 },
    { month: "Abr", ingresos: 61000, egresos: 42000 },
    { month: "May", ingresos: 55000, egresos: 39000 },
    { month: "Jun", ingresos: 67000, egresos: 45000 },
  ];

  const reports = [
    {
      id: "balance",
      name: "Balance General",
      description: "Activos, pasivos y patrimonio",
      icon: FileText,
    },
    {
      id: "income",
      name: "Estado de Resultados",
      description: "Ingresos, costos y utilidades",
      icon: TrendingUp,
    },
    {
      id: "cashflow",
      name: "Flujo de Caja",
      description: "Entradas y salidas de efectivo",
      icon: DollarSign,
    },
    {
      id: "payables",
      name: "Cuentas por Pagar",
      description: "Deudas con proveedores",
      icon: Calendar,
    },
    {
      id: "receivables",
      name: "Cuentas por Cobrar",
      description: "Pagos pendientes de clientes",
      icon: Calendar,
    },
  ];

  function generateReport() {
    // In a real app, this would call the backend
    alert("Generando reporte...\nEsta función se conectará al backend en producción.");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold">Reportes Financieros</h3>
        <p className="text-sm text-muted-foreground">
          Análisis contable y estados financieros
        </p>
      </div>

      {/* Date Range */}
      <div className="bg-white p-4 rounded-lg border border-border">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Desde</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Hasta</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={generateReport}
            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="w-5 h-5" />
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <motion.button
            key={report.id}
            onClick={() => setSelectedReport(report.id as ReportType)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              selectedReport === report.id
                ? "border-primary bg-primary/5"
                : "border-border bg-white hover:border-primary/50"
            }`}
          >
            <report.icon
              className={`w-8 h-8 mb-3 ${
                selectedReport === report.id ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <h4 className="font-bold mb-1">{report.name}</h4>
            <p className="text-sm text-muted-foreground">{report.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Report Content */}
      {selectedReport === "balance" && <BalanceSheet />}
      {selectedReport === "income" && <IncomeStatement />}
      {selectedReport === "cashflow" && <CashflowReport data={cashflowData} />}
      {selectedReport === "payables" && <PayablesReport />}
      {selectedReport === "receivables" && <ReceivablesReport />}
    </div>
  );
}

function BalanceSheet() {
  const data = {
    assets: {
      current: [
        { name: "Efectivo y equivalentes", amount: 45000 },
        { name: "Cuentas por cobrar", amount: 28000 },
        { name: "Inventario", amount: 65000 },
      ],
      fixed: [
        { name: "Propiedad, planta y equipo", amount: 120000 },
        { name: "Depreciación acumulada", amount: -25000 },
      ],
    },
    liabilities: {
      current: [
        { name: "Cuentas por pagar", amount: 32000 },
        { name: "Préstamos a corto plazo", amount: 15000 },
      ],
      longTerm: [{ name: "Préstamos a largo plazo", amount: 50000 }],
    },
  };

  const totalAssets =
    data.assets.current.reduce((sum, item) => sum + item.amount, 0) +
    data.assets.fixed.reduce((sum, item) => sum + item.amount, 0);

  const totalLiabilities =
    data.liabilities.current.reduce((sum, item) => sum + item.amount, 0) +
    data.liabilities.longTerm.reduce((sum, item) => sum + item.amount, 0);

  const equity = totalAssets - totalLiabilities;

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-6">Balance General</h3>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Assets */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">ACTIVOS</h4>

            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">Activos Corrientes</p>
                {data.assets.current.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between text-sm py-1"
                  >
                    <span>{item.name}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="font-semibold mb-2">Activos Fijos</p>
                {data.assets.fixed.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between text-sm py-1"
                  >
                    <span>{item.name}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex justify-between font-bold">
                  <span>TOTAL ACTIVOS</span>
                  <span>${totalAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">
              PASIVOS Y PATRIMONIO
            </h4>

            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">Pasivos Corrientes</p>
                {data.liabilities.current.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between text-sm py-1"
                  >
                    <span>{item.name}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="font-semibold mb-2">Pasivos a Largo Plazo</p>
                {data.liabilities.longTerm.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between text-sm py-1"
                  >
                    <span>{item.name}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex justify-between text-sm py-1">
                  <span>Total Pasivos</span>
                  <span>${totalLiabilities.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span>Patrimonio</span>
                  <span>${equity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border">
                  <span>TOTAL PASIVOS + PATRIMONIO</span>
                  <span>${totalAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncomeStatement() {
  const data = {
    revenue: 150000,
    cogs: 90000,
    operatingExpenses: 35000,
    taxes: 5000,
  };

  const grossProfit = data.revenue - data.cogs;
  const operatingProfit = grossProfit - data.operatingExpenses;
  const netProfit = operatingProfit - data.taxes;

  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h3 className="text-xl font-bold mb-6">Estado de Resultados</h3>

      <div className="space-y-3 max-w-md">
        <div className="flex justify-between py-2">
          <span className="font-semibold">Ingresos</span>
          <span className="font-bold">${data.revenue.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-2 text-red-600">
          <span>Costo de Ventas</span>
          <span>-${data.cogs.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-2 border-t border-border font-semibold">
          <span>Ganancia Bruta</span>
          <span className="text-green-600">${grossProfit.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-2 text-red-600">
          <span>Gastos Operativos</span>
          <span>-${data.operatingExpenses.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-2 border-t border-border font-semibold">
          <span>Ganancia Operativa</span>
          <span className="text-green-600">
            ${operatingProfit.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between py-2 text-red-600">
          <span>Impuestos</span>
          <span>-${data.taxes.toLocaleString()}</span>
        </div>

        <div className="flex justify-between py-3 border-t-2 border-border font-bold text-lg">
          <span>Ganancia Neta</span>
          <span className="text-green-600">${netProfit.toLocaleString()}</span>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Margen Bruto:</span>
            <span className="font-bold">
              {((grossProfit / data.revenue) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Margen Neto:</span>
            <span className="font-bold">
              {((netProfit / data.revenue) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CashflowReport({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h3 className="text-xl font-bold mb-6">Flujo de Caja</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="ingresos"
            stroke="#22c55e"
            strokeWidth={2}
            name="Ingresos"
          />
          <Line
            type="monotone"
            dataKey="egresos"
            stroke="#ef4444"
            strokeWidth={2}
            name="Egresos"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 mb-1">Total Ingresos</p>
          <p className="text-2xl font-bold text-green-600">
            $
            {data
              .reduce((sum, item) => sum + item.ingresos, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700 mb-1">Total Egresos</p>
          <p className="text-2xl font-bold text-red-600">
            $
            {data.reduce((sum, item) => sum + item.egresos, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function PayablesReport() {
  const payables = [
    {
      id: "1",
      supplier: "Proveedor ABC",
      invoice: "FAC-001",
      amount: 15000,
      dueDate: "2024-03-15",
      status: "pending",
    },
    {
      id: "2",
      supplier: "Proveedor XYZ",
      invoice: "FAC-002",
      amount: 8500,
      dueDate: "2024-03-20",
      status: "overdue",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-6">Cuentas por Pagar</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Proveedor
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Factura
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Monto</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Vencimiento
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payables.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.supplier}</td>
                  <td className="px-4 py-3 font-mono text-sm">{item.invoice}</td>
                  <td className="px-4 py-3 font-bold">
                    ${item.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.status === "overdue"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status === "overdue" ? "Vencido" : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReceivablesReport() {
  const receivables = [
    {
      id: "1",
      customer: "Cliente Premium",
      invoice: "VEN-001",
      amount: 25000,
      dueDate: "2024-03-18",
      status: "pending",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-6">Cuentas por Cobrar</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Factura</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Monto</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Vencimiento
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {receivables.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.customer}</td>
                  <td className="px-4 py-3 font-mono text-sm">{item.invoice}</td>
                  <td className="px-4 py-3 font-bold">
                    ${item.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      Pendiente
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
