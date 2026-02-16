import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// TIPOS Y HELPERS
// ==========================================

type PrizeType =
  | "discount_percentage"
  | "discount_fixed"
  | "free_shipping"
  | "free_product"
  | "add_to_cart"
  | "loyalty_points"
  | "coupon_code"
  | "no_prize";

// Generar código de cupón único
function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Seleccionar premio basado en probabilidades
function selectPrize(prizes: any[]): any | null {
  if (!prizes || prizes.length === 0) return null;

  // Filtrar premios disponibles (sin stock requirement o con stock disponible)
  const availablePrizes = prizes.filter((p) => {
    if (p.type === "no_prize") return true;
    if (!p.requiresStock) return true;
    // Si requiere stock, se verifica después
    return true;
  });

  if (availablePrizes.length === 0) return null;

  // Calcular probabilidad total
  const totalProbability = availablePrizes.reduce(
    (sum, p) => sum + (p.probability || 0),
    0
  );

  if (totalProbability === 0) return null;

  // Selección aleatoria ponderada
  const random = Math.random() * totalProbability;
  let cumulative = 0;

  for (const prize of availablePrizes) {
    cumulative += prize.probability || 0;
    if (random <= cumulative) {
      return prize;
    }
  }

  // Fallback: último premio
  return availablePrizes[availablePrizes.length - 1];
}

// Procesar premio ganado
async function processPrize(
  prize: any,
  userId: string | undefined,
  email: string | undefined,
  sessionId: string | undefined,
  wheel: any
): Promise<any> {
  const result: any = {
    prize: { ...prize },
    couponCode: null,
    expiresAt: null,
    product: null,
  };

  // Verificar stock si es necesario
  if (prize.requiresStock && prize.productId) {
    const productEntry = await kv.get([`article:${prize.productId}`]);
    const product = productEntry.value;

    if (!product || (product.stock !== undefined && product.stock <= 0)) {
      // Buscar premio alternativo sin stock requirement
      const alternativePrize = wheel.prizes.find(
        (p: any) => !p.requiresStock && p.type !== "no_prize"
      );
      if (alternativePrize) {
        return await processPrize(alternativePrize, userId, email, sessionId, wheel);
      }
      // Si no hay alternativa, dar "sin premio"
      return {
        prize: wheel.prizes.find((p: any) => p.type === "no_prize") || prize,
        couponCode: null,
        expiresAt: null,
        product: null,
      };
    }

    // Descontar stock si está configurado
    if (prize.decrementStock && product.stock !== undefined) {
      product.stock = Math.max(0, product.stock - 1);
      await kv.set([`article:${prize.productId}`], product);
    }

    result.product = product;
  }

  // Procesar según tipo de premio
  switch (prize.type) {
    case "discount_percentage":
    case "discount_fixed": {
      const couponCode = generateCouponCode();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (prize.expiryDays || 7));

      await kv.set([`coupon:${couponCode}`], {
        code: couponCode,
        discount: prize.value,
        type: prize.type === "discount_percentage" ? "percentage" : "fixed",
        userId: userId || undefined,
        email: email || undefined,
        source: "wheel",
        expiresAt: expiryDate.toISOString(),
        createdAt: new Date().toISOString(),
        active: true,
      });

      result.couponCode = couponCode;
      result.expiresAt = expiryDate.toISOString();
      break;
    }

    case "free_shipping": {
      const shippingCode = generateCouponCode();
      const shippingExpiryDate = new Date();
      shippingExpiryDate.setDate(
        shippingExpiryDate.getDate() + (prize.expiryDays || 14)
      );

      await kv.set([`coupon:${shippingCode}`], {
        code: shippingCode,
        freeShipping: true,
        userId: userId || undefined,
        email: email || undefined,
        source: "wheel",
        expiresAt: shippingExpiryDate.toISOString(),
        createdAt: new Date().toISOString(),
        active: true,
      });

      result.couponCode = shippingCode;
      result.expiresAt = shippingExpiryDate.toISOString();
      break;
    }

    case "add_to_cart": {
      if (prize.productId && userId) {
        // Obtener carrito del usuario
        const cartKey = `cart:${userId}`;
        const cartEntry = await kv.get([cartKey]);
        let cart = cartEntry.value || { items: [] };

        // Agregar producto al carrito con precio $0
        const productEntry = await kv.get([`article:${prize.productId}`]);
        const product = productEntry.value;

        if (product) {
          const cartItem = {
            product_id: prize.productId,
            name: product.name || product.nombre || "Producto Gratis",
            sku: product.sku || "",
            price: 0, // GRATIS
            quantity: 1,
            image_url: product.image || product.imagen || "",
            metadata: {
              fromWheel: true,
              prizeId: prize.id,
            },
            added_at: new Date().toISOString(),
          };

          cart.items = cart.items || [];
          cart.items.push(cartItem);
          cart.updated_at = new Date().toISOString();

          await kv.set([cartKey], cart);
          result.product = product;
          result.addedToCart = true;
        }
      } else if (prize.productId && sessionId) {
        // Carrito de sesión
        const cartKey = `cart:session:${sessionId}`;
        const cartEntry = await kv.get([cartKey]);
        let cart = cartEntry.value || { items: [] };

        const productEntry = await kv.get([`article:${prize.productId}`]);
        const product = productEntry.value;

        if (product) {
          const cartItem = {
            product_id: prize.productId,
            name: product.name || product.nombre || "Producto Gratis",
            sku: product.sku || "",
            price: 0,
            quantity: 1,
            image_url: product.image || product.imagen || "",
            metadata: {
              fromWheel: true,
              prizeId: prize.id,
            },
            added_at: new Date().toISOString(),
          };

          cart.items = cart.items || [];
          cart.items.push(cartItem);
          cart.updated_at = new Date().toISOString();

          await kv.set([cartKey], cart);
          result.product = product;
          result.addedToCart = true;
        }
      }
      break;
    }

    case "loyalty_points": {
      if (userId && prize.value) {
        // Obtener puntos actuales del usuario
        const userPointsKey = `user_points:${userId}`;
        const pointsEntry = await kv.get([userPointsKey]);
        const currentPoints = pointsEntry.value?.points || 0;

        // Agregar puntos
        await kv.set([userPointsKey], {
          userId,
          points: currentPoints + prize.value,
          updatedAt: new Date().toISOString(),
        });

        result.pointsAdded = prize.value;
        result.totalPoints = currentPoints + prize.value;
      }
      break;
    }

    case "coupon_code": {
      // Usar código pre-generado
      result.couponCode = prize.couponCode;
      if (prize.expiryDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + prize.expiryDays);
        result.expiresAt = expiryDate.toISOString();
      }
      break;
    }

    case "free_product":
      // Solo retornar info del producto, no agregar al carrito automáticamente
      if (prize.productId) {
        const productEntry = await kv.get([`article:${prize.productId}`]);
        result.product = productEntry.value;
      }
      break;

    case "no_prize":
      // No hacer nada
      break;
  }

  // Cola de emails
  if (prize.sendEmail && email && wheel.enableEmailNotifications) {
    const emailQueueKey = `email_queue:${Date.now()}`;
    await kv.set([emailQueueKey], {
      to: email,
      subject: `🎉 ¡Felicitaciones! Ganaste: ${prize.label}`,
      template: "wheel_prize",
      data: {
        prize: prize.label,
        description: prize.description,
        couponCode: result.couponCode,
        expiresAt: result.expiresAt,
        product: result.product,
      },
      createdAt: new Date().toISOString(),
    });
    result.emailQueued = true;
  }

  // Cola de WhatsApp
  if (prize.sendWhatsApp && wheel.enableWhatsAppNotifications) {
    // Aquí se integraría con WhatsApp Business API o Twilio
    const whatsappQueueKey = `whatsapp_queue:${Date.now()}`;
    await kv.set([whatsappQueueKey], {
      to: "", // Número del usuario (se obtendría del perfil)
      message: `🎉 ¡Felicitaciones!\nGanaste: ${prize.label}\n${
        result.couponCode ? `Código: ${result.couponCode}` : ""
      }\n${
        result.expiresAt
          ? `Válido hasta: ${new Date(result.expiresAt).toLocaleDateString()}`
          : ""
      }\n\nUsalo en tu próxima compra en oddymarket.com`,
      data: {
        prizeLabel: prize.label,
        couponCode: result.couponCode,
      },
      createdAt: new Date().toISOString(),
    });
    result.whatsappQueued = true;
  }

  return result;
}

// ==========================================
// CONFIGURACIÓN DE RUEDAS
// ==========================================

// Obtener todas las configuraciones de ruedas
app.get("/make-server-0dd48dc4/wheel/configs", async (c) => {
  try {
    const wheels = [];
    for await (const entry of kv.list({ prefix: ["wheel_config:"] })) {
      wheels.push(entry.value);
    }
    return c.json({ wheels });
  } catch (error) {
    console.error("Error fetching wheel configs:", error);
    return c.json({ error: "Error fetching wheel configs" }, 500);
  }
});

// Obtener rueda activa
app.get("/make-server-0dd48dc4/wheel/active", async (c) => {
  try {
    let activeWheel = null;
    for await (const entry of kv.list({ prefix: ["wheel_config:"] })) {
      const wheel = entry.value as any;
      if (wheel.active) {
        // Verificar fechas de vigencia
        const now = new Date();
        if (wheel.startDate && new Date(wheel.startDate) > now) continue;
        if (wheel.endDate && new Date(wheel.endDate) < now) continue;
        activeWheel = wheel;
        break;
      }
    }
    return c.json({ wheel: activeWheel });
  } catch (error) {
    console.error("Error fetching active wheel:", error);
    return c.json({ error: "Error fetching active wheel" }, 500);
  }
});

// Crear/Actualizar configuración de rueda
app.post("/make-server-0dd48dc4/wheel/config", async (c) => {
  try {
    const config = await c.req.json();

    // Validar que las probabilidades sumen 100
    const totalProb = config.prizes.reduce(
      (sum: number, p: any) => sum + (p.probability || 0),
      0
    );
    if (Math.abs(totalProb - 100) > 0.1) {
      return c.json(
        {
          error: `Las probabilidades deben sumar 100% (actual: ${totalProb.toFixed(
            1
          )}%)`,
        },
        400
      );
    }

    const id = config.id || `wheel_config:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const wheelConfig = {
      id,
      name: config.name || "Nueva Rueda",
      description: config.description || "",
      prizes: config.prizes || [],
      spinDuration: config.spinDuration || 3000,
      showConfetti: config.showConfetti !== false,
      requireEmail: config.requireEmail || false,
      requireLogin: config.requireLogin || false,
      maxSpinsPerUser: config.maxSpinsPerUser,
      maxSpinsPerDay: config.maxSpinsPerDay,
      enableEmailNotifications: config.enableEmailNotifications || false,
      enableWhatsAppNotifications: config.enableWhatsAppNotifications || false,
      enableSocialSharing: config.enableSocialSharing || false,
      active: config.active || false,
      startDate: config.startDate,
      endDate: config.endDate,
      totalSpins: config.totalSpins || 0,
      uniqueUsers: config.uniqueUsers || 0,
      uniqueEmails: config.uniqueEmails || 0,
      lastSpinAt: config.lastSpinAt,
      createdAt: config.createdAt || timestamp,
      updatedAt: timestamp,
    };

    await kv.set([id], wheelConfig);

    return c.json({ success: true, wheelId: id, wheel: wheelConfig });
  } catch (error) {
    console.error("Error saving wheel config:", error);
    return c.json({ error: "Error saving wheel config" }, 500);
  }
});

// ==========================================
// GIRAR RUEDA
// ==========================================

app.post("/make-server-0dd48dc4/wheel/spin", async (c) => {
  try {
    const { wheelId, userId, email, sessionId } = await c.req.json();

    if (!wheelId) {
      return c.json({ error: "wheelId es requerido" }, 400);
    }

    // Obtener configuración de rueda
    const wheelEntry = await kv.get([wheelId]);
    if (!wheelEntry.value) {
      return c.json({ error: "Rueda no encontrada" }, 404);
    }

    const wheel = wheelEntry.value as any;

    // Verificar si está activa
    if (!wheel.active) {
      return c.json({ error: "La rueda no está activa" }, 400);
    }

    // Verificar fechas de vigencia
    const now = new Date();
    if (wheel.startDate && new Date(wheel.startDate) > now) {
      return c.json({ error: "La rueda aún no ha comenzado" }, 400);
    }
    if (wheel.endDate && new Date(wheel.endDate) < now) {
      return c.json({ error: "La rueda ha finalizado" }, 400);
    }

    // Verificar requerimientos
    if (wheel.requireLogin && !userId) {
      return c.json({ error: "Se requiere iniciar sesión" }, 401);
    }
    if (wheel.requireEmail && !email) {
      return c.json({ error: "Se requiere email" }, 400);
    }

    // Verificar límites de giros
    const identifier = userId || email || sessionId || "anonymous";
    const spinPrefix = [`wheel_spin:${wheelId}:${identifier}`];

    const userSpins = [];
    for await (const entry of kv.list({ prefix: spinPrefix })) {
      userSpins.push(entry.value);
    }

    // Límite total por usuario
    if (wheel.maxSpinsPerUser && userSpins.length >= wheel.maxSpinsPerUser) {
      return c.json(
        {
          error: `Has alcanzado el límite de giros (${wheel.maxSpinsPerUser}/${wheel.maxSpinsPerUser})`,
        },
        400
      );
    }

    // Límite diario
    if (wheel.maxSpinsPerDay) {
      const today = new Date().toISOString().split("T")[0];
      const todaySpins = userSpins.filter((spin: any) =>
        spin.timestamp?.startsWith(today)
      );
      if (todaySpins.length >= wheel.maxSpinsPerDay) {
        return c.json(
          { error: "Ya giraste hoy. Volvé mañana!" },
          400
        );
      }
    }

    // Seleccionar premio
    const selectedPrize = selectPrize(wheel.prizes);
    if (!selectedPrize) {
      return c.json({ error: "No hay premios disponibles" }, 400);
    }

    // Procesar premio
    const prizeResult = await processPrize(
      selectedPrize,
      userId,
      email,
      sessionId,
      wheel
    );

    // Registrar spin
    const spinId = `wheel_spin:${wheelId}:${identifier}:${Date.now()}`;
    const spin = {
      id: spinId,
      wheelId,
      userId: userId || null,
      email: email || null,
      sessionId: sessionId || null,
      prizeId: selectedPrize.id,
      prizeType: selectedPrize.type,
      prizeLabel: selectedPrize.label,
      prizeValue: selectedPrize.value,
      couponCode: prizeResult.couponCode,
      expiresAt: prizeResult.expiresAt,
      productId: prizeResult.product?.id || selectedPrize.productId,
      timestamp: new Date().toISOString(),
    };

    await kv.set([spinId], spin);

    // Actualizar estadísticas de la rueda
    wheel.totalSpins = (wheel.totalSpins || 0) + 1;
    wheel.lastSpinAt = new Date().toISOString();

    // Actualizar usuarios únicos
    const allSpins = [];
    for await (const entry of kv.list({ prefix: [`wheel_spin:${wheelId}:`] })) {
      allSpins.push(entry.value);
    }

    const uniqueUserIds = new Set(
      allSpins
        .map((s: any) => s.userId)
        .filter((id: any) => id !== null)
    );
    const uniqueEmailsSet = new Set(
      allSpins
        .map((s: any) => s.email)
        .filter((e: any) => e !== null)
    );

    wheel.uniqueUsers = uniqueUserIds.size;
    wheel.uniqueEmails = uniqueEmailsSet.size;

    await kv.set([wheelId], wheel);

    // Retornar resultado
    return c.json({
      success: true,
      prize: {
        ...selectedPrize,
        couponCode: prizeResult.couponCode,
        expiresAt: prizeResult.expiresAt,
        product: prizeResult.product,
        pointsAdded: prizeResult.pointsAdded,
        totalPoints: prizeResult.totalPoints,
        addedToCart: prizeResult.addedToCart,
      },
      spinId,
    });
  } catch (error) {
    console.error("Error spinning wheel:", error);
    return c.json({ error: "Error al girar la rueda" }, 500);
  }
});

// ==========================================
// ESTADÍSTICAS
// ==========================================

app.get("/make-server-0dd48dc4/wheel/:wheelId/stats", async (c) => {
  try {
    const wheelId = c.req.param("wheelId");
    const wheelEntry = await kv.get([wheelId]);

    if (!wheelEntry.value) {
      return c.json({ error: "Rueda no encontrada" }, 404);
    }

    const wheel = wheelEntry.value as any;

    // Obtener todos los spins de esta rueda
    const allSpins = [];
    for await (const entry of kv.list({ prefix: [`wheel_spin:${wheelId}:`] })) {
      allSpins.push(entry.value);
    }

    // Calcular distribución de premios
    const prizeDistribution: Record<string, number> = {};
    const prizeStats = wheel.prizes.map((prize: any) => {
      const timesWon = allSpins.filter(
        (spin: any) => spin.prizeId === prize.id
      ).length;
      prizeDistribution[prize.id] = timesWon;

      const actualProbability =
        allSpins.length > 0 ? (timesWon / allSpins.length) * 100 : 0;

      return {
        id: prize.id,
        label: prize.label,
        color: prize.color,
        probability: prize.probability,
        timesWon,
        actualProbability: parseFloat(actualProbability.toFixed(2)),
      };
    });

    // Usuarios únicos
    const uniqueUserIds = new Set(
      allSpins
        .map((s: any) => s.userId)
        .filter((id: any) => id !== null)
    );
    const uniqueEmailsSet = new Set(
      allSpins
        .map((s: any) => s.email)
        .filter((e: any) => e !== null)
    );

    return c.json({
      stats: {
        totalSpins: allSpins.length,
        uniqueEmails: uniqueEmailsSet.size,
        uniqueUsers: uniqueUserIds.size,
        lastSpinAt: wheel.lastSpinAt,
        prizeDistribution,
        prizes: prizeStats,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ error: "Error fetching stats" }, 500);
  }
});

// Mis premios
app.get("/make-server-0dd48dc4/wheel/my-prizes", async (c) => {
  try {
    const userId = c.req.query("userId");
    const email = c.req.query("email");

    if (!userId && !email) {
      return c.json({ error: "userId o email requerido" }, 400);
    }

    const allSpins = [];
    for await (const entry of kv.list({ prefix: ["wheel_spin:"] })) {
      const spin = entry.value as any;
      if (
        (userId && spin.userId === userId) ||
        (email && spin.email === email)
      ) {
        allSpins.push(spin);
      }
    }

    return c.json({ prizes: allSpins });
  } catch (error) {
    console.error("Error fetching my prizes:", error);
    return c.json({ error: "Error fetching my prizes" }, 500);
  }
});

export default app;
