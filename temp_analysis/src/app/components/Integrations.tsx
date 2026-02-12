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
  Facebook,
  Instagram,
  MessageCircle,
  Share2,
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { motion } from "motion/react";
import { MercadoLibreConfig } from "./integrations/MercadoLibreConfig";
import { MercadoPagoConfig } from "./integrations/MercadoPagoConfig";
import { ApiKeysManager } from "./ApiKeysManager";
import { TwilioWhatsAppManager } from "./integrations/TwilioWhatsAppManager";

interface IntegrationsStatus {
  mercadolibre: { configured: boolean; userId: string | null };
  mercadopago: { configured: boolean };
  paypal: { configured: boolean };
  stripe: { configured: boolean };
  plexo: { configured: boolean; environment: string };
  meta: { configured: boolean };
  whatsapp: { configured: boolean };
}

interface SyncResult {
  productId: string;
  mlProductId?: string;
  status: string;
  error?: string;
  permalink?: string;
}

export function Integrations() {
  const [status, setStatus] = useState<IntegrationsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<"marketplace" | "payments" | "social" | "messaging">("marketplace");
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    
    // Listen for integrations updates
    const handleUpdate = () => {
      fetchStatus();
    };
    
    window.addEventListener('integrations-updated', handleUpdate);
    return () => window.removeEventListener('integrations-updated', handleUpdate);
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

  const marketplaceIntegrations = [
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
  ];

  const paymentIntegrations = [
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

  const socialIntegrations = [
    {
      id: "meta",
      name: "Meta Business",
      description: "Sincronización con Facebook e Instagram Shopping",
      icon: Facebook,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      configured: status?.meta?.configured,
      docs: "https://developers.facebook.com/docs/commerce-platform/",
    },
    {
      id: "instagram",
      name: "Instagram Shopping",
      description: "Catálogo de productos en Instagram",
      icon: Instagram,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      configured: status?.meta?.configured,
      docs: "https://business.instagram.com/shopping",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Catálogo de productos y atención al cliente",
      icon: MessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      configured: status?.whatsapp?.configured,
      docs: "https://business.whatsapp.com/",
    },
    {
      id: "facebook-catalog",
      name: "Facebook Catalog",
      description: "Sincronización de catálogo para Marketplace y Shops",
      icon: Share2,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      configured: status?.meta?.configured,
      docs: "https://www.facebook.com/business/help/125074381480892",
    },
  ];

  // Si hay una integración seleccionada, mostrar su configuración
  if (selectedIntegration === "api-keys") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedIntegration(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver a Integraciones
        </button>
        <ApiKeysManager />
      </div>
    );
  }

  if (selectedIntegration === "mercadolibre") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedIntegration(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver a Integraciones
        </button>
        <MercadoLibreConfig />
      </div>
    );
  }

  if (selectedIntegration === "mercadopago") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedIntegration(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver a Integraciones
        </button>
        <MercadoPagoConfig />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integraciones</h2>
          <p className="text-muted-foreground mt-1">
            Conectá ODDY Market con Redes Sociales, Marketplaces y Pasarelas de Pago
          </p>
        </div>
        <button
          onClick={() => setSelectedIntegration("api-keys")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Gestionar API Keys</span>
        </button>
      </div>

      {/* Quick Access Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-medium text-foreground">
                Gestiona tus API Keys desde aquí
              </h3>
              <p className="text-sm text-muted-foreground">
                Configura Mercado Libre, Mercado Pago, Plexo y más sin acceder a Supabase
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedIntegration("api-keys")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Abrir Gestor →
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "marketplace"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Marketplaces
          </div>
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "payments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pagos
          </div>
        </button>
        <button
          onClick={() => setActiveTab("social")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "social"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Redes Sociales
          </div>
        </button>
        <button
          onClick={() => setActiveTab("messaging")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "messaging"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Mensajería (Twilio/WhatsApp)
          </div>
        </button>
      </div>

      {/* Marketplace Tab */}
      {activeTab === "marketplace" && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {marketplaceIntegrations.map((integration) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedIntegration(integration.id)}
                className="bg-white border border-border rounded-lg p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${integration.bgColor}`}>
                      <integration.icon className={`w-6 h-6 ${integration.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{integration.name}</h3>
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
                  <span className="text-sm text-primary font-medium">
                    Configurar →
                  </span>
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
        </>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="grid md:grid-cols-2 gap-6">
          {paymentIntegrations.map((integration) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() =>
                ["mercadopago", "mercadolibre"].includes(integration.id)
                  ? setSelectedIntegration(integration.id)
                  : null
              }
              className={`bg-white border border-border rounded-lg p-6 ${
                ["mercadopago", "mercadolibre"].includes(integration.id)
                  ? "cursor-pointer hover:border-primary hover:shadow-md"
                  : ""
              } transition-all`}
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
                {["mercadopago", "mercadolibre"].includes(integration.id) ? (
                  <span className="text-sm text-primary font-medium">
                    Configurar →
                  </span>
                ) : (
                  <a
                    href={integration.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Documentación
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Social Tab */}
      {activeTab === "social" && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {socialIntegrations.map((integration) => (
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
                      <h3 className="font-semibold text-lg">{integration.name}</h3>
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

          {/* Social Sync Info */}
          <div className="bg-gradient-to-br from-blue-50 to-pink-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Sincronización Multi-Canal
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Una vez configuradas las integraciones de redes sociales, tus productos se sincronizarán automáticamente:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Catálogo de productos en Facebook Shops</li>
              <li>Productos visibles en Instagram Shopping</li>
              <li>Catálogo de WhatsApp Business para compartir con clientes</li>
              <li>Sincronización automática de inventario y precios</li>
            </ul>
          </div>
        </>
      )}

      {/* Messaging Tab (Twilio/WhatsApp) */}
      {activeTab === "messaging" && (
        <TwilioWhatsAppManager />
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
            Usa los botones de sincronización para publicar productos en los canales conectados
          </li>
        </ol>
      </div>
    </div>
  );
}
