import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { kv } from "./storage.tsx";

const app = new Hono();

// Create Supabase client (optional for local development)
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper para obtener credenciales por canal
async function getCredentials(tenant_id: string | null, canal: string) {
  // Si no hay Supabase, buscar en KV (desarrollo local)
  if (!supabase) {
    const key = ["credentials", tenant_id || "default", canal];
    const result = await kv.get(key);
    return result.value || null;
  }

  // Producción con Supabase
  const { data, error } = await supabase
    .from('tenant_integrations')
    .select('*')
    .eq('tipo', canal)
    .eq('activo', true)
    .maybeSingle();

  if (error || !data) {
    console.warn(`No credentials found for canal: ${canal}`);
    return null;
  }

  return data.credenciales;
}

// ============================================================
// MERCADO LIBRE - SINCRONIZACIÓN
// ============================================================

// POST /integraciones/ml/sync - Sincronizar producto a ML
app.post("/make-server-0dd48dc4/integraciones/ml/sync", async (c) => {
  try {
    const { product_id } = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    if (!product_id) {
      return c.json({ error: "product_id requerido" }, 400);
    }

    // Obtener credenciales ML
    const credentials = await getCredentials(tenant_id, 'mercadolibre');
    if (!credentials || !credentials.access_token) {
      return c.json({ error: "ML access token not configured" }, 400);
    }

    // Obtener producto completo
    const { data: producto, error: prodError } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*)
      `)
      .eq('id', product_id)
      .single();

    if (prodError || !producto) {
      return c.json({ error: "Producto no encontrado" }, 404);
    }

    // Mapear a formato ML
    const mlProduct: any = {
      title: producto.nombre,
      category_id: producto.ml_categoria_id || "MLA1051",
      price: producto.precio,
      currency_id: producto.ml_moneda || "UYU",
      available_quantity: producto.stock_disponible || 0,
      buying_mode: "buy_it_now",
      condition: producto.ml_condicion || "new",
      listing_type_id: producto.ml_tipo_listado || "gold_special",
      description: {
        plain_text: producto.descripcion || ""
      },
      pictures: producto.imagenes?.map((img: string) => ({ source: img })) || [],
      shipping: {
        mode: producto.ml_modo_envio || "me2",
        local_pick_up: producto.ml_retiro_persona || false,
        free_shipping: producto.envio_gratis || false
      },
      warranty: producto.garantia || null
    };

    // Agregar atributos si existen
    const attributes: any[] = [];
    if (producto.marca) {
      attributes.push({ id: "BRAND", value_name: producto.marca });
    }
    if (producto.ml_modelo) {
      attributes.push({ id: "MODEL", value_name: producto.ml_modelo });
    }
    if (producto.color) {
      attributes.push({ id: "COLOR", value_name: producto.color });
    }
    if (producto.material) {
      attributes.push({ id: "MATERIAL", value_name: producto.material });
    }

    if (attributes.length > 0) {
      mlProduct.attributes = attributes;
    }

    // Si tiene variantes, agregarlas
    if (producto.variants && producto.variants.length > 0) {
      mlProduct.variations = producto.variants.map((v: any) => ({
        attribute_combinations: Object.entries(v.atributos || {}).map(([key, value]) => ({
          id: key.toUpperCase(),
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value_name: value
        })),
        price: v.precio,
        available_quantity: v.stock_disponible || 0,
        picture_ids: v.imagen_principal ? [v.imagen_principal] : [],
        seller_custom_field: v.sku
      }));
    }

    // Crear o actualizar en ML
    let mlResponse;
    if (producto.ml_item_id) {
      // Actualizar
      const response = await fetch(`https://api.mercadolibre.com/items/${producto.ml_item_id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${credentials.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mlProduct)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return c.json({ error: "Error actualizando en ML", details: errorData }, 400);
      }

      mlResponse = await response.json();
    } else {
      // Crear
      const response = await fetch("https://api.mercadolibre.com/items", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${credentials.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mlProduct)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return c.json({ error: "Error creando en ML", details: errorData }, 400);
      }

      mlResponse = await response.json();
    }

    // Actualizar producto con datos de ML
    await supabase
      .from('products')
      .update({
        ml_item_id: mlResponse.id,
        ml_permalink: mlResponse.permalink,
        ml_sincronizado: true,
        ml_ultima_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', product_id);

    return c.json({
      success: true,
      ml_item_id: mlResponse.id,
      ml_permalink: mlResponse.permalink,
      mensaje: producto.ml_item_id ? "Producto actualizado en ML" : "Producto creado en ML"
    });
  } catch (error) {
    console.error("Error syncing to ML:", error);
    return c.json({ error: "Error syncing to ML" }, 500);
  }
});

// POST /integraciones/ml/webhook - Webhook de ML (cambios de stock, precio, etc.)
app.post("/make-server-0dd48dc4/integraciones/ml/webhook", async (c) => {
  try {
    const body = await c.req.json();

    // ML envía notificaciones de cambios
    const { resource, user_id, topic } = body;

    if (!resource || !topic) {
      return c.json({ success: true }); // Ignorar notificaciones inválidas
    }

    // Procesar según el topic
    if (topic === "items") {
      // Cambio en un item
      const itemId = resource.split("/").pop();

      // Buscar producto con este ml_item_id
      const { data: producto } = await supabase
        .from('products')
        .select('*')
        .eq('ml_item_id', itemId)
        .maybeSingle();

      if (producto) {
        // TODO: Actualizar producto con datos de ML
        // Obtener item actualizado de ML y sincronizar
        console.log(`Item ${itemId} changed, updating local product ${producto.id}`);
      }
    } else if (topic === "orders") {
      // Nueva orden desde ML
      // TODO: Crear pedido en ODDY desde orden de ML
      console.log(`New order from ML: ${resource}`);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error processing ML webhook:", error);
    return c.json({ error: "Error processing webhook" }, 500);
  }
});

// ============================================================
// FACEBOOK MARKETPLACE
// ============================================================

// POST /integraciones/facebook/sync - Sincronizar producto a Facebook
app.post("/make-server-0dd48dc4/integraciones/facebook/sync", async (c) => {
  try {
    const { product_id } = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    if (!product_id) {
      return c.json({ error: "product_id requerido" }, 400);
    }

    // Obtener credenciales Facebook
    const credentials = await getCredentials(tenant_id, 'facebook');
    if (!credentials || !credentials.access_token) {
      return c.json({ error: "Facebook access token not configured" }, 400);
    }

    // Obtener producto
    const { data: producto, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (error || !producto) {
      return c.json({ error: "Producto no encontrado" }, 404);
    }

    // Mapear a formato Facebook Catalog
    const fbProduct = {
      id: producto.id.toString(),
      title: producto.nombre,
      description: producto.descripcion || '',
      availability: producto.stock_disponible > 0 ? "in stock" : "out of stock",
      condition: producto.condicion || "new",
      price: `${producto.precio} ${producto.ml_moneda || 'UYU'}`,
      link: `https://tu-tienda.com/productos/${producto.id}`,
      image_link: producto.imagenes?.[0] || producto.imagen_principal || '',
      brand: producto.marca || ''
    };

    // Enviar a Facebook Catalog API
    const catalogId = credentials.catalog_id;
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${catalogId}/products`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${credentials.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: [fbProduct] })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return c.json({ error: "Error syncing to Facebook", details: errorData }, 400);
    }

    const fbResponse = await response.json();

    // Actualizar producto
    await supabase
      .from('products')
      .update({
        fb_product_id: producto.id.toString(),
        fb_sincronizado: true,
        fb_ultima_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', product_id);

    return c.json({
      success: true,
      fb_product_id: producto.id.toString(),
      mensaje: "Producto sincronizado con Facebook Marketplace"
    });
  } catch (error) {
    console.error("Error syncing to Facebook:", error);
    return c.json({ error: "Error syncing to Facebook" }, 500);
  }
});

// ============================================================
// INSTAGRAM SHOPPING
// ============================================================

// POST /integraciones/instagram/sync - Sincronizar producto a Instagram
app.post("/make-server-0dd48dc4/integraciones/instagram/sync", async (c) => {
  try {
    const { product_id } = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    if (!product_id) {
      return c.json({ error: "product_id requerido" }, 400);
    }

    // Instagram Shopping usa el mismo catálogo que Facebook
    const credentials = await getCredentials(tenant_id, 'instagram');
    if (!credentials || !credentials.access_token) {
      return c.json({ error: "Instagram access token not configured" }, 400);
    }

    // Obtener producto
    const { data: producto, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (error || !producto) {
      return c.json({ error: "Producto no encontrado" }, 404);
    }

    // Instagram usa Facebook Graph API
    const fbProduct = {
      id: producto.id.toString(),
      title: producto.nombre,
      description: producto.descripcion || '',
      availability: producto.stock_disponible > 0 ? "in stock" : "out of stock",
      condition: producto.condicion || "new",
      price: `${producto.precio} ${producto.ml_moneda || 'UYU'}`,
      link: `https://tu-tienda.com/productos/${producto.id}`,
      image_link: producto.imagenes?.[0] || producto.imagen_principal || '',
      brand: producto.marca || ''
    };

    const catalogId = credentials.catalog_id;
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${catalogId}/products`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${credentials.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: [fbProduct] })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return c.json({ error: "Error syncing to Instagram", details: errorData }, 400);
    }

    const igResponse = await response.json();

    // Actualizar producto
    await supabase
      .from('products')
      .update({
        ig_product_id: producto.id.toString(),
        ig_sincronizado: true,
        ig_ultima_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', product_id);

    return c.json({
      success: true,
      ig_product_id: producto.id.toString(),
      mensaje: "Producto sincronizado con Instagram Shopping"
    });
  } catch (error) {
    console.error("Error syncing to Instagram:", error);
    return c.json({ error: "Error syncing to Instagram" }, 500);
  }
});

// ============================================================
// WHATSAPP BUSINESS
// ============================================================

// POST /integraciones/whatsapp/send - Enviar mensaje WhatsApp
app.post("/make-server-0dd48dc4/integraciones/whatsapp/send", async (c) => {
  try {
    const { to, template, parameters } = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    const credentials = await getCredentials(tenant_id, 'whatsapp');
    if (!credentials || !credentials.access_token) {
      return c.json({ error: "WhatsApp access token not configured" }, 400);
    }

    // Enviar mensaje usando WhatsApp Business API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${credentials.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "template",
          template: {
            name: template,
            language: { code: "es" },
            components: parameters ? [
              {
                type: "body",
                parameters: parameters
              }
            ] : []
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return c.json({ error: "Error sending WhatsApp message", details: errorData }, 400);
    }

    const waResponse = await response.json();

    return c.json({
      success: true,
      message_id: waResponse.messages[0]?.id,
      mensaje: "Mensaje enviado por WhatsApp"
    });
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
    return c.json({ error: "Error sending WhatsApp" }, 500);
  }
});

// ============================================================
// GESTIÓN DE CREDENCIALES
// ============================================================

// POST /integraciones/credenciales - Guardar credenciales de canal
app.post("/make-server-0dd48dc4/integraciones/credenciales", async (c) => {
  try {
    const { canal, credenciales, territorio } = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    if (!canal || !credenciales) {
      return c.json({ error: "canal y credenciales son requeridos" }, 400);
    }

    // Upsert credenciales
    const { data, error } = await supabase
      .from('tenant_integrations')
      .upsert([{
        tenant_id: tenant_id || null,
        territorio: territorio || null,
        tipo: canal,
        proveedor: canal,
        credenciales: credenciales,
        activo: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return c.json({
      success: true,
      integracion: {
        ...data,
        credenciales: '***' // No devolver credenciales en respuesta
      },
      mensaje: `Credenciales de ${canal} guardadas exitosamente`
    });
  } catch (error) {
    console.error("Error saving credentials:", error);
    return c.json({ error: "Error saving credentials" }, 500);
  }
});

// GET /integraciones/status - Estado de las integraciones
app.get("/make-server-0dd48dc4/integraciones/status", async (c) => {
  try {
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('tenant_integrations')
      .select('tipo, activo, proveedor, created_at');

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const status: any = {
      mercadolibre: { configurado: false, activo: false },
      facebook: { configurado: false, activo: false },
      instagram: { configurado: false, activo: false },
      whatsapp: { configurado: false, activo: false }
    };

    data?.forEach(integ => {
      if (status[integ.tipo]) {
        status[integ.tipo] = {
          configurado: true,
          activo: integ.activo
        };
      }
    });

    return c.json({ integraciones: status });
  } catch (error) {
    console.error("Error fetching integration status:", error);
    return c.json({ error: "Error fetching status" }, 500);
  }
});

// ============================================
// INTEGRACIÓN CON GOOGLE APIS
// ============================================

// Configurar Google Maps API
app.post("/make-server-0dd48dc4/integrations/google/configure", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const configId = `google-config:${entity_id}`;

    const config = {
      id: configId,
      entity_id,
      platform: "google",
      
      // APIs habilitadas
      apis: {
        maps: {
          enabled: body.apis?.maps?.enabled !== false,
          api_key: body.apis?.maps?.api_key || null,
          services: {
            directions: true,
            geocoding: true,
            places: true,
            distance_matrix: true,
          },
        },
        analytics: {
          enabled: body.apis?.analytics?.enabled || false,
          measurement_id: body.apis?.analytics?.measurement_id || null,
        },
        tag_manager: {
          enabled: body.apis?.tag_manager?.enabled || false,
          container_id: body.apis?.tag_manager?.container_id || null,
        },
        recaptcha: {
          enabled: body.apis?.recaptcha?.enabled || false,
          site_key: body.apis?.recaptcha?.site_key || null,
          secret_key: body.apis?.recaptcha?.secret_key || null,
        },
      },
      
      // Configuración
      environment: body.environment || "production",
      
      // Metadata
      metadata: body.metadata || {},
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([configId], config);
    await kv.set(["integrations", entity_id, "google"], configId);

    return c.json({ 
      config: {
        ...config,
        apis: {
          maps: {
            ...config.apis.maps,
            api_key: config.apis.maps.api_key ? "***hidden***" : null,
          },
          recaptcha: {
            ...config.apis.recaptcha,
            secret_key: config.apis.recaptcha.secret_key ? "***hidden***" : null,
          },
          analytics: config.apis.analytics,
          tag_manager: config.apis.tag_manager,
        },
      },
      message: "Google APIs configured successfully" 
    });
  } catch (error) {
    console.log("Error configuring Google APIs:", error);
    return c.json({ error: "Error configuring Google APIs" }, 500);
  }
});

// Obtener configuración de Google
app.get("/make-server-0dd48dc4/integrations/google/config", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const configIdEntry = await kv.get(["integrations", entity_id, "google"]);

    if (!configIdEntry.value) {
      return c.json({ error: "Google integration not configured" }, 404);
    }

    const configId = configIdEntry.value as string;
    const configEntry = await kv.get([configId]);

    if (!configEntry.value) {
      return c.json({ error: "Configuration not found" }, 404);
    }

    const config = configEntry.value as any;

    return c.json({ 
      config: {
        ...config,
        apis: {
          maps: {
            ...config.apis.maps,
            api_key: config.apis.maps.api_key ? "***hidden***" : null,
          },
          recaptcha: {
            ...config.apis.recaptcha,
            secret_key: config.apis.recaptcha.secret_key ? "***hidden***" : null,
          },
          analytics: config.apis.analytics,
          tag_manager: config.apis.tag_manager,
        },
      },
    });
  } catch (error) {
    console.log("Error getting Google config:", error);
    return c.json({ error: "Error getting Google config" }, 500);
  }
});

// ============================================
// INTEGRACIÓN CON COURIERS (APIs de Envíos)
// ============================================

// Configurar API de Courier
app.post("/make-server-0dd48dc4/integrations/courier/configure", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const courier = body.courier; // fedex, ups, dhl, etc.
    const timestamp = new Date().toISOString();

    if (!courier) {
      return c.json({ error: "Courier is required" }, 400);
    }

    const configId = `courier-config:${entity_id}:${courier}`;

    const config = {
      id: configId,
      entity_id,
      platform: "courier",
      courier,
      
      // Credenciales (según el courier)
      credentials: {
        // FedEx
        fedex_account_number: body.credentials?.fedex_account_number || null,
        fedex_meter_number: body.credentials?.fedex_meter_number || null,
        fedex_key: body.credentials?.fedex_key || null,
        fedex_password: body.credentials?.fedex_password || null,
        
        // UPS
        ups_username: body.credentials?.ups_username || null,
        ups_password: body.credentials?.ups_password || null,
        ups_access_key: body.credentials?.ups_access_key || null,
        
        // DHL
        dhl_site_id: body.credentials?.dhl_site_id || null,
        dhl_password: body.credentials?.dhl_password || null,
        dhl_account_number: body.credentials?.dhl_account_number || null,
        
        // Genérico
        api_key: body.credentials?.api_key || null,
        api_secret: body.credentials?.api_secret || null,
        client_id: body.credentials?.client_id || null,
        client_secret: body.credentials?.client_secret || null,
      },
      
      // Configuración
      environment: body.environment || "production", // sandbox, production
      webhook_url: body.webhook_url || null,
      
      // Servicios habilitados
      services: {
        create_shipment: body.services?.create_shipment !== false,
        track_shipment: body.services?.track_shipment !== false,
        calculate_rate: body.services?.calculate_rate !== false,
        print_label: body.services?.print_label !== false,
        schedule_pickup: body.services?.schedule_pickup || false,
      },
      
      // Estado
      enabled: body.enabled !== false,
      
      // Metadata
      metadata: body.metadata || {},
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([configId], config);
    await kv.set(["integrations", entity_id, "courier", courier], configId);

    return c.json({ 
      config: {
        ...config,
        credentials: "***hidden***",
      },
      message: `${courier.toUpperCase()} courier configured successfully` 
    });
  } catch (error) {
    console.log("Error configuring courier:", error);
    return c.json({ error: "Error configuring courier" }, 500);
  }
});

// Obtener configuración de Courier
app.get("/make-server-0dd48dc4/integrations/courier/:courier/config", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const courier = c.req.param("courier");

    const configIdEntry = await kv.get(["integrations", entity_id, "courier", courier]);

    if (!configIdEntry.value) {
      return c.json({ error: "Courier integration not configured" }, 404);
    }

    const configId = configIdEntry.value as string;
    const configEntry = await kv.get([configId]);

    if (!configEntry.value) {
      return c.json({ error: "Configuration not found" }, 404);
    }

    const config = configEntry.value as any;

    return c.json({ 
      config: {
        ...config,
        credentials: "***hidden***",
      },
    });
  } catch (error) {
    console.log("Error getting courier config:", error);
    return c.json({ error: "Error getting courier config" }, 500);
  }
});

// Listar couriers configurados
app.get("/make-server-0dd48dc4/integrations/couriers", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const prefix = ["integrations", entity_id, "courier"];
    const entries = kv.list({ prefix });
    
    let couriers = [];
    for await (const entry of entries) {
      const courier = entry.key[entry.key.length - 1];
      const configId = entry.value as string;
      const configEntry = await kv.get([configId]);
      
      if (configEntry.value) {
        const config = configEntry.value as any;
        couriers.push({
          courier: config.courier,
          enabled: config.enabled,
          environment: config.environment,
          services: config.services,
        });
      }
    }

    return c.json({ couriers, total: couriers.length });
  } catch (error) {
    console.log("Error listing couriers:", error);
    return c.json({ error: "Error listing couriers" }, 500);
  }
});

// ============================================
// LLAMAR A API DE COURIER (Ejemplo genérico)
// ============================================

// Crear envío en API del courier
app.post("/make-server-0dd48dc4/integrations/courier/:courier/create-shipment", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const courier = c.req.param("courier");
    const body = await c.req.json();

    // Obtener configuración del courier
    const configIdEntry = await kv.get(["integrations", entity_id, "courier", courier]);

    if (!configIdEntry.value) {
      return c.json({ error: "Courier not configured" }, 400);
    }

    const configId = configIdEntry.value as string;
    const configEntry = await kv.get([configId]);
    const config = configEntry.value as any;

    if (!config.enabled) {
      return c.json({ error: "Courier integration is disabled" }, 400);
    }

    // En producción, hacer llamada real a la API del courier
    console.log(`[COURIER API] Creating shipment with ${courier}...`);
    console.log(`Environment: ${config.environment}`);
    console.log(`Shipment data:`, body);

    // Simulado: Retornar respuesta del courier
    const courierResponse = {
      success: true,
      courier,
      tracking_number: `${courier.toUpperCase()}-${Date.now()}`,
      label_url: `https://api.${courier}.com/labels/${Date.now()}.pdf`,
      estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      cost: {
        total: 25.50,
        currency: "USD",
      },
    };

    return c.json({ 
      courier_response: courierResponse,
      message: `Shipment created successfully with ${courier}` 
    });
  } catch (error) {
    console.log("Error creating shipment with courier:", error);
    return c.json({ error: "Error creating shipment with courier" }, 500);
  }
});

// Tracking desde API del courier
app.get("/make-server-0dd48dc4/integrations/courier/:courier/track/:tracking_number", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const courier = c.req.param("courier");
    const tracking_number = c.req.param("tracking_number");

    // Obtener configuración del courier
    const configIdEntry = await kv.get(["integrations", entity_id, "courier", courier]);

    if (!configIdEntry.value) {
      return c.json({ error: "Courier not configured" }, 400);
    }

    // En producción, hacer llamada real a la API del courier
    console.log(`[COURIER API] Tracking ${tracking_number} with ${courier}...`);

    // Simulado: Retornar tracking del courier
    const trackingData = {
      courier,
      tracking_number,
      status: "in_transit",
      current_location: {
        city: "Memphis, TN",
        country: "US",
        timestamp: new Date().toISOString(),
      },
      events: [
        {
          status: "picked_up",
          location: "Los Angeles, CA",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: "in_transit",
          location: "Memphis, TN",
          timestamp: new Date().toISOString(),
        },
      ],
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return c.json({ tracking: trackingData });
  } catch (error) {
    console.log("Error tracking with courier:", error);
    return c.json({ error: "Error tracking with courier" }, 500);
  }
});

export default app;
