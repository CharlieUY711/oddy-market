import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Facebook,
  Instagram,
  MessageCircle,
  Package,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Zap,
  ExternalLink,
  Clock,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface SyncChannel {
  id: string;
  name: string;
  icon: any;
  color: string;
  enabled: boolean;
  lastSync?: string;
  status: "active" | "inactive" | "error" | "syncing";
  productCount: number;
}

interface SyncStats {
  totalProducts: number;
  syncedProducts: number;
  pendingSync: number;
  failedSync: number;
  lastFullSync?: string;
}

export function CatalogSyncManager() {
  const [channels, setChannels] = useState<SyncChannel[]>([
    {
      id: "mercadolibre",
      name: "Mercado Libre",
      icon: ShoppingBag,
      color: "text-yellow-500",
      enabled: true,
      status: "active",
      productCount: 0,
    },
    {
      id: "facebook",
      name: "Facebook Shops",
      icon: Facebook,
      color: "text-blue-600",
      enabled: false,
      status: "inactive",
      productCount: 0,
    },
    {
      id: "instagram",
      name: "Instagram Shopping",
      icon: Instagram,
      color: "text-pink-600",
      enabled: false,
      status: "inactive",
      productCount: 0,
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      icon: MessageCircle,
      color: "text-green-600",
      enabled: false,
      status: "inactive",
      productCount: 0,
    },
  ]);

  const [stats, setStats] = useState<SyncStats>({
    totalProducts: 0,
    syncedProducts: 0,
    pendingSync: 0,
    failedSync: 0,
  });

  const [syncing, setSyncing] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadSyncData();
  }, []);

  async function loadSyncData() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/catalog-sync/stats`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        
        // Update channel product counts
        setChannels((prev) =>
          prev.map((ch) => ({
            ...ch,
            productCount: data.channelCounts[ch.id] || 0,
            lastSync: data.lastSyncs[ch.id],
          }))
        );
      }
    } catch (error) {
      console.error("Error loading sync data:", error);
    }
  }

  async function syncChannel(channelId: string) {
    setSyncing(true);
    setSelectedChannel(channelId);

    // Update channel status to syncing
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, status: "syncing" } : ch
      )
    );

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/catalog-sync/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ channelId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Sincronización completada: ${data.synced} productos actualizados`);
        
        // Update channel status
        setChannels((prev) =>
          prev.map((ch) =>
            ch.id === channelId
              ? {
                  ...ch,
                  status: "active",
                  lastSync: new Date().toISOString(),
                  productCount: data.synced,
                }
              : ch
          )
        );
        
        await loadSyncData();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      console.error("Error syncing channel:", error);
      toast.error(`Error en sincronización: ${error.message}`);
      
      // Update channel status to error
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === channelId ? { ...ch, status: "error" } : ch
        )
      );
    } finally {
      setSyncing(false);
      setSelectedChannel(null);
    }
  }

  async function syncAll() {
    setSyncing(true);
    toast.info("Iniciando sincronización completa...");

    const enabledChannels = channels.filter((ch) => ch.enabled);

    for (const channel of enabledChannels) {
      await syncChannel(channel.id);
    }

    toast.success("Sincronización completa finalizada");
    setSyncing(false);
  }

  async function toggleChannel(channelId: string) {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? {
              ...ch,
              enabled: !ch.enabled,
              status: !ch.enabled ? "active" : "inactive",
            }
          : ch
      )
    );

    // Save to backend
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/catalog-sync/toggle-channel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ channelId }),
        }
      );
    } catch (error) {
      console.error("Error toggling channel:", error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Sincronización de Catálogos
          </h2>
          <p className="text-sm text-gray-600">
            Gestiona la sincronización de productos con tus canales de venta
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </button>
          <button
            onClick={syncAll}
            disabled={syncing}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {syncing ? "Sincronizando..." : "Sincronizar Todo"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Productos</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalProducts}
              </p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sincronizados</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.syncedProducts}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.pendingSync}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Errores</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.failedSync}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Sync Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((channel, index) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`${channel.color}`}>
                  <channel.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {channel.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {channel.productCount} productos
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleChannel(channel.id)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                  channel.enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {channel.enabled ? "Activo" : "Inactivo"}
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mb-4">
              {channel.status === "active" && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-700">
                    Sincronizado correctamente
                  </span>
                </>
              )}
              {channel.status === "syncing" && (
                <>
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-blue-700">
                    Sincronizando...
                  </span>
                </>
              )}
              {channel.status === "error" && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    Error en sincronización
                  </span>
                </>
              )}
              {channel.status === "inactive" && (
                <>
                  <XCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Inactivo</span>
                </>
              )}
            </div>

            {/* Last Sync */}
            {channel.lastSync && (
              <p className="text-xs text-gray-500 mb-4">
                Última sincronización:{" "}
                {new Date(channel.lastSync).toLocaleString("es-ES")}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => syncChannel(channel.id)}
                disabled={!channel.enabled || syncing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    selectedChannel === channel.id ? "animate-spin" : ""
                  }`}
                />
                Sincronizar
              </button>
              <button
                onClick={() => window.open(`#/integrations/${channel.id}`, "_blank")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configuración de Sincronización
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sincronización Automática
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option value="manual">Manual</option>
                <option value="hourly">Cada hora</option>
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notificar errores de sincronización
              </label>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                Recibir notificaciones por email
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sincronizar solo productos con stock
              </label>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                No sincronizar productos sin stock
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                toast.success("Configuración guardada");
                setShowSettings(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Guardar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
