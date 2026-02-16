import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// EVENTS - Tracking de Eventos
// ==========================================

// Track event
app.post("/make-server-0dd48dc4/analytics/events", async (c) => {
  try {
    const event = await c.req.json();
    const id = event.id || `event:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newEvent = {
      ...event,
      id,
      timestamp,
      event_name: event.event_name, // page_view, click, purchase, signup, etc.
      user_id: event.user_id || null,
      session_id: event.session_id || null,
      properties: event.properties || {},
      context: {
        ip: c.req.header("x-forwarded-for") || "unknown",
        user_agent: c.req.header("user-agent") || "unknown",
        referrer: event.referrer || null,
        url: event.url || null,
      },
    };

    await kv.set(id, newEvent);
    return c.json({ event: newEvent });
  } catch (error) {
    return c.json({ error: "Error tracking event" }, 500);
  }
});

// Get events
app.get("/make-server-0dd48dc4/analytics/events", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const event_name = c.req.query("event_name");
    const user_id = c.req.query("user_id");
    const start_date = c.req.query("start_date");
    const end_date = c.req.query("end_date");
    const events = [];

    for await (const entry of kv.list({ prefix: "event:" })) {
      const event = entry.value as any;
      if (event.entity_id === entity_id) {
        if (event_name && event.event_name !== event_name) continue;
        if (user_id && event.user_id !== user_id) continue;
        if (start_date && end_date) {
          const eventDate = new Date(event.timestamp);
          if (eventDate < new Date(start_date) || eventDate > new Date(end_date)) continue;
        }
        events.push(event);
      }
    }

    return c.json({ events, total: events.length });
  } catch (error) {
    return c.json({ error: "Error fetching events" }, 500);
  }
});

// ==========================================
// METRICS - Métricas y KPIs
// ==========================================

// Get metrics
app.get("/make-server-0dd48dc4/analytics/metrics", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const metric_type = c.req.query("type") || "overview"; // overview, sales, users, engagement

    const events = [];
    const orders = [];
    const users = [];

    for await (const entry of kv.list({ prefix: "event:" })) {
      const event = entry.value as any;
      if (event.entity_id === entity_id) events.push(event);
    }

    for await (const entry of kv.list({ prefix: "order:" })) {
      const order = entry.value as any;
      if (order.entity_id === entity_id) orders.push(order);
    }

    for await (const entry of kv.list({ prefix: "user:" })) {
      const user = entry.value as any;
      if (user.entity_id === entity_id) users.push(user);
    }

    const metrics = {
      overview: {
        total_events: events.length,
        total_users: users.length,
        total_orders: orders.length,
        total_revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      },
      sales: {
        total_revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        average_order_value: orders.length > 0 
          ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length 
          : 0,
        conversion_rate: events.length > 0 
          ? (orders.length / events.filter(e => e.event_name === "page_view").length) * 100 
          : 0,
      },
      users: {
        total: users.length,
        active: users.filter(u => u.status === "active").length,
        new_last_30d: users.filter(u => 
          (Date.now() - new Date(u.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000
        ).length,
      },
      engagement: {
        page_views: events.filter(e => e.event_name === "page_view").length,
        unique_sessions: new Set(events.map(e => e.session_id)).size,
        avg_session_duration: 0, // Would need session data
      },
    };

    return c.json({ metrics: metrics[metric_type] || metrics.overview });
  } catch (error) {
    return c.json({ error: "Error fetching metrics" }, 500);
  }
});

// ==========================================
// FUNNELS - Análisis de Embudos
// ==========================================

// Analyze funnel
app.post("/make-server-0dd48dc4/analytics/funnels/analyze", async (c) => {
  try {
    const { funnel_steps, start_date, end_date } = await c.req.json();
    const events = [];

    for await (const entry of kv.list({ prefix: "event:" })) {
      const event = entry.value as any;
      if (start_date && end_date) {
        const eventDate = new Date(event.timestamp);
        if (eventDate >= new Date(start_date) && eventDate <= new Date(end_date)) {
          events.push(event);
        }
      } else {
        events.push(event);
      }
    }

    const analysis = funnel_steps.map((step: string, index: number) => {
      const stepEvents = events.filter(e => e.event_name === step);
      const uniqueUsers = new Set(stepEvents.map(e => e.user_id)).size;
      
      return {
        step: step,
        step_number: index + 1,
        users: uniqueUsers,
        conversion_rate: index === 0 ? 100 : 
          (uniqueUsers / new Set(events.filter(e => e.event_name === funnel_steps[0]).map(e => e.user_id)).size) * 100,
        drop_off: index === 0 ? 0 : 
          new Set(events.filter(e => e.event_name === funnel_steps[index - 1]).map(e => e.user_id)).size - uniqueUsers,
      };
    });

    return c.json({ funnel_analysis: analysis });
  } catch (error) {
    return c.json({ error: "Error analyzing funnel" }, 500);
  }
});

// ==========================================
// COHORTS - Análisis de Cohortes
// ==========================================

// Get cohort analysis
app.get("/make-server-0dd48dc4/analytics/cohorts", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const users = [];

    for await (const entry of kv.list({ prefix: "user:" })) {
      const user = entry.value as any;
      if (user.entity_id === entity_id) users.push(user);
    }

    // Group users by signup month
    const cohorts = users.reduce((acc: any, user) => {
      const month = new Date(user.created_at).toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) acc[month] = [];
      acc[month].push(user);
      return acc;
    }, {});

    const cohortAnalysis = Object.entries(cohorts).map(([month, users]: any) => ({
      cohort: month,
      size: users.length,
      retention: {
        month_0: users.length,
        month_1: 0, // Would need activity data
        month_3: 0,
        month_6: 0,
      },
    }));

    return c.json({ cohorts: cohortAnalysis });
  } catch (error) {
    return c.json({ error: "Error fetching cohort analysis" }, 500);
  }
});

// ==========================================
// REPORTS - Reportes Personalizados
// ==========================================

// Generate custom report
app.post("/make-server-0dd48dc4/analytics/reports/generate", async (c) => {
  try {
    const { dimensions, metrics, filters, date_range } = await c.req.json();
    
    const events = [];
    for await (const entry of kv.list({ prefix: "event:" })) {
      events.push(entry.value);
    }

    // Apply filters
    let filteredEvents = events;
    if (filters) {
      filteredEvents = events.filter(event => {
        return Object.entries(filters).every(([key, value]) => event[key] === value);
      });
    }

    // Group by dimensions
    const grouped = this.groupByDimensions(filteredEvents, dimensions);

    return c.json({ report: grouped });
  } catch (error) {
    return c.json({ error: "Error generating report" }, 500);
  }
});

// Helper: Group by dimensions
function groupByDimensions(events: any[], dimensions: string[]): any {
  if (!dimensions || dimensions.length === 0) return { total: events.length };
  
  const result: any = {};
  events.forEach(event => {
    const key = dimensions.map(d => event[d] || "unknown").join("_");
    result[key] = (result[key] || 0) + 1;
  });
  return result;
}

// ==========================================
// REAL-TIME - Analytics en Tiempo Real
// ==========================================

// Get real-time data
app.get("/make-server-0dd48dc4/analytics/realtime", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const events = [];
    
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    for await (const entry of kv.list({ prefix: "event:" })) {
      const event = entry.value as any;
      if (event.entity_id === entity_id) {
        if (new Date(event.timestamp).getTime() > fiveMinutesAgo) {
          events.push(event);
        }
      }
    }

    const realtime = {
      active_users: new Set(events.map(e => e.user_id)).size,
      events_last_5min: events.length,
      top_pages: this.getTopPages(events),
      recent_events: events.slice(-10).reverse(),
    };

    return c.json({ realtime });
  } catch (error) {
    return c.json({ error: "Error fetching real-time data" }, 500);
  }
});

// Helper: Get top pages
function getTopPages(events: any[]): any[] {
  const pageCounts: any = {};
  events.forEach(e => {
    if (e.event_name === "page_view" && e.properties?.page) {
      pageCounts[e.properties.page] = (pageCounts[e.properties.page] || 0) + 1;
    }
  });
  return Object.entries(pageCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, views]) => ({ page, views }));
}

// Dashboard
app.get("/make-server-0dd48dc4/analytics/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const events = [];

    for await (const entry of kv.list({ prefix: "event:" })) {
      const event = entry.value as any;
      if (event.entity_id === entity_id) events.push(event);
    }

    const now = Date.now();
    const last24h = events.filter(e => (now - new Date(e.timestamp).getTime()) < 24 * 60 * 60 * 1000);
    const last7d = events.filter(e => (now - new Date(e.timestamp).getTime()) < 7 * 24 * 60 * 60 * 1000);

    const dashboard = {
      total_events: events.length,
      last_24h: last24h.length,
      last_7d: last7d.length,
      unique_users: new Set(events.map(e => e.user_id)).size,
      top_events: this.getTopEvents(events),
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching analytics dashboard" }, 500);
  }
});

// Helper: Get top events
function getTopEvents(events: any[]): any[] {
  const eventCounts: any = {};
  events.forEach(e => {
    eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
  });
  return Object.entries(eventCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10)
    .map(([event, count]) => ({ event, count }));
}

export default app;
