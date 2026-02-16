import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// LEADS - Gestión de Leads
// ==========================================

// Create lead
app.post("/make-server-0dd48dc4/crm/leads", async (c) => {
  try {
    const lead = await c.req.json();
    const id = lead.id || `lead:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newLead = {
      ...lead,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: lead.status || "new", // new, contacted, qualified, unqualified
      score: lead.score || 0,
      source: lead.source || "manual", // manual, website, referral, social, ads
      assigned_to: lead.assigned_to || null,
      activities: [],
      tags: lead.tags || [],
    };

    await kv.set(id, newLead);
    return c.json({ lead: newLead });
  } catch (error) {
    return c.json({ error: "Error creating lead" }, 500);
  }
});

// Get leads
app.get("/make-server-0dd48dc4/crm/leads", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const assigned_to = c.req.query("assigned_to");
    const leads = [];

    for await (const entry of kv.list({ prefix: "lead:" })) {
      const lead = entry.value as any;
      if (lead.entity_id === entity_id) {
        if (status && lead.status !== status) continue;
        if (assigned_to && lead.assigned_to !== assigned_to) continue;
        leads.push(lead);
      }
    }

    return c.json({ leads, total: leads.length });
  } catch (error) {
    return c.json({ error: "Error fetching leads" }, 500);
  }
});

// Convert lead to customer
app.post("/make-server-0dd48dc4/crm/leads/:id/convert", async (c) => {
  try {
    const id = c.req.param("id");
    const lead = await kv.get(id);

    if (!lead.value) {
      return c.json({ error: "Lead not found" }, 404);
    }

    // Create customer from lead (party)
    const customer_id = `party:${Date.now()}`;
    const customer = {
      id: customer_id,
      entity_id: lead.value.entity_id,
      type: "person",
      person_data: {
        first_name: lead.value.first_name,
        last_name: lead.value.last_name,
      },
      contact: {
        email: lead.value.email,
        phone: lead.value.phone,
      },
      roles: ["customer"],
      created_at: new Date().toISOString(),
      converted_from_lead: id,
    };

    await kv.set(customer_id, customer);

    // Update lead
    const updatedLead = {
      ...lead.value,
      status: "converted",
      converted_to: customer_id,
      converted_at: new Date().toISOString(),
    };
    await kv.set(id, updatedLead);

    return c.json({ lead: updatedLead, customer });
  } catch (error) {
    return c.json({ error: "Error converting lead" }, 500);
  }
});

// ==========================================
// DEALS - Oportunidades de Venta
// ==========================================

// Create deal
app.post("/make-server-0dd48dc4/crm/deals", async (c) => {
  try {
    const deal = await c.req.json();
    const id = deal.id || `deal:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newDeal = {
      ...deal,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      stage: deal.stage || "prospecting", // prospecting, qualification, proposal, negotiation, closed_won, closed_lost
      value: deal.value || 0,
      currency: deal.currency || "USD",
      probability: deal.probability || 10,
      expected_close_date: deal.expected_close_date || null,
      assigned_to: deal.assigned_to || null,
      activities: [],
    };

    await kv.set(id, newDeal);
    return c.json({ deal: newDeal });
  } catch (error) {
    return c.json({ error: "Error creating deal" }, 500);
  }
});

// Get deals
app.get("/make-server-0dd48dc4/crm/deals", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const stage = c.req.query("stage");
    const deals = [];

    for await (const entry of kv.list({ prefix: "deal:" })) {
      const deal = entry.value as any;
      if (deal.entity_id === entity_id) {
        if (stage && deal.stage !== stage) continue;
        deals.push(deal);
      }
    }

    return c.json({ deals, total: deals.length });
  } catch (error) {
    return c.json({ error: "Error fetching deals" }, 500);
  }
});

// Update deal stage
app.patch("/make-server-0dd48dc4/crm/deals/:id/stage", async (c) => {
  try {
    const id = c.req.param("id");
    const { stage, probability } = await c.req.json();
    const deal = await kv.get(id);

    if (!deal.value) {
      return c.json({ error: "Deal not found" }, 404);
    }

    const updatedDeal = {
      ...deal.value,
      stage,
      probability: probability || deal.value.probability,
      updated_at: new Date().toISOString(),
    };

    if (stage === "closed_won") {
      updatedDeal.closed_at = new Date().toISOString();
      updatedDeal.won = true;
    } else if (stage === "closed_lost") {
      updatedDeal.closed_at = new Date().toISOString();
      updatedDeal.won = false;
    }

    await kv.set(id, updatedDeal);
    return c.json({ deal: updatedDeal });
  } catch (error) {
    return c.json({ error: "Error updating deal stage" }, 500);
  }
});

// ==========================================
// ACTIVITIES - Actividades y Seguimiento
// ==========================================

// Create activity
app.post("/make-server-0dd48dc4/crm/activities", async (c) => {
  try {
    const activity = await c.req.json();
    const id = activity.id || `activity:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newActivity = {
      ...activity,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      type: activity.type || "note", // call, email, meeting, task, note
      related_to: activity.related_to || null, // lead_id or deal_id
      completed: activity.completed || false,
      due_date: activity.due_date || null,
    };

    await kv.set(id, newActivity);
    return c.json({ activity: newActivity });
  } catch (error) {
    return c.json({ error: "Error creating activity" }, 500);
  }
});

// Get activities
app.get("/make-server-0dd48dc4/crm/activities", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const related_to = c.req.query("related_to");
    const type = c.req.query("type");
    const activities = [];

    for await (const entry of kv.list({ prefix: "activity:" })) {
      const activity = entry.value as any;
      if (activity.entity_id === entity_id) {
        if (related_to && activity.related_to !== related_to) continue;
        if (type && activity.type !== type) continue;
        activities.push(activity);
      }
    }

    return c.json({ activities, total: activities.length });
  } catch (error) {
    return c.json({ error: "Error fetching activities" }, 500);
  }
});

// ==========================================
// PIPELINE - Embudo de Ventas
// ==========================================

// Get pipeline view
app.get("/make-server-0dd48dc4/crm/pipeline", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const deals = [];

    for await (const entry of kv.list({ prefix: "deal:" })) {
      const deal = entry.value as any;
      if (deal.entity_id === entity_id) deals.push(deal);
    }

    const stages = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
    const pipeline = stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      return {
        stage,
        deals_count: stageDeals.length,
        total_value: stageDeals.reduce((sum, d) => sum + d.value, 0),
        deals: stageDeals,
      };
    });

    return c.json({ pipeline });
  } catch (error) {
    return c.json({ error: "Error fetching pipeline" }, 500);
  }
});

// ==========================================
// DASHBOARD - Dashboard CRM
// ==========================================

app.get("/make-server-0dd48dc4/crm/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const leads = [];
    const deals = [];

    for await (const entry of kv.list({ prefix: "lead:" })) {
      const lead = entry.value as any;
      if (lead.entity_id === entity_id) leads.push(lead);
    }

    for await (const entry of kv.list({ prefix: "deal:" })) {
      const deal = entry.value as any;
      if (deal.entity_id === entity_id) deals.push(deal);
    }

    const dashboard = {
      entity_id,
      leads: {
        total: leads.length,
        new: leads.filter((l) => l.status === "new").length,
        qualified: leads.filter((l) => l.status === "qualified").length,
        converted: leads.filter((l) => l.status === "converted").length,
      },
      deals: {
        total: deals.length,
        active: deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage)).length,
        won: deals.filter((d) => d.stage === "closed_won").length,
        lost: deals.filter((d) => d.stage === "closed_lost").length,
        total_value: deals.reduce((sum, d) => sum + d.value, 0),
        won_value: deals.filter((d) => d.stage === "closed_won").reduce((sum, d) => sum + d.value, 0),
      },
      conversion_rate: leads.length > 0
        ? (leads.filter((l) => l.status === "converted").length / leads.length) * 100
        : 0,
      win_rate: deals.length > 0
        ? (deals.filter((d) => d.stage === "closed_won").length / deals.length) * 100
        : 0,
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching CRM dashboard" }, 500);
  }
});

export default app;
