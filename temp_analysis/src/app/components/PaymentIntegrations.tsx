import { useState, useEffect } from "react";
import {
  CreditCard,
  Globe,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Settings,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { motion } from "motion/react";

interface IntegrationsStatus {
  mercadolibre: { configured: boolean; userId: string | null };
  mercadopago: { configured: boolean };
  paypal: { configured: boolean };
  stripe: { configured: boolean };
  plexo: { configured: boolean; environment: string };
}

interface SyncResult {
  productId: string;
  mlProductId?: string;
  status: string;
  error?: string;
  permalink?: string;
}

export function PaymentIntegrations() {
  const [status, setStatus] = useState<IntegrationsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [showApiConfig, setShowApiConfig] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/status`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching integrations status:", error);
      toast.error("Error al cargar estado de integraciones");
    } finally {
      setLoading(false);
    }
  }

  async function syncProductsToML() {
    setSyncing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadolibre/sync-products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productIds: null }), // null = todos los productos
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSyncResults(data.results);
        toast.success(
          `${data.synced} productos sincronizados exitosamente${
            data.failed > 0 ? `, ${data.failed} fallidos` : ""
          }`
        );
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al sincronizar productos");
      }
    } catch (error) {
      console.error("Error syncing products:", error);
      toast.error("Error al sincronizar con Mercado Libre");
    } finally {
      setSyncing(false);
    }
  }

  async function syncStockFromML() {
    setSyncing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadolibre/sync-stock`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.synced} productos actualizados desde Mercado Libre`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al sincronizar stock");
      }
    } catch (error) {
      console.error("Error syncing stock:", error);
      toast.error("Error al sincronizar stock");
    } finally {
      setSyncing(false);
    }
  }

  async function fetchMLOrders() {
    setSyncing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadolibre/orders`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.orders.length} órdenes sincronizadas de Mercado Libre`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al obtener órdenes");
      }
    } catch (error) {
      console.error("Error fetching ML orders:", error);
      toast.error("Error al obtener órdenes");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const integrations = [
    {
      id: "mercadolibre",
      name: "Mercado Libre",
      description: "Sincronización de productos, inventario y órdenes",
      icon: ShoppingBag,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      configured: status?.mercadolibre.configured,
      docs: "https://developers.mercadolibre.com.ar/",
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      description: "Pasarela de pago para Argentina y Latinoamérica",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      configured: status?.mercadopago.configured,
      docs: "https://www.mercadopago.com.ar/developers/",
    },
    {
      id: "plexo",
      name: "Plexo 🇺🇾",
      description: "Procesamiento de tarjetas para Uruguay (Visa, Mastercard, OCA, Creditel)",
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      configured: status?.plexo.configured,
      docs: "https://www.plexo.com.uy/docs",
      badge: status?.plexo.environment === "production" ? "Producción" : "Sandbox",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pagos internacionales con tarjetas y PayPal",
      icon: Globe,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      configured: status?.paypal.configured,
      docs: "https://developer.paypal.com/",
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Procesamiento de tarjetas Visa/Mastercard",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      configured: status?.stripe.configured,
      docs: "https://stripe.com/docs/",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integraciones de Pago</h2>
          <p className="text-muted-foreground mt-1">
            Configura y gestiona tus pasarelas de pago y marketplaces
          </p>
        </div>
        <button
          onClick={() => setShowApiConfig(!showApiConfig)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Configurar APIs</span>
        </button>
      </div>

      {/* API Configuration Alert */}
      {showApiConfig && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-2">
                Configuración de API Keys
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>Para configurar las integraciones, necesitas agregar las siguientes variables de entorno en tu proyecto de Supabase:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Mercado Libre:</strong> MERCADOLIBRE_ACCESS_TOKEN, MERCADOLIBRE_USER_ID</li>
                  <li><strong>Mercado Pago:</strong> MERCADOPAGO_ACCESS_TOKEN</li>
                  <li><strong>Plexo (Uruguay):</strong> PLEXO_CLIENT_ID, PLEXO_SECRET_KEY, PLEXO_ENVIRONMENT (sandbox/production)</li>
                  <li><strong>PayPal:</strong> PAYPAL_CLIENT_ID, PAYPAL_SECRET</li>
                  <li><strong>Stripe:</strong> STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY</li>
                </ul>
                <p className="mt-3">
                  Ve a <strong>Settings → Edge Functions → Secrets</strong> en tu dashboard de Supabase para agregar estas variables.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Integrations Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                  <integration.icon className={`w-6 h-6 ${integration.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {integration.name}
                    {(integration as any).badge && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        {(integration as any).badge}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
              </div>
              <div>
                {integration.configured ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {integration.configured ? "Configurado" : "No configurado"}
              </span>
              <a
                href={integration.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Documentación
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mercado Libre Sync Section */}
      {status?.mercadolibre.configured && (
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-lg">
                Sincronización con Mercado Libre
              </h3>
              <p className="text-sm text-muted-foreground">
                Gestiona productos, inventario y órdenes
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={syncProductsToML}
              disabled={syncing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Publicar Productos</span>
            </button>

            <button
              onClick={syncStockFromML}
              disabled={syncing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Actualizar Stock</span>
            </button>

            <button
              onClick={fetchMLOrders}
              disabled={syncing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Sincronizar Órdenes</span>
            </button>
          </div>

          {/* Sync Results */}
          {syncResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground mb-3">
                Resultados de la sincronización:
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {syncResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                      result.status === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {result.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        Producto {result.productId}
                      </span>
                    </div>
                    {result.permalink && (
                      <a
                        href={result.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        Ver en ML
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {result.error && (
                      <span className="text-red-600 text-xs">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Cómo configurar las integraciones
        </h3>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>
            Registra una aplicación en cada plataforma para obtener las credenciales API
          </li>
          <li>
            Agrega las variables de entorno en tu proyecto de Supabase
          </li>
          <li>
            Reinicia el Edge Function para que tome las nuevas configuraciones
          </li>
          <li>
            Actualiza esta página y verifica que las integraciones estén configuradas
          </li>
          <li>
            Usa los botones de sincronización para publicar productos en Mercado Libre
          </li>
        </ol>
      </div>
    </div>
  );
}
