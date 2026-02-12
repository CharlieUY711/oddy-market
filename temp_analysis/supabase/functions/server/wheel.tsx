import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { getApiKey } from "./api-keys.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ============== TIPOS DE PREMIOS ==============

export type PrizeType = 
  | "discount_percentage"  // Descuento en %
  | "discount_fixed"       // Descuento en monto fijo
  | "free_shipping"        // Envío gratis
  | "free_product"         // Producto gratis
  | "add_to_cart"          // Agregar producto al carrito
  | "loyalty_points"       // Puntos de lealtad
  | "coupon_code"          // Código de cupón
  | "no_prize";            // Sin premio

export interface WheelPrize {
  id: string;
  label: string;
  color: string;
  probability: number;
  
  // Tipo de premio
  type: PrizeType;
  
  // Configuración del premio
  value?: number;           // Valor del descuento o puntos
  productId?: string;       // ID del producto (para free_product o add_to_cart)
  couponCode?: string;      // Código de cupón pre-generado
  
  // Manejo de stock
  requiresStock?: boolean;  // Si requiere verificar stock
  decrementStock?: boolean; // Si debe descontar stock
  
  // Integraciones
  sendEmail?: boolean;      // Enviar email de premio
  sendWhatsApp?: boolean;   // Enviar mensaje de WhatsApp
  shareOnSocial?: boolean;  // Permitir compartir en redes
  
  // Metadatos
  description?: string;
  termsAndConditions?: string;
  expiryDays?: number;      // Días de validez del premio
}

export interface WheelConfig {
  id: string;
  name: string;
  description?: string;
  prizes: WheelPrize[];
  
  // Configuración visual
  spinDuration: number;
  showConfetti: boolean;
  
  // Restricciones
  requireEmail: boolean;
  requireLogin: boolean;
  maxSpinsPerUser?: number;
  maxSpinsPerDay?: number;
  
  // Integraciones
  enableEmailNotifications: boolean;
  enableWhatsAppNotifications: boolean;
  enableSocialSharing: boolean;
  
  // Estado
  active: boolean;
  startDate?: string;
  endDate?: string;
  
  // Analytics
  totalSpins?: number;
  uniqueUsers?: number;
}

// ============== ENDPOINTS ==============

// Obtener todas las ruedas
app.get("/make-server-0dd48dc4/wheel/configs", async (c) => {
  try {
    const wheels = await kv.getByPrefix("wheel_config:");
    
    return c.json({
      wheels: wheels.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    });
  } catch (error) {
    console.error("Error fetching wheel configs:", error);
    return c.json({ error: "Error fetching wheel configs" }, 500);
  }
});

// Obtener rueda activa para el frontend público
app.get("/make-server-0dd48dc4/wheel/active", async (c) => {
  try {
    const wheels = await kv.getByPrefix("wheel_config:");
    const now = new Date();
    
    const activeWheel = wheels.find((wheel: WheelConfig) => {
      if (!wheel.active) return false;
      
      // Verificar fechas
      if (wheel.startDate && new Date(wheel.startDate) > now) return false;
      if (wheel.endDate && new Date(wheel.endDate) < now) return false;
      
      return true;
    });
    
    if (!activeWheel) {
      return c.json({ wheel: null, message: "No active wheel" });
    }
    
    return c.json({ wheel: activeWheel });
  } catch (error) {
    console.error("Error fetching active wheel:", error);
    return c.json({ error: "Error fetching active wheel" }, 500);
  }
});

// Crear/Actualizar rueda
app.post("/make-server-0dd48dc4/wheel/config", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const config: WheelConfig = await c.req.json();
    
    // Validar probabilidades suman 100%
    const totalProbability = config.prizes.reduce((sum, p) => sum + p.probability, 0);
    if (Math.abs(totalProbability - 100) > 0.1) {
      return c.json({ 
        error: "Las probabilidades deben sumar 100%",
        current: totalProbability 
      }, 400);
    }
    
    const wheelId = config.id || `wheel_${Date.now()}`;
    
    await kv.set(`wheel_config:${wheelId}`, {
      ...config,
      id: wheelId,
      updatedAt: new Date().toISOString(),
      createdAt: config.createdAt || new Date().toISOString(),
    });
    
    return c.json({ success: true, wheelId });
  } catch (error) {
    console.error("Error saving wheel config:", error);
    return c.json({ error: "Error saving wheel config" }, 500);
  }
});

// Girar la rueda (público)
app.post("/make-server-0dd48dc4/wheel/spin", async (c) => {
  try {
    const { wheelId, userId, email, sessionId } = await c.req.json();
    
    if (!wheelId) {
      return c.json({ error: "Wheel ID required" }, 400);
    }
    
    // Cargar configuración de la rueda
    const wheel: WheelConfig = await kv.get(`wheel_config:${wheelId}`);
    
    if (!wheel || !wheel.active) {
      return c.json({ error: "Wheel not active" }, 400);
    }
    
    // Verificar restricciones de email/login
    if (wheel.requireEmail && !email) {
      return c.json({ error: "Email required" }, 400);
    }
    
    if (wheel.requireLogin && !userId) {
      return c.json({ error: "Login required" }, 400);
    }
    
    // Identificador del usuario (userId o sessionId)
    const userIdentifier = userId || sessionId || email;
    
    // Verificar límites de spins
    if (wheel.maxSpinsPerUser) {
      const userSpins = await kv.getByPrefix(`wheel_spin:${wheelId}:${userIdentifier}`);
      if (userSpins.length >= wheel.maxSpinsPerUser) {
        return c.json({ 
          error: "Has alcanzado el límite de giros",
          maxSpins: wheel.maxSpinsPerUser 
        }, 403);
      }
    }
    
    if (wheel.maxSpinsPerDay) {
      const today = new Date().toISOString().split('T')[0];
      const todaySpins = await kv.getByPrefix(`wheel_spin:${wheelId}:${userIdentifier}:`);
      const todayCount = todaySpins.filter((spin: any) => 
        spin.timestamp?.startsWith(today)
      ).length;
      
      if (todayCount >= wheel.maxSpinsPerDay) {
        return c.json({ 
          error: "Has alcanzado el límite de giros diarios",
          maxSpinsPerDay: wheel.maxSpinsPerDay 
        }, 403);
      }
    }
    
    // Seleccionar premio basado en probabilidad
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize: WheelPrize | null = null;
    
    for (const prize of wheel.prizes) {
      cumulative += prize.probability;
      if (random <= cumulative) {
        selectedPrize = prize;
        break;
      }
    }
    
    if (!selectedPrize) {
      return c.json({ error: "Error selecting prize" }, 500);
    }
    
    // Verificar stock si es necesario
    if (selectedPrize.requiresStock && selectedPrize.productId) {
      const product = await kv.get(`article:${selectedPrize.productId}`);
      
      if (!product || product.stock <= 0) {
        // Si no hay stock, dar premio alternativo (primer premio sin stock)
        selectedPrize = wheel.prizes.find(p => !p.requiresStock) || selectedPrize;
      } else if (selectedPrize.decrementStock) {
        // Descontar stock
        await kv.set(`article:${selectedPrize.productId}`, {
          ...product,
          stock: product.stock - 1,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    // Procesar premio
    const prizeData = await processPrize(selectedPrize, userId, email, wheel);
    
    // Registrar el spin
    const spinId = `wheel_spin:${wheelId}:${userIdentifier}:${Date.now()}`;
    await kv.set(spinId, {
      wheelId,
      userId,
      email,
      sessionId,
      prizeId: selectedPrize.id,
      prizeType: selectedPrize.type,
      prizeValue: selectedPrize.value,
      timestamp: new Date().toISOString(),
      ...prizeData,
    });
    
    // Actualizar estadísticas de la rueda
    await kv.set(`wheel_config:${wheelId}`, {
      ...wheel,
      totalSpins: (wheel.totalSpins || 0) + 1,
      uniqueUsers: wheel.uniqueUsers || 0, // Se puede mejorar con un Set
      lastSpinAt: new Date().toISOString(),
    });
    
    // Agregar al carrito si es necesario
    if (selectedPrize.type === "add_to_cart" && selectedPrize.productId && userId) {
      await addPrizeToCart(selectedPrize.productId, userId);
    }
    
    return c.json({
      success: true,
      prize: {
        ...selectedPrize,
        ...prizeData,
      },
      spinId,
    });
    
  } catch (error) {
    console.error("Error spinning wheel:", error);
    return c.json({ error: "Error spinning wheel" }, 500);
  }
});

// Procesar premio ganado
async function processPrize(
  prize: WheelPrize,
  userId: string | undefined,
  email: string | undefined,
  wheel: WheelConfig
): Promise<any> {
  const result: any = {};
  
  switch (prize.type) {
    case "discount_percentage":
    case "discount_fixed":
      // Generar código de cupón
      const couponCode = prize.couponCode || `WHEEL${Date.now()}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (prize.expiryDays || 7));
      
      await kv.set(`coupon:${couponCode}`, {
        code: couponCode,
        discount: prize.value,
        type: prize.type === "discount_percentage" ? "percentage" : "fixed",
        userId: userId || undefined,
        email: email || undefined,
        source: "wheel",
        expiresAt: expiryDate.toISOString(),
        createdAt: new Date().toISOString(),
      });
      
      result.couponCode = couponCode;
      result.expiresAt = expiryDate.toISOString();
      break;
      
    case "free_shipping":
      // Generar código de envío gratis
      const shippingCode = `SHIP${Date.now()}`;
      const shippingExpiryDate = new Date();
      shippingExpiryDate.setDate(shippingExpiryDate.getDate() + (prize.expiryDays || 7));
      
      await kv.set(`coupon:${shippingCode}`, {
        code: shippingCode,
        freeShipping: true,
        userId: userId || undefined,
        email: email || undefined,
        source: "wheel",
        expiresAt: shippingExpiryDate.toISOString(),
        createdAt: new Date().toISOString(),
      });
      
      result.couponCode = shippingCode;
      result.expiresAt = shippingExpiryDate.toISOString();
      break;
      
    case "free_product":
    case "add_to_cart":
      if (prize.productId) {
        const product = await kv.get(`article:${prize.productId}`);
        result.product = product;
        result.productId = prize.productId;
      }
      break;
      
    case "loyalty_points":
      if (userId) {
        const customer = await kv.get(`customer:${userId}`);
        if (customer) {
          await kv.set(`customer:${userId}`, {
            ...customer,
            loyaltyPoints: (customer.loyaltyPoints || 0) + (prize.value || 0),
            updatedAt: new Date().toISOString(),
          });
        }
        result.pointsAwarded = prize.value;
      }
      break;
      
    case "coupon_code":
      result.couponCode = prize.couponCode;
      break;
      
    case "no_prize":
      result.message = "Mejor suerte la próxima vez";
      break;
  }
  
  // Enviar notificaciones
  if (prize.sendEmail && email && wheel.enableEmailNotifications) {
    await sendPrizeEmail(email, prize, result);
  }
  
  if (prize.sendWhatsApp && wheel.enableWhatsAppNotifications) {
    // Obtener número de teléfono del cliente
    const customer = userId ? await kv.get(`customer:${userId}`) : null;
    const phone = customer?.phone || email; // Fallback a email si no hay teléfono
    
    if (phone) {
      await sendPrizeWhatsApp(phone, prize, result);
    }
  }
  
  return result;
}

// Agregar producto al carrito
async function addPrizeToCart(productId: string, userId: string) {
  try {
    const cart = await kv.get(`cart:${userId}`) || { items: [] };
    const product = await kv.get(`article:${productId}`);
    
    if (!product) return;
    
    // Verificar si ya está en el carrito
    const existingIndex = cart.items.findIndex((item: any) => item.id === productId);
    
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += 1;
    } else {
      cart.items.push({
        id: product.id,
        name: product.name,
        price: 0, // Gratis
        image: product.image,
        quantity: 1,
        fromWheel: true,
      });
    }
    
    await kv.set(`cart:${userId}`, {
      ...cart,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error adding prize to cart:", error);
  }
}

// Enviar email de premio
async function sendPrizeEmail(email: string, prize: WheelPrize, result: any) {
  try {
    await kv.set(`email_queue:${Date.now()}`, {
      to: email,
      subject: `🎉 ¡Felicitaciones! Ganaste: ${prize.label}`,
      template: "wheel_prize",
      data: {
        prizeLabel: prize.label,
        prizeDescription: prize.description,
        couponCode: result.couponCode,
        expiresAt: result.expiresAt,
        product: result.product,
      },
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error queuing prize email:", error);
  }
}

// Enviar WhatsApp de premio
async function sendPrizeWhatsApp(phone: string, prize: WheelPrize, result: any) {
  try {
    // Formatear mensaje
    let message = `🎉 ¡Felicitaciones ${prize.label}!\n\n`;
    message += `${prize.description || ''}\n\n`;
    
    if (result.couponCode) {
      message += `🎫 Tu código: ${result.couponCode}\n`;
      message += `📅 Válido hasta: ${new Date(result.expiresAt).toLocaleDateString('es-AR')}\n\n`;
    }
    
    if (result.product) {
      message += `🎁 Producto: ${result.product.name}\n`;
    }
    
    message += `¡Usalo en tu próxima compra en ODDY Market! 🛍️`;
    
    // Enviar via endpoint de WhatsApp
    await fetch(
      `https://${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-0dd48dc4/integrations/whatsapp/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          to: phone,
          message,
        }),
      }
    );
    
    console.log("WhatsApp prize notification sent to:", phone);
  } catch (error) {
    console.error("Error sending prize WhatsApp:", error);
  }
}

// Obtener estadísticas de una rueda
app.get("/make-server-0dd48dc4/wheel/:wheelId/stats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const wheelId = c.req.param("wheelId");
    const wheel: WheelConfig = await kv.get(`wheel_config:${wheelId}`);
    
    if (!wheel) {
      return c.json({ error: "Wheel not found" }, 404);
    }
    
    // Obtener todos los spins
    const spins = await kv.getByPrefix(`wheel_spin:${wheelId}:`);
    
    // Calcular estadísticas
    const prizeStats: Record<string, number> = {};
    const uniqueEmails = new Set<string>();
    const uniqueUsers = new Set<string>();
    
    for (const spin of spins) {
      const prizeId = spin.prizeId;
      prizeStats[prizeId] = (prizeStats[prizeId] || 0) + 1;
      
      if (spin.email) uniqueEmails.add(spin.email);
      if (spin.userId) uniqueUsers.add(spin.userId);
    }
    
    return c.json({
      stats: {
        totalSpins: spins.length,
        uniqueEmails: uniqueEmails.size,
        uniqueUsers: uniqueUsers.size,
        prizeDistribution: prizeStats,
        prizes: wheel.prizes.map(prize => ({
          ...prize,
          timesWon: prizeStats[prize.id] || 0,
          actualProbability: spins.length > 0 
            ? ((prizeStats[prize.id] || 0) / spins.length * 100).toFixed(2)
            : 0,
        })),
        lastSpins: spins.slice(-10).reverse(),
      },
    });
  } catch (error) {
    console.error("Error fetching wheel stats:", error);
    return c.json({ error: "Error fetching wheel stats" }, 500);
  }
});

// Obtener premios ganados por un usuario
app.get("/make-server-0dd48dc4/wheel/my-prizes", async (c) => {
  try {
    const { userId, email } = c.req.query();
    
    if (!userId && !email) {
      return c.json({ error: "userId or email required" }, 400);
    }
    
    // Buscar spins del usuario
    const identifier = userId || email;
    const allSpins = await kv.getByPrefix("wheel_spin:");
    
    const userSpins = allSpins.filter((spin: any) => 
      spin.userId === identifier || spin.email === identifier
    );
    
    return c.json({
      prizes: userSpins.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    });
  } catch (error) {
    console.error("Error fetching user prizes:", error);
    return c.json({ error: "Error fetching user prizes" }, 500);
  }
});

export default app;
