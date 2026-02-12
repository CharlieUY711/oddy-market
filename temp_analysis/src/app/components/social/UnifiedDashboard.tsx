import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  ShoppingCart,
  Facebook,
  Instagram,
  MessageCircle,
  Bell,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "motion/react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface SocialStats {
  facebook: {
    followers: number;
    engagement: number;
    reach: number;
    posts: number;
    messages: number;
  };
  instagram: {
    followers: number;
    engagement: number;
    reach: number;
    posts: number;
    dms: number;
  };
  whatsapp: {
    contacts: number;
    messages: number;
    broadcasts: number;
  };
}

export function UnifiedDashboard() {
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  async function loadStats() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/social/stats?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }

  // Mock data for charts
  const performanceData = [
    { date: "Lun", facebook: 850, instagram: 920, whatsapp: 430 },
    { date: "Mar", facebook: 920, instagram: 1050, whatsapp: 380 },
    { date: "Mié", facebook: 1100, instagram: 980, whatsapp: 520 },
    { date: "Jue", facebook: 980, instagram: 1150, whatsapp: 490 },
    { date: "Vie", facebook: 1250, instagram: 1320, whatsapp: 680 },
    { date: "Sáb", facebook: 1380, instagram: 1580, whatsapp: 720 },
    { date: "Dom", facebook: 1150, instagram: 1280, whatsapp: 550 },
  ];

  const engagementData = [
    { name: "Likes", value: 3450, color: "#3b82f6" },
    { name: "Comentarios", value: 890, color: "#fb923c" },
    { name: "Compartidos", value: 520, color: "#8b5cf6" },
    { name: "Guardados", value: 340, color: "#22c55e" },
  ];

  const topPosts = [
    {
      platform: "instagram",
      content: "Nueva colección verano 2024 🌊",
      likes: 1250,
      comments: 89,
      shares: 45,
      reach: 15420,
    },
    {
      platform: "facebook",
      content: "Descuento especial del 30% este fin de semana",
      likes: 980,
      comments: 124,
      shares: 67,
      reach: 12350,
    },
    {
      platform: "instagram",
      content: "Behind the scenes: Así preparamos tus pedidos 📦",
      likes: 850,
      comments: 56,
      shares: 32,
      reach: 10890,
    },
  ];

  const recentMessages = [
    {
      platform: "whatsapp",
      from: "María González",
      message: "¿Tienen stock del producto X en talle M?",
      time: "Hace 5 min",
      unread: true,
    },
    {
      platform: "instagram",
      from: "@juanperez",
      message: "¿Cuánto demora el envío a Montevideo?",
      time: "Hace 12 min",
      unread: true,
    },
    {
      platform: "facebook",
      from: "Carlos Rodríguez",
      message: "Excelente atención! Gracias",
      time: "Hace 25 min",
      unread: false,
    },
    {
      platform: "whatsapp",
      from: "Ana Martínez",
      message: "Me llegó el pedido perfecto 😊",
      time: "Hace 1 hora",
      unread: false,
    },
  ];

  function getPlatformIcon(platform: string) {
    switch (platform) {
      case "facebook":
        return <Facebook className="w-4 h-4 text-[#1877F2]" />;
      case "instagram":
        return <Instagram className="w-4 h-4 text-[#E4405F]" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4 text-[#25D366]" />;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Resumen General</h3>
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-primary text-white"
                  : "bg-white border border-border hover:bg-muted"
              }`}
            >
              {range === "day" ? "Hoy" : range === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-xs text-green-600 font-medium">+12.5%</span>
          </div>
          <div className="text-2xl font-bold">45.2K</div>
          <div className="text-sm text-muted-foreground">
            Total Seguidores
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-red-600" />
            <span className="text-xs text-green-600 font-medium">+8.3%</span>
          </div>
          <div className="text-2xl font-bold">8.5%</div>
          <div className="text-sm text-muted-foreground">
            Engagement Rate
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-purple-600" />
            <span className="text-xs text-green-600 font-medium">+15.7%</span>
          </div>
          <div className="text-2xl font-bold">152K</div>
          <div className="text-sm text-muted-foreground">Alcance Semanal</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-8 h-8 text-green-600" />
            <span className="text-xs text-red-600 font-medium">3 sin leer</span>
          </div>
          <div className="text-2xl font-bold">127</div>
          <div className="text-sm text-muted-foreground">
            Mensajes Nuevos
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Facebook */}
        <div className="bg-gradient-to-br from-[#1877F2]/10 to-[#1877F2]/5 p-6 rounded-lg border border-[#1877F2]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#1877F2] rounded-lg flex items-center justify-center">
              <Facebook className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold">Facebook</h4>
              <p className="text-sm text-muted-foreground">
                18.5K seguidores
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Engagement</p>
              <p className="font-bold">7.2%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Alcance</p>
              <p className="font-bold">52K</p>
            </div>
            <div>
              <p className="text-muted-foreground">Posts</p>
              <p className="font-bold">24</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mensajes</p>
              <p className="font-bold">48</p>
            </div>
          </div>
        </div>

        {/* Instagram */}
        <div className="bg-gradient-to-br from-[#E4405F]/10 to-[#E4405F]/5 p-6 rounded-lg border border-[#E4405F]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E4405F] to-[#C13584] rounded-lg flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold">Instagram</h4>
              <p className="text-sm text-muted-foreground">
                22.8K seguidores
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Engagement</p>
              <p className="font-bold">9.8%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Alcance</p>
              <p className="font-bold">78K</p>
            </div>
            <div>
              <p className="text-muted-foreground">Posts</p>
              <p className="font-bold">32</p>
            </div>
            <div>
              <p className="text-muted-foreground">DMs</p>
              <p className="font-bold">63</p>
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 p-6 rounded-lg border border-[#25D366]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#25D366] rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold">WhatsApp Business</h4>
              <p className="text-sm text-muted-foreground">3.9K contactos</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Conversaciones</p>
              <p className="font-bold">156</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tasa Respuesta</p>
              <p className="font-bold">94%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Broadcasts</p>
              <p className="font-bold">12</p>
            </div>
            <div>
              <p className="text-muted-foreground">Catálogo</p>
              <p className="font-bold">245</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h4 className="font-bold mb-4">Alcance por Plataforma</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="facebook"
                stroke="#1877F2"
                strokeWidth={2}
                name="Facebook"
              />
              <Line
                type="monotone"
                dataKey="instagram"
                stroke="#E4405F"
                strokeWidth={2}
                name="Instagram"
              />
              <Line
                type="monotone"
                dataKey="whatsapp"
                stroke="#25D366"
                strokeWidth={2}
                name="WhatsApp"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-border">
          <h4 className="font-bold mb-4">Distribución de Engagement</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={engagementData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Posts */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h4 className="font-bold mb-4">Publicaciones con Mejor Rendimiento</h4>
        <div className="space-y-3">
          {topPosts.map((post, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                {getPlatformIcon(post.platform)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{post.content}</p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {post.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    {post.shares}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.reach.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold">Mensajes Recientes</h4>
          <button className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors text-sm">
            <Bell className="w-4 h-4" />
            Ver todos
          </button>
        </div>
        <div className="space-y-3">
          {recentMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors ${
                msg.unread ? "bg-blue-50/50" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                {getPlatformIcon(msg.platform)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{msg.from}</p>
                  <span className="text-xs text-muted-foreground">
                    {msg.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {msg.message}
                </p>
              </div>
              {msg.unread && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-yellow-900 mb-2">
              Tareas Pendientes
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Responder 3 mensajes sin leer en Instagram</li>
              <li>• Publicación programada para mañana necesita revisión</li>
              <li>
                • Actualizar catálogo de WhatsApp con nuevos productos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
