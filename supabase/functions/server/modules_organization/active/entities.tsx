import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// CRUD DE ENTITIES
// ============================================

// CREATE - Crear entity
app.post("/make-server-0dd48dc4/entities", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `entity:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newEntity = {
      id,
      // Información básica
      name: body.name,
      legal_name: body.legal_name || body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      
      // Contacto
      contact: {
        email: body.contact?.email || "",
        phone: body.contact?.phone || "",
        address: body.contact?.address || {},
      },
      
      // Configuración de territorio
      territory: {
        country: body.territory?.country || "UY",
        currency: body.territory?.currency || "USD",
        language: body.territory?.language || "es",
        timezone: body.territory?.timezone || "America/Montevideo",
      },
      
      // Datos fiscales
      tax_data: {
        tax_id: body.tax_data?.tax_id || "",
        tax_id_type: body.tax_data?.tax_id_type || "RUT",
        tax_regime: body.tax_data?.tax_regime || "",
      },
      
      // Branding
      branding: {
        logo_url: body.branding?.logo_url || "",
        primary_color: body.branding?.primary_color || "#000000",
        secondary_color: body.branding?.secondary_color || "#ffffff",
        favicon_url: body.branding?.favicon_url || "",
      },
      
      // Features habilitados (módulos)
      features: {
        ecommerce: body.features?.ecommerce !== false,
        second_hand: body.features?.second_hand || false,
        fulfillment: body.features?.fulfillment || false,
        multi_channel: body.features?.multi_channel || false,
        marketing: body.features?.marketing || false,
        crm: body.features?.crm || false,
        erp: body.features?.erp || false,
        automation: body.features?.automation || false,
      },
      
      // Límites
      limits: {
        max_users: body.limits?.max_users || 5,
        max_products: body.limits?.max_products || 1000,
        max_orders_per_month: body.limits?.max_orders_per_month || 500,
        max_storage_mb: body.limits?.max_storage_mb || 1000,
      },
      
      // Plan y billing
      plan: {
        type: body.plan?.type || "trial", // trial, basic, pro, enterprise
        price_monthly: body.plan?.price_monthly || 0,
        billing_cycle: body.plan?.billing_cycle || "monthly",
        trial_ends_at: body.plan?.trial_ends_at || null,
      },
      
      // Status
      status: body.status || "active", // active, suspended, trial, cancelled
      
      // Metadata
      metadata: body.metadata || {},
      
      // Auditoría
      created_at: timestamp,
      updated_at: timestamp,
      created_by: body.created_by || null,
    };

    await kv.set([id], newEntity);
    
    // Indexar por slug
    await kv.set(["entities_by_slug", newEntity.slug], id);
    
    // Indexar por status
    await kv.set(["entities_by_status", newEntity.status, id], true);

    return c.json({ entity: newEntity });
  } catch (error) {
    console.log("Error creating entity:", error);
    return c.json({ error: error.message || "Error creating entity" }, 500);
  }
});

// READ - Listar entities
app.get("/make-server-0dd48dc4/entities", async (c) => {
  try {
    const status = c.req.query("status");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    let entities = [];

    if (status) {
      // Buscar por status
      const statusPrefix = ["entities_by_status", status];
      const entries = kv.list({ prefix: statusPrefix });
      for await (const entry of entries) {
        const entityId = entry.key[entry.key.length - 1];
        const entityEntry = await kv.get([entityId]);
        if (entityEntry.value) {
          entities.push(entityEntry.value);
        }
      }
    } else {
      // Buscar todas las entities
      const allPrefix = ["entity:"];
      const entries = kv.list({ prefix: [] });
      for await (const entry of entries) {
        const key = entry.key[0];
        if (typeof key === "string" && key.startsWith("entity:")) {
          entities.push(entry.value);
        }
      }
    }

    // Ordenar por fecha de creación
    entities.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Paginar
    const total = entities.length;
    const paginated = entities.slice(offset, offset + limit);

    return c.json({
      entities: paginated,
      total,
      limit,
      offset,
      has_more: offset + limit < total,
    });
  } catch (error) {
    console.log("Error listing entities:", error);
    return c.json({ error: "Error listing entities" }, 500);
  }
});

// READ - Obtener entity por ID
app.get("/make-server-0dd48dc4/entities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    return c.json({ entity: entry.value });
  } catch (error) {
    console.log("Error getting entity:", error);
    return c.json({ error: "Error getting entity" }, 500);
  }
});

// READ - Obtener entity por slug
app.get("/make-server-0dd48dc4/entities/by-slug/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const slugEntry = await kv.get(["entities_by_slug", slug]);

    if (!slugEntry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    const entityId = slugEntry.value;
    const entityEntry = await kv.get([entityId]);

    if (!entityEntry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    return c.json({ entity: entityEntry.value });
  } catch (error) {
    console.log("Error getting entity by slug:", error);
    return c.json({ error: "Error getting entity" }, 500);
  }
});

// UPDATE - Actualizar entity
app.patch("/make-server-0dd48dc4/entities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    const existing = entry.value as any;
    const timestamp = new Date().toISOString();

    // Si cambia el slug, actualizar índice
    if (updates.slug && updates.slug !== existing.slug) {
      await kv.delete(["entities_by_slug", existing.slug]);
      await kv.set(["entities_by_slug", updates.slug], id);
    }

    // Si cambia el status, actualizar índice
    if (updates.status && updates.status !== existing.status) {
      await kv.delete(["entities_by_status", existing.status, id]);
      await kv.set(["entities_by_status", updates.status, id], true);
    }

    const updated = {
      ...existing,
      ...updates,
      contact: { ...existing.contact, ...updates.contact },
      territory: { ...existing.territory, ...updates.territory },
      tax_data: { ...existing.tax_data, ...updates.tax_data },
      branding: { ...existing.branding, ...updates.branding },
      features: { ...existing.features, ...updates.features },
      limits: { ...existing.limits, ...updates.limits },
      plan: { ...existing.plan, ...updates.plan },
      metadata: { ...existing.metadata, ...updates.metadata },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ entity: updated });
  } catch (error) {
    console.log("Error updating entity:", error);
    return c.json({ error: error.message || "Error updating entity" }, 500);
  }
});

// DELETE - Eliminar entity
app.delete("/make-server-0dd48dc4/entities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    const entity = entry.value as any;

    // Eliminar índices
    await kv.delete(["entities_by_slug", entity.slug]);
    await kv.delete(["entities_by_status", entity.status, id]);

    // Eliminar entity
    await kv.delete([id]);

    return c.json({ success: true, message: "Entity deleted" });
  } catch (error) {
    console.log("Error deleting entity:", error);
    return c.json({ error: "Error deleting entity" }, 500);
  }
});

// ============================================
// FEATURES
// ============================================

// Actualizar features
app.patch("/make-server-0dd48dc4/entities/:id/features", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    const entity = entry.value as any;
    const timestamp = new Date().toISOString();

    const updated = {
      ...entity,
      features: {
        ...entity.features,
        ...updates,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ entity: updated });
  } catch (error) {
    console.log("Error updating features:", error);
    return c.json({ error: "Error updating features" }, 500);
  }
});

// Obtener features
app.get("/make-server-0dd48dc4/entities/:id/features", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    const entity = entry.value as any;

    return c.json({ features: entity.features || {} });
  } catch (error) {
    console.log("Error getting features:", error);
    return c.json({ error: "Error getting features" }, 500);
  }
});

// ============================================
// CONFIGURACIÓN
// ============================================

// Obtener configuración completa
app.get("/make-server-0dd48dc4/entities/:id/config", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    const entity = entry.value as any;

    return c.json({
      config: {
        territory: entity.territory,
        branding: entity.branding,
        features: entity.features,
        limits: entity.limits,
        plan: entity.plan,
      },
    });
  } catch (error) {
    console.log("Error getting config:", error);
    return c.json({ error: "Error getting config" }, 500);
  }
});

// Actualizar configuración de territorio
app.patch("/make-server-0dd48dc4/entities/:id/territory", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    const entity = entry.value as any;
    const timestamp = new Date().toISOString();

    const updated = {
      ...entity,
      territory: {
        ...entity.territory,
        ...updates,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ entity: updated });
  } catch (error) {
    console.log("Error updating territory:", error);
    return c.json({ error: "Error updating territory" }, 500);
  }
});

// Actualizar branding
app.patch("/make-server-0dd48dc4/entities/:id/branding", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    const entity = entry.value as any;
    const timestamp = new Date().toISOString();

    const updated = {
      ...entity,
      branding: {
        ...entity.branding,
        ...updates,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ entity: updated });
  } catch (error) {
    console.log("Error updating branding:", error);
    return c.json({ error: "Error updating branding" }, 500);
  }
});

// ============================================
// ESTADÍSTICAS
// ============================================

// Stats de una entity
app.get("/make-server-0dd48dc4/entities/:id/stats", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Entity not found" }, 404);
    }

    const entity = entry.value as any;

    // Contar usuarios, productos, pedidos (simulado por ahora)
    // En producción, esto vendría de queries reales
    const stats = {
      users: {
        total: 0,
        active: 0,
        limit: entity.limits.max_users,
      },
      products: {
        total: 0,
        published: 0,
        limit: entity.limits.max_products,
      },
      orders: {
        total: 0,
        this_month: 0,
        limit: entity.limits.max_orders_per_month,
      },
      storage: {
        used_mb: 0,
        limit_mb: entity.limits.max_storage_mb,
      },
      plan: {
        type: entity.plan.type,
        status: entity.status,
        trial_ends_at: entity.plan.trial_ends_at,
      },
    };

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting stats:", error);
    return c.json({ error: "Error getting stats" }, 500);
  }
});

// Dashboard general de entities
app.get("/make-server-0dd48dc4/entities/dashboard", async (c) => {
  try {
    // Obtener todas las entities
    const entries = kv.list({ prefix: [] });
    const entities = [];
    
    for await (const entry of entries) {
      const key = entry.key[0];
      if (typeof key === "string" && key.startsWith("entity:")) {
        entities.push(entry.value);
      }
    }

    // Calcular estadísticas
    const totalEntities = entities.length;
    const activeEntities = entities.filter((e: any) => e.status === "active").length;
    const trialEntities = entities.filter((e: any) => e.status === "trial").length;
    const suspendedEntities = entities.filter((e: any) => e.status === "suspended").length;

    // Contar por plan
    const planCounts = entities.reduce((acc: any, e: any) => {
      const planType = e.plan?.type || "trial";
      acc[planType] = (acc[planType] || 0) + 1;
      return acc;
    }, {});

    // Contar por país
    const countryCounts = entities.reduce((acc: any, e: any) => {
      const country = e.territory?.country || "unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    return c.json({
      dashboard: {
        total_entities: totalEntities,
        active_entities: activeEntities,
        trial_entities: trialEntities,
        suspended_entities: suspendedEntities,
        by_plan: planCounts,
        by_country: countryCounts,
        entities: entities.slice(0, 10), // Top 10 más recientes
      },
    });
  } catch (error) {
    console.log("Error getting dashboard:", error);
    return c.json({ error: "Error getting dashboard" }, 500);
  }
});

export default app;
