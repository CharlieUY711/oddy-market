import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// Track event
app.post("/make-server-0dd48dc4/analytics/track", async (c) => {
  try {
    const event = await c.req.json();
    const id = `analytics:${Date.now()}`;
    
    const analyticsEvent = {
      ...event,
      id,
      timestamp: new Date().toISOString(),
      session_id: event.session_id || null,
      user_id: event.user_id || null,
      properties: event.properties || {},
    };

    await kv.set(id, analyticsEvent);
    return c.json({ event: analyticsEvent });
  } catch (error) {
    return c.json({ error: "Error tracking event" }, 500);
  }
});

// Get analytics
app.get("/make-server-0dd48dc4/analytics", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const event_name = c.req.query("event_name");
    const events = [];

    for await (const entry of kv.list({ prefix: "analytics:" })) {
      const event = entry.value as any;
      if (event.entity_id === entity_id) {
        if (event_name && event.event_name !== event_name) continue;
        events.push(event);
      }
    }

    const stats = {
      total_events: events.length,
      unique_users: new Set(events.map((e) => e.user_id).filter(Boolean)).size,
      by_event: this.groupByEvent(events),
    };

    return c.json({ stats, events: events.slice(-50) });
  } catch (error) {
    return c.json({ error: "Error fetching analytics" }, 500);
  }
});

function groupByEvent(events: any[]) {
  const grouped: any = {};
  events.forEach((event) => {
    grouped[event.event_name] = (grouped[event.event_name] || 0) + 1;
  });
  return grouped;
}

export default app;
