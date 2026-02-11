import { useState } from "react";
import { Zap, Plus, Play, Pause, Calendar, Mail, MessageSquare, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "push" | "social";
  trigger: "purchase" | "cart-abandonment" | "birthday" | "inactive" | "new-customer";
  status: "active" | "paused" | "draft";
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
}

export function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Carrito Abandonado",
      type: "email",
      trigger: "cart-abandonment",
      status: "active",
      sent: 450,
      opened: 320,
      clicked: 128,
      converted: 85,
      revenue: 8450,
    },
    {
      id: "2",
      name: "Bienvenida Nuevos Clientes",
      type: "email",
      trigger: "new-customer",
      status: "active",
      sent: 280,
      opened: 245,
      clicked: 156,
      converted: 92,
      revenue: 5620,
    },
  ]);

  const triggers = [
    { id: "purchase", name: "Después de compra", icon: ShoppingBag },
    { id: "cart-abandonment", name: "Carrito abandonado", icon: ShoppingBag },
    { id: "birthday", name: "Cumpleaños", icon: Calendar },
    { id: "inactive", name: "Cliente inactivo", icon: MessageSquare },
    { id: "new-customer", name: "Nuevo cliente", icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8 text-pink-600" />
            Campañas Automatizadas
          </h2>
          <p className="text-muted-foreground">Marketing automático basado en eventos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
          <Plus className="w-5 h-5" />
          Nueva Campaña
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.sent, 0)}</p>
          <p className="text-sm text-muted-foreground">Mensajes enviados</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">
            {((campaigns.reduce((sum, c) => sum + c.opened, 0) / campaigns.reduce((sum, c) => sum + c.sent, 0)) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">Tasa de apertura</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.converted, 0)}</p>
          <p className="text-sm text-muted-foreground">Conversiones</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold text-green-600">
            ${campaigns.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Ingresos generados</p>
        </div>
      </div>

      {/* Triggers Quick Setup */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h3 className="font-bold mb-4">Configuración Rápida por Eventos</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
          {triggers.map((trigger) => (
            <button
              key={trigger.id}
              onClick={() => toast.success(`Configurando campaña: ${trigger.name}`)}
              className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
            >
              <trigger.icon className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="text-sm font-medium">{trigger.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold">Campañas Configuradas</h3>
        </div>
        <div className="divide-y divide-border">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold">{campaign.name}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-700"
                          : campaign.status === "paused"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {campaign.status === "active" ? "Activa" : campaign.status === "paused" ? "Pausada" : "Borrador"}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {campaign.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trigger: {triggers.find((t) => t.id === campaign.trigger)?.name}
                  </p>
                </div>

                <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                  {campaign.status === "active" ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Enviados</p>
                  <p className="font-bold text-lg">{campaign.sent}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Abiertos</p>
                  <p className="font-bold text-lg">{campaign.opened}</p>
                  <p className="text-xs text-green-600">
                    {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Clicks</p>
                  <p className="font-bold text-lg">{campaign.clicked}</p>
                  <p className="text-xs text-blue-600">
                    {((campaign.clicked / campaign.opened) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Conversiones</p>
                  <p className="font-bold text-lg">{campaign.converted}</p>
                  <p className="text-xs text-purple-600">
                    {((campaign.converted / campaign.sent) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ingresos</p>
                  <p className="font-bold text-lg text-green-600">${campaign.revenue}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ROI</p>
                  <p className="font-bold text-lg">{((campaign.revenue / 100) * 5).toFixed(1)}x</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 p-6 rounded-lg">
        <h3 className="font-bold text-pink-900 mb-3">⚡ Automatización Inteligente</h3>
        <ul className="text-sm text-pink-800 space-y-2">
          <li>• <strong>Carrito abandonado:</strong> Recupera hasta el 30% de carritos perdidos</li>
          <li>• <strong>Seguimiento post-compra:</strong> Solicita reviews y genera recompra</li>
          <li>• <strong>Cumpleaños:</strong> Fideliza con descuentos personalizados</li>
          <li>• <strong>Reactivación:</strong> Recupera clientes inactivos automáticamente</li>
        </ul>
      </div>
    </div>
  );
}
