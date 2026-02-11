import { useState, useRef, useEffect } from "react";
import {
  Target,
  Plus,
  Play,
  Settings,
  Trash2,
  Edit,
  Save,
  Copy,
  Download,
  Share2,
  Package,
  TrendingUp,
  Mail,
  MessageCircle,
  ShoppingCart,
  Gift,
  Percent,
  Truck,
  Award,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

type PrizeType = 
  | "discount_percentage"
  | "discount_fixed"
  | "free_shipping"
  | "free_product"
  | "add_to_cart"
  | "loyalty_points"
  | "coupon_code"
  | "no_prize";

interface WheelPrize {
  id: string;
  label: string;
  color: string;
  probability: number;
  type: PrizeType;
  value?: number;
  productId?: string;
  couponCode?: string;
  requiresStock?: boolean;
  decrementStock?: boolean;
  sendEmail?: boolean;
  sendWhatsApp?: boolean;
  shareOnSocial?: boolean;
  description?: string;
  termsAndConditions?: string;
  expiryDays?: number;
}

interface WheelConfig {
  id: string;
  name: string;
  description?: string;
  prizes: WheelPrize[];
  spinDuration: number;
  showConfetti: boolean;
  requireEmail: boolean;
  requireLogin: boolean;
  maxSpinsPerUser?: number;
  maxSpinsPerDay?: number;
  enableEmailNotifications: boolean;
  enableWhatsAppNotifications: boolean;
  enableSocialSharing: boolean;
  active: boolean;
  startDate?: string;
  endDate?: string;
  totalSpins?: number;
  uniqueUsers?: number;
}

const prizeTypeIcons: Record<PrizeType, any> = {
  discount_percentage: Percent,
  discount_fixed: Percent,
  free_shipping: Truck,
  free_product: Gift,
  add_to_cart: ShoppingCart,
  loyalty_points: Award,
  coupon_code: Percent,
  no_prize: XCircle,
};

const prizeTypeLabels: Record<PrizeType, string> = {
  discount_percentage: "Descuento %",
  discount_fixed: "Descuento Fijo",
  free_shipping: "Envío Gratis",
  free_product: "Producto Gratis",
  add_to_cart: "Agregar al Carrito",
  loyalty_points: "Puntos de Lealtad",
  coupon_code: "Código de Cupón",
  no_prize: "Sin Premio",
};

export function SpinWheel() {
  const [configs, setConfigs] = useState<WheelConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<WheelConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const defaultPrizes: WheelPrize[] = [
    {
      id: "1",
      label: "10% OFF",
      color: "#FF6B6B",
      probability: 30,
      type: "discount_percentage",
      value: 10,
      sendEmail: true,
      expiryDays: 7,
      description: "10% de descuento en tu próxima compra",
    },
    {
      id: "2",
      label: "20% OFF",
      color: "#4ECDC4",
      probability: 20,
      type: "discount_percentage",
      value: 20,
      sendEmail: true,
      expiryDays: 7,
      description: "20% de descuento en tu próxima compra",
    },
    {
      id: "3",
      label: "Envío Gratis",
      color: "#FFE66D",
      probability: 25,
      type: "free_shipping",
      sendEmail: true,
      expiryDays: 14,
      description: "Envío gratis en tu próxima compra",
    },
    {
      id: "4",
      label: "30% OFF",
      color: "#95E1D3",
      probability: 10,
      type: "discount_percentage",
      value: 30,
      sendEmail: true,
      sendWhatsApp: true,
      expiryDays: 5,
      description: "30% de descuento en tu próxima compra",
    },
    {
      id: "5",
      label: "Inténtalo otra vez",
      color: "#F38181",
      probability: 10,
      type: "no_prize",
      description: "Mejor suerte la próxima vez",
    },
    {
      id: "6",
      label: "50% OFF",
      color: "#AA96DA",
      probability: 5,
      type: "discount_percentage",
      value: 50,
      sendEmail: true,
      sendWhatsApp: true,
      shareOnSocial: true,
      expiryDays: 3,
      description: "50% de descuento en tu próxima compra - ¡Premio especial!",
    },
  ];

  useEffect(() => {
    loadConfigs();
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeConfig) {
      drawWheel();
    }
  }, [activeConfig, rotation]);

  async function loadConfigs() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/wheel/configs`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConfigs(data.wheels || []);
        if (data.wheels?.length > 0) {
          setActiveConfig(data.wheels[0]);
        }
      }
    } catch (error) {
      console.error("Error loading wheel configs:", error);
    }
  }

  async function loadProducts() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/products`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  async function saveConfig(config: WheelConfig) {
    try {
      // Validar que las probabilidades sumen 100
      const totalProb = config.prizes.reduce((sum, p) => sum + p.probability, 0);
      if (Math.abs(totalProb - 100) > 0.1) {
        toast.error(`Las probabilidades deben sumar 100% (actual: ${totalProb.toFixed(1)}%)`);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/wheel/config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(config),
        }
      );

      if (response.ok) {
        toast.success("Configuración guardada");
        loadConfigs();
        setIsEditing(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving wheel config:", error);
      toast.error("Error al guardar configuración");
    }
  }

  async function loadStats(wheelId: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/wheel/${wheelId}/stats`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setShowStats(true);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Error cargando estadísticas");
    }
  }

  function drawWheel() {
    const canvas = canvasRef.current;
    if (!canvas || !activeConfig) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalSegments = activeConfig.prizes.length;
    const anglePerSegment = (2 * Math.PI) / totalSegments;

    activeConfig.prizes.forEach((prize, index) => {
      const startAngle = index * anglePerSegment + (rotation * Math.PI) / 180;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.fillText(prize.label, radius * 0.65, 5);
      ctx.font = "10px Arial";
      ctx.fillText(`${prize.probability}%`, radius * 0.65, 20);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - 15, 10);
    ctx.lineTo(centerX + 15, 10);
    ctx.lineTo(centerX, 40);
    ctx.closePath();
    ctx.fillStyle = "#FF6B35";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  async function handleSpin() {
    if (isSpinning || !activeConfig) return;

    if (activeConfig.requireEmail && !email) {
      setShowEmailModal(true);
      return;
    }

    setIsSpinning(true);
    setWinner(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/wheel/spin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            wheelId: activeConfig.id,
            email: email || undefined,
            sessionId: localStorage.getItem("oddy_session_id"),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Error al girar");
        setIsSpinning(false);
        return;
      }

      const data = await response.json();
      const winningPrize = data.prize;

      // Calcular rotación
      const prizeIndex = activeConfig.prizes.findIndex((p) => p.id === winningPrize.id);
      const anglePerSegment = 360 / activeConfig.prizes.length;
      const winningAngle = prizeIndex * anglePerSegment;
      const randomOffset = Math.random() * anglePerSegment * 0.8;
      const totalRotation = 360 * 5 + (360 - winningAngle) + randomOffset;

      setRotation(totalRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setWinner(winningPrize);
        if (activeConfig.showConfetti) {
          showConfetti();
        }
        
        let message = `¡Ganaste: ${winningPrize.label}!`;
        if (winningPrize.couponCode) {
          message += ` Código: ${winningPrize.couponCode}`;
        }
        toast.success(message);
      }, activeConfig.spinDuration);
    } catch (error) {
      console.error("Error spinning wheel:", error);
      toast.error("Error al girar la rueda");
      setIsSpinning(false);
    }
  }

  function showConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }

  function createNewWheel() {
    const newWheel: WheelConfig = {
      id: `wheel_${Date.now()}`,
      name: "Nueva Rueda",
      prizes: defaultPrizes,
      spinDuration: 3000,
      showConfetti: true,
      requireEmail: true,
      requireLogin: false,
      enableEmailNotifications: true,
      enableWhatsAppNotifications: false,
      enableSocialSharing: true,
      active: false,
    };
    setActiveConfig(newWheel);
    setIsEditing(true);
  }

  function updatePrize(id: string, field: keyof WheelPrize, value: any) {
    if (!activeConfig) return;

    setActiveConfig({
      ...activeConfig,
      prizes: activeConfig.prizes.map((prize) =>
        prize.id === id ? { ...prize, [field]: value } : prize
      ),
    });
  }

  function addPrize() {
    if (!activeConfig) return;

    const newPrize: WheelPrize = {
      id: Date.now().toString(),
      label: "Nuevo Premio",
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      probability: 10,
      type: "discount_percentage",
      value: 10,
      sendEmail: true,
      expiryDays: 7,
    };

    setActiveConfig({
      ...activeConfig,
      prizes: [...activeConfig.prizes, newPrize],
    });
  }

  function removePrize(id: string) {
    if (!activeConfig || activeConfig.prizes.length <= 2) {
      toast.error("Debe haber al menos 2 premios");
      return;
    }

    setActiveConfig({
      ...activeConfig,
      prizes: activeConfig.prizes.filter((prize) => prize.id !== id),
    });
  }

  const totalProbability = activeConfig?.prizes.reduce((sum, p) => sum + p.probability, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            Rueda de Sorteos Integrada
          </h2>
          <p className="text-muted-foreground">
            Stock, carrito, email, WhatsApp y redes sociales
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={createNewWheel}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Rueda
          </button>
          {activeConfig && (
            <button
              onClick={() => loadStats(activeConfig.id)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Estadísticas
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wheel Display */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold">
                  {activeConfig?.name || "Selecciona o crea una rueda"}
                </h3>
                {activeConfig && (
                  <p className="text-sm text-muted-foreground">
                    {activeConfig.active ? "✅ Activa" : "⏸️ Inactiva"} • 
                    {activeConfig.totalSpins || 0} giros
                  </p>
                )}
              </div>
              {activeConfig && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => saveConfig(activeConfig)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Guardar
                    </button>
                  )}
                </div>
              )}
            </div>

            {activeConfig ? (
              <div className="space-y-6">
                {/* Wheel Canvas */}
                <div className="flex justify-center">
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={400}
                      style={{
                        transition: isSpinning
                          ? `transform ${activeConfig.spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                          : "none",
                      }}
                    />
                  </div>
                </div>

                {/* Spin Button */}
                {!isEditing && (
                  <div className="flex justify-center">
                    <motion.button
                      onClick={handleSpin}
                      disabled={isSpinning}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      <Play className="w-6 h-6" />
                      {isSpinning ? "Girando..." : "¡GIRAR!"}
                    </motion.button>
                  </div>
                )}

                {/* Winner Display */}
                <AnimatePresence>
                  {winner && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-500 p-6 rounded-lg"
                    >
                      <p className="text-3xl font-bold text-orange-600 mb-2 text-center">
                        ¡FELICITACIONES!
                      </p>
                      <p className="text-xl font-bold mb-2 text-center">{winner.label}</p>
                      {winner.description && (
                        <p className="text-muted-foreground text-center mb-3">
                          {winner.description}
                        </p>
                      )}
                      {winner.couponCode && (
                        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-orange-300 text-center">
                          <p className="text-sm text-muted-foreground mb-1">Tu código:</p>
                          <p className="text-2xl font-mono font-bold text-orange-600">
                            {winner.couponCode}
                          </p>
                          {winner.expiresAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Válido hasta:{" "}
                              {new Date(winner.expiresAt).toLocaleDateString("es-AR")}
                            </p>
                          )}
                        </div>
                      )}
                      {winner.product && (
                        <div className="bg-white p-4 rounded-lg border border-border mt-3">
                          <p className="font-medium mb-2">Producto ganado:</p>
                          <div className="flex items-center gap-3">
                            {winner.product.image && (
                              <img
                                src={winner.product.image}
                                alt={winner.product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{winner.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {winner.type === "add_to_cart"
                                  ? "Agregado a tu carrito"
                                  : "Te lo enviaremos pronto"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        {activeConfig.enableEmailNotifications && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            Email enviado
                          </div>
                        )}
                        {activeConfig.enableWhatsAppNotifications && winner.sendWhatsApp && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp enviado
                          </div>
                        )}
                        {activeConfig.enableSocialSharing && winner.shareOnSocial && (
                          <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                            <Share2 className="w-4 h-4" />
                            Compartir
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay rueda seleccionada</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea una nueva rueda o selecciona una existente
                </p>
                <button
                  onClick={createNewWheel}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Crear Primera Rueda
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-4">
          {/* Wheel List */}
          <div className="bg-white p-4 rounded-lg border border-border">
            <h3 className="font-bold mb-3">Ruedas Guardadas</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {configs.length > 0 ? (
                configs.map((config) => (
                  <button
                    key={config.id}
                    onClick={() => {
                      setActiveConfig(config);
                      setIsEditing(false);
                    }}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${ activeConfig?.id === config.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="font-medium">{config.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.prizes.length} premios • {config.totalSpins || 0} giros
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay ruedas guardadas
                </p>
              )}
            </div>
          </div>

          {/* Edit Prizes */}
          {isEditing && activeConfig && (
            <>
              <div className="bg-white p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold">Editar Premios</h3>
                    <p className={`text-xs ${Math.abs(totalProbability - 100) < 0.1 ? "text-green-600" : "text-red-600"}`}>
                      Total probabilidad: {totalProbability.toFixed(1)}%
                      {Math.abs(totalProbability - 100) >= 0.1 && " ⚠️"}
                    </p>
                  </div>
                  <button
                    onClick={addPrize}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeConfig.prizes.map((prize) => {
                    const Icon = prizeTypeIcons[prize.type];
                    return (
                      <div key={prize.id} className="p-3 border border-border rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={prize.label}
                            onChange={(e) => updatePrize(prize.id, "label", e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-border rounded"
                            placeholder="Etiqueta"
                          />
                          <input
                            type="color"
                            value={prize.color}
                            onChange={(e) => updatePrize(prize.id, "color", e.target.value)}
                            className="w-10 h-8 border border-border rounded cursor-pointer"
                          />
                          <button
                            onClick={() => removePrize(prize.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <select
                          value={prize.type}
                          onChange={(e) => updatePrize(prize.id, "type", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-border rounded"
                        >
                          {Object.entries(prizeTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>

                        {(prize.type === "discount_percentage" ||
                          prize.type === "discount_fixed" ||
                          prize.type === "loyalty_points") && (
                          <input
                            type="number"
                            value={prize.value || 0}
                            onChange={(e) => updatePrize(prize.id, "value", parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-border rounded"
                            placeholder="Valor"
                          />
                        )}

                        {(prize.type === "free_product" || prize.type === "add_to_cart") && (
                          <select
                            value={prize.productId || ""}
                            onChange={(e) => updatePrize(prize.id, "productId", e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-border rounded"
                          >
                            <option value="">Seleccionar producto...</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - Stock: {product.stock || 0}
                              </option>
                            ))}
                          </select>
                        )}

                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted-foreground">
                            Probabilidad: {prize.probability}%
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={prize.probability}
                            onChange={(e) =>
                              updatePrize(prize.id, "probability", parseInt(e.target.value))
                            }
                            className="flex-1"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={prize.sendEmail || false}
                              onChange={(e) => updatePrize(prize.id, "sendEmail", e.target.checked)}
                              className="w-3 h-3"
                            />
                            <Mail className="w-3 h-3" /> Email
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={prize.sendWhatsApp || false}
                              onChange={(e) =>
                                updatePrize(prize.id, "sendWhatsApp", e.target.checked)
                              }
                              className="w-3 h-3"
                            />
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={prize.requiresStock || false}
                              onChange={(e) =>
                                updatePrize(prize.id, "requiresStock", e.target.checked)
                              }
                              className="w-3 h-3"
                            />
                            <Package className="w-3 h-3" /> Verificar stock
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={prize.decrementStock || false}
                              onChange={(e) =>
                                updatePrize(prize.id, "decrementStock", e.target.checked)
                              }
                              className="w-3 h-3"
                            />
                            Descontar stock
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white p-4 rounded-lg border border-border space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuración
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de la Rueda</label>
                  <input
                    type="text"
                    value={activeConfig.name}
                    onChange={(e) => setActiveConfig({ ...activeConfig, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duración del giro (ms): {activeConfig.spinDuration}
                  </label>
                  <input
                    type="range"
                    min="2000"
                    max="8000"
                    step="500"
                    value={activeConfig.spinDuration}
                    onChange={(e) =>
                      setActiveConfig({
                        ...activeConfig,
                        spinDuration: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeConfig.showConfetti}
                      onChange={(e) =>
                        setActiveConfig({ ...activeConfig, showConfetti: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Mostrar confetti</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeConfig.requireEmail}
                      onChange={(e) =>
                        setActiveConfig({ ...activeConfig, requireEmail: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Requerir email</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeConfig.requireLogin}
                      onChange={(e) =>
                        setActiveConfig({ ...activeConfig, requireLogin: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Requerir login</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeConfig.enableEmailNotifications}
                      onChange={(e) =>
                        setActiveConfig({
                          ...activeConfig,
                          enableEmailNotifications: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Notificaciones por email</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeConfig.enableWhatsAppNotifications}
                      onChange={(e) =>
                        setActiveConfig({
                          ...activeConfig,
                          enableWhatsAppNotifications: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Notificaciones por WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeConfig.enableSocialSharing}
                      onChange={(e) =>
                        setActiveConfig({
                          ...activeConfig,
                          enableSocialSharing: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Compartir en redes sociales</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeConfig.active}
                      onChange={(e) =>
                        setActiveConfig({ ...activeConfig, active: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Activar en el sitio web</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Max giros/usuario</label>
                    <input
                      type="number"
                      value={activeConfig.maxSpinsPerUser || ""}
                      onChange={(e) =>
                        setActiveConfig({
                          ...activeConfig,
                          maxSpinsPerUser: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-border rounded"
                      placeholder="Sin límite"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Max giros/día</label>
                    <input
                      type="number"
                      value={activeConfig.maxSpinsPerDay || ""}
                      onChange={(e) =>
                        setActiveConfig({
                          ...activeConfig,
                          maxSpinsPerDay: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-2 py-1 text-sm border border-border rounded"
                      placeholder="Sin límite"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
          >
            <h3 className="font-bold mb-4">Ingresa tu email</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Te enviaremos tu premio por email
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2 border border-border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  handleSpin();
                }}
                disabled={!email}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && stats && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowStats(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Estadísticas de la Rueda
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalSpins}</p>
                <p className="text-sm text-muted-foreground">Giros Totales</p>
              </div>
              <div className="bg-secondary/10 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-secondary">{stats.uniqueEmails}</p>
                <p className="text-sm text-muted-foreground">Emails Únicos</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.uniqueUsers}</p>
                <p className="text-sm text-muted-foreground">Usuarios Únicos</p>
              </div>
            </div>

            <h4 className="font-medium mb-3">Distribución de Premios:</h4>
            <div className="space-y-2">
              {stats.prizes.map((prize: any) => (
                <div
                  key={prize.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: prize.color }}
                    ></div>
                    <span className="font-medium">{prize.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{prize.timesWon} veces</p>
                    <p className="text-xs text-muted-foreground">
                      {prize.actualProbability}% real vs {prize.probability}% esperado
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="w-full mt-6 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
