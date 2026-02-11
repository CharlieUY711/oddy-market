import { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Sparkles,
  Plus,
  FileCheck,
  FileBarChart,
  Receipt,
  Package,
  Truck,
  File,
  Loader2,
  Settings,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface DocumentGeneratorProps {
  onClose?: () => void;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  type: "invoice" | "quote" | "packing_slip" | "purchase_order" | "contract" | "report" | "custom";
  color: string;
  aiGenerate?: boolean;
}

export function DocumentGenerator({ onClose }: DocumentGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const templates: DocumentTemplate[] = [
    {
      id: "invoice",
      name: "Factura",
      description: "Factura comercial con detalle de productos y servicios",
      icon: Receipt,
      type: "invoice",
      color: "from-blue-50 to-blue-100 border-blue-200",
    },
    {
      id: "quote",
      name: "Presupuesto",
      description: "Cotización de productos y servicios",
      icon: FileText,
      type: "quote",
      color: "from-green-50 to-green-100 border-green-200",
    },
    {
      id: "packing_slip",
      name: "Remito",
      description: "Documento de envío con detalle de mercadería",
      icon: Package,
      type: "packing_slip",
      color: "from-orange-50 to-orange-100 border-orange-200",
    },
    {
      id: "purchase_order",
      name: "Orden de Compra",
      description: "Orden de compra a proveedores",
      icon: FileBarChart,
      type: "purchase_order",
      color: "from-purple-50 to-purple-100 border-purple-200",
    },
    {
      id: "delivery_note",
      name: "Nota de Entrega",
      description: "Comprobante de entrega de mercadería",
      icon: Truck,
      type: "packing_slip",
      color: "from-cyan-50 to-cyan-100 border-cyan-200",
    },
    {
      id: "contract",
      name: "Contrato",
      description: "Contrato comercial o de servicios",
      icon: FileCheck,
      type: "contract",
      color: "from-pink-50 to-pink-100 border-pink-200",
    },
    {
      id: "report",
      name: "Reporte",
      description: "Reportes personalizados y análisis",
      icon: FileBarChart,
      type: "report",
      color: "from-indigo-50 to-indigo-100 border-indigo-200",
    },
    {
      id: "custom",
      name: "Documento Personalizado",
      description: "Crea cualquier documento con IA",
      icon: Sparkles,
      type: "custom",
      color: "from-yellow-50 to-yellow-100 border-yellow-200",
      aiGenerate: true,
    },
  ];

  async function handleGenerateDocument(template: DocumentTemplate) {
    if (template.aiGenerate) {
      setShowAIPrompt(true);
      setSelectedTemplate(template);
      return;
    }

    setGenerating(true);
    setSelectedTemplate(template);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/documents/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templateId: template.id,
            type: template.type,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Documento generado exitosamente");
        
        // Trigger download
        if (data.downloadUrl) {
          const a = document.createElement("a");
          a.href = data.downloadUrl;
          a.download = `${template.name}-${Date.now()}.pdf`;
          a.click();
        }
      } else {
        toast.error("Error al generar documento");
      }
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Error al generar documento");
    } finally {
      setGenerating(false);
      setSelectedTemplate(null);
    }
  }

  async function handleAIGenerate() {
    if (!aiPrompt.trim()) {
      toast.error("Describe qué documento necesitas");
      return;
    }

    setGenerating(true);
    setShowAIPrompt(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/documents/ai-generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: aiPrompt,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Documento generado con IA");
        
        if (data.downloadUrl) {
          const a = document.createElement("a");
          a.href = data.downloadUrl;
          a.download = `documento-ai-${Date.now()}.pdf`;
          a.click();
        }
      } else {
        toast.error("Error al generar documento");
      }
    } catch (error) {
      console.error("Error generating AI document:", error);
      toast.error("Error al generar documento");
    } finally {
      setGenerating(false);
      setSelectedTemplate(null);
      setAiPrompt("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" />
            Generador de Documentos
          </h2>
          <p className="text-muted-foreground mt-1">
            Crea facturas, presupuestos, contratos y más con IA
          </p>
        </div>
      </div>

      {/* AI Prompt Modal */}
      {showAIPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAIPrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 max-w-2xl w-full"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Generar Documento con IA
            </h3>
            
            <p className="text-muted-foreground mb-4">
              Describe qué documento necesitas y la IA lo generará por ti
            </p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ejemplo: Necesito un contrato de prestación de servicios de diseño web por 3 meses, con renovación automática y confidencialidad..."
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              rows={6}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIPrompt(false)}
                className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAIGenerate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                Generar con IA
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            onClick={() => handleGenerateDocument(template)}
            disabled={generating && selectedTemplate?.id === template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative bg-gradient-to-br ${template.color} border-2 rounded-lg p-6 text-left transition-all hover:shadow-lg disabled:opacity-50`}
          >
            {template.aiGenerate && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full">
                IA
              </div>
            )}

            <div className="flex flex-col items-start gap-4">
              <div className="p-3 bg-white rounded-lg">
                <template.icon className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>

              {generating && selectedTemplate?.id === template.id ? (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Plus className="w-4 h-4" />
                  <span>Generar</span>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="bg-white border border-border rounded-lg p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <File className="w-5 h-5" />
          Documentos Recientes
        </h3>

        <div className="space-y-3">
          {[
            { name: "Factura #0001234", date: "Hoy, 14:30", type: "invoice" },
            { name: "Presupuesto Cliente XYZ", date: "Ayer, 16:45", type: "quote" },
            { name: "Remito #5678", date: "3 días atrás", type: "packing_slip" },
          ].map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">{doc.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold mb-2">Generación Inteligente con IA</h3>
            <p className="text-sm text-muted-foreground">
              Todos los documentos pueden personalizarse automáticamente con datos de tu sistema.
              La opción "Documento Personalizado" te permite crear cualquier tipo de documento
              simplemente describiéndolo en lenguaje natural.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
