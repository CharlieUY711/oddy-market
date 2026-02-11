import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const usersApp = new Hono();

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

// ============== CLIENT DASHBOARD ROUTES ==============

// Get user orders
usersApp.get("/orders", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orders = await kv.getByPrefix(`order:user:${user.id}:`);
    
    // Sort by date descending
    orders.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return c.json({ orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return c.json({ error: "Error fetching orders" }, 500);
  }
});

// Get user addresses
usersApp.get("/addresses", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const addresses = await kv.getByPrefix(`address:user:${user.id}:`);

    return c.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return c.json({ error: "Error fetching addresses" }, 500);
  }
});

// Add new address
usersApp.post("/addresses", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const addressData = await c.req.json();
    const addressId = `address:user:${user.id}:${Date.now()}`;
    
    await kv.set(addressId, {
      id: addressId,
      ...addressData,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, addressId });
  } catch (error) {
    console.error("Error adding address:", error);
    return c.json({ error: "Error adding address" }, 500);
  }
});

// Get user wishlist
usersApp.get("/wishlist", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const wishlist = await kv.getByPrefix(`wishlist:user:${user.id}:`);

    return c.json({ wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return c.json({ error: "Error fetching wishlist" }, 500);
  }
});

// Add to wishlist
usersApp.post("/wishlist", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { productId, priceAlert, stockAlert } = await c.req.json();
    const product = await kv.get(`product:${productId}`);
    
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    const wishlistId = `wishlist:user:${user.id}:${productId}`;
    await kv.set(wishlistId, {
      id: wishlistId,
      productId,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      priceAlert,
      stockAlert,
      addedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return c.json({ error: "Error adding to wishlist" }, 500);
  }
});

// Get custom lists
usersApp.get("/lists", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const lists = await kv.getByPrefix(`list:user:${user.id}:`);

    return c.json({ lists });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return c.json({ error: "Error fetching lists" }, 500);
  }
});

// Create custom list
usersApp.post("/lists", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, description } = await c.req.json();
    const listId = `list:user:${user.id}:${Date.now()}`;
    
    await kv.set(listId, {
      id: listId,
      name,
      description,
      items: [],
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, listId });
  } catch (error) {
    console.error("Error creating list:", error);
    return c.json({ error: "Error creating list" }, 500);
  }
});

// Get notifications
usersApp.get("/notifications", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const notifications = await kv.getByPrefix(`notification:user:${user.id}:`);
    
    // Sort by date descending
    notifications.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return c.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return c.json({ error: "Error fetching notifications" }, 500);
  }
});

// Get marketing history
usersApp.get("/marketing-history", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const history = await kv.getByPrefix(`marketing:user:${user.id}:`);
    
    // Sort by date descending
    history.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return c.json({ history });
  } catch (error) {
    console.error("Error fetching marketing history:", error);
    return c.json({ error: "Error fetching marketing history" }, 500);
  }
});

// Get notification settings
usersApp.get("/notification-settings", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const settings = await kv.get(`settings:user:${user.id}:notifications`);

    return c.json({ 
      settings: settings || {
        emailOrders: true,
        emailMarketing: true,
        emailPriceAlerts: true,
        emailStockAlerts: true,
        pushEnabled: false,
      }
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return c.json({ error: "Error fetching settings" }, 500);
  }
});

// Update notification settings
usersApp.put("/notification-settings", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const settings = await c.req.json();
    await kv.set(`settings:user:${user.id}:notifications`, settings);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return c.json({ error: "Error updating settings" }, 500);
  }
});

// Download order invoice
usersApp.get("/orders/:orderId/invoice", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orderId = c.req.param("orderId");
    const order = await kv.get(`order:user:${user.id}:${orderId}`);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    // Generate simple invoice (in production, use a PDF library)
    const invoiceHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ODDY Market</h1>
            <h2>Factura</h2>
          </div>
          <div class="invoice-details">
            <p><strong>Número de Orden:</strong> ${order.orderNumber}</p>
            <p><strong>Fecha:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Cliente:</strong> ${user.email}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toLocaleString()}</td>
                  <td>$${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="3" class="total">Total</td>
                <td class="total">$${order.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    return new Response(invoiceHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="factura-${orderId}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return c.json({ error: "Error generating invoice" }, 500);
  }
});

export default usersApp;
