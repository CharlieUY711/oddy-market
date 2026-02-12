import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface StepStatus {
  completed: boolean;
  data?: any;
}

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  checkCompletion: () => Promise<boolean>;
}

export function MercadoPagoSetupWizard() {
  const [expandedStep, setExpandedStep] = useState<string | null>("step1");
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({});
  const [loading, setLoading] = useState(true);
  const [projectIdValue, setProjectIdValue] = useState("");

  useEffect(() => {
    checkAllSteps();
    setProjectIdValue(projectId);
  }, []);

  // Escuchar cambios en las integraciones
  useEffect(() => {
    const handleUpdate = () => {
      checkAllSteps();
    };
    
    window.addEventListener('integrations-updated', handleUpdate);
    return () => window.removeEventListener('integrations-updated', handleUpdate);
  }, []);

  async function checkAllSteps() {
    setLoading(true);
    const statuses: Record<string, StepStatus> = {};

    for (const step of steps) {
      statuses[step.id] = {
        completed: await step.checkCompletion(),
      };
    }

    setStepStatuses(statuses);
    setLoading(false);

    // Auto-expandir el primer paso incompleto
    const firstIncomplete = steps.find(step => !statuses[step.id]?.completed);
    if (firstIncomplete && !expandedStep) {
      setExpandedStep(firstIncomplete.id);
    }
  }

  async function checkMercadoPagoCredentials(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/api-keys`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("MP Keys check:", {
          mercadopago_access_token: data.keys?.mercadopago_access_token,
          mercadopago_public_key: data.keys?.mercadopago_public_key,
          allKeys: Object.keys(data.keys || {})
        });
        // Solo verificamos el access_token porque es el único requerido
        // La public_key es opcional
        return data.keys?.mercadopago_access_token === "********";
      }
      return false;
    } catch (error) {
      console.error("Error checking MP credentials:", error);
      return false;
    }
  }

  async function checkSupabaseConfig(): Promise<boolean> {
    // Supabase siempre está configurado si el proyecto funciona
    return !!projectId;
  }

  async function checkWebhookConfig(): Promise<boolean> {
    // Por ahora, asumimos que si tienen credenciales, configuraron el webhook
    // En el futuro podríamos verificar esto llamando a la API de MP
    return await checkMercadoPagoCredentials();
  }

  const steps: WizardStep[] = [
    {
      id: "step1",
      title: "Crea una aplicación en Mercado Pago",
      description: "Ve al panel de desarrolladores y crea una nueva aplicación",
      checkCompletion: async () => {
        // Este paso se completa cuando obtienen las credenciales
        return await checkMercadoPagoCredentials();
      },
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Ve al panel de desarrolladores y crea una nueva aplicación:
          </p>
          
          <a
            href="https://www.mercadopago.com.ar/developers/panel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ExternalLink className="w-5 h-5" />
            Ir a Mercado Pago Developers
          </a>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 mb-2">Una vez allí:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Click en "Crear aplicación"</li>
              <li>Nombre: "ODDY Market"</li>
              <li>Tipo: "Checkout API" o "Checkout Pro"</li>
              <li>Guarda la aplicación</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "step2",
      title: "Obtén tus credenciales",
      description: "Public Key y Access Token para modo prueba y producción",
      checkCompletion: checkMercadoPagoCredentials,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            En tu aplicación, ve a "Credenciales" y obtén:
          </p>

          <div className="grid gap-4">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">1️⃣</span>
                Public Key
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Para el frontend (comienza con APP_USR- o TEST-)
              </p>
              <div className="bg-muted rounded px-3 py-2 font-mono text-sm">
                TEST-c8b5e7f3-xxxx-xxxx-xxxx...
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">2️⃣</span>
                Access Token
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Para el backend (privado)
              </p>
              <div className="bg-muted rounded px-3 py-2 font-mono text-sm">
                TEST-1234567890123456-xxxxxx...
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Importante:</p>
                <p>
                  Usa las credenciales de PRUEBA primero para hacer testing. 
                  Cuando estés listo, cambia a las credenciales de PRODUCCIÓN.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <a
              href="/admin/integraciones"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ir al Gestor de API Keys →
            </a>
          </div>
        </div>
      ),
    },
    {
      id: "step3",
      title: "Configura las variables en Supabase",
      description: "Agrega estas variables de entorno en tu Edge Function",
      checkCompletion: checkSupabaseConfig,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Agrega estas variables de entorno en tu Edge Function:
          </p>

          <div className="space-y-3">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm font-semibold">MERCADOPAGO_ACCESS_TOKEN</code>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Privado</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Access token (privado) - Solo backend
              </p>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm font-semibold">MERCADOPAGO_PUBLIC_KEY</code>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Público</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Public key (opcional, para frontend)
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">¡Ya está configurado!</p>
                <p>
                  Las credenciales que pegaste en el Gestor de API Keys se guardan 
                  automáticamente y el backend puede acceder a ellas de forma segura.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "step4",
      title: "Configura las URLs de notificación",
      description: "Webhook para recibir notificaciones de pagos",
      checkCompletion: checkWebhookConfig,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            En tu aplicación de MP, configura estas URLs:
          </p>

          <div className="space-y-3">
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2">URL de retorno exitoso:</h4>
              <div className="bg-muted rounded px-3 py-2 font-mono text-sm break-all">
                https://{projectIdValue || "TU_PROJECT_ID"}.supabase.co/success
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold mb-2">URL de retorno fallido:</h4>
              <div className="bg-muted rounded px-3 py-2 font-mono text-sm break-all">
                https://{projectIdValue || "TU_PROJECT_ID"}.supabase.co/failure
              </div>
            </div>

            <div className="border border-primary/50 bg-primary/5 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-primary">URL de notificaciones (Webhook):</h4>
              <div className="bg-white rounded px-3 py-2 font-mono text-sm break-all border border-primary/30">
                https://{projectIdValue || "TU_PROJECT_ID"}.supabase.co/functions/v1/make-server-0dd48dc4/payments/mercadopago-webhook
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Esta es la más importante - recibe notificaciones de pagos en tiempo real
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-medium text-blue-900 mb-2">¿Dónde pego estas URLs?</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>En Mercado Pago Developers, entra a tu aplicación</li>
              <li>Busca "Webhooks" o "Notificaciones IPN" en el menú</li>
              <li>Pega la URL del webhook</li>
              <li>Activa los eventos: "payment" y "merchant_order"</li>
            </ol>
          </div>

          <a
            href="https://www.mercadopago.com.ar/developers/panel/notifications/ipn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Configurar Webhooks en MP
          </a>
        </div>
      ),
    },
  ];

  function toggleStep(stepId: string) {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  }

  const completedCount = Object.values(stepStatuses).filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Configuración de Mercado Pago</h2>
          <button
            onClick={() => checkAllSteps()}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Verificar Estado
              </>
            )}
          </button>
        </div>
        <p className="text-muted-foreground mb-4">
          Sigue estos pasos para integrar Mercado Pago en tu tienda
        </p>
        
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-green-500"
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {completedCount} de {steps.length}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isExpanded = expandedStep === step.id;
          const status = stepStatuses[step.id];
          const isCompleted = status?.completed || false;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg overflow-hidden transition-all ${
                isCompleted
                  ? "border-green-200 bg-green-50/50"
                  : "border-border bg-white"
              }`}
            >
              {/* Step header - clickable */}
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  {/* Step number badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-primary text-white"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base">{step.title}</h3>
                    {step.description && !isExpanded && (
                      <p className="text-sm text-muted-foreground truncate">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Status icon */}
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}

                  {/* Expand icon */}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Step content - expandable */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-border/50">
                      {step.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Success message */}
      {completedCount === steps.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            ¡Configuración Completa!
          </h3>
          <p className="text-green-800 mb-4">
            Mercado Pago está completamente integrado y listo para procesar pagos
          </p>
          <button
            onClick={() => window.location.href = "/admin/ventas"}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Ver Panel de Ventas
          </button>
        </motion.div>
      )}
    </div>
  );
}
