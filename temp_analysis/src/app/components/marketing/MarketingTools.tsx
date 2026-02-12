import { useState } from "react";
import {
  Target,
  Gift,
  Tag,
  Trophy,
  MessageSquare,
  BarChart3,
  Zap,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
} from "lucide-react";
import { motion } from "motion/react";
import { SpinWheel } from "./SpinWheel";
import { GoogleAdsManager } from "./GoogleAdsManager";
import { CouponsManager } from "./CouponsManager";
import { LoyaltyProgram } from "./LoyaltyProgram";
import { PopupBannerManager } from "./PopupBannerManager";
import { ABTestingManager } from "./ABTestingManager";
import { CampaignsManager } from "./CampaignsManager";

type MarketingModule =
  | "overview"
  | "spin-wheel"
  | "google-ads"
  | "coupons"
  | "loyalty"
  | "popups"
  | "ab-testing"
  | "campaigns";

export function MarketingTools() {
  const [activeModule, setActiveModule] = useState<MarketingModule>("overview");

  const modules = [
    {
      id: "spin-wheel" as MarketingModule,
      name: "Rueda de Sorteos",
      description: "Gamificación y engagement",
      icon: Target,
      color: "from-orange-500 to-red-500",
      stats: "85% conversión",
    },
    {
      id: "google-ads" as MarketingModule,
      name: "Google Ads",
      description: "Campañas publicitarias",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      stats: "ROAS 4.2x",
    },
    {
      id: "coupons" as MarketingModule,
      name: "Cupones",
      description: "Descuentos y promociones",
      icon: Tag,
      color: "from-green-500 to-emerald-500",
      stats: "250 activos",
    },
    {
      id: "loyalty" as MarketingModule,
      name: "Fidelización",
      description: "Programa de puntos",
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
      stats: "1,240 miembros",
    },
    {
      id: "popups" as MarketingModule,
      name: "Pop-ups & Banners",
      description: "Mensajes promocionales",
      icon: MessageSquare,
      color: "from-yellow-500 to-orange-500",
      stats: "12% CTR",
    },
    {
      id: "ab-testing" as MarketingModule,
      name: "A/B Testing",
      description: "Optimización continua",
      icon: BarChart3,
      color: "from-indigo-500 to-blue-500",
      stats: "5 tests activos",
    },
    {
      id: "campaigns" as MarketingModule,
      name: "Campañas",
      description: "Automatización marketing",
      icon: Zap,
      color: "from-pink-500 to-rose-500",
      stats: "8 automatizadas",
    },
  ];

  if (activeModule !== "overview") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveModule("overview")}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            ← Volver a Herramientas
          </button>
        </div>

        {activeModule === "spin-wheel" && <SpinWheel />}
        {activeModule === "google-ads" && <GoogleAdsManager />}
        {activeModule === "coupons" && <CouponsManager />}
        {activeModule === "loyalty" && <LoyaltyProgram />}
        {activeModule === "popups" && <PopupBannerManager />}
        {activeModule === "ab-testing" && <ABTestingManager />}
        {activeModule === "campaigns" && <CampaignsManager />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Herramientas de Marketing</h2>
        <p className="text-muted-foreground">
          Impulsa tus ventas con herramientas de marketing modernas
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-lg">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-2xl font-bold mb-1">12,450</p>
          <p className="text-sm opacity-90">Visitantes este mes</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-lg">
          <DollarSign className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-2xl font-bold mb-1">$45,230</p>
          <p className="text-sm opacity-90">Ventas generadas</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-lg">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-2xl font-bold mb-1">+35%</p>
          <p className="text-sm opacity-90">Conversión vs mes anterior</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-lg">
          <Sparkles className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-2xl font-bold mb-1">4.2x</p>
          <p className="text-sm opacity-90">ROI promedio</p>
        </div>
      </div>

      {/* Marketing Modules */}
      <div>
        <h3 className="text-lg font-bold mb-4">Módulos de Marketing</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <motion.button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 rounded-lg border border-border hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}
                >
                  <module.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                  {module.stats}
                </span>
              </div>
              <h4 className="font-bold mb-1 group-hover:text-primary transition-colors">
                {module.name}
              </h4>
              <p className="text-sm text-muted-foreground">{module.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-500 rounded-lg text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-2">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
                Crear Cupón
              </button>
              <button className="px-4 py-2 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
                Nueva Campaña
              </button>
              <button className="px-4 py-2 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
                Configurar Pop-up
              </button>
              <button className="px-4 py-2 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium">
                Iniciar A/B Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Tips */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Consejos de Marketing
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium text-blue-900 mb-1">🎯 Segmentación</p>
            <p className="text-sm text-blue-800">
              Personaliza tus mensajes según el comportamiento de tus clientes
            </p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-medium text-green-900 mb-1">📊 Mide resultados</p>
            <p className="text-sm text-green-800">
              Usa A/B testing para optimizar continuamente tus campañas
            </p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="font-medium text-purple-900 mb-1">🎁 Gamificación</p>
            <p className="text-sm text-purple-800">
              La rueda de sorteos aumenta el engagement hasta un 85%
            </p>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="font-medium text-orange-900 mb-1">⚡ Automatización</p>
            <p className="text-sm text-orange-800">
              Configura campañas automáticas para ahorrar tiempo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
