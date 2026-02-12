import { useState, useEffect } from "react";
import { Key, Save, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Shield } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { motion } from "motion/react";

interface ApiKey {
  name: string;
  key: string;
  label: string;
  description: string;
  placeholder: string;
  category: "marketplace" | "payments" | "social" | "services" | "infrastructure";
  required?: boolean;
  docs?: string;
  readOnly?: boolean;
}

interface ApiKeysConfig {
  [key: string]: string;
}

const API_KEYS_DEFINITIONS: ApiKey[] = [
  // Marketplace
  {
    name: "MERCADOLIBRE_ACCESS_TOKEN",
    key: "mercadolibre_access_token",
    label: "Mercado Libre - Access Token",
    description: "Token de acceso para API de Mercado Libre",
    placeholder: "APP_USR-1234567890123456-...",
    category: "marketplace",
    required: true,
    docs: "https://developers.mercadolibre.com.ar/",
  },
  {
    name: "MERCADOLIBRE_USER_ID",
    key: "mercadolibre_user_id",
    label: "Mercado Libre - User ID",
    description: "ID de usuario de Mercado Libre",
    placeholder: "123456789",
    category: "marketplace",
    required: true,
  },
  
  // Payments
  {
    name: "MERCADOPAGO_ACCESS_TOKEN",
    key: "mercadopago_access_token",
    label: "Mercado Pago - Access Token",
    description: "Token de acceso para procesar pagos",
    placeholder: "APP_USR-1234567890123456-...",
    category: "payments",
    required: true,
    docs: "https://www.mercadopago.com.ar/developers/",
  },
  {
    name: "MERCADOPAGO_PUBLIC_KEY",
    key: "mercadopago_public_key",
    label: "Mercado Pago - Public Key",
    description: "Public Key para frontend de Mercado Pago",
    placeholder: "APP_USR-xxxxxxxx-xxxxxxxx-...",
    category: "payments",
    docs: "https://www.mercadopago.com.ar/developers/",
  },
  {
    name: "PLEXO_CLIENT_ID",
    key: "plexo_client_id",
    label: "Plexo - Client ID 🇺🇾",
    description: "ID de cliente para Plexo Payment Gateway (Uruguay)",
    placeholder: "your-client-id",
    category: "payments",
    docs: "https://www.plexo.com.uy/docs",
  },
  {
    name: "PLEXO_SECRET_KEY",
    key: "plexo_secret_key",
    label: "Plexo - Secret Key 🇺🇾",
    description: "Clave secreta de Plexo",
    placeholder: "your-secret-key",
    category: "payments",
  },
  {
    name: "PLEXO_ENVIRONMENT",
    key: "plexo_environment",
    label: "Plexo - Environment 🇺🇾",
    description: "Entorno de Plexo (sandbox o production)",
    placeholder: "sandbox",
    category: "payments",
  },
  {
    name: "PAYPAL_CLIENT_ID",
    key: "paypal_client_id",
    label: "PayPal - Client ID",
    description: "Client ID para API de PayPal",
    placeholder: "YOUR_CLIENT_ID",
    category: "payments",
    docs: "https://developer.paypal.com/",
  },
  {
    name: "PAYPAL_SECRET",
    key: "paypal_secret",
    label: "PayPal - Secret",
    description: "Secret Key para API de PayPal",
    placeholder: "YOUR_SECRET",
    category: "payments",
  },
  {
    name: "STRIPE_SECRET_KEY",
    key: "stripe_secret_key",
    label: "Stripe - Secret Key",
    description: "Secret Key para procesamiento con Stripe",
    placeholder: "sk_test_...",
    category: "payments",
    docs: "https://stripe.com/docs/",
  },
  {
    name: "STRIPE_PUBLISHABLE_KEY",
    key: "stripe_publishable_key",
    label: "Stripe - Publishable Key",
    description: "Publishable Key para frontend de Stripe",
    placeholder: "pk_test_...",
    category: "payments",
  },
  
  // Social Media
  {
    name: "META_ACCESS_TOKEN",
    key: "meta_access_token",
    label: "Meta - Access Token",
    description: "Token para Facebook e Instagram Shopping",
    placeholder: "EAAxxxxxxxxxxxxx",
    category: "social",
    docs: "https://developers.facebook.com/",
  },
  {
    name: "META_CATALOG_ID",
    key: "meta_catalog_id",
    label: "Meta - Catalog ID",
    description: "ID del catálogo de productos en Meta",
    placeholder: "1234567890",
    category: "social",
  },
  {
    name: "WHATSAPP_BUSINESS_ID",
    key: "whatsapp_business_id",
    label: "WhatsApp - Business ID",
    description: "ID de cuenta de WhatsApp Business",
    placeholder: "1234567890",
    category: "social",
    docs: "https://business.whatsapp.com/",
  },
  {
    name: "WHATSAPP_ACCESS_TOKEN",
    key: "whatsapp_access_token",
    label: "WhatsApp - Access Token",
    description: "Token de acceso para WhatsApp Business API",
    placeholder: "EAAxxxxxxxxxxxxx",
    category: "social",
  },
  
  // Services
  {
    name: "RESEND_API_KEY",
    key: "resend_api_key",
    label: "Resend - API Key",
    description: "API Key para envío de emails con Resend",
    placeholder: "re_xxxxxxxxxxxx",
    category: "services",
    docs: "https://resend.com/docs",
  },
  {
    name: "REPLICATE_API_KEY",
    key: "replicate_api_key",
    label: "Replicate - API Key",
    description: "API Key para procesamiento de IA con Replicate",
    placeholder: "r8_xxxxxxxxxxxx",
    category: "services",
    docs: "https://replicate.com/docs",
  },
  {
    name: "REMOVE_BG_API_KEY",
    key: "remove_bg_api_key",
    label: "Remove.bg - API Key",
    description: "API Key para remover fondos de imágenes",
    placeholder: "xxxxxxxxxxxxx",
    category: "services",
    docs: "https://www.remove.bg/api",
  },
  {
    name: "METAMAP_CLIENT_ID",
    key: "metamap_client_id",
    label: "MetaMap - Client ID",
    description: "Client ID para verificación de identidad KYC",
    placeholder: "your-client-id",
    category: "services",
    required: true,
    docs: "https://docs.metamap.com/",
  },
  {
    name: "METAMAP_CLIENT_SECRET",
    key: "metamap_client_secret",
    label: "MetaMap - Client Secret",
    description: "Secret Key para verificación de identidad",
    placeholder: "your-client-secret",
    category: "services",
    required: true,
  },
  
  // Infrastructure
  {
    name: "SUPABASE_URL",
    key: "supabase_url",
    label: "Supabase - Project URL",
    description: "URL de tu proyecto Supabase",
    placeholder: "https://xxxxxxxxxxxxx.supabase.co",
    category: "infrastructure",
    required: true,
    readOnly: true,
    docs: "https://supabase.com/dashboard",
  },
  {
    name: "SUPABASE_ANON_KEY",
    key: "supabase_anon_key",
    label: "Supabase - Anon/Public Key",
    description: "Clave pública para autenticación del cliente",
    placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    category: "infrastructure",
    required: true,
    readOnly: true,
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    key: "supabase_service_role_key",
    label: "Supabase - Service Role Key",
    description: "⚠️ Clave privada solo para backend (no compartir)",
    placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    category: "infrastructure",
    required: true,
    readOnly: true,
  },
  {
    name: "HOSTING_PROVIDER",
    key: "hosting_provider",
    label: "Hosting - Provider",
    description: "Proveedor donde está alojado el sitio",
    placeholder: "Vercel / Netlify / Custom",
    category: "infrastructure",
  },
  {
    name: "HOSTING_DOMAIN",
    key: "hosting_domain",
    label: "Hosting - Domain",
    description: "Dominio principal del sitio",
    placeholder: "www.oddymarket.com",
    category: "infrastructure",
  },
  {
    name: "HOSTING_API_KEY",
    key: "hosting_api_key",
    label: "Hosting - API Key",
    description: "API Key del proveedor de hosting (si aplica)",
    placeholder: "xxxxxxxxxxxxx",
    category: "infrastructure",
  },
];

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKeysConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("marketplace");
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
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
        setKeys(data.keys || {});
        
        // Marcar keys que ya están guardadas
        const saved = new Set<string>();
        Object.keys(data.keys || {}).forEach(key => {
          if (data.keys[key]) saved.add(key);
        });
        setSavedKeys(saved);
      }
    } catch (error) {
      console.error("Error loading API keys:", error);
      toast.error("Error al cargar las configuraciones");
    } finally {
      setLoading(false);
    }
  }

  async function saveKey(keyName: string, value: string) {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/api-keys`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: keyName,
            value: value,
          }),
        }
      );

      if (response.ok) {
        toast.success("Configuración guardada exitosamente");
        setSavedKeys(prev => new Set([...prev, keyName]));
        
        // Recargar estado de integraciones
        setTimeout(() => {
          window.dispatchEvent(new Event('integrations-updated'));
        }, 500);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al guardar configuración");
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  }

  async function saveAllKeys() {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/api-keys/bulk`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keys }),
        }
      );

      if (response.ok) {
        toast.success("Todas las configuraciones guardadas exitosamente");
        
        // Marcar todas las keys como guardadas
        const saved = new Set<string>();
        Object.keys(keys).forEach(key => {
          if (keys[key]) saved.add(key);
        });
        setSavedKeys(saved);
        
        // Recargar estado de integraciones
        setTimeout(() => {
          window.dispatchEvent(new Event('integrations-updated'));
        }, 500);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al guardar configuraciones");
      }
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast.error("Error al guardar configuraciones");
    } finally {
      setSaving(false);
    }
  }

  function toggleVisibility(keyName: string) {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyName)) {
        newSet.delete(keyName);
      } else {
        newSet.add(keyName);
      }
      return newSet;
    });
  }

  function handleKeyChange(keyName: string, value: string) {
    setKeys(prev => ({
      ...prev,
      [keyName]: value,
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = [
    { id: "marketplace", label: "Marketplaces", icon: "🛍️" },
    { id: "payments", label: "Pagos", icon: "💳" },
    { id: "social", label: "Redes Sociales", icon: "📱" },
    { id: "services", label: "Servicios", icon: "⚙️" },
    { id: "infrastructure", label: "Infraestructura", icon: "🏗️" },
  ];

  const filteredKeys = API_KEYS_DEFINITIONS.filter(
    key => key.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6" />
            Gestor de API Keys
          </h2>
          <p className="text-muted-foreground mt-1">
            Configura las integraciones pegando tus API keys aquí - Se guardan de forma segura
          </p>
        </div>
        <button
          onClick={saveAllKeys}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Guardar Todo</span>
        </button>
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-green-900 mb-1">
              Configuración Segura
            </h3>
            <p className="text-sm text-green-800">
              Tus API keys se guardan de forma segura en la base de datos y solo son accesibles por el servidor backend. 
              Nunca se exponen en el frontend. No necesitas acceder a Supabase para cambiarlas.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeCategory === category.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* API Keys Grid */}
      <div className="grid gap-6">
        {filteredKeys.map((apiKey) => {
          const isSaved = savedKeys.has(apiKey.key);
          const hasValue = keys[apiKey.key]?.trim().length > 0;
          
          return (
            <motion.div
              key={apiKey.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{apiKey.label}</h3>
                    {apiKey.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Requerido
                      </span>
                    )}
                    {isSaved && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {apiKey.description}
                  </p>
                  {apiKey.docs && (
                    <a
                      href={apiKey.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Ver documentación →
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={visibleKeys.has(apiKey.key) ? "text" : "password"}
                    value={keys[apiKey.key] || ""}
                    onChange={(e) => handleKeyChange(apiKey.key, e.target.value)}
                    placeholder={apiKey.placeholder}
                    disabled={apiKey.readOnly}
                    className={`w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10 ${
                      apiKey.readOnly ? 'bg-muted/50 cursor-not-allowed' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(apiKey.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {visibleKeys.has(apiKey.key) ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {!apiKey.readOnly && (
                  <button
                    onClick={() => saveKey(apiKey.key, keys[apiKey.key] || "")}
                    disabled={saving || !hasValue}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Guardar</span>
                </button>
                )}
              </div>

              {apiKey.readOnly && (
                <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
                  <Shield className="w-3 h-3" />
                  <span>Solo lectura - Configura estos valores en las variables de entorno</span>
                </div>
              )}
              {!hasValue && isSaved && !apiKey.readOnly && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Key configurada previamente (oculta por seguridad)</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Cómo obtener tus API Keys
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Mercado Libre/Pago:</strong>
            <p>Ingresa a developers.mercadolibre.com.ar, crea una aplicación y obtén tu Access Token.</p>
          </div>
          <div>
            <strong className="text-foreground">Plexo (Uruguay):</strong>
            <p>Contacta a Plexo en plexo.com.uy para obtener credenciales de sandbox o producción.</p>
          </div>
          <div>
            <strong className="text-foreground">PayPal & Stripe:</strong>
            <p>Registra una aplicación en sus respectivos dashboards de desarrolladores.</p>
          </div>
          <div>
            <strong className="text-foreground">Meta & WhatsApp:</strong>
            <p>Configura Meta Business Suite y obtén tokens desde developers.facebook.com.</p>
          </div>
          <div>
            <strong className="text-foreground">MetaMap (Verificación KYC):</strong>
            <p>Registra tu aplicación en metamap.com para obtener Client ID y Secret. Necesario para verificación de identidad.</p>
          </div>
          <div>
            <strong className="text-foreground">Supabase:</strong>
            <p>Las credenciales de Supabase son solo lectura aquí. Configúralas en las variables de entorno de tu proyecto.</p>
          </div>
          <div>
            <strong className="text-foreground">Hosting:</strong>
            <p>Configura el dominio y proveedor donde está alojado tu sitio (Vercel, Netlify, AWS, etc.).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
