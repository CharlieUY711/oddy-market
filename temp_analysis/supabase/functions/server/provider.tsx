import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const providerApp = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// ============== AUTH HELPER ==============
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ============== PROVIDER DASHBOARD ROUTES ==============

// Get provider products
providerApp.get("/products", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "proveedor") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const products = await kv.getByPrefix(`product:provider:${user.id}:`);
    
    return c.json({ products });
  } catch (error) {
    console.error("Error fetching provider products:", error);
    return c.json({ error: "Error fetching products" }, 500);
  }
});

// Create new product (pending approval)
providerApp.post("/products", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "proveedor") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const productData = await c.req.json();
    const productId = `product:provider:${user.id}:${Date.now()}`;
    
    await kv.set(productId, {
      id: productId,
      ...productData,
      status: "pending_approval",
      providerId: user.id,
      providerEmail: user.email,
      providerName: user.user_metadata?.company || user.user_metadata?.name,
      sold: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
    });

    // Create notification for admin
    const notificationId = `notification:admin:product-approval:${Date.now()}`;
    await kv.set(notificationId, {
      id: notificationId,
      type: "product_approval",
      title: "Nueva solicitud de producto",
      message: `${user.user_metadata?.company || user.email} solicita publicar: ${productData.name}`,
      productId,
      providerId: user.id,
      read: false,
      date: new Date().toISOString(),
    });

    return c.json({ success: true, productId });
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ error: "Error creating product" }, 500);
  }
});

// Update product
providerApp.put("/products/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "proveedor") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const productId = c.req.param("id");
    const product = await kv.get(productId);
    
    if (!product || product.providerId !== user.id) {
      return c.json({ error: "Product not found or unauthorized" }, 404);
    }

    const updates = await c.req.json();
    await kv.set(productId, {
      ...product,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ error: "Error updating product" }, 500);
  }
});

// Request product publication
providerApp.post("/products/:id/request-publication", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "proveedor") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const productId = c.req.param("id");
    const product = await kv.get(productId);
    
    if (!product || product.providerId !== user.id) {
      return c.json({ error: "Product not found or unauthorized" }, 404);
    }

    // Update product status
    await kv.set(productId, {
      ...product,
      status: "pending_approval",
      requestedAt: new Date().toISOString(),
    });

    // Create notification for admin
    const notificationId = `notification:admin:product-approval:${Date.now()}`;
    await kv.set(notificationId, {
      id: notificationId,
      type: "product_approval",
      title: "Solicitud de publicación",
      message: `${user.user_metadata?.company || user.email} solicita publicar: ${product.name}`,
      productId,
      providerId: user.id,
      read: false,
      date: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error requesting publication:", error);
    return c.json({ error: "Error requesting publication" }, 500);
  }
});

// Get provider orders
providerApp.get("/orders", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "proveedor") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all orders and filter by provider products
    const allOrders = await kv.getByPrefix("order:");
    const providerOrders = [];

    for (const order of allOrders) {
      const hasProviderItems = order.items?.some(
        (item: any) => item.providerId === user.id
      );
      
      if (hasProviderItems) {
        // Filter items to only include provider's products
        const filteredOrder = {
          ...order,
          items: order.items.filter((item: any) => item.providerId === user.id),
        };
        
        // Recalculate total for filtered items
        filteredOrder.total = filteredOrder.items.reduce(
          (sum: number, item: any) => sum + (item.price * item.quantity),
          0
        );
        
        providerOrders.push(filteredOrder);
      }
    }

    // Sort by date descending
    providerOrders.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return c.json({ orders: providerOrders });
  } catch (error) {
    console.error("Error fetching provider orders:", error);
    return c.json({ error: "Error fetching orders" }, 500);
  }
});

// Update order status
providerApp.put("/orders/:id/status", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "proveedor") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orderId = c.req.param("id");
    const { status } = await c.req.json();
    
    const order = await kv.get(orderId);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    // Verify provider owns products in this order
    const hasProviderItems = order.items?.some(
      (item: any) => item.providerId === user.id
    );
    
    if (!hasProviderItems) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Update order status
    await kv.set(orderId, {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    });

    // Create notification for customer
    const notificationId = `notification:user:${order.userId}:${Date.now()}`;
    await kv.set(notificationId, {
      id: notificationId,
      type: "order",
      title: "Actualización de pedido",
      message: `Tu pedido ${order.orderNumber} ha sido ${status === "shipped" ? "enviado" : "actualizado"}`,
      orderId,
      read: false,
      date: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating order status:", error);
    return c.json({ error: "Error updating order status" }, 500);
  }
});

// Get account movements
providerApp.get("/account", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "proveedor") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const movements = await kv.getByPrefix(`account:provider:${user.id}:`);
    
    // Sort by date descending
    movements.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return c.json({ movements });
  } catch (error) {
    console.error("Error fetching account movements:", error);
    return c.json({ error: "Error fetching account" }, 500);
  }
});

// Get statistics
providerApp.get("/statistics", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "proveedor") {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get all provider products
    const products = await kv.getByPrefix(`product:provider:${user.id}:`);
    
    // Calculate statistics
    const activeProducts = products.filter((p: any) => p.status === "active").length;
    const pendingApproval = products.filter((p: any) => p.status === "pending_approval").length;
    
    const totalSales = products.reduce((sum: number, p: any) => sum + (p.sold || 0), 0);
    const totalRevenue = products.reduce((sum: number, p: any) => sum + (p.revenue || 0), 0);
    
    // Get account balance
    const movements = await kv.getByPrefix(`account:provider:${user.id}:`);
    const accountBalance = movements.reduce((sum: number, m: any) => {
      if (m.type === "sale" || m.type === "refund") {
        return sum + m.amount;
      } else {
        return sum - m.amount;
      }
    }, 0);
    
    // Get pending orders
    const allOrders = await kv.getByPrefix("order:");
    const pendingOrders = allOrders.filter((order: any) => {
      const hasProviderItems = order.items?.some(
        (item: any) => item.providerId === user.id
      );
      return hasProviderItems && order.status === "pending";
    }).length;

    return c.json({
      statistics: {
        totalProducts: products.length,
        activeProducts,
        pendingApproval,
        totalSales,
        totalRevenue,
        accountBalance,
        pendingOrders,
      }
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return c.json({ error: "Error fetching statistics" }, 500);
  }
});

export default providerApp;
