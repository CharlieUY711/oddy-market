import { useState } from "react";
import { TestTube2, Plus, BarChart3, Trophy } from "lucide-react";
import { toast } from "sonner";

export function ABTestingManagement() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-lg border border-border text-center">
        <TestTube2 className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-bold mb-2">A/B Testing</h3>
        <p className="text-muted-foreground mb-6">
          Prueba diferentes versiones de tus emails para optimizar resultados
        </p>

        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          <div className="p-4 border border-border rounded-lg">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-bold mb-1">Subject Lines</h4>
            <p className="text-sm text-muted-foreground">
              Prueba diferentes asuntos
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-bold mb-1">Contenido</h4>
            <p className="text-sm text-muted-foreground">
              Diferentes diseños y textos
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <TestTube2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h4 className="font-bold mb-1">CTAs</h4>
            <p className="text-sm text-muted-foreground">
              Botones y llamados a acción
            </p>
          </div>
        </div>

        <button
          onClick={() => toast.info("A/B Testing próximamente disponible")}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 inline mr-2" />
          Crear Test A/B
        </button>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left max-w-2xl mx-auto">
          <h4 className="font-bold text-blue-900 mb-2">¿Cómo funciona?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Crea 2 o más variantes de tu email</li>
            <li>• Define el porcentaje de audiencia para cada variante</li>
            <li>• Elige la métrica ganadora (opens, clicks, conversions)</li>
            <li>• El sistema envía automáticamente la versión ganadora al resto</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
