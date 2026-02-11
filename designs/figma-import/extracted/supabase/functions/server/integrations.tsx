import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { getApiKey } from "./api-keys.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Helper para obtener usuario autenticado
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ============== MERCADO LIBRE INTEGRATION ==============

// Sincronizar productos a Mercado Libre
app.post("/make-server-0dd48dc4/integrations/mercadolibre/sync-products", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { productIds } = await c.req.json();
    
    // Get API key from KV store or env var (KV has priority)
    const mlAccessToken = await getApiKey("mercadolibre_access_token") || Deno.env.get("MERCADOLIBRE_ACCESS_TOKEN");

    if (!mlAccessToken) {
      return c.json({ error: "Mercado Libre access token not configured" }, 400);
    }

    // Obtener artículos locales (antes productos)
    const products = productIds 
      ? await kv.mget(productIds.map((id: string) => `article:${id}`))
      : await kv.getByPrefix("article:");

    const syncResults = [];

    for (const product of products) {
      try {
        // Verificar si ya existe en ML
        const mlProductId = await kv.get(`ml_product:${product.id}`);
        
        const mlProduct = {
          title: product.name || product.title,
          category_id: product.mlCategoryId || "MLA1051", // Categoría de ML
          price: (product.price || 0) / 100, // Convertir centavos a pesos
          currency_id: "ARS",
          available_quantity: product.stock || 0,
          buying_mode: "buy_it_now",
          condition: product.condition || "new",
          listing_type_id: "gold_special",
          description: product.description || "",
          pictures: product.images && product.images.length > 0
            ? product.images.map((img: string) => ({ source: img }))
            : product.image 
              ? [{ source: product.image }]
              : [],
        };

        let response;
        if (mlProductId) {
          // Actualizar producto existente
          response = await fetch(`https://api.mercadolibre.com/items/${mlProductId}`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${mlAccessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(mlProduct),
          });
        } else {
          // Crear nuevo producto
          response = await fetch("https://api.mercadolibre.com/items", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${mlAccessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(mlProduct),
          });
        }

        const mlResponse = await response.json();

        if (response.ok && mlResponse.id) {
          // Guardar mapeo entre ID local y ML
          await kv.set(`ml_product:${product.id}`, mlResponse.id);
          await kv.set(`ml_product_reverse:${mlResponse.id}`, product.id);
          
          syncResults.push({
            productId: product.id,
            mlProductId: mlResponse.id,
            status: "success",
            permalink: mlResponse.permalink,
          });
        } else {
          syncResults.push({
            productId: product.id,
            status: "error",
            error: mlResponse.message || "Unknown error",
          });
        }
      } catch (error) {
        console.log(`Error syncing product ${product.id} to ML:`, error);
        syncResults.push({
          productId: product.id,
          status: "error",
          error: error.message,
        });
      }
    }

    // Guardar log de sincronización
    await kv.set(`ml_sync:${Date.now()}`, {
      timestamp: new Date().toISOString(),
      results: syncResults,
    });

    return c.json({ 
      success: true, 
      results: syncResults,
      synced: syncResults.filter(r => r.status === "success").length,
      failed: syncResults.filter(r => r.status === "error").length,
    });
  } catch (error) {
    console.log("Error syncing products to Mercado Libre:", error);
    return c.json({ error: "Error syncing products to Mercado Libre" }, 500);
  }
});

// Obtener órdenes de Mercado Libre
app.get("/make-server-0dd48dc4/integrations/mercadolibre/orders", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get API keys from KV store or env var (KV has priority)
    const mlAccessToken = await getApiKey("mercadolibre_access_token") || Deno.env.get("MERCADOLIBRE_ACCESS_TOKEN");
    const mlUserId = await getApiKey("mercadolibre_user_id") || Deno.env.get("MERCADOLIBRE_USER_ID");

    if (!mlAccessToken || !mlUserId) {
      return c.json({ error: "Mercado Libre not configured" }, 400);
    }

    // Obtener órdenes del vendedor
    const response = await fetch(
      `https://api.mercadolibre.com/orders/search?seller=${mlUserId}&sort=date_desc`,
      {
        headers: {
          "Authorization": `Bearer ${mlAccessToken}`,
        },
      }
    );

    const mlOrders = await response.json();

    if (!response.ok) {
      return c.json({ error: mlOrders.message }, response.status);
    }

    // Sincronizar órdenes localmente
    for (const mlOrder of mlOrders.results || []) {
      const existingOrder = await kv.get(`ml_order:${mlOrder.id}`);
      
      if (!existingOrder) {
        // Crear orden local
        const localOrder = {
          id: crypto.randomUUID(),
          mlOrderId: mlOrder.id,
          customer: {
            name: mlOrder.buyer.nickname,
            email: mlOrder.buyer.email || "",
            phone: mlOrder.buyer.phone?.number || "",
          },
          items: mlOrder.order_items.map((item: any) => ({
            id: item.item.id,
            name: item.item.title,
            quantity: item.quantity,
            price: item.unit_price * 100, // Convertir a centavos
          })),
          total: mlOrder.total_amount * 100,
          status: mlOrder.status === "paid" ? "completed" : "pending",
          paymentMethod: "mercadolibre",
          shippingAddress: mlOrder.shipping?.receiver_address,
          createdAt: mlOrder.date_created,
          updatedAt: new Date().toISOString(),
        };

        await kv.set(`order:${localOrder.id}`, localOrder);
        await kv.set(`ml_order:${mlOrder.id}`, localOrder.id);
      }
    }

    return c.json({ orders: mlOrders.results || [] });
  } catch (error) {
    console.log("Error fetching Mercado Libre orders:", error);
    return c.json({ error: "Error fetching Mercado Libre orders" }, 500);
  }
});

// Actualizar stock desde Mercado Libre
app.post("/make-server-0dd48dc4/integrations/mercadolibre/sync-stock", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get API keys from KV store or env var (KV has priority)
    const mlAccessToken = await getApiKey("mercadolibre_access_token") || Deno.env.get("MERCADOLIBRE_ACCESS_TOKEN");
    const mlUserId = await getApiKey("mercadolibre_user_id") || Deno.env.get("MERCADOLIBRE_USER_ID");

    if (!mlAccessToken || !mlUserId) {
      return c.json({ error: "Mercado Libre not configured" }, 400);
    }

    // Obtener todos los productos de ML
    const response = await fetch(
      `https://api.mercadolibre.com/users/${mlUserId}/items/search?status=active`,
      {
        headers: {
          "Authorization": `Bearer ${mlAccessToken}`,
        },
      }
    );

    const mlItems = await response.json();
    const syncResults = [];

    for (const mlItemId of mlItems.results || []) {
      // Obtener detalles del producto
      const itemResponse = await fetch(`https://api.mercadolibre.com/items/${mlItemId}`, {
        headers: {
          "Authorization": `Bearer ${mlAccessToken}`,
        },
      });

      const mlItem = await itemResponse.json();
      
      // Buscar artículo local
      const localProductId = await kv.get(`ml_product_reverse:${mlItemId}`);
      
      if (localProductId) {
        const localProduct = await kv.get(`article:${localProductId}`);
        
        if (localProduct) {
          // Actualizar stock local
          const updated = {
            ...localProduct,
            stock: mlItem.available_quantity,
            updatedAt: new Date().toISOString(),
          };
          
          await kv.set(`article:${localProductId}`, updated);
          
          syncResults.push({
            productId: localProductId,
            mlProductId: mlItemId,
            stock: mlItem.available_quantity,
            status: "success",
          });
        }
      }
    }

    return c.json({ 
      success: true, 
      results: syncResults,
      synced: syncResults.length,
    });
  } catch (error) {
    console.log("Error syncing stock from Mercado Libre:", error);
    return c.json({ error: "Error syncing stock from Mercado Libre" }, 500);
  }
});

// ============== MERCADO PAGO INTEGRATION ==============

app.post("/make-server-0dd48dc4/integrations/mercadopago/create-preference", async (c) => {
  try {
    const { items, payer } = await c.req.json();
    const mpAccessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

    if (!mpAccessToken) {
      return c.json({ error: "Mercado Pago not configured" }, 400);
    }

    const preference = {
      items: items.map((item: any) => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price / 100, // Convertir centavos a pesos
        currency_id: "ARS",
      })),
      payer: {
        email: payer?.email || "test@test.com",
        name: payer?.name || "",
      },
      back_urls: {
        success: `${c.req.header("origin")}/payment/success`,
        failure: `${c.req.header("origin")}/payment/failure`,
        pending: `${c.req.header("origin")}/payment/pending`,
      },
      auto_return: "approved",
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-0dd48dc4/integrations/mercadopago/webhook`,
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Mercado Pago error:", result);
      return c.json({ error: result.message || "Error creating preference" }, response.status);
    }

    return c.json({ 
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (error) {
    console.log("Error creating Mercado Pago preference:", error);
    return c.json({ error: "Error creating payment preference" }, 500);
  }
});

// ============== WEBHOOK MERCADO PAGO - MEJORADO ==============
app.post("/make-server-0dd48dc4/integrations/mercadopago/webhook", async (c) => {
  try {
    const notification = await c.req.json();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] MP Webhook received:`, JSON.stringify(notification));

    // Registrar webhook recibido
    const webhookLogId = `webhook:mp:${Date.now()}`;
    await kv.set(webhookLogId, {
      type: "mercadopago",
      notification,
      timestamp,
      processed: false,
    });

    // Ignorar notificaciones que no sean de pago
    if (notification.type !== "payment") {
      console.log(`[${timestamp}] Ignoring non-payment notification: ${notification.type}`);
      await kv.set(webhookLogId, { 
        ...(await kv.get(webhookLogId)), 
        processed: true, 
        status: "ignored",
        reason: "not_a_payment" 
      });
      return c.json({ status: "ignored", reason: "not_a_payment" });
    }

    // Obtener access token (prioridad: KV store > env var)
    const mpAccessToken = await getApiKey("mercadopago_access_token") || 
                          Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    
    if (!mpAccessToken) {
      console.error(`[${timestamp}] MP Access Token not configured`);
      return c.json({ error: "Mercado Pago not configured" }, 500);
    }

    // Obtener información completa del pago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${notification.data.id}`,
      {
        headers: {
          "Authorization": `Bearer ${mpAccessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      console.error(`[${timestamp}] Error fetching payment from MP:`, await paymentResponse.text());
      return c.json({ error: "Error fetching payment details" }, 500);
    }

    const payment = await paymentResponse.json();
    console.log(`[${timestamp}] Payment details:`, JSON.stringify(payment));

    // Mapear estados de MP a estados internos
    const statusMap: Record<string, string> = {
      approved: "completed",
      pending: "pending",
      in_process: "processing",
      in_mediation: "processing",
      rejected: "failed",
      cancelled: "cancelled",
      refunded: "refunded",
      charged_back: "refunded",
    };

    const newStatus = statusMap[payment.status] || "pending";

    // Buscar orden por external_reference
    if (!payment.external_reference) {
      console.warn(`[${timestamp}] Payment ${payment.id} has no external_reference`);
      await kv.set(webhookLogId, { 
        ...(await kv.get(webhookLogId)), 
        processed: true, 
        status: "no_reference",
        payment 
      });
      return c.json({ status: "no_reference" });
    }

    const orderId = payment.external_reference;
    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      console.warn(`[${timestamp}] Order ${orderId} not found`);
      await kv.set(webhookLogId, { 
        ...(await kv.get(webhookLogId)), 
        processed: true, 
        status: "order_not_found",
        orderId,
        payment 
      });
      return c.json({ status: "order_not_found", orderId }, 404);
    }

    // Actualizar orden
    const updatedOrder = {
      ...order,
      status: newStatus,
      paymentStatus: payment.status,
      paymentId: payment.id,
      paymentMethod: payment.payment_method_id || "mercadopago",
      paymentDetails: {
        transactionAmount: payment.transaction_amount,
        netAmount: payment.transaction_details?.net_received_amount,
        mpFee: payment.fee_details?.reduce((sum: number, fee: any) => sum + fee.amount, 0) || 0,
        installments: payment.installments,
        cardLastFourDigits: payment.card?.last_four_digits,
      },
      updatedAt: timestamp,
      lastWebhookAt: timestamp,
    };

    await kv.set(`order:${orderId}`, updatedOrder);
    console.log(`[${timestamp}] Order ${orderId} updated to status: ${newStatus}`);

    // Actualizar stock si el pago fue aprobado
    if (payment.status === "approved" && order.items) {
      for (const item of order.items) {
        const product = await kv.get(`article:${item.id}`);
        if (product && product.stock !== undefined) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await kv.set(`article:${item.id}`, {
            ...product,
            stock: newStock,
            updatedAt: timestamp,
          });
          console.log(`[${timestamp}] Stock updated for article ${item.id}: ${product.stock} -> ${newStock}`);
        }
      }
    }

    // Registrar evento de automatización
    if (payment.status === "approved") {
      await kv.set(`automation_event:purchase:${Date.now()}`, {
        event: "purchase",
        orderId,
        customerId: order.customerId || order.customer?.email,
        timestamp,
        data: {
          total: payment.transaction_amount,
          items: order.items,
        },
      });
      console.log(`[${timestamp}] Automation event 'purchase' triggered for order ${orderId}`);
    }

    // Marcar webhook como procesado
    await kv.set(webhookLogId, { 
      ...(await kv.get(webhookLogId)), 
      processed: true, 
      status: "success",
      orderId,
      newStatus,
      payment
    });

    console.log(`[${timestamp}] Webhook processed successfully for order ${orderId}`);

    return c.json({ 
      success: true, 
      orderId, 
      status: newStatus,
      paymentId: payment.id 
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Error processing Mercado Pago webhook:`, error);
    
    // Intentar registrar el error
    try {
      await kv.set(`webhook_error:mp:${Date.now()}`, {
        error: error.message,
        stack: error.stack,
        timestamp,
      });
    } catch (logError) {
      console.error("Failed to log webhook error:", logError);
    }

    return c.json({ error: "Error processing webhook", details: error.message }, 500);
  }
});

// ============== PAYPAL INTEGRATION ==============

app.post("/make-server-0dd48dc4/integrations/paypal/create-order", async (c) => {
  try {
    const { items, total } = await c.req.json();
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalSecret = Deno.env.get("PAYPAL_SECRET");

    if (!paypalClientId || !paypalSecret) {
      return c.json({ error: "PayPal not configured" }, 400);
    }

    // Obtener access token
    const auth = btoa(`${paypalClientId}:${paypalSecret}`);
    const tokenResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    const { access_token } = await tokenResponse.json();

    // Crear orden
    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (total / 100 / 1000).toFixed(2), // Convertir centavos ARS a USD aproximado
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: (total / 100 / 1000).toFixed(2),
              },
            },
          },
          items: items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity.toString(),
            unit_amount: {
              currency_code: "USD",
              value: ((item.price / 100) / 1000).toFixed(2),
            },
          })),
        },
      ],
      application_context: {
        return_url: `${c.req.header("origin")}/payment/success`,
        cancel_url: `${c.req.header("origin")}/payment/cancelled`,
      },
    };

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.log("PayPal error:", result);
      return c.json({ error: result.message || "Error creating order" }, response.status);
    }

    return c.json({ 
      orderId: result.id,
      approveUrl: result.links.find((link: any) => link.rel === "approve")?.href,
    });
  } catch (error) {
    console.log("Error creating PayPal order:", error);
    return c.json({ error: "Error creating PayPal order" }, 500);
  }
});

app.post("/make-server-0dd48dc4/integrations/paypal/capture-order", async (c) => {
  try {
    const { orderId } = await c.req.json();
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalSecret = Deno.env.get("PAYPAL_SECRET");

    if (!paypalClientId || !paypalSecret) {
      return c.json({ error: "PayPal not configured" }, 400);
    }

    // Obtener access token
    const auth = btoa(`${paypalClientId}:${paypalSecret}`);
    const tokenResponse = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    const { access_token } = await tokenResponse.json();

    // Capturar pago
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    return c.json({ success: response.ok, result });
  } catch (error) {
    console.log("Error capturing PayPal order:", error);
    return c.json({ error: "Error capturing PayPal order" }, 500);
  }
});

// ============== STRIPE INTEGRATION ==============

app.post("/make-server-0dd48dc4/integrations/stripe/create-payment-intent", async (c) => {
  try {
    const { amount, currency = "usd" } = await c.req.json();
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey) {
      return c.json({ error: "Stripe not configured" }, 400);
    }

    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        automatic_payment_methods: JSON.stringify({ enabled: true }),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Stripe error:", result);
      return c.json({ error: result.error?.message || "Error creating payment intent" }, response.status);
    }

    return c.json({ 
      clientSecret: result.client_secret,
      paymentIntentId: result.id,
    });
  } catch (error) {
    console.log("Error creating Stripe payment intent:", error);
    return c.json({ error: "Error creating payment intent" }, 500);
  }
});

app.post("/make-server-0dd48dc4/integrations/stripe/webhook", async (c) => {
  try {
    const event = await c.req.json();
    console.log("Stripe webhook event:", event);

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        
        // Actualizar orden si existe metadata
        if (paymentIntent.metadata?.orderId) {
          const order = await kv.get(`order:${paymentIntent.metadata.orderId}`);
          
          if (order) {
            const updated = {
              ...order,
              status: "completed",
              paymentId: paymentIntent.id,
              updatedAt: new Date().toISOString(),
            };
            
            await kv.set(`order:${paymentIntent.metadata.orderId}`, updated);
          }
        }
        break;

      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        break;
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Error processing Stripe webhook:", error);
    return c.json({ error: "Error processing webhook" }, 500);
  }
});

// ============== PLEXO INTEGRATION (URUGUAY) ==============

app.post("/make-server-0dd48dc4/integrations/plexo/create-payment", async (c) => {
  try {
    const { amount, currency = "UYU", orderId, customer, items } = await c.req.json();
    const plexoClientId = Deno.env.get("PLEXO_CLIENT_ID");
    const plexoSecretKey = Deno.env.get("PLEXO_SECRET_KEY");
    const plexoEnvironment = Deno.env.get("PLEXO_ENVIRONMENT") || "sandbox";

    if (!plexoClientId || !plexoSecretKey) {
      return c.json({ error: "Plexo not configured" }, 400);
    }

    const baseUrl = plexoEnvironment === "production" 
      ? "https://api.plexo.com.uy/v1"
      : "https://api-stg.plexo.com.uy/v1";

    // Crear autorización básica
    const auth = btoa(`${plexoClientId}:${plexoSecretKey}`);

    // Crear payload de pago
    const paymentData = {
      amount: {
        value: amount, // Monto en centavos
        currency: currency,
      },
      reference: orderId || crypto.randomUUID(),
      description: `Orden ${orderId || "sin referencia"}`,
      customer: {
        email: customer?.email || "customer@example.com",
        name: customer?.name || "Cliente",
        phone: customer?.phone || "",
      },
      items: items?.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        amount: item.price,
      })) || [],
      callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-0dd48dc4/integrations/plexo/webhook`,
      returnUrl: `${c.req.header("origin")}/payment/success`,
      cancelUrl: `${c.req.header("origin")}/payment/cancelled`,
    };

    const response = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Plexo error creating payment:", result);
      return c.json({ 
        error: result.message || result.error || "Error creating payment" 
      }, response.status);
    }

    // Guardar referencia del pago
    if (orderId) {
      await kv.set(`plexo_payment:${result.id}`, {
        paymentId: result.id,
        orderId: orderId,
        amount: amount,
        status: result.status || "pending",
        createdAt: new Date().toISOString(),
      });
    }

    return c.json({ 
      paymentId: result.id,
      status: result.status,
      paymentUrl: result.paymentUrl || result.redirectUrl,
      reference: result.reference,
    });
  } catch (error) {
    console.log("Error creating Plexo payment:", error);
    return c.json({ error: "Error creating Plexo payment" }, 500);
  }
});

// Consultar estado de pago en Plexo
app.get("/make-server-0dd48dc4/integrations/plexo/payment-status/:paymentId", async (c) => {
  try {
    const paymentId = c.req.param("paymentId");
    const plexoClientId = Deno.env.get("PLEXO_CLIENT_ID");
    const plexoSecretKey = Deno.env.get("PLEXO_SECRET_KEY");
    const plexoEnvironment = Deno.env.get("PLEXO_ENVIRONMENT") || "sandbox";

    if (!plexoClientId || !plexoSecretKey) {
      return c.json({ error: "Plexo not configured" }, 400);
    }

    const baseUrl = plexoEnvironment === "production" 
      ? "https://api.plexo.com.uy/v1"
      : "https://api-stg.plexo.com.uy/v1";

    const auth = btoa(`${plexoClientId}:${plexoSecretKey}`);

    const response = await fetch(`${baseUrl}/payments/${paymentId}`, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Plexo error fetching payment status:", result);
      return c.json({ 
        error: result.message || result.error || "Error fetching payment" 
      }, response.status);
    }

    // Actualizar estado en KV si cambió
    const savedPayment = await kv.get(`plexo_payment:${paymentId}`);
    if (savedPayment && savedPayment.status !== result.status) {
      await kv.set(`plexo_payment:${paymentId}`, {
        ...savedPayment,
        status: result.status,
        updatedAt: new Date().toISOString(),
      });

      // Si el pago fue aprobado, actualizar la orden
      if (result.status === "approved" && savedPayment.orderId) {
        const order = await kv.get(`order:${savedPayment.orderId}`);
        if (order) {
          await kv.set(`order:${savedPayment.orderId}`, {
            ...order,
            status: "completed",
            paymentId: paymentId,
            paymentMethod: "plexo",
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    return c.json({
      paymentId: result.id,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      reference: result.reference,
      createdAt: result.createdAt,
    });
  } catch (error) {
    console.log("Error fetching Plexo payment status:", error);
    return c.json({ error: "Error fetching payment status" }, 500);
  }
});

// Webhook de Plexo para notificaciones de pago
app.post("/make-server-0dd48dc4/integrations/plexo/webhook", async (c) => {
  try {
    const notification = await c.req.json();
    console.log("Plexo webhook notification:", notification);

    const { paymentId, status, reference } = notification;

    if (!paymentId) {
      return c.json({ error: "Missing paymentId" }, 400);
    }

    // Buscar pago guardado
    const savedPayment = await kv.get(`plexo_payment:${paymentId}`);
    
    if (savedPayment) {
      // Actualizar estado
      await kv.set(`plexo_payment:${paymentId}`, {
        ...savedPayment,
        status: status,
        updatedAt: new Date().toISOString(),
      });

      // Si el pago fue aprobado, actualizar la orden
      if (status === "approved" && savedPayment.orderId) {
        const order = await kv.get(`order:${savedPayment.orderId}`);
        
        if (order) {
          const updated = {
            ...order,
            status: "completed",
            paymentId: paymentId,
            paymentMethod: "plexo",
            paymentStatus: status,
            updatedAt: new Date().toISOString(),
          };
          
          await kv.set(`order:${savedPayment.orderId}`, updated);
          console.log(`Order ${savedPayment.orderId} updated to completed via Plexo webhook`);
        }
      } else if (status === "rejected" && savedPayment.orderId) {
        const order = await kv.get(`order:${savedPayment.orderId}`);
        
        if (order) {
          await kv.set(`order:${savedPayment.orderId}`, {
            ...order,
            status: "cancelled",
            paymentStatus: status,
            updatedAt: new Date().toISOString(),
          });
          console.log(`Order ${savedPayment.orderId} marked as cancelled via Plexo webhook`);
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Error processing Plexo webhook:", error);
    return c.json({ error: "Error processing webhook" }, 500);
  }
});

// ============== CONFIGURATION ==============

app.get("/make-server-0dd48dc4/integrations/status", async (c) => {
  try {
    // Check KV store first, then fallback to env vars
    const mlToken = await getApiKey("mercadolibre_access_token") || Deno.env.get("MERCADOLIBRE_ACCESS_TOKEN");
    const mlUserId = await getApiKey("mercadolibre_user_id") || Deno.env.get("MERCADOLIBRE_USER_ID");
    const mpToken = await getApiKey("mercadopago_access_token") || Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const paypalClient = await getApiKey("paypal_client_id") || Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalSecret = await getApiKey("paypal_secret") || Deno.env.get("PAYPAL_SECRET");
    const stripeKey = await getApiKey("stripe_secret_key") || Deno.env.get("STRIPE_SECRET_KEY");
    const plexoClient = await getApiKey("plexo_client_id") || Deno.env.get("PLEXO_CLIENT_ID");
    const plexoSecret = await getApiKey("plexo_secret_key") || Deno.env.get("PLEXO_SECRET_KEY");
    const plexoEnv = await getApiKey("plexo_environment") || Deno.env.get("PLEXO_ENVIRONMENT");
    const metaToken = await getApiKey("meta_access_token") || Deno.env.get("META_ACCESS_TOKEN");
    const whatsappToken = await getApiKey("whatsapp_access_token") || Deno.env.get("WHATSAPP_ACCESS_TOKEN");

    const status = {
      mercadolibre: {
        configured: !!mlToken,
        userId: mlUserId || null,
      },
      mercadopago: {
        configured: !!mpToken,
      },
      paypal: {
        configured: !!(paypalClient && paypalSecret),
      },
      stripe: {
        configured: !!stripeKey,
      },
      plexo: {
        configured: !!(plexoClient && plexoSecret),
        environment: plexoEnv || "sandbox",
      },
      meta: {
        configured: !!metaToken,
      },
      whatsapp: {
        configured: !!whatsappToken,
      },
    };

    return c.json(status);
  } catch (error) {
    console.log("Error fetching integrations status:", error);
    return c.json({ error: "Error fetching status" }, 500);
  }
});

// Mercado Libre Config
app.get("/make-server-0dd48dc4/integrations/mercadolibre/config", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const configured = !!Deno.env.get("MERCADOLIBRE_ACCESS_TOKEN");
    const userId = Deno.env.get("MERCADOLIBRE_USER_ID");
    const accessToken = configured ? "configured" : null;

    return c.json({
      configured,
      userId,
      accessToken,
    });
  } catch (error) {
    console.log("Error fetching ML config:", error);
    return c.json({ error: "Error fetching config" }, 500);
  }
});

// Mercado Libre Stats
app.get("/make-server-0dd48dc4/integrations/mercadolibre/stats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Obtener todos los productos
    const products = await kv.getByPrefix("article:");
    const totalProducts = products.length;

    // Contar productos sincronizados con ML
    let syncedProducts = 0;
    for (const product of products) {
      const mlProductId = await kv.get(`ml_product:${product.id}`);
      if (mlProductId) {
        syncedProducts++;
      }
    }

    // Obtener órdenes de ML
    const mlOrders = await kv.getByPrefix("ml_order:");
    const totalOrders = mlOrders.length;
    const pendingOrders = mlOrders.filter(
      (order: any) => order.status === "pending"
    ).length;

    return c.json({
      totalProducts,
      syncedProducts,
      totalOrders,
      pendingOrders,
    });
  } catch (error) {
    console.log("Error fetching ML stats:", error);
    return c.json({ error: "Error fetching stats" }, 500);
  }
});

// Mercado Pago Config
app.get("/make-server-0dd48dc4/integrations/mercadopago/config", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check both KV store and environment variables
    const mpToken = await getApiKey("mercadopago_access_token") || Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const publicKey = await getApiKey("mercadopago_public_key") || Deno.env.get("MERCADOPAGO_PUBLIC_KEY") || null;
    
    const configured = !!mpToken;
    const testMode = (mpToken?.includes("TEST") || publicKey?.includes("TEST")) || false;

    return c.json({
      configured,
      publicKey: publicKey ? "********" : null, // Mask for security
      testMode,
    });
  } catch (error) {
    console.log("Error fetching MP config:", error);
    return c.json({ error: "Error fetching config" }, 500);
  }
});

// Mercado Pago Stats
app.get("/make-server-0dd48dc4/integrations/mercadopago/stats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Obtener órdenes con pago de Mercado Pago
    const orders = await kv.getByPrefix("order:");
    const mpOrders = orders.filter(
      (order: any) => order.paymentMethod === "mercadopago"
    );

    const totalPayments = mpOrders.length;
    const successfulPayments = mpOrders.filter(
      (order: any) => order.status === "completed"
    ).length;
    const pendingPayments = mpOrders.filter(
      (order: any) => order.status === "pending"
    ).length;

    const totalAmount = mpOrders
      .filter((order: any) => order.status === "completed")
      .reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    return c.json({
      totalPayments,
      successfulPayments,
      pendingPayments,
      totalAmount,
    });
  } catch (error) {
    console.log("Error fetching MP stats:", error);
    return c.json({ error: "Error fetching stats" }, 500);
  }
});

// ============== TWILIO & WHATSAPP INTEGRATION ==============

// Configurar credenciales de Twilio
app.post("/make-server-0dd48dc4/integrations/twilio/configure", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { accountSid, authToken, phoneNumber, whatsappNumber } = await c.req.json();

    if (!accountSid || !authToken) {
      return c.json({ error: "Account SID and Auth Token are required" }, 400);
    }

    // Guardar credenciales en KV store (encriptadas en producción)
    await kv.set("twilio_config", {
      accountSid,
      authToken, // En producción: encrypt(authToken)
      phoneNumber,
      whatsappNumber,
      configuredAt: new Date().toISOString(),
      configuredBy: user.id,
    });

    return c.json({ 
      success: true, 
      message: "Twilio configured successfully" 
    });
  } catch (error) {
    console.error("Error configuring Twilio:", error);
    return c.json({ error: "Error configuring Twilio" }, 500);
  }
});

// Obtener configuración de Twilio (sin exponer credenciales)
app.get("/make-server-0dd48dc4/integrations/twilio/config", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const config = await kv.get("twilio_config");

    if (!config) {
      return c.json({ 
        configured: false,
        phoneNumber: null,
        whatsappNumber: null 
      });
    }

    return c.json({
      configured: true,
      accountSid: config.accountSid ? `${config.accountSid.slice(0, 8)}...` : null,
      phoneNumber: config.phoneNumber,
      whatsappNumber: config.whatsappNumber,
      configuredAt: config.configuredAt,
    });
  } catch (error) {
    console.error("Error fetching Twilio config:", error);
    return c.json({ error: "Error fetching config" }, 500);
  }
});

// Enviar SMS via Twilio
app.post("/make-server-0dd48dc4/integrations/twilio/send-sms", async (c) => {
  try {
    const { to, message, scheduledFor } = await c.req.json();

    if (!to || !message) {
      return c.json({ error: "Phone number and message are required" }, 400);
    }

    // Obtener configuración de Twilio
    const config = await kv.get("twilio_config");
    if (!config || !config.accountSid || !config.authToken) {
      return c.json({ error: "Twilio not configured" }, 400);
    }

    // Si es programado, guardar en cola
    if (scheduledFor) {
      await kv.set(`sms_scheduled:${Date.now()}`, {
        to,
        message,
        scheduledFor,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      return c.json({ 
        success: true, 
        scheduled: true,
        scheduledFor 
      });
    }

    // Enviar inmediatamente via Twilio API
    const auth = btoa(`${config.accountSid}:${config.authToken}`);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: config.phoneNumber,
          Body: message,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Twilio SMS error:", result);
      return c.json({ 
        error: result.message || "Error sending SMS",
        code: result.code 
      }, response.status);
    }

    // Guardar en historial
    await kv.set(`sms_sent:${Date.now()}`, {
      to,
      message,
      twilioSid: result.sid,
      status: result.status,
      sentAt: new Date().toISOString(),
    });

    return c.json({
      success: true,
      messageSid: result.sid,
      status: result.status,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return c.json({ error: "Error sending SMS" }, 500);
  }
});

// Enviar mensaje de WhatsApp via Twilio
app.post("/make-server-0dd48dc4/integrations/whatsapp/send", async (c) => {
  try {
    const { to, message, mediaUrl, templateName, templateParams } = await c.req.json();

    if (!to || (!message && !templateName)) {
      return c.json({ error: "Phone number and message/template are required" }, 400);
    }

    // Obtener configuración de Twilio
    const config = await kv.get("twilio_config");
    if (!config || !config.accountSid || !config.authToken || !config.whatsappNumber) {
      return c.json({ error: "WhatsApp not configured" }, 400);
    }

    // Formatear número (debe incluir código de país con +)
    const formattedTo = to.startsWith("+") ? to : `+${to}`;
    const whatsappTo = formattedTo.startsWith("whatsapp:") 
      ? formattedTo 
      : `whatsapp:${formattedTo}`;
    
    const whatsappFrom = config.whatsappNumber.startsWith("whatsapp:")
      ? config.whatsappNumber
      : `whatsapp:${config.whatsappNumber}`;

    const auth = btoa(`${config.accountSid}:${config.authToken}`);
    
    // Preparar body del mensaje
    const bodyParams: any = {
      To: whatsappTo,
      From: whatsappFrom,
    };

    // Si es template (pre-aprobado por WhatsApp)
    if (templateName) {
      bodyParams.ContentSid = templateName;
      if (templateParams) {
        bodyParams.ContentVariables = JSON.stringify(templateParams);
      }
    } else {
      bodyParams.Body = message;
    }

    // Agregar media si existe
    if (mediaUrl) {
      bodyParams.MediaUrl = mediaUrl;
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(bodyParams),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("WhatsApp send error:", result);
      return c.json({ 
        error: result.message || "Error sending WhatsApp message",
        code: result.code 
      }, response.status);
    }

    // Guardar en historial
    await kv.set(`whatsapp_sent:${Date.now()}`, {
      to: formattedTo,
      message: message || `Template: ${templateName}`,
      twilioSid: result.sid,
      status: result.status,
      mediaUrl,
      sentAt: new Date().toISOString(),
    });

    return c.json({
      success: true,
      messageSid: result.sid,
      status: result.status,
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return c.json({ error: "Error sending WhatsApp message" }, 500);
  }
});

// Procesar cola de SMS/WhatsApp (llamar desde cron o manualmente)
app.post("/make-server-0dd48dc4/integrations/messaging/process-queue", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const now = new Date();
    
    // Procesar cola de emails
    const emailQueue = await kv.getByPrefix("email_queue:");
    let emailsSent = 0;

    for (const emailItem of emailQueue) {
      try {
        // Aquí se integraría con Resend o SendGrid
        console.log("Sending email:", emailItem.to, emailItem.subject);
        
        // Mover a historial
        await kv.set(`email_sent:${Date.now()}`, {
          ...emailItem,
          sentAt: new Date().toISOString(),
          status: "sent",
        });
        
        // Eliminar de cola (en producción usar TTL o marcar como procesado)
        emailsSent++;
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }

    // Procesar cola de WhatsApp
    const whatsappQueue = await kv.getByPrefix("whatsapp_queue:");
    let whatsappSent = 0;

    for (const whatsappItem of whatsappQueue) {
      try {
        // Enviar via endpoint de WhatsApp
        const response = await fetch(
          `https://${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-0dd48dc4/integrations/whatsapp/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": c.req.header("Authorization") || "",
            },
            body: JSON.stringify({
              to: whatsappItem.to,
              message: whatsappItem.message,
            }),
          }
        );

        if (response.ok) {
          // Eliminar de cola
          whatsappSent++;
        }
      } catch (error) {
        console.error("Error sending WhatsApp from queue:", error);
      }
    }

    // Procesar SMS programados
    const scheduledSms = await kv.getByPrefix("sms_scheduled:");
    let smsSent = 0;

    for (const smsItem of scheduledSms) {
      if (smsItem.status === "pending" && new Date(smsItem.scheduledFor) <= now) {
        try {
          const response = await fetch(
            `https://${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-0dd48dc4/integrations/twilio/send-sms`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": c.req.header("Authorization") || "",
              },
              body: JSON.stringify({
                to: smsItem.to,
                message: smsItem.message,
              }),
            }
          );

          if (response.ok) {
            smsSent++;
          }
        } catch (error) {
          console.error("Error sending scheduled SMS:", error);
        }
      }
    }

    return c.json({
      success: true,
      processed: {
        emails: emailsSent,
        whatsapp: whatsappSent,
        sms: smsSent,
      },
    });
  } catch (error) {
    console.error("Error processing messaging queue:", error);
    return c.json({ error: "Error processing queue" }, 500);
  }
});

// Webhook de Twilio para recibir mensajes entrantes
app.post("/make-server-0dd48dc4/integrations/twilio/webhook", async (c) => {
  try {
    const body = await c.req.text();
    const params = new URLSearchParams(body);

    const messageSid = params.get("MessageSid");
    const from = params.get("From");
    const to = params.get("To");
    const messageBody = params.get("Body");
    const numMedia = parseInt(params.get("NumMedia") || "0");

    console.log("Twilio webhook received:", { messageSid, from, to, messageBody });

    // Determinar si es SMS o WhatsApp
    const isWhatsApp = from?.startsWith("whatsapp:") || to?.startsWith("whatsapp:");

    // Guardar mensaje entrante
    await kv.set(`message_received:${messageSid}`, {
      messageSid,
      from,
      to,
      body: messageBody,
      numMedia,
      type: isWhatsApp ? "whatsapp" : "sms",
      receivedAt: new Date().toISOString(),
    });

    // Trigger automatización si es necesario
    if (isWhatsApp) {
      await kv.set(`automation_event:whatsapp_received:${Date.now()}`, {
        event: "whatsapp_received",
        from,
        message: messageBody,
        timestamp: new Date().toISOString(),
      });
    }

    // Respuesta TwiML (opcional)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Gracias por tu mensaje. Te responderemos pronto!</Message>
</Response>`,
      {
        headers: { "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    return c.json({ error: "Error processing webhook" }, 500);
  }
});

// Obtener historial de mensajes enviados
app.get("/make-server-0dd48dc4/integrations/messaging/history", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { type, limit = 50 } = c.req.query();

    let messages: any[] = [];

    if (!type || type === "sms") {
      const sms = await kv.getByPrefix("sms_sent:");
      messages.push(...sms.map((m: any) => ({ ...m, type: "sms" })));
    }

    if (!type || type === "whatsapp") {
      const whatsapp = await kv.getByPrefix("whatsapp_sent:");
      messages.push(...whatsapp.map((m: any) => ({ ...m, type: "whatsapp" })));
    }

    if (!type || type === "email") {
      const emails = await kv.getByPrefix("email_sent:");
      messages.push(...emails.map((m: any) => ({ ...m, type: "email" })));
    }

    // Ordenar por fecha descendente
    messages.sort((a, b) => 
      new Date(b.sentAt || b.createdAt).getTime() - 
      new Date(a.sentAt || a.createdAt).getTime()
    );

    return c.json({
      messages: messages.slice(0, parseInt(limit.toString())),
      total: messages.length,
    });
  } catch (error) {
    console.error("Error fetching message history:", error);
    return c.json({ error: "Error fetching history" }, 500);
  }
});

// Obtener mensajes recibidos
app.get("/make-server-0dd48dc4/integrations/messaging/inbox", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const received = await kv.getByPrefix("message_received:");

    return c.json({
      messages: received.sort((a: any, b: any) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      ),
      total: received.length,
    });
  } catch (error) {
    console.error("Error fetching inbox:", error);
    return c.json({ error: "Error fetching inbox" }, 500);
  }
});

// Estadísticas de mensajería
app.get("/make-server-0dd48dc4/integrations/messaging/stats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [sms, whatsapp, emails] = await Promise.all([
      kv.getByPrefix("sms_sent:"),
      kv.getByPrefix("whatsapp_sent:"),
      kv.getByPrefix("email_sent:"),
    ]);

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      sms: {
        total: sms.length,
        last30Days: sms.filter((m: any) => 
          new Date(m.sentAt) >= last30Days
        ).length,
      },
      whatsapp: {
        total: whatsapp.length,
        last30Days: whatsapp.filter((m: any) => 
          new Date(m.sentAt) >= last30Days
        ).length,
      },
      email: {
        total: emails.length,
        last30Days: emails.filter((m: any) => 
          new Date(m.sentAt) >= last30Days
        ).length,
      },
    };

    return c.json({ stats });
  } catch (error) {
    console.error("Error fetching messaging stats:", error);
    return c.json({ error: "Error fetching stats" }, 500);
  }
});

// Plantillas de mensajes
app.get("/make-server-0dd48dc4/integrations/messaging/templates", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const templates = await kv.getByPrefix("message_template:");

    return c.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return c.json({ error: "Error fetching templates" }, 500);
  }
});

// Crear/Actualizar plantilla
app.post("/make-server-0dd48dc4/integrations/messaging/templates", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { id, name, content, variables, type } = await c.req.json();

    const templateId = id || `template_${Date.now()}`;

    await kv.set(`message_template:${templateId}`, {
      id: templateId,
      name,
      content,
      variables,
      type, // sms, whatsapp, email
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    });

    return c.json({ 
      success: true, 
      templateId 
    });
  } catch (error) {
    console.error("Error saving template:", error);
    return c.json({ error: "Error saving template" }, 500);
  }
});

export default app;
