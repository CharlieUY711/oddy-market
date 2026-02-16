import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// HELPERS
// ============================================

function calculateCartTotals(cart: any) {
  const items = cart.items || [];
  
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  const tax = subtotal * (cart.tax_rate || 0);
  const shipping = cart.shipping_cost || 0;
  const discount = cart.discount_amount || 0;
  const total = subtotal + tax + shipping - discount;
  
  return {
    subtotal,
    tax,
    shipping,
    discount,
    total,
    items_count: items.length,
    total_quantity: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
  };
}

// ============================================
// CRUD DE CARRITOS
// ============================================

// CREATE - Crear carrito
app.post("/make-server-0dd48dc4/carts", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `cart:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newCart = {
      id,
      entity_id: body.entity_id || "default",
      user_id: body.user_id || null,
      session_id: body.session_id || null, // Para guest users
      
      items: [],
      
      // Costos y descuentos
      tax_rate: body.tax_rate || 0.22, // 22% por defecto
      shipping_cost: body.shipping_cost || 0,
      discount_code: body.discount_code || null,
      discount_amount: body.discount_amount || 0,
      discount_percentage: body.discount_percentage || 0,
      
      // Dirección de envío
      shipping_address: body.shipping_address || null,
      
      // Método de pago
      payment_method: body.payment_method || null,
      
      // Notas
      notes: body.notes || "",
      
      // Status
      status: "active", // active, abandoned, converted, expired
      
      // Metadata
      metadata: body.metadata || {},
      
      // Auditoría
      created_at: timestamp,
      updated_at: timestamp,
      expires_at: body.expires_at || null, // Carrito expira en X días
    };

    // Calcular totales
    const totals = calculateCartTotals(newCart);
    newCart.metadata = { ...newCart.metadata, totals };

    await kv.set([id], newCart);
    
    // Indexar por user_id
    if (newCart.user_id) {
      await kv.set(["carts_by_user", newCart.entity_id, newCart.user_id, id], true);
    }
    
    // Indexar por session_id
    if (newCart.session_id) {
      await kv.set(["carts_by_session", newCart.entity_id, newCart.session_id, id], true);
    }

    return c.json({ cart: newCart });
  } catch (error) {
    console.log("Error creating cart:", error);
    return c.json({ error: error.message || "Error creating cart" }, 500);
  }
});

// READ - Obtener carrito por ID
app.get("/make-server-0dd48dc4/carts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;
    
    // Recalcular totales
    const totals = calculateCartTotals(cart);
    cart.metadata = { ...cart.metadata, totals };

    return c.json({ cart });
  } catch (error) {
    console.log("Error getting cart:", error);
    return c.json({ error: "Error getting cart" }, 500);
  }
});

// READ - Obtener carrito por user_id
app.get("/make-server-0dd48dc4/carts/by-user/:user_id", async (c) => {
  try {
    const user_id = c.req.param("user_id");
    const entity_id = c.req.query("entity_id") || "default";
    
    const prefix = ["carts_by_user", entity_id, user_id];
    const entries = kv.list({ prefix });
    
    for await (const entry of entries) {
      const cartId = entry.key[entry.key.length - 1];
      const cartEntry = await kv.get([cartId]);
      
      if (cartEntry.value) {
        const cart = cartEntry.value as any;
        
        // Solo retornar si está activo
        if (cart.status === "active") {
          const totals = calculateCartTotals(cart);
          cart.metadata = { ...cart.metadata, totals };
          return c.json({ cart });
        }
      }
    }

    return c.json({ error: "Cart not found" }, 404);
  } catch (error) {
    console.log("Error getting cart by user:", error);
    return c.json({ error: "Error getting cart" }, 500);
  }
});

// READ - Obtener carrito por session_id
app.get("/make-server-0dd48dc4/carts/by-session/:session_id", async (c) => {
  try {
    const session_id = c.req.param("session_id");
    const entity_id = c.req.query("entity_id") || "default";
    
    const prefix = ["carts_by_session", entity_id, session_id];
    const entries = kv.list({ prefix });
    
    for await (const entry of entries) {
      const cartId = entry.key[entry.key.length - 1];
      const cartEntry = await kv.get([cartId]);
      
      if (cartEntry.value) {
        const cart = cartEntry.value as any;
        
        // Solo retornar si está activo
        if (cart.status === "active") {
          const totals = calculateCartTotals(cart);
          cart.metadata = { ...cart.metadata, totals };
          return c.json({ cart });
        }
      }
    }

    return c.json({ error: "Cart not found" }, 404);
  } catch (error) {
    console.log("Error getting cart by session:", error);
    return c.json({ error: "Error getting cart" }, 500);
  }
});

// DELETE - Eliminar carrito
app.delete("/make-server-0dd48dc4/carts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;

    // Eliminar índices
    if (cart.user_id) {
      await kv.delete(["carts_by_user", cart.entity_id, cart.user_id, id]);
    }
    if (cart.session_id) {
      await kv.delete(["carts_by_session", cart.entity_id, cart.session_id, id]);
    }

    // Eliminar carrito
    await kv.delete([id]);

    return c.json({ success: true, message: "Cart deleted" });
  } catch (error) {
    console.log("Error deleting cart:", error);
    return c.json({ error: "Error deleting cart" }, 500);
  }
});

// ============================================
// GESTIÓN DE ITEMS
// ============================================

// Agregar item al carrito
app.post("/make-server-0dd48dc4/carts/:id/items", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;
    const timestamp = new Date().toISOString();
    
    const items = cart.items || [];
    
    // Verificar si el producto ya existe en el carrito
    const existingIndex = items.findIndex((item: any) => 
      item.product_id === body.product_id && 
      JSON.stringify(item.variant) === JSON.stringify(body.variant || {})
    );
    
    if (existingIndex >= 0) {
      // Actualizar cantidad
      items[existingIndex].quantity += body.quantity || 1;
      items[existingIndex].updated_at = timestamp;
    } else {
      // Agregar nuevo item
      const newItem = {
        product_id: body.product_id,
        name: body.name,
        sku: body.sku || "",
        variant: body.variant || null,
        price: body.price,
        quantity: body.quantity || 1,
        image_url: body.image_url || "",
        metadata: body.metadata || {},
        added_at: timestamp,
        updated_at: timestamp,
      };
      items.push(newItem);
    }
    
    const updated = {
      ...cart,
      items,
      updated_at: timestamp,
    };
    
    // Calcular totales
    const totals = calculateCartTotals(updated);
    updated.metadata = { ...updated.metadata, totals };

    await kv.set([id], updated);

    return c.json({ cart: updated });
  } catch (error) {
    console.log("Error adding item:", error);
    return c.json({ error: error.message || "Error adding item" }, 500);
  }
});

// Actualizar cantidad de item
app.patch("/make-server-0dd48dc4/carts/:id/items/:product_id", async (c) => {
  try {
    const id = c.req.param("id");
    const product_id = c.req.param("product_id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;
    const timestamp = new Date().toISOString();
    
    const items = cart.items || [];
    const itemIndex = items.findIndex((item: any) => item.product_id === product_id);
    
    if (itemIndex === -1) {
      return c.json({ error: "Item not found in cart" }, 404);
    }
    
    // Actualizar cantidad
    items[itemIndex].quantity = body.quantity;
    items[itemIndex].updated_at = timestamp;
    
    // Si cantidad es 0 o negativa, eliminar item
    if (items[itemIndex].quantity <= 0) {
      items.splice(itemIndex, 1);
    }
    
    const updated = {
      ...cart,
      items,
      updated_at: timestamp,
    };
    
    // Calcular totales
    const totals = calculateCartTotals(updated);
    updated.metadata = { ...updated.metadata, totals };

    await kv.set([id], updated);

    return c.json({ cart: updated });
  } catch (error) {
    console.log("Error updating item:", error);
    return c.json({ error: "Error updating item" }, 500);
  }
});

// Eliminar item del carrito
app.delete("/make-server-0dd48dc4/carts/:id/items/:product_id", async (c) => {
  try {
    const id = c.req.param("id");
    const product_id = c.req.param("product_id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;
    const timestamp = new Date().toISOString();
    
    const items = (cart.items || []).filter((item: any) => item.product_id !== product_id);
    
    const updated = {
      ...cart,
      items,
      updated_at: timestamp,
    };
    
    // Calcular totales
    const totals = calculateCartTotals(updated);
    updated.metadata = { ...updated.metadata, totals };

    await kv.set([id], updated);

    return c.json({ cart: updated });
  } catch (error) {
    console.log("Error removing item:", error);
    return c.json({ error: "Error removing item" }, 500);
  }
});

// Vaciar carrito
app.post("/make-server-0dd48dc4/carts/:id/clear", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;
    const timestamp = new Date().toISOString();
    
    const updated = {
      ...cart,
      items: [],
      updated_at: timestamp,
    };
    
    // Calcular totales
    const totals = calculateCartTotals(updated);
    updated.metadata = { ...updated.metadata, totals };

    await kv.set([id], updated);

    return c.json({ cart: updated });
  } catch (error) {
    console.log("Error clearing cart:", error);
    return c.json({ error: "Error clearing cart" }, 500);
  }
});

// ============================================
// DESCUENTOS Y CUPONES
// ============================================

// Aplicar cupón
app.post("/make-server-0dd48dc4/carts/:id/apply-coupon", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;
    const timestamp = new Date().toISOString();
    
    // Aquí iría la lógica de validación del cupón
    // Por ahora, simulamos que el cupón es válido
    const coupon_code = body.coupon_code;
    const discount_percentage = body.discount_percentage || 10; // 10% por defecto
    
    const subtotal = cart.items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    
    const discount_amount = subtotal * (discount_percentage / 100);
    
    const updated = {
      ...cart,
      discount_code: coupon_code,
      discount_percentage,
      discount_amount,
      updated_at: timestamp,
    };
    
    // Calcular totales
    const totals = calculateCartTotals(updated);
    updated.metadata = { ...updated.metadata, totals };

    await kv.set([id], updated);

    return c.json({ cart: updated });
  } catch (error) {
    console.log("Error applying coupon:", error);
    return c.json({ error: "Error applying coupon" }, 500);
  }
});

// Remover cupón
app.post("/make-server-0dd48dc4/carts/:id/remove-coupon", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;
    const timestamp = new Date().toISOString();
    
    const updated = {
      ...cart,
      discount_code: null,
      discount_percentage: 0,
      discount_amount: 0,
      updated_at: timestamp,
    };
    
    // Calcular totales
    const totals = calculateCartTotals(updated);
    updated.metadata = { ...updated.metadata, totals };

    await kv.set([id], updated);

    return c.json({ cart: updated });
  } catch (error) {
    console.log("Error removing coupon:", error);
    return c.json({ error: "Error removing coupon" }, 500);
  }
});

// ============================================
// CHECKOUT
// ============================================

// Iniciar checkout
app.post("/make-server-0dd48dc4/carts/:id/checkout", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;
    const timestamp = new Date().toISOString();
    
    // Validar que el carrito no esté vacío
    if (!cart.items || cart.items.length === 0) {
      return c.json({ error: "Cart is empty" }, 400);
    }
    
    // Actualizar información de checkout
    const updated = {
      ...cart,
      shipping_address: body.shipping_address || cart.shipping_address,
      payment_method: body.payment_method || cart.payment_method,
      status: "converting",
      updated_at: timestamp,
    };
    
    await kv.set([id], updated);

    return c.json({ 
      cart: updated,
      message: "Ready for checkout" 
    });
  } catch (error) {
    console.log("Error starting checkout:", error);
    return c.json({ error: "Error starting checkout" }, 500);
  }
});

// Convertir carrito a pedido
app.post("/make-server-0dd48dc4/carts/:id/convert-to-order", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Cart not found" }, 404);
    }

    const cart = entry.value as any;
    const timestamp = new Date().toISOString();
    
    // Marcar carrito como convertido
    const updated = {
      ...cart,
      status: "converted",
      converted_at: timestamp,
      updated_at: timestamp,
    };
    
    await kv.set([id], updated);

    // Aquí se crearía el pedido en el módulo de orders
    // Por ahora solo retornamos la info del carrito

    return c.json({ 
      cart: updated,
      message: "Cart converted to order",
      order_id: `order:${Date.now()}` // Simulated
    });
  } catch (error) {
    console.log("Error converting cart:", error);
    return c.json({ error: "Error converting cart" }, 500);
  }
});

export default app;
