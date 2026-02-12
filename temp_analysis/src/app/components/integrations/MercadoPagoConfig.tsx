import { useState, useEffect } from "react";
import {
  CreditCard,
  ExternalLink,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Settings,
  Wallet,
  QrCode,
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { motion } from "motion/react";
import { copyToClipboardWithToast } from "/src/utils/clipboard";

interface MPConfig {
  configured: boolean;
  publicKey: string | null;
  testMode: boolean;
}

interface MPStats {
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  totalAmount: number;
}

export function MercadoPagoConfig() {
  const [config, setConfig] = useState<MPConfig | null>(null);
  const [stats, setStats] = useState<MPStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTestCards, setShowTestCards] = useState(false);
  const [apiKeysStored, setApiKeysStored] = useState(false);

  const redirectUri = `${window.location.origin}/payment/success`;

  useEffect(() => {
    fetchConfig();
    fetchStats();
    checkApiKeys();
  }, []);

  // Escuchar actualizaciones de integraciones
  useEffect(() => {
    const handleUpdate = () => {
      fetchConfig();
      checkApiKeys();
    };
    
    window.addEventListener('integrations-updated', handleUpdate);
    return () => window.removeEventListener('integrations-updated', handleUpdate);
  }, []);

  async function checkApiKeys() {
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
        const hasAccessToken = data.keys?.mercadopago_access_token === "********";
        setApiKeysStored(hasAccessToken);
        console.log("MP API Keys check:", { hasAccessToken, keys: data.keys });
      }
    } catch (error) {
      console.error("Error checking API keys:", error);
    }
  }

  async function fetchConfig() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadopago/config`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setTestMode(data.testMode || false);
      }
    } catch (error) {
      console.error("Error fetching MP config:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadopago/stats`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching MP stats:", error);
    }
  }

  async function copyToClipboard(text: string) {
    await copyToClipboardWithToast(text, "Copiado al portapapeles");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const testCards = [
    {
      brand: "Visa",
      number: "4509 9535 6623 3704",
      cvv: "123",
      expiry: "11/25",
      status: "approved",
    },
    {
      brand: "Mastercard",
      number: "5031 7557 3453 0604",
      cvv: "123",
      expiry: "11/25",
      status: "approved",
    },
    {
      brand: "American Express",
      number: "3711 803032 57522",
      cvv: "1234",
      expiry: "11/25",
      status: "approved",
    },
    {
      brand: "Visa (Rechazada)",
      number: "4074 0945 3159 5316",
      cvv: "123",
      expiry: "11/25",
      status: "rejected",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Mercado Pago</h2>
          <p className="text-muted-foreground">
            Acepta pagos con tarjetas, efectivo y más métodos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              Promise.all([fetchConfig(), fetchStats(), checkApiKeys()])
                .finally(() => setLoading(false));
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                Verificar Estado
              </>
            )}
          </button>
          {config?.configured && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Conectado
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Section */}
      {!config?.configured && !apiKeysStored ? (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Configuración de Mercado Pago
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para aceptar pagos con Mercado Pago, sigue estos pasos:
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h4 className="font-semibold">Crea una aplicación en Mercado Pago</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Ve al panel de desarrolladores y crea una nueva aplicación:
              </p>
              <a
                href="https://www.mercadopago.com.ar/developers/panel/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ir a Mercado Pago Developers
              </a>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h4 className="font-semibold">Obtén tus credenciales</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                En tu aplicación, ve a "Credenciales" y obtén:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-2">
                <li><strong>Public Key</strong> - Para el frontend (comienza con APP_USR-)</li>
                <li><strong>Access Token</strong> - Para el backend (privado)</li>
              </ul>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Importante:</strong> Usa las credenciales de PRUEBA primero para hacer testing. Cuando estés listo, cambia a las credenciales de PRODUCCIÓN.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`bg-white border rounded-lg p-4 transition-all ${
              apiKeysStored 
                ? 'border-green-200 bg-green-50/30' 
                : 'border-blue-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {apiKeysStored ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                )}
                <h4 className="font-semibold">
                  Configura las variables en Supabase
                  {apiKeysStored && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      ✓ Completado
                    </span>
                  )}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {apiKeysStored 
                  ? "¡Credenciales configuradas correctamente! Ya puedes procesar pagos."
                  : "Guarda tus credenciales usando el gestor de API Keys del sistema:"
                }
              </p>
              {!apiKeysStored && (
                <>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-2 mb-3">
                    <li><strong>MERCADOPAGO_ACCESS_TOKEN</strong> - Access token (privado)</li>
                    <li><strong>MERCADOPAGO_PUBLIC_KEY</strong> - Public key (opcional, para frontend)</li>
                  </ul>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Tip:</strong> Ve a "Integraciones" → "API Keys" para guardar tus credenciales de forma segura.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <h4 className="font-semibold">Configura las URLs de notificación</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                En tu aplicación de MP, configura estas URLs:
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    URL de retorno exitoso:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-50 border border-border rounded text-sm">
                      {redirectUri}
                    </code>
                    <button
                      onClick={() => copyToClipboard(redirectUri)}
                      className="p-2 hover:bg-muted rounded transition-colors"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    URL de webhook:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-50 border border-border rounded text-sm break-all">
                      {`https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadopago/webhook`}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadopago/webhook`
                        )
                      }
                      className="p-2 hover:bg-muted rounded transition-colors"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : apiKeysStored && !config?.configured ? (
        // Credenciales guardadas pero configuración incompleta
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                ¡Credenciales Guardadas!
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tus credenciales de Mercado Pago están configuradas. Completa el último paso:
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 4 - URLs de notificación */}
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <h4 className="font-semibold">Configura las URLs de notificación</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                En tu aplicación de MP, configura estas URLs:
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    URL de retorno exitoso:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-50 border border-border rounded text-sm">
                      {redirectUri}
                    </code>
                    <button
                      onClick={() => copyToClipboard(redirectUri)}
                      className="p-2 hover:bg-muted rounded transition-colors"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    URL de webhook:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-50 border border-border rounded text-sm break-all">
                      {`https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadopago/webhook`}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadopago/webhook`
                        )
                      }
                      className="p-2 hover:bg-muted rounded transition-colors"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-900">
                    {stats.totalPayments}
                  </span>
                </div>
                <p className="text-sm text-blue-700 font-medium">
                  Pagos Totales
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-900">
                    {stats.successfulPayments}
                  </span>
                </div>
                <p className="text-sm text-green-700 font-medium">
                  Pagos Exitosos
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-900">
                    {stats.pendingPayments}
                  </span>
                </div>
                <p className="text-sm text-orange-700 font-medium">
                  Pagos Pendientes
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-900">
                    ${(stats.totalAmount / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-purple-700 font-medium">
                  Total Recaudado
                </p>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">
              Métodos de Pago Disponibles
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">Tarjetas de Crédito</p>
                  <p className="text-xs text-muted-foreground">
                    Visa, Mastercard, Amex
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium">Tarjetas de Débito</p>
                  <p className="text-xs text-muted-foreground">
                    Todas las tarjetas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                <Wallet className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium">Dinero en Cuenta</p>
                  <p className="text-xs text-muted-foreground">
                    Saldo de Mercado Pago
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                <QrCode className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-medium">QR de Mercado Pago</p>
                  <p className="text-xs text-muted-foreground">
                    Pago con QR
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium">Efectivo</p>
                  <p className="text-xs text-muted-foreground">
                    Rapipago, Pago Fácil
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
                <div>
                  <p className="font-medium">Cuotas sin interés</p>
                  <p className="text-xs text-muted-foreground">
                    Hasta 12 cuotas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Mode */}
          {testMode && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    Modo de Prueba Activo
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Estás usando credenciales de prueba. Los pagos no son reales.
                  </p>
                  <button
                    onClick={() => setShowTestCards(!showTestCards)}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    {showTestCards ? "Ocultar" : "Ver"} tarjetas de prueba
                  </button>
                </div>
              </div>

              {showTestCards && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 mt-4"
                >
                  {testCards.map((card, index) => (
                    <div
                      key={index}
                      className="bg-white border border-yellow-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{card.brand}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            card.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {card.status === "approved" ? "Aprobada" : "Rechazada"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Número</p>
                          <p className="font-mono font-medium">{card.number}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CVV</p>
                          <p className="font-mono font-medium">{card.cvv}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Vencimiento</p>
                          <p className="font-mono font-medium">{card.expiry}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">
                    Nombre del titular: Puedes usar cualquier nombre
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Documentation */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  Información de Configuración
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Tu integración con Mercado Pago está activa. Los pagos se procesan automáticamente y las órdenes se actualizan en tiempo real.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://www.mercadopago.com.ar/developers/es/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Ver documentación de API
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.mercadopago.com.ar/developers/panel/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Panel de desarrolladores
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
