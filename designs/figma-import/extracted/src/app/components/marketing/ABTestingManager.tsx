import { useState } from "react";
import { BarChart3, Plus, Play, Pause, CheckCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ABTest {
  id: string;
  name: string;
  type: "landing" | "email" | "button" | "price";
  status: "running" | "paused" | "completed";
  variantA: {
    name: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
  };
  variantB: {
    name: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
  };
  winner?: "A" | "B";
  startDate: string;
}

export function ABTestingManager() {
  const [tests, setTests] = useState<ABTest[]>([
    {
      id: "1",
      name: "Botón CTA Principal",
      type: "button",
      status: "running",
      variantA: {
        name: "Comprar Ahora",
        visitors: 1250,
        conversions: 187,
        conversionRate: 14.96,
      },
      variantB: {
        name: "Agregar al Carrito",
        visitors: 1280,
        conversions: 224,
        conversionRate: 17.5,
      },
      winner: "B",
      startDate: "2026-02-01",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            A/B Testing
          </h2>
          <p className="text-muted-foreground">Optimiza tu conversión con pruebas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-5 h-5" />
          Nueva Prueba
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">{tests.length}</p>
          <p className="text-sm text-muted-foreground">Tests totales</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">{tests.filter((t) => t.status === "running").length}</p>
          <p className="text-sm text-muted-foreground">En ejecución</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold text-green-600">+22%</p>
          <p className="text-sm text-muted-foreground">Mejora promedio</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">95%</p>
          <p className="text-sm text-muted-foreground">Confianza estadística</p>
        </div>
      </div>

      {/* Tests List */}
      {tests.map((test) => {
        const chartData = [
          {
            name: test.variantA.name,
            conversiones: test.variantA.conversions,
            visitantes: test.variantA.visitors,
          },
          {
            name: test.variantB.name,
            conversiones: test.variantB.conversions,
            visitantes: test.variantB.visitors,
          },
        ];

        return (
          <div key={test.id} className="bg-white p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{test.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      test.status === "running"
                        ? "bg-green-100 text-green-700"
                        : test.status === "paused"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {test.status === "running" ? "Activo" : test.status === "paused" ? "Pausado" : "Completado"}
                  </span>
                  {test.winner && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Ganador: Variante {test.winner}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Tipo: {test.type} • Inicio: {new Date(test.startDate).toLocaleDateString()}
                </p>
              </div>

              <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                {test.status === "running" ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className={`p-4 rounded-lg border-2 ${test.winner === "A" ? "border-green-500 bg-green-50" : "border-border"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold">Variante A</h4>
                  {test.winner === "A" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <p className="text-lg font-medium mb-2">{test.variantA.name}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visitantes:</span>
                    <span className="font-medium">{test.variantA.visitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversiones:</span>
                    <span className="font-medium">{test.variantA.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasa de conversión:</span>
                    <span className="font-bold text-lg">{test.variantA.conversionRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${test.winner === "B" ? "border-green-500 bg-green-50" : "border-border"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold">Variante B</h4>
                  {test.winner === "B" && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <p className="text-lg font-medium mb-2">{test.variantB.name}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visitantes:</span>
                    <span className="font-medium">{test.variantB.visitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversiones:</span>
                    <span className="font-medium">{test.variantB.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasa de conversión:</span>
                    <span className="font-bold text-lg">{test.variantB.conversionRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div>
              <h4 className="font-medium mb-3">Comparación Visual</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conversiones" fill="#10B981" name="Conversiones" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {test.winner && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  La variante {test.winner} superó a la otra por{" "}
                  {Math.abs(test.variantB.conversionRate - test.variantA.conversionRate).toFixed(2)}% puntos porcentuales
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
