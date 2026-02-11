import { useState } from "react";
import {
  CreditCard,
  ShoppingBag,
  Globe,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { motion } from "motion/react";

interface CheckoutProps {
  items: any[];
  total: number;
  onBack: () => void;
  onSuccess: () => void;
}

type PaymentMethod = "mercadopago" | "paypal" | "stripe" | "mercadolibre" | "plexo";

export function Checkout({ items, total, onBack, onSuccess }: CheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const paymentMethods = [
    {
      id: "mercadopago" as PaymentMethod,
      name: "Mercado Pago",
      description: "Tarjetas, efectivo y más",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      available: true,
    },
    {
      id: "plexo" as PaymentMethod,
      name: "Plexo 🇺🇾",
      description: "Tarjetas uruguayas (Visa, Mastercard, OCA, Creditel)",
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      available: true,
    },
    {
      id: "mercadolibre" as PaymentMethod,
      name: "Mercado Libre",
      description: "Paga a través de Mercado Libre",
      icon: ShoppingBag,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      available: true,
    },
    {
      id: "paypal" as PaymentMethod,
      name: "PayPal",
      description: "Pago internacional seguro",
      icon: Globe,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      available: true,
    },
    {
      id: "stripe" as PaymentMethod,
      name: "Tarjeta de Crédito/Débito",
      description: "Visa, Mastercard, American Express",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      available: true,
    },
  ];

  async function handlePayment() {
    if (!selectedMethod) {
      toast.error("Selecciona un método de pago");
      return;
    }

    if (!customerData.name || !customerData.email) {
      toast.error("Completa tus datos para continuar");
      return;
    }

    setProcessing(true);

    try {
      switch (selectedMethod) {
        case "mercadopago":
          await processMercadoPago();
          break;
        case "plexo":
          await processPlexo();
          break;
        case "paypal":
          await processPayPal();
          break;
        case "stripe":
          await processStripe();
          break;
        case "mercadolibre":
          toast.info("Redirigiendo a Mercado Libre...");
          // Implementar redirección a ML
          break;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setProcessing(false);
    }
  }

  async function processPlexo() {
    try {
      const orderId = crypto.randomUUID();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/plexo/create-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total, // Monto en centavos
            currency: "UYU",
            orderId: orderId,
            customer: {
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
            },
            items: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Redirigir a Plexo para completar el pago
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          toast.success("Pago procesado con Plexo");
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al crear pago con Plexo");
      }
    } catch (error) {
      console.error("Plexo error:", error);
      throw error;
    }
  }

  async function processMercadoPago() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadopago/create-preference`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            payer: {
              name: customerData.name,
              email: customerData.email,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Redirigir a Mercado Pago
        window.location.href = data.initPoint;
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al crear preferencia de pago");
      }
    } catch (error) {
      console.error("Mercado Pago error:", error);
      throw error;
    }
  }

  async function processPayPal() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/paypal/create-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            total,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Redirigir a PayPal
        window.location.href = data.approveUrl;
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al crear orden de PayPal");
      }
    } catch (error) {
      console.error("PayPal error:", error);
      throw error;
    }
  }

  async function processStripe() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/stripe/create-payment-intent`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Math.round(total / 1000), // Convertir a USD aproximado
            currency: "usd",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Pago procesado con Stripe");
        // Aquí deberías implementar el Stripe Elements para capturar la tarjeta
        // Por ahora, simulamos éxito
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al crear intención de pago");
      }
    } catch (error) {
      console.error("Stripe error:", error);
      throw error;
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al carrito</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Data */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Datos de contacto</h2>
              <p className="text-muted-foreground">
                Completa tus datos para continuar con el pago
              </p>
            </div>

            <div className="bg-white border border-border rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dirección de envío
                </label>
                <textarea
                  value={customerData.address}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, address: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Calle, número, piso, departamento, localidad"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Método de pago</h2>
              <p className="text-muted-foreground">
                Selecciona cómo deseas pagar tu compra
              </p>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={!method.available || processing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-white hover:border-primary/50"
                  } ${!method.available ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${method.bgColor}`}>
                      <method.icon className={`w-6 h-6 ${method.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{method.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.description}
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Resumen de la orden</h3>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(item.price * item.quantity / 100).toLocaleString("es-AR")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-primary/20 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${(total / 100).toLocaleString("es-AR")}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || processing || !customerData.name || !customerData.email}
              className="w-full py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Pagar ${(total / 100).toLocaleString("es-AR")}</span>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Al realizar el pago, aceptás nuestros términos y condiciones y
              política de privacidad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
