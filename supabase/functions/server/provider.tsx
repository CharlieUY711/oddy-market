import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// PROVIDERS - Gestión Avanzada de Proveedores
// ==========================================

// Create provider
app.post("/make-server-0dd48dc4/providers", async (c) => {
  try {
    const provider = await c.req.json();
    const id = provider.id || `provider:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newProvider = {
      ...provider,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: provider.status || "active", // active, inactive, blacklisted
      rating: provider.rating || 0,
      payment_terms: provider.payment_terms || { days: 30, type: "net" },
      delivery_terms: provider.delivery_terms || {},
      certifications: provider.certifications || [],
      performance: {
        on_time_delivery_rate: 0,
        quality_score: 0,
        total_orders: 0,
        total_spent: 0,
      },
    };

    await kv.set(id, newProvider);
    return c.json({ provider: newProvider });
  } catch (error) {
    return c.json({ error: "Error creating provider" }, 500);
  }
});

// Get providers
app.get("/make-server-0dd48dc4/providers", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const providers = [];

    for await (const entry of kv.list({ prefix: "provider:" })) {
      const provider = entry.value as any;
      if (provider.entity_id === entity_id) {
        if (status && provider.status !== status) continue;
        providers.push(provider);
      }
    }

    return c.json({ providers, total: providers.length });
  } catch (error) {
    return c.json({ error: "Error fetching providers" }, 500);
  }
});

// Rate provider
app.post("/make-server-0dd48dc4/providers/:id/rate", async (c) => {
  try {
    const id = c.req.param("id");
    const { rating, comment } = await c.req.json();
    const provider = await kv.get(id);

    if (!provider.value) {
      return c.json({ error: "Provider not found" }, 404);
    }

    provider.value.rating = rating;
    provider.value.last_rating = {
      rating,
      comment,
      date: new Date().toISOString(),
    };
    provider.value.updated_at = new Date().toISOString();

    await kv.set(id, provider.value);
    return c.json({ provider: provider.value });
  } catch (error) {
    return c.json({ error: "Error rating provider" }, 500);
  }
});

// ==========================================
// PURCHASE ORDERS - Órdenes de Compra
// ==========================================

// Create purchase order
app.post("/make-server-0dd48dc4/providers/purchase-orders", async (c) => {
  try {
    const po = await c.req.json();
    const id = po.id || `po:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newPO = {
      ...po,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      po_number: `PO-${Date.now()}`,
      status: po.status || "pending", // pending, approved, sent, received, cancelled
      expected_delivery_date: po.expected_delivery_date || null,
      actual_delivery_date: null,
      items: po.items || [],
      totals: this.calculatePOTotals(po.items || []),
    };

    await kv.set(id, newPO);
    return c.json({ purchase_order: newPO });
  } catch (error) {
    return c.json({ error: "Error creating purchase order" }, 500);
  }
});

// Helper: Calculate PO totals
function calculatePOTotals(items: any[]): any {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const tax = subtotal * 0.22; // Default 22%
  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

// Get purchase orders
app.get("/make-server-0dd48dc4/providers/purchase-orders", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const provider_id = c.req.query("provider_id");
    const status = c.req.query("status");
    const pos = [];

    for await (const entry of kv.list({ prefix: "po:" })) {
      const po = entry.value as any;
      if (po.entity_id === entity_id) {
        if (provider_id && po.provider_id !== provider_id) continue;
        if (status && po.status !== status) continue;
        pos.push(po);
      }
    }

    return c.json({ purchase_orders: pos, total: pos.length });
  } catch (error) {
    return c.json({ error: "Error fetching purchase orders" }, 500);
  }
});

// Receive purchase order
app.post("/make-server-0dd48dc4/providers/purchase-orders/:id/receive", async (c) => {
  try {
    const id = c.req.param("id");
    const { items_received } = await c.req.json();
    const po = await kv.get(id);

    if (!po.value) {
      return c.json({ error: "Purchase order not found" }, 404);
    }

    po.value.status = "received";
    po.value.actual_delivery_date = new Date().toISOString();
    po.value.items_received = items_received;
    po.value.updated_at = new Date().toISOString();

    await kv.set(id, po.value);

    // Update provider performance
    await this.updateProviderPerformance(po.value.provider_id, po.value);

    return c.json({ purchase_order: po.value });
  } catch (error) {
    return c.json({ error: "Error receiving purchase order" }, 500);
  }
});

// Helper: Update provider performance
async function updateProviderPerformance(provider_id: string, po: any) {
  const provider = await kv.get(provider_id);
  if (provider.value) {
    provider.value.performance.total_orders = (provider.value.performance.total_orders || 0) + 1;
    provider.value.performance.total_spent = (provider.value.performance.total_spent || 0) + (po.totals?.total || 0);
    
    // Calculate on-time delivery
    if (po.expected_delivery_date && po.actual_delivery_date) {
      const expected = new Date(po.expected_delivery_date);
      const actual = new Date(po.actual_delivery_date);
      const onTime = actual <= expected;
      
      const currentRate = provider.value.performance.on_time_delivery_rate || 0;
      const totalOrders = provider.value.performance.total_orders;
      provider.value.performance.on_time_delivery_rate = 
        ((currentRate * (totalOrders - 1)) + (onTime ? 100 : 0)) / totalOrders;
    }

    await kv.set(provider_id, provider.value);
  }
}

// ==========================================
// CONTRACTS - Contratos con Proveedores
// ==========================================

// Create contract
app.post("/make-server-0dd48dc4/providers/contracts", async (c) => {
  try {
    const contract = await c.req.json();
    const id = contract.id || `contract:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newContract = {
      ...contract,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: contract.status || "draft", // draft, active, expired, terminated
      start_date: contract.start_date || null,
      end_date: contract.end_date || null,
      terms: contract.terms || {},
      attachments: contract.attachments || [],
    };

    await kv.set(id, newContract);
    return c.json({ contract: newContract });
  } catch (error) {
    return c.json({ error: "Error creating contract" }, 500);
  }
});

// Get contracts
app.get("/make-server-0dd48dc4/providers/contracts", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const provider_id = c.req.query("provider_id");
    const status = c.req.query("status");
    const contracts = [];

    for await (const entry of kv.list({ prefix: "contract:" })) {
      const contract = entry.value as any;
      if (contract.entity_id === entity_id) {
        if (provider_id && contract.provider_id !== provider_id) continue;
        if (status && contract.status !== status) continue;
        contracts.push(contract);
      }
    }

    return c.json({ contracts, total: contracts.length });
  } catch (error) {
    return c.json({ error: "Error fetching contracts" }, 500);
  }
});

// ==========================================
// RFQ - Request for Quotation
// ==========================================

// Create RFQ
app.post("/make-server-0dd48dc4/providers/rfq", async (c) => {
  try {
    const rfq = await c.req.json();
    const id = rfq.id || `rfq:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newRFQ = {
      ...rfq,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: rfq.status || "open", // open, closed, awarded
      deadline: rfq.deadline || null,
      items: rfq.items || [],
      responses: [],
    };

    await kv.set(id, newRFQ);
    return c.json({ rfq: newRFQ });
  } catch (error) {
    return c.json({ error: "Error creating RFQ" }, 500);
  }
});

// Submit RFQ response
app.post("/make-server-0dd48dc4/providers/rfq/:id/respond", async (c) => {
  try {
    const rfq_id = c.req.param("id");
    const response = await c.req.json();
    const rfq = await kv.get(rfq_id);

    if (!rfq.value) {
      return c.json({ error: "RFQ not found" }, 404);
    }

    const newResponse = {
      id: `rfq_response:${Date.now()}`,
      provider_id: response.provider_id,
      items: response.items,
      total_quote: response.total_quote,
      delivery_time: response.delivery_time,
      notes: response.notes,
      submitted_at: new Date().toISOString(),
    };

    rfq.value.responses = rfq.value.responses || [];
    rfq.value.responses.push(newResponse);
    rfq.value.updated_at = new Date().toISOString();

    await kv.set(rfq_id, rfq.value);
    return c.json({ rfq: rfq.value, response: newResponse });
  } catch (error) {
    return c.json({ error: "Error submitting RFQ response" }, 500);
  }
});

// ==========================================
// ANALYTICS - Análisis de Proveedores
// ==========================================

// Get provider performance
app.get("/make-server-0dd48dc4/providers/:id/performance", async (c) => {
  try {
    const id = c.req.param("id");
    const provider = await kv.get(id);

    if (!provider.value) {
      return c.json({ error: "Provider not found" }, 404);
    }

    // Get purchase orders for this provider
    const pos = [];
    for await (const entry of kv.list({ prefix: "po:" })) {
      const po = entry.value as any;
      if (po.provider_id === id) pos.push(po);
    }

    const performance = {
      provider_id: id,
      provider_name: provider.value.name,
      stats: provider.value.performance,
      recent_orders: pos.slice(-10),
      on_time_deliveries: pos.filter((po) => {
        if (!po.expected_delivery_date || !po.actual_delivery_date) return false;
        return new Date(po.actual_delivery_date) <= new Date(po.expected_delivery_date);
      }).length,
      total_orders: pos.length,
    };

    return c.json({ performance });
  } catch (error) {
    return c.json({ error: "Error fetching provider performance" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/providers/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const providers = [];
    const pos = [];
    const contracts = [];

    for await (const entry of kv.list({ prefix: "provider:" })) {
      const provider = entry.value as any;
      if (provider.entity_id === entity_id) providers.push(provider);
    }

    for await (const entry of kv.list({ prefix: "po:" })) {
      const po = entry.value as any;
      if (po.entity_id === entity_id) pos.push(po);
    }

    for await (const entry of kv.list({ prefix: "contract:" })) {
      const contract = entry.value as any;
      if (contract.entity_id === entity_id) contracts.push(contract);
    }

    const dashboard = {
      entity_id,
      providers: {
        total: providers.length,
        active: providers.filter((p) => p.status === "active").length,
      },
      purchase_orders: {
        total: pos.length,
        pending: pos.filter((p) => p.status === "pending").length,
        received: pos.filter((p) => p.status === "received").length,
      },
      contracts: {
        total: contracts.length,
        active: contracts.filter((c) => c.status === "active").length,
      },
      spend: {
        total: pos.reduce((sum, p) => sum + (p.totals?.total || 0), 0),
      },
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching providers dashboard" }, 500);
  }
});

export default app;
