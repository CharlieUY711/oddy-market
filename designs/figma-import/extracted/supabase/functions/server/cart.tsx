import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

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

// Obtener carrito del usuario
app.get("/make-server-0dd48dc4/cart/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    // Buscar carrito guardado
    const cart = await kv.get(`cart:${userId}`);
    
    if (!cart) {
      return c.json({ cart: { items: [], total: 0 } });
    }

    return c.json({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return c.json({ error: "Error fetching cart" }, 500);
  }
});

// Guardar carrito del usuario
app.post("/make-server-0dd48dc4/cart/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const { items } = await c.req.json();

    const cart = {
      items,
      total: items.reduce((sum: number, item: any) => {
        const price = item.discount 
          ? item.price * (1 - item.discount / 100) 
          : item.price;
        return sum + (price * item.quantity);
      }, 0),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`cart:${userId}`, cart);

    return c.json({ success: true, cart });
  } catch (error) {
    console.error("Error saving cart:", error);
    return c.json({ error: "Error saving cart" }, 500);
  }
});

// Limpiar carrito después de compra
app.delete("/make-server-0dd48dc4/cart/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    await kv.del(`cart:${userId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return c.json({ error: "Error clearing cart" }, 500);
  }
});

// Obtener carrito por sessionId (para usuarios no logueados)
app.get("/make-server-0dd48dc4/cart/session/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    
    const cart = await kv.get(`cart:session:${sessionId}`);
    
    if (!cart) {
      return c.json({ cart: { items: [], total: 0 } });
    }

    return c.json({ cart });
  } catch (error) {
    console.error("Error fetching session cart:", error);
    return c.json({ error: "Error fetching session cart" }, 500);
  }
});

// Guardar carrito por sessionId (para usuarios no logueados)
app.post("/make-server-0dd48dc4/cart/session/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    const { items } = await c.req.json();

    const cart = {
      items,
      total: items.reduce((sum: number, item: any) => {
        const price = item.discount 
          ? item.price * (1 - item.discount / 100) 
          : item.price;
        return sum + (price * item.quantity);
      }, 0),
      updatedAt: new Date().toISOString(),
    };

    // Expirar después de 7 días
    await kv.set(`cart:session:${sessionId}`, cart);

    return c.json({ success: true, cart });
  } catch (error) {
    console.error("Error saving session cart:", error);
    return c.json({ error: "Error saving session cart" }, 500);
  }
});

// Migrar carrito de session a usuario (cuando se loguea)
app.post("/make-server-0dd48dc4/cart/migrate", async (c) => {
  try {
    const { sessionId, userId } = await c.req.json();

    if (!sessionId || !userId) {
      return c.json({ error: "sessionId and userId required" }, 400);
    }

    const sessionCart = await kv.get(`cart:session:${sessionId}`);
    const userCart = await kv.get(`cart:${userId}`);

    if (sessionCart) {
      // Combinar carritos si el usuario ya tenía uno
      if (userCart && userCart.items) {
        const combinedItems = [...userCart.items];
        
        for (const sessionItem of sessionCart.items) {
          const existingIndex = combinedItems.findIndex(
            (i: any) => i.id === sessionItem.id
          );
          
          if (existingIndex >= 0) {
            // Sumar cantidades si el producto ya existe
            combinedItems[existingIndex].quantity += sessionItem.quantity;
          } else {
            // Agregar nuevo producto
            combinedItems.push(sessionItem);
          }
        }

        await kv.set(`cart:${userId}`, {
          items: combinedItems,
          total: combinedItems.reduce((sum: number, item: any) => {
            const price = item.discount 
              ? item.price * (1 - item.discount / 100) 
              : item.price;
            return sum + (price * item.quantity);
          }, 0),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Simplemente mover el carrito de session a usuario
        await kv.set(`cart:${userId}`, {
          ...sessionCart,
          updatedAt: new Date().toISOString(),
        });
      }

      // Limpiar session cart
      await kv.del(`cart:session:${sessionId}`);

      return c.json({ success: true, migrated: true });
    }

    return c.json({ success: true, migrated: false });
  } catch (error) {
    console.error("Error migrating cart:", error);
    return c.json({ error: "Error migrating cart" }, 500);
  }
});

export default app;
