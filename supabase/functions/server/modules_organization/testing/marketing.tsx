import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// CAMPAIGNS - Campañas de Marketing
// ==========================================

// Create marketing campaign
app.post("/make-server-0dd48dc4/marketing/campaigns", async (c) => {
  try {
    const campaign = await c.req.json();
    const id = campaign.id || `marketing_campaign:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newCampaign = {
      ...campaign,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: campaign.status || "draft", // draft, active, paused, completed, archived
      type: campaign.type || "multi_channel", // email, social, sms, multi_channel
      objective: campaign.objective || "awareness", // awareness, engagement, conversion, retention
      budget: campaign.budget || { amount: 0, currency: "USD", spent: 0 },
      duration: {
        start_date: campaign.start_date || null,
        end_date: campaign.end_date || null,
      },
      channels: campaign.channels || [], // email, facebook, instagram, google_ads, sms
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        roi: 0,
        ctr: 0,
        cpc: 0,
        cpa: 0,
      },
    };

    await kv.set(id, newCampaign);
    return c.json({ campaign: newCampaign });
  } catch (error) {
    console.log("Error creating marketing campaign:", error);
    return c.json({ error: "Error creating marketing campaign" }, 500);
  }
});

// Get all marketing campaigns
app.get("/make-server-0dd48dc4/marketing/campaigns", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const type = c.req.query("type");
    const campaigns = [];

    for await (const entry of kv.list({ prefix: "marketing_campaign:" })) {
      const campaign = entry.value as any;
      if (campaign.entity_id === entity_id) {
        if (status && campaign.status !== status) continue;
        if (type && campaign.type !== type) continue;
        campaigns.push(campaign);
      }
    }

    return c.json({ campaigns, total: campaigns.length });
  } catch (error) {
    console.log("Error fetching marketing campaigns:", error);
    return c.json({ error: "Error fetching marketing campaigns" }, 500);
  }
});

// Update campaign metrics
app.patch("/make-server-0dd48dc4/marketing/campaigns/:id/metrics", async (c) => {
  try {
    const id = c.req.param("id");
    const metrics = await c.req.json();
    const campaign = await kv.get(id);

    if (!campaign.value) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    const updatedCampaign = {
      ...campaign.value,
      metrics: { ...campaign.value.metrics, ...metrics },
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedCampaign);
    return c.json({ campaign: updatedCampaign });
  } catch (error) {
    console.log("Error updating campaign metrics:", error);
    return c.json({ error: "Error updating campaign metrics" }, 500);
  }
});

// ==========================================
// SEGMENTS - Segmentación de Audiencias
// ==========================================

// Create segment
app.post("/make-server-0dd48dc4/marketing/segments", async (c) => {
  try {
    const segment = await c.req.json();
    const id = segment.id || `segment:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newSegment = {
      ...segment,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      type: segment.type || "dynamic", // static, dynamic
      conditions: segment.conditions || [], // Array of filtering conditions
      contacts_count: 0,
      last_calculated_at: null,
    };

    await kv.set(id, newSegment);
    return c.json({ segment: newSegment });
  } catch (error) {
    console.log("Error creating segment:", error);
    return c.json({ error: "Error creating segment" }, 500);
  }
});

// Get all segments
app.get("/make-server-0dd48dc4/marketing/segments", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const segments = [];

    for await (const entry of kv.list({ prefix: "segment:" })) {
      const segment = entry.value as any;
      if (segment.entity_id === entity_id) {
        segments.push(segment);
      }
    }

    return c.json({ segments, total: segments.length });
  } catch (error) {
    console.log("Error fetching segments:", error);
    return c.json({ error: "Error fetching segments" }, 500);
  }
});

// Calculate segment contacts
app.post("/make-server-0dd48dc4/marketing/segments/:id/calculate", async (c) => {
  try {
    const id = c.req.param("id");
    const segment = await kv.get(id);

    if (!segment.value) {
      return c.json({ error: "Segment not found" }, 404);
    }

    // Get all contacts
    const contacts = [];
    for await (const entry of kv.list({ prefix: "contact:" })) {
      const contact = entry.value as any;
      if (contact.entity_id === segment.value.entity_id) {
        // Apply segment conditions
        if (this.matchesConditions(contact, segment.value.conditions)) {
          contacts.push(contact);
        }
      }
    }

    const updatedSegment = {
      ...segment.value,
      contacts_count: contacts.length,
      last_calculated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedSegment);
    return c.json({ segment: updatedSegment, contacts });
  } catch (error) {
    console.log("Error calculating segment:", error);
    return c.json({ error: "Error calculating segment" }, 500);
  }
});

// Helper: Match segment conditions
function matchesConditions(contact: any, conditions: any[]): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => {
    const { field, operator, value } = condition;
    const contactValue = contact[field] || contact.custom_fields?.[field];

    switch (operator) {
      case "equals":
        return contactValue === value;
      case "not_equals":
        return contactValue !== value;
      case "contains":
        return String(contactValue).includes(value);
      case "greater_than":
        return Number(contactValue) > Number(value);
      case "less_than":
        return Number(contactValue) < Number(value);
      case "in":
        return Array.isArray(value) && value.includes(contactValue);
      default:
        return false;
    }
  });
}

// ==========================================
// AB TESTS - Pruebas A/B
// ==========================================

// Create A/B test
app.post("/make-server-0dd48dc4/marketing/ab-tests", async (c) => {
  try {
    const test = await c.req.json();
    const id = test.id || `ab_test:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTest = {
      ...test,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: test.status || "draft", // draft, running, completed, paused
      variants: test.variants || [
        { id: "A", name: "Control", allocation: 50, metrics: { conversions: 0, clicks: 0, impressions: 0 } },
        { id: "B", name: "Variant", allocation: 50, metrics: { conversions: 0, clicks: 0, impressions: 0 } },
      ],
      winner: null,
      confidence: 0,
      sample_size: test.sample_size || 1000,
      started_at: null,
      completed_at: null,
    };

    await kv.set(id, newTest);
    return c.json({ test: newTest });
  } catch (error) {
    console.log("Error creating A/B test:", error);
    return c.json({ error: "Error creating A/B test" }, 500);
  }
});

// Get all A/B tests
app.get("/make-server-0dd48dc4/marketing/ab-tests", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const tests = [];

    for await (const entry of kv.list({ prefix: "ab_test:" })) {
      const test = entry.value as any;
      if (test.entity_id === entity_id) {
        if (status && test.status !== status) continue;
        tests.push(test);
      }
    }

    return c.json({ tests, total: tests.length });
  } catch (error) {
    console.log("Error fetching A/B tests:", error);
    return c.json({ error: "Error fetching A/B tests" }, 500);
  }
});

// Record A/B test event
app.post("/make-server-0dd48dc4/marketing/ab-tests/:id/event", async (c) => {
  try {
    const id = c.req.param("id");
    const { variant_id, event_type } = await c.req.json(); // event_type: impression, click, conversion
    const test = await kv.get(id);

    if (!test.value) {
      return c.json({ error: "A/B test not found" }, 404);
    }

    const variant = test.value.variants.find((v: any) => v.id === variant_id);
    if (!variant) {
      return c.json({ error: "Variant not found" }, 404);
    }

    variant.metrics[event_type + "s"] = (variant.metrics[event_type + "s"] || 0) + 1;

    await kv.set(id, test.value);
    return c.json({ message: "Event recorded successfully", test: test.value });
  } catch (error) {
    console.log("Error recording A/B test event:", error);
    return c.json({ error: "Error recording A/B test event" }, 500);
  }
});

// Calculate A/B test winner
app.post("/make-server-0dd48dc4/marketing/ab-tests/:id/calculate-winner", async (c) => {
  try {
    const id = c.req.param("id");
    const test = await kv.get(id);

    if (!test.value) {
      return c.json({ error: "A/B test not found" }, 404);
    }

    // Simple winner calculation based on conversion rate
    const variants = test.value.variants.map((v: any) => ({
      ...v,
      conversion_rate: v.metrics.impressions > 0 ? v.metrics.conversions / v.metrics.impressions : 0,
    }));

    const winner = variants.reduce((prev: any, current: any) =>
      current.conversion_rate > prev.conversion_rate ? current : prev
    );

    const updatedTest = {
      ...test.value,
      winner: winner.id,
      confidence: this.calculateConfidence(variants),
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedTest);
    return c.json({ test: updatedTest, winner });
  } catch (error) {
    console.log("Error calculating A/B test winner:", error);
    return c.json({ error: "Error calculating A/B test winner" }, 500);
  }
});

// Helper: Calculate statistical confidence (simplified)
function calculateConfidence(variants: any[]): number {
  if (variants.length !== 2) return 0;
  const [a, b] = variants;
  if (a.metrics.impressions < 100 || b.metrics.impressions < 100) return 0;
  // Simplified confidence calculation (in production, use proper statistical test)
  const diff = Math.abs(a.conversion_rate - b.conversion_rate);
  return Math.min(diff * 100, 95);
}

// ==========================================
// FUNNELS - Embudos de Conversión
// ==========================================

// Create funnel
app.post("/make-server-0dd48dc4/marketing/funnels", async (c) => {
  try {
    const funnel = await c.req.json();
    const id = funnel.id || `funnel:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newFunnel = {
      ...funnel,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      steps: funnel.steps || [],
      stats: funnel.steps.map((step: any) => ({
        step_id: step.id,
        step_name: step.name,
        visitors: 0,
        conversion_rate: 0,
        drop_off_rate: 0,
      })),
    };

    await kv.set(id, newFunnel);
    return c.json({ funnel: newFunnel });
  } catch (error) {
    console.log("Error creating funnel:", error);
    return c.json({ error: "Error creating funnel" }, 500);
  }
});

// Get all funnels
app.get("/make-server-0dd48dc4/marketing/funnels", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const funnels = [];

    for await (const entry of kv.list({ prefix: "funnel:" })) {
      const funnel = entry.value as any;
      if (funnel.entity_id === entity_id) {
        funnels.push(funnel);
      }
    }

    return c.json({ funnels, total: funnels.length });
  } catch (error) {
    console.log("Error fetching funnels:", error);
    return c.json({ error: "Error fetching funnels" }, 500);
  }
});

// Track funnel step
app.post("/make-server-0dd48dc4/marketing/funnels/:id/track", async (c) => {
  try {
    const id = c.req.param("id");
    const { step_id, user_id } = await c.req.json();
    const funnel = await kv.get(id);

    if (!funnel.value) {
      return c.json({ error: "Funnel not found" }, 404);
    }

    // Record step visit
    const track_id = `funnel_track:${id}:${user_id}:${step_id}:${Date.now()}`;
    await kv.set(track_id, {
      funnel_id: id,
      step_id,
      user_id,
      timestamp: new Date().toISOString(),
    });

    return c.json({ message: "Funnel step tracked successfully" });
  } catch (error) {
    console.log("Error tracking funnel step:", error);
    return c.json({ error: "Error tracking funnel step" }, 500);
  }
});

// ==========================================
// ANALYTICS - Análisis Avanzado
// ==========================================

// Get campaign performance
app.get("/make-server-0dd48dc4/marketing/analytics/performance", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const start_date = c.req.query("start_date");
    const end_date = c.req.query("end_date");

    const campaigns = [];
    for await (const entry of kv.list({ prefix: "marketing_campaign:" })) {
      const campaign = entry.value as any;
      if (campaign.entity_id === entity_id) {
        // Filter by date range if provided
        if (start_date && end_date) {
          const campaignStart = new Date(campaign.duration.start_date);
          if (campaignStart < new Date(start_date) || campaignStart > new Date(end_date)) continue;
        }
        campaigns.push(campaign);
      }
    }

    const performance = {
      total_campaigns: campaigns.length,
      active_campaigns: campaigns.filter((c) => c.status === "active").length,
      total_budget: campaigns.reduce((sum, c) => sum + (c.budget?.amount || 0), 0),
      total_spent: campaigns.reduce((sum, c) => sum + (c.budget?.spent || 0), 0),
      total_impressions: campaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0),
      total_clicks: campaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0),
      total_conversions: campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0),
      total_revenue: campaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0),
      average_ctr: campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + (c.metrics?.ctr || 0), 0) / campaigns.length
        : 0,
      average_roi: campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + (c.metrics?.roi || 0), 0) / campaigns.length
        : 0,
    };

    return c.json({ performance, campaigns });
  } catch (error) {
    console.log("Error fetching performance analytics:", error);
    return c.json({ error: "Error fetching performance analytics" }, 500);
  }
});

// Get channel comparison
app.get("/make-server-0dd48dc4/marketing/analytics/channels", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const campaigns = [];
    for await (const entry of kv.list({ prefix: "marketing_campaign:" })) {
      const campaign = entry.value as any;
      if (campaign.entity_id === entity_id) campaigns.push(campaign);
    }

    const channels = ["email", "facebook", "instagram", "google_ads", "sms"];
    const channelStats = channels.map((channel) => {
      const channelCampaigns = campaigns.filter((c) => c.channels?.includes(channel));
      return {
        channel,
        campaigns: channelCampaigns.length,
        impressions: channelCampaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0),
        clicks: channelCampaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0),
        conversions: channelCampaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0),
        revenue: channelCampaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0),
        spent: channelCampaigns.reduce((sum, c) => sum + (c.budget?.spent || 0), 0),
      };
    });

    return c.json({ channels: channelStats });
  } catch (error) {
    console.log("Error fetching channel analytics:", error);
    return c.json({ error: "Error fetching channel analytics" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/marketing/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const campaigns = [];
    const segments = [];
    const abTests = [];

    for await (const entry of kv.list({ prefix: "marketing_campaign:" })) {
      const campaign = entry.value as any;
      if (campaign.entity_id === entity_id) campaigns.push(campaign);
    }

    for await (const entry of kv.list({ prefix: "segment:" })) {
      const segment = entry.value as any;
      if (segment.entity_id === entity_id) segments.push(segment);
    }

    for await (const entry of kv.list({ prefix: "ab_test:" })) {
      const test = entry.value as any;
      if (test.entity_id === entity_id) abTests.push(test);
    }

    const dashboard = {
      entity_id,
      campaigns: {
        total: campaigns.length,
        active: campaigns.filter((c) => c.status === "active").length,
        draft: campaigns.filter((c) => c.status === "draft").length,
        completed: campaigns.filter((c) => c.status === "completed").length,
      },
      segments: {
        total: segments.length,
        total_contacts: segments.reduce((sum, s) => sum + s.contacts_count, 0),
      },
      ab_tests: {
        total: abTests.length,
        running: abTests.filter((t) => t.status === "running").length,
        completed: abTests.filter((t) => t.status === "completed").length,
      },
      metrics: {
        total_impressions: campaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0),
        total_clicks: campaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0),
        total_conversions: campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0),
        total_revenue: campaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0),
      },
    };

    return c.json({ dashboard });
  } catch (error) {
    console.log("Error fetching marketing dashboard:", error);
    return c.json({ error: "Error fetching marketing dashboard" }, 500);
  }
});

export default app;
