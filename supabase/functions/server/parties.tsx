import { Hono } from "npm:hono";

const app = new Hono();
const kv = await Deno.openKv();

// ============================================
// HELPERS Y VALIDACIONES
// ============================================

function validatePersonData(data: any) {
  if (!data.first_name || !data.last_name) {
    throw new Error("first_name y last_name son requeridos para PERSON");
  }
  return {
    first_name: data.first_name,
    last_name: data.last_name,
    middle_name: data.middle_name || null,
    date_of_birth: data.date_of_birth || null,
    gender: data.gender || null,
    nationality: data.nationality || null,
  };
}

function validateOrganizationData(data: any) {
  if (!data.legal_name) {
    throw new Error("legal_name es requerido para ORGANIZATION");
  }
  return {
    legal_name: data.legal_name,
    trade_name: data.trade_name || null,
    company_type: data.company_type || null,
    incorporation_date: data.incorporation_date || null,
    industry: data.industry || null,
    employee_count: data.employee_count || null,
  };
}

function validateContact(data: any) {
  if (!data.email && !data.phone) {
    throw new Error("Al menos email o phone son requeridos");
  }
  return {
    email: data.email || null,
    phone: data.phone || null,
    mobile: data.mobile || null,
    website: data.website || null,
    address: data.address || null,
  };
}

function validateContextData(role: string, data: any) {
  switch (role) {
    case "CUSTOMER":
      return {
        customer_type: data.customer_type || "B2C",
        credit_limit: Number(data.credit_limit) || 0,
        credit_used: Number(data.credit_used) || 0,
        payment_terms: data.payment_terms || "NET_30",
        loyalty_points: Number(data.loyalty_points) || 0,
        loyalty_tier: data.loyalty_tier || "BRONZE",
        preferred_language: data.preferred_language || "es",
        preferred_currency: data.preferred_currency || "USD",
        accepts_marketing: Boolean(data.accepts_marketing),
        marketing_source: data.marketing_source || null,
        total_orders: Number(data.total_orders) || 0,
        total_spent: Number(data.total_spent) || 0,
        average_order_value: Number(data.average_order_value) || 0,
        last_order_date: data.last_order_date || null,
      };
    
    case "SUPPLIER":
      return {
        supplier_type: data.supplier_type || "DISTRIBUTOR",
        payment_terms: data.payment_terms || "NET_60",
        lead_time_days: Number(data.lead_time_days) || 0,
        minimum_order_value: Number(data.minimum_order_value) || 0,
        rating: Number(data.rating) || 0,
        quality_score: Number(data.quality_score) || 0,
        delivery_score: Number(data.delivery_score) || 0,
        communication_score: Number(data.communication_score) || 0,
        total_orders: Number(data.total_orders) || 0,
        total_purchased: Number(data.total_purchased) || 0,
        last_order_date: data.last_order_date || null,
        certifications: data.certifications || [],
        preferred: Boolean(data.preferred),
      };
    
    case "EMPLOYEE":
      return {
        department: data.department || null,
        position: data.position || null,
        hire_date: data.hire_date || null,
        salary: Number(data.salary) || 0,
        employment_type: data.employment_type || "FULL_TIME",
        manager_id: data.manager_id || null,
      };
    
    default:
      return data;
  }
}

function getDisplayName(party: any): string {
  if (party.type === "PERSON") {
    const firstName = party.person_data?.first_name || "";
    const lastName = party.person_data?.last_name || "";
    return `${firstName} ${lastName}`.trim();
  } else {
    return party.organization_data?.legal_name || "";
  }
}

// ============================================
// CRUD BÁSICO
// ============================================

// CREATE - Crear party
app.post("/make-server-0dd48dc4/parties", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || `party:${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Validar tipo
    if (!["PERSON", "ORGANIZATION"].includes(body.type)) {
      return c.json({ error: "type debe ser PERSON o ORGANIZATION" }, 400);
    }

    // Validar datos según tipo
    let typeData = {};
    if (body.type === "PERSON") {
      typeData = { person_data: validatePersonData(body.person_data || {}) };
    } else {
      typeData = { organization_data: validateOrganizationData(body.organization_data || {}) };
    }

    // Validar contacto
    const contact = validateContact(body.contact || {});

    // Validar roles
    const roles = Array.isArray(body.roles) ? body.roles : [];

    // Validar context_data
    const context_data: any = {};
    if (body.context_data) {
      for (const role of roles) {
        if (body.context_data[role.toLowerCase()]) {
          context_data[role.toLowerCase()] = validateContextData(
            role,
            body.context_data[role.toLowerCase()]
          );
        }
      }
    }

    const newParty = {
      id,
      entity_id: body.entity_id || "default",
      type: body.type,
      ...typeData,
      contact,
      tax_data: body.tax_data || {},
      roles,
      context_data,
      status: body.status || "ACTIVE",
      metadata: body.metadata || {},
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], newParty);

    // Indexar por entity_id
    const entityIndex = ["parties_by_entity", newParty.entity_id, id];
    await kv.set(entityIndex, true);

    // Indexar por email si existe
    if (contact.email) {
      const emailIndex = ["parties_by_email", contact.email.toLowerCase(), id];
      await kv.set(emailIndex, true);
    }

    // Indexar por roles
    for (const role of roles) {
      const roleIndex = ["parties_by_role", newParty.entity_id, role, id];
      await kv.set(roleIndex, true);
    }

    return c.json({ party: newParty });
  } catch (error) {
    console.log("Error creating party:", error);
    return c.json({ error: error.message || "Error creating party" }, 500);
  }
});

// READ - Listar parties
app.get("/make-server-0dd48dc4/parties", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const type = c.req.query("type");
    const status = c.req.query("status");
    const role = c.req.query("role");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    let parties = [];

    if (role) {
      // Buscar por rol
      const rolePrefix = ["parties_by_role", entity_id, role];
      const entries = kv.list({ prefix: rolePrefix });
      for await (const entry of entries) {
        const partyId = entry.key[entry.key.length - 1];
        const partyEntry = await kv.get([partyId]);
        if (partyEntry.value) {
          parties.push(partyEntry.value);
        }
      }
    } else {
      // Buscar por entity_id
      const entityPrefix = ["parties_by_entity", entity_id];
      const entries = kv.list({ prefix: entityPrefix });
      for await (const entry of entries) {
        const partyId = entry.key[entry.key.length - 1];
        const partyEntry = await kv.get([partyId]);
        if (partyEntry.value) {
          parties.push(partyEntry.value);
        }
      }
    }

    // Filtrar por tipo si se especifica
    if (type) {
      parties = parties.filter((p: any) => p.type === type);
    }

    // Filtrar por status si se especifica
    if (status) {
      parties = parties.filter((p: any) => p.status === status);
    }

    // Agregar display_name
    parties = parties.map((p: any) => ({
      ...p,
      display_name: getDisplayName(p),
    }));

    // Ordenar por fecha de creación (más reciente primero)
    parties.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Paginar
    const total = parties.length;
    const paginated = parties.slice(offset, offset + limit);

    return c.json({
      parties: paginated,
      total,
      limit,
      offset,
      has_more: offset + limit < total,
    });
  } catch (error) {
    console.log("Error listing parties:", error);
    return c.json({ error: "Error listing parties" }, 500);
  }
});

// READ - Obtener party por ID
app.get("/make-server-0dd48dc4/parties/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Party not found" }, 404);
    }

    const party = {
      ...entry.value,
      display_name: getDisplayName(entry.value),
    };

    return c.json({ party });
  } catch (error) {
    console.log("Error getting party:", error);
    return c.json({ error: "Error getting party" }, 500);
  }
});

// UPDATE - Actualizar party
app.patch("/make-server-0dd48dc4/parties/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Party not found" }, 404);
    }

    const existing = entry.value as any;
    const timestamp = new Date().toISOString();

    // Actualizar campos básicos
    const updated: any = {
      ...existing,
      updated_at: timestamp,
    };

    // Actualizar person_data si se proporciona
    if (updates.person_data && existing.type === "PERSON") {
      updated.person_data = {
        ...existing.person_data,
        ...updates.person_data,
      };
    }

    // Actualizar organization_data si se proporciona
    if (updates.organization_data && existing.type === "ORGANIZATION") {
      updated.organization_data = {
        ...existing.organization_data,
        ...updates.organization_data,
      };
    }

    // Actualizar contact
    if (updates.contact) {
      updated.contact = {
        ...existing.contact,
        ...updates.contact,
      };

      // Re-indexar email si cambió
      if (updates.contact.email && updates.contact.email !== existing.contact?.email) {
        // Eliminar índice viejo
        if (existing.contact?.email) {
          await kv.delete(["parties_by_email", existing.contact.email.toLowerCase(), id]);
        }
        // Crear índice nuevo
        await kv.set(["parties_by_email", updates.contact.email.toLowerCase(), id], true);
      }
    }

    // Actualizar tax_data
    if (updates.tax_data) {
      updated.tax_data = {
        ...existing.tax_data,
        ...updates.tax_data,
      };
    }

    // Actualizar roles
    if (updates.roles) {
      // Eliminar índices de roles viejos
      for (const oldRole of existing.roles || []) {
        await kv.delete(["parties_by_role", existing.entity_id, oldRole, id]);
      }
      
      updated.roles = updates.roles;

      // Crear índices de roles nuevos
      for (const newRole of updates.roles) {
        await kv.set(["parties_by_role", existing.entity_id, newRole, id], true);
      }
    }

    // Actualizar context_data
    if (updates.context_data) {
      updated.context_data = {
        ...existing.context_data,
        ...updates.context_data,
      };
    }

    // Actualizar status
    if (updates.status) {
      updated.status = updates.status;
    }

    // Actualizar metadata
    if (updates.metadata) {
      updated.metadata = {
        ...existing.metadata,
        ...updates.metadata,
      };
    }

    await kv.set([id], updated);

    return c.json({
      party: {
        ...updated,
        display_name: getDisplayName(updated),
      },
    });
  } catch (error) {
    console.log("Error updating party:", error);
    return c.json({ error: error.message || "Error updating party" }, 500);
  }
});

// DELETE - Eliminar party
app.delete("/make-server-0dd48dc4/parties/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Party not found" }, 404);
    }

    const party = entry.value as any;

    // Eliminar índices
    await kv.delete(["parties_by_entity", party.entity_id, id]);
    
    if (party.contact?.email) {
      await kv.delete(["parties_by_email", party.contact.email.toLowerCase(), id]);
    }

    for (const role of party.roles || []) {
      await kv.delete(["parties_by_role", party.entity_id, role, id]);
    }

    // Eliminar party
    await kv.delete([id]);

    return c.json({ success: true, message: "Party deleted" });
  } catch (error) {
    console.log("Error deleting party:", error);
    return c.json({ error: "Error deleting party" }, 500);
  }
});

// ============================================
// BÚSQUEDA
// ============================================

// Búsqueda exhaustiva
app.get("/make-server-0dd48dc4/parties/search", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const q = c.req.query("q")?.toLowerCase() || "";
    const type = c.req.query("type");
    const role = c.req.query("role");
    const limit = parseInt(c.req.query("limit") || "50");

    // Obtener todas las parties del entity
    const entityPrefix = ["parties_by_entity", entity_id];
    const entries = kv.list({ prefix: entityPrefix });
    
    let parties = [];
    for await (const entry of entries) {
      const partyId = entry.key[entry.key.length - 1];
      const partyEntry = await kv.get([partyId]);
      if (partyEntry.value) {
        parties.push(partyEntry.value);
      }
    }

    // Filtrar por búsqueda
    if (q) {
      parties = parties.filter((p: any) => {
        const searchFields = [
          p.person_data?.first_name,
          p.person_data?.last_name,
          p.organization_data?.legal_name,
          p.organization_data?.trade_name,
          p.contact?.email,
          p.contact?.phone,
          p.tax_data?.tax_id,
        ]
          .filter(Boolean)
          .map((f) => String(f).toLowerCase());

        return searchFields.some((field) => field.includes(q));
      });
    }

    // Filtrar por tipo
    if (type) {
      parties = parties.filter((p: any) => p.type === type);
    }

    // Filtrar por rol
    if (role) {
      parties = parties.filter((p: any) => p.roles?.includes(role));
    }

    // Agregar display_name
    parties = parties.map((p: any) => ({
      ...p,
      display_name: getDisplayName(p),
    }));

    // Ordenar por relevancia (simple: por fecha)
    parties.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Limitar resultados
    parties = parties.slice(0, limit);

    return c.json({
      parties,
      total: parties.length,
      query: q,
    });
  } catch (error) {
    console.log("Error searching parties:", error);
    return c.json({ error: "Error searching parties" }, 500);
  }
});

// Buscar por email
app.get("/make-server-0dd48dc4/parties/by-email/:email", async (c) => {
  try {
    const email = c.req.param("email").toLowerCase();
    const emailIndex = ["parties_by_email", email];
    
    const entries = kv.list({ prefix: emailIndex });
    const parties = [];
    
    for await (const entry of entries) {
      const partyId = entry.key[entry.key.length - 1];
      const partyEntry = await kv.get([partyId]);
      if (partyEntry.value) {
        parties.push({
          ...partyEntry.value,
          display_name: getDisplayName(partyEntry.value),
        });
      }
    }

    if (parties.length === 0) {
      return c.json({ error: "Party not found" }, 404);
    }

    return c.json({ parties });
  } catch (error) {
    console.log("Error finding party by email:", error);
    return c.json({ error: "Error finding party" }, 500);
  }
});

// ============================================
// GESTIÓN DE ROLES
// ============================================

// Agregar rol
app.post("/make-server-0dd48dc4/parties/:id/roles", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { role, context } = body;

    if (!role) {
      return c.json({ error: "role es requerido" }, 400);
    }

    const entry = await kv.get([id]);
    if (!entry.value) {
      return c.json({ error: "Party not found" }, 404);
    }

    const party = entry.value as any;
    const timestamp = new Date().toISOString();

    // Agregar rol si no existe
    const roles = party.roles || [];
    if (!roles.includes(role)) {
      roles.push(role);
      
      // Crear índice de rol
      await kv.set(["parties_by_role", party.entity_id, role, id], true);
    }

    // Agregar context_data si se proporciona
    const context_data = { ...party.context_data };
    if (context) {
      context_data[role.toLowerCase()] = validateContextData(role, context);
    } else {
      // Inicializar con valores por defecto
      context_data[role.toLowerCase()] = validateContextData(role, {});
    }

    const updated = {
      ...party,
      roles,
      context_data,
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({
      party: {
        ...updated,
        display_name: getDisplayName(updated),
      },
    });
  } catch (error) {
    console.log("Error adding role:", error);
    return c.json({ error: error.message || "Error adding role" }, 500);
  }
});

// Quitar rol
app.delete("/make-server-0dd48dc4/parties/:id/roles/:role", async (c) => {
  try {
    const id = c.req.param("id");
    const role = c.req.param("role");

    const entry = await kv.get([id]);
    if (!entry.value) {
      return c.json({ error: "Party not found" }, 404);
    }

    const party = entry.value as any;
    const timestamp = new Date().toISOString();

    // Quitar rol
    const roles = (party.roles || []).filter((r: string) => r !== role);

    // Eliminar índice de rol
    await kv.delete(["parties_by_role", party.entity_id, role, id]);

    // Quitar context_data del rol
    const context_data = { ...party.context_data };
    delete context_data[role.toLowerCase()];

    const updated = {
      ...party,
      roles,
      context_data,
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({
      party: {
        ...updated,
        display_name: getDisplayName(updated),
      },
    });
  } catch (error) {
    console.log("Error removing role:", error);
    return c.json({ error: "Error removing role" }, 500);
  }
});

// ============================================
// CONTEXTO
// ============================================

// Actualizar context_data de un rol específico
app.patch("/make-server-0dd48dc4/parties/:id/context/:role", async (c) => {
  try {
    const id = c.req.param("id");
    const role = c.req.param("role");
    const updates = await c.req.json();

    const entry = await kv.get([id]);
    if (!entry.value) {
      return c.json({ error: "Party not found" }, 404);
    }

    const party = entry.value as any;

    // Verificar que tiene el rol
    if (!party.roles?.includes(role)) {
      return c.json({ error: `Party does not have role ${role}` }, 400);
    }

    const timestamp = new Date().toISOString();
    const roleKey = role.toLowerCase();

    // Actualizar context_data
    const context_data = {
      ...party.context_data,
      [roleKey]: {
        ...party.context_data[roleKey],
        ...updates,
      },
    };

    const updated = {
      ...party,
      context_data,
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({
      party: {
        ...updated,
        display_name: getDisplayName(updated),
      },
    });
  } catch (error) {
    console.log("Error updating context:", error);
    return c.json({ error: "Error updating context" }, 500);
  }
});

// ============================================
// FILTROS ESPECÍFICOS
// ============================================

// Solo clientes
app.get("/make-server-0dd48dc4/parties/customers", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const limit = parseInt(c.req.query("limit") || "50");

    const rolePrefix = ["parties_by_role", entity_id, "CUSTOMER"];
    const entries = kv.list({ prefix: rolePrefix });
    
    let customers = [];
    for await (const entry of entries) {
      const partyId = entry.key[entry.key.length - 1];
      const partyEntry = await kv.get([partyId]);
      if (partyEntry.value) {
        const party = partyEntry.value as any;
        customers.push({
          ...party,
          display_name: getDisplayName(party),
          customer_data: party.context_data?.customer || {},
        });
      }
    }

    // Ordenar por total_spent (más alto primero)
    customers.sort((a: any, b: any) => {
      const aSpent = a.customer_data?.total_spent || 0;
      const bSpent = b.customer_data?.total_spent || 0;
      return bSpent - aSpent;
    });

    customers = customers.slice(0, limit);

    return c.json({
      customers,
      total: customers.length,
    });
  } catch (error) {
    console.log("Error listing customers:", error);
    return c.json({ error: "Error listing customers" }, 500);
  }
});

// Solo proveedores
app.get("/make-server-0dd48dc4/parties/suppliers", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const limit = parseInt(c.req.query("limit") || "50");

    const rolePrefix = ["parties_by_role", entity_id, "SUPPLIER"];
    const entries = kv.list({ prefix: rolePrefix });
    
    let suppliers = [];
    for await (const entry of entries) {
      const partyId = entry.key[entry.key.length - 1];
      const partyEntry = await kv.get([partyId]);
      if (partyEntry.value) {
        const party = partyEntry.value as any;
        suppliers.push({
          ...party,
          display_name: getDisplayName(party),
          supplier_data: party.context_data?.supplier || {},
        });
      }
    }

    // Ordenar por rating (más alto primero)
    suppliers.sort((a: any, b: any) => {
      const aRating = a.supplier_data?.rating || 0;
      const bRating = b.supplier_data?.rating || 0;
      return bRating - aRating;
    });

    suppliers = suppliers.slice(0, limit);

    return c.json({
      suppliers,
      total: suppliers.length,
    });
  } catch (error) {
    console.log("Error listing suppliers:", error);
    return c.json({ error: "Error listing suppliers" }, 500);
  }
});

// ============================================
// ESTADÍSTICAS
// ============================================

// Stats de una party
app.get("/make-server-0dd48dc4/parties/:id/stats", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "Party not found" }, 404);
    }

    const party = entry.value as any;
    const stats: any = {
      id: party.id,
      display_name: getDisplayName(party),
      type: party.type,
      roles: party.roles || [],
      created_at: party.created_at,
    };

    // Agregar stats por rol
    for (const role of party.roles || []) {
      const roleKey = role.toLowerCase();
      const contextData = party.context_data?.[roleKey] || {};

      if (role === "CUSTOMER") {
        stats.customer = {
          total_orders: contextData.total_orders || 0,
          total_spent: contextData.total_spent || 0,
          average_order_value: contextData.average_order_value || 0,
          loyalty_points: contextData.loyalty_points || 0,
          loyalty_tier: contextData.loyalty_tier || "BRONZE",
          last_order_date: contextData.last_order_date || null,
        };
      } else if (role === "SUPPLIER") {
        stats.supplier = {
          rating: contextData.rating || 0,
          total_orders: contextData.total_orders || 0,
          total_purchased: contextData.total_purchased || 0,
          lead_time_days: contextData.lead_time_days || 0,
          preferred: contextData.preferred || false,
          last_order_date: contextData.last_order_date || null,
        };
      }
    }

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting stats:", error);
    return c.json({ error: "Error getting stats" }, 500);
  }
});

// Dashboard general
app.get("/make-server-0dd48dc4/parties/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    // Obtener todas las parties del entity
    const entityPrefix = ["parties_by_entity", entity_id];
    const entries = kv.list({ prefix: entityPrefix });
    
    let parties = [];
    for await (const entry of entries) {
      const partyId = entry.key[entry.key.length - 1];
      const partyEntry = await kv.get([partyId]);
      if (partyEntry.value) {
        parties.push(partyEntry.value);
      }
    }

    // Calcular estadísticas
    const totalParties = parties.length;
    const totalPersons = parties.filter((p: any) => p.type === "PERSON").length;
    const totalOrganizations = parties.filter((p: any) => p.type === "ORGANIZATION").length;

    const totalCustomers = parties.filter((p: any) => p.roles?.includes("CUSTOMER")).length;
    const totalSuppliers = parties.filter((p: any) => p.roles?.includes("SUPPLIER")).length;
    const totalEmployees = parties.filter((p: any) => p.roles?.includes("EMPLOYEE")).length;

    // Parties con múltiples roles
    const multiRoleParties = parties.filter((p: any) => (p.roles?.length || 0) > 1).length;

    // Total gastado por clientes
    const totalRevenue = parties.reduce((sum: number, p: any) => {
      return sum + (p.context_data?.customer?.total_spent || 0);
    }, 0);

    // Total comprado a proveedores
    const totalPurchased = parties.reduce((sum: number, p: any) => {
      return sum + (p.context_data?.supplier?.total_purchased || 0);
    }, 0);

    // Top 5 clientes
    const topCustomers = parties
      .filter((p: any) => p.roles?.includes("CUSTOMER"))
      .sort((a: any, b: any) => {
        const aSpent = a.context_data?.customer?.total_spent || 0;
        const bSpent = b.context_data?.customer?.total_spent || 0;
        return bSpent - aSpent;
      })
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        name: getDisplayName(p),
        total_spent: p.context_data?.customer?.total_spent || 0,
        total_orders: p.context_data?.customer?.total_orders || 0,
      }));

    // Top 5 proveedores
    const topSuppliers = parties
      .filter((p: any) => p.roles?.includes("SUPPLIER"))
      .sort((a: any, b: any) => {
        const aRating = a.context_data?.supplier?.rating || 0;
        const bRating = b.context_data?.supplier?.rating || 0;
        return bRating - aRating;
      })
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        name: getDisplayName(p),
        rating: p.context_data?.supplier?.rating || 0,
        total_orders: p.context_data?.supplier?.total_orders || 0,
      }));

    return c.json({
      dashboard: {
        total_parties: totalParties,
        total_persons: totalPersons,
        total_organizations: totalOrganizations,
        total_customers: totalCustomers,
        total_suppliers: totalSuppliers,
        total_employees: totalEmployees,
        multi_role_parties: multiRoleParties,
        total_revenue: totalRevenue,
        total_purchased: totalPurchased,
        top_customers: topCustomers,
        top_suppliers: topSuppliers,
      },
    });
  } catch (error) {
    console.log("Error getting dashboard:", error);
    return c.json({ error: "Error getting dashboard" }, 500);
  }
});

export default app;
