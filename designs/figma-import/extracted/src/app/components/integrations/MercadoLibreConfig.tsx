import { useState, useEffect } from "react";
import {
  ShoppingBag,
  ExternalLink,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Settings,
  Link as LinkIcon,
  Package,
  TrendingUp,
  DollarSign,
  XCircle,
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { motion } from "motion/react";
import { copyToClipboardWithToast } from "/src/utils/clipboard";

interface MLConfig {
  configured: boolean;
  userId: string | null;
  accessToken: string | null;
}

interface MLStats {
  totalProducts: number;
  syncedProducts: number;
  totalOrders: number;
  pendingOrders: number;
}

interface SyncResult {
  productId: string;
  mlProductId?: string;
  status: string;
  error?: string;
  permalink?: string;
}

export function MercadoLibreConfig() {
  const [config, setConfig] = useState<MLConfig | null>(null);
  const [stats, setStats] = useState<MLStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [showOAuthInstructions, setShowOAuthInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  const redirectUri = `${window.location.origin}/ml-oauth-callback`;
  const mlAppId = "MERCADOLIBRE_APP_ID"; // El usuario debe reemplazar esto

  useEffect(() => {
    fetchConfig();
    fetchStats();
  }, []);

  async function fetchConfig() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadolibre/config`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Error fetching ML config:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadolibre/stats`,
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
      console.error("Error fetching ML stats:", error);
    }
  }

  async function syncProducts() {
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
          body: JSON.stringify({ productIds: null }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSyncResults(data.results || []);
        toast.success(
          `${data.synced} artículos sincronizados ${
            data.failed > 0 ? `(${data.failed} fallidos)` : ""
          }`
        );
        await fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al sincronizar artículos");
      }
    } catch (error) {
      console.error("Error syncing products:", error);
      toast.error("Error al sincronizar con Mercado Libre");
    } finally {
      setSyncing(false);
    }
  }

  async function syncOrders() {
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
        toast.success(`${data.orders.length} órdenes sincronizadas`);
        await fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al sincronizar órdenes");
      }
    } catch (error) {
      console.error("Error syncing orders:", error);
      toast.error("Error al sincronizar órdenes");
    } finally {
      setSyncing(false);
    }
  }

  async function syncStock() {
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
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.synced} artículos actualizados`);
        await fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al actualizar stock");
      }
    } catch (error) {
      console.error("Error syncing stock:", error);
      toast.error("Error al sincronizar stock");
    } finally {
      setSyncing(false);
    }
  }

  async function copyToClipboard(text: string) {
    await copyToClipboardWithToast(text, "Copiado al portapapeles");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
        <div className="p-3 bg-yellow-50 rounded-lg">
          <ShoppingBag className="w-8 h-8 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Mercado Libre</h2>
          <p className="text-muted-foreground">
            Sincroniza productos, inventario y órdenes automáticamente
          </p>
        </div>
        {config?.configured && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Conectado
            </span>
          </div>
        )}
      </div>

      {/* Configuration Section */}
      {!config?.configured ? (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Configuración de Mercado Libre
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para conectar tu cuenta de Mercado Libre, sigue estos pasos:
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-white border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h4 className="font-semibold">Crea una aplicación en Mercado Libre</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Ve al portal de desarrolladores de Mercado Libre y crea una nueva aplicación:
              </p>
              <a
                href="https://developers.mercadolibre.com.ar/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ir a Mercado Libre Developers
              </a>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h4 className="font-semibold">Configura la URL de redirección</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                En tu aplicación de ML, agrega esta URL de redirección:
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

            {/* Step 3 */}
            <div className="bg-white border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h4 className="font-semibold">Obtén las credenciales OAuth</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Después de autorizar la aplicación, agrega estas variables en Supabase:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-2">
                <li><strong>MERCADOLIBRE_ACCESS_TOKEN</strong> - Token de acceso de ML</li>
                <li><strong>MERCADOLIBRE_USER_ID</strong> - Tu ID de usuario de ML</li>
                <li><strong>MERCADOLIBRE_APP_ID</strong> - App ID (Client ID)</li>
                <li><strong>MERCADOLIBRE_APP_SECRET</strong> - App Secret</li>
              </ul>
            </div>

            {/* OAuth Button */}
            <div className="bg-white border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <h4 className="font-semibold">Autoriza la aplicación</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Haz clic en el botón para autorizar ODDY Market a acceder a tu cuenta:
              </p>
              <button
                onClick={() => setShowOAuthInstructions(!showOAuthInstructions)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Ver instrucciones OAuth
              </button>
            </div>

            {showOAuthInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <h4 className="font-semibold mb-2 text-blue-900">
                  URL de autorización OAuth:
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Reemplaza <code>YOUR_APP_ID</code> con tu App ID y visita esta URL:
                </p>
                <div className="bg-white p-3 rounded border border-blue-200 text-sm break-all">
                  {`https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(
                    redirectUri
                  )}`}
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  Después de autorizar, serás redirigido con un código que debes intercambiar por un access_token.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-900">
                    {stats.totalProducts}
                  </span>
                </div>
                <p className="text-sm text-blue-700 font-medium">
                  Artículos Totales
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-900">
                    {stats.syncedProducts}
                  </span>
                </div>
                <p className="text-sm text-green-700 font-medium">
                  Sincronizados en ML
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-900">
                    {stats.totalOrders}
                  </span>
                </div>
                <p className="text-sm text-purple-700 font-medium">
                  Órdenes Totales
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-900">
                    {stats.pendingOrders}
                  </span>
                </div>
                <p className="text-sm text-orange-700 font-medium">
                  Órdenes Pendientes
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">
              Acciones de Sincronización
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <button
                onClick={syncProducts}
                disabled={syncing}
                className="flex flex-col items-center gap-3 p-4 border-2 border-primary/20 rounded-lg hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-primary" />
                )}
                <div className="text-center">
                  <p className="font-medium">Publicar Artículos</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sincroniza todos los artículos locales a ML
                  </p>
                </div>
              </button>

              <button
                onClick={syncStock}
                disabled={syncing}
                className="flex flex-col items-center gap-3 p-4 border-2 border-primary/20 rounded-lg hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <Package className="w-6 h-6 text-primary" />
                )}
                <div className="text-center">
                  <p className="font-medium">Actualizar Stock</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trae el stock desde ML
                  </p>
                </div>
              </button>

              <button
                onClick={syncOrders}
                disabled={syncing}
                className="flex flex-col items-center gap-3 p-4 border-2 border-primary/20 rounded-lg hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <DollarSign className="w-6 h-6 text-primary" />
                )}
                <div className="text-center">
                  <p className="font-medium">Sincronizar Órdenes</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Importa órdenes de ML
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Sync Results */}
          {syncResults.length > 0 && (
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">
                Resultados de Sincronización
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {syncResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.status === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.status === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          Artículo {result.productId}
                        </p>
                        {result.error && (
                          <p className="text-xs text-red-600 mt-1">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                    {result.permalink && (
                      <a
                        href={result.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Ver en ML
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documentation */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  Información de Configuración
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Tu integración está activa. Los artículos se sincronizan automáticamente cada vez que creas o editas uno.
                </p>
                <a
                  href="https://developers.mercadolibre.com.ar/es_ar/api-docs-es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Ver documentación de API
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
