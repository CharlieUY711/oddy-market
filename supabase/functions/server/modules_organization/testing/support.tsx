import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// SUPPORT - Sistema de Tickets de Soporte
// ==========================================

// Create ticket
app.post("/make-server-0dd48dc4/support/tickets", async (c) => {
  try {
    const ticket = await c.req.json();
    const id = `ticket:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTicket = {
      ...ticket,
      id,
      ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
      created_at: timestamp,
      updated_at: timestamp,
      status: "open", // open, in_progress, resolved, closed
      priority: ticket.priority || "medium", // low, medium, high, urgent
      category: ticket.category || "general", // general, technical, billing, other
      messages: [],
      assigned_to: null,
    };

    await kv.set(id, newTicket);
    return c.json({ ticket: newTicket });
  } catch (error) {
    return c.json({ error: "Error creating ticket" }, 500);
  }
});

// Get tickets
app.get("/make-server-0dd48dc4/support/tickets", async (c) => {
  try {
    const entity_id = c.req.query("entity_id");
    const user_id = c.req.query("user_id");
    const status = c.req.query("status");
    const tickets = [];

    for await (const entry of kv.list({ prefix: "ticket:" })) {
      const ticket = entry.value as any;
      if (entity_id && ticket.entity_id !== entity_id) continue;
      if (user_id && ticket.user_id !== user_id) continue;
      if (status && ticket.status !== status) continue;
      tickets.push(ticket);
    }

    tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ tickets, total: tickets.length });
  } catch (error) {
    return c.json({ error: "Error fetching tickets" }, 500);
  }
});

// Get ticket by ID
app.get("/make-server-0dd48dc4/support/tickets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const ticket = await kv.get(id);

    if (!ticket.value) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    return c.json({ ticket: ticket.value });
  } catch (error) {
    return c.json({ error: "Error fetching ticket" }, 500);
  }
});

// Update ticket
app.patch("/make-server-0dd48dc4/support/tickets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const ticket = await kv.get(id);

    if (!ticket.value) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    const updatedTicket = {
      ...ticket.value,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedTicket);
    return c.json({ ticket: updatedTicket });
  } catch (error) {
    return c.json({ error: "Error updating ticket" }, 500);
  }
});

// Add message to ticket
app.post("/make-server-0dd48dc4/support/tickets/:id/messages", async (c) => {
  try {
    const id = c.req.param("id");
    const message = await c.req.json();
    const ticket = await kv.get(id);

    if (!ticket.value) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    const newMessage = {
      id: `msg:${Date.now()}`,
      ...message,
      created_at: new Date().toISOString(),
    };

    ticket.value.messages.push(newMessage);
    ticket.value.updated_at = new Date().toISOString();

    await kv.set(id, ticket.value);
    return c.json({ message: newMessage, ticket: ticket.value });
  } catch (error) {
    return c.json({ error: "Error adding message" }, 500);
  }
});

// Close ticket
app.post("/make-server-0dd48dc4/support/tickets/:id/close", async (c) => {
  try {
    const id = c.req.param("id");
    const ticket = await kv.get(id);

    if (!ticket.value) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    ticket.value.status = "closed";
    ticket.value.closed_at = new Date().toISOString();
    ticket.value.updated_at = new Date().toISOString();

    await kv.set(id, ticket.value);
    return c.json({ message: "Ticket closed", ticket: ticket.value });
  } catch (error) {
    return c.json({ error: "Error closing ticket" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/support/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id");
    const tickets = [];

    for await (const entry of kv.list({ prefix: "ticket:" })) {
      const ticket = entry.value as any;
      if (entity_id && ticket.entity_id !== entity_id) continue;
      tickets.push(ticket);
    }

    const dashboard = {
      total_tickets: tickets.length,
      open: tickets.filter(t => t.status === "open").length,
      in_progress: tickets.filter(t => t.status === "in_progress").length,
      resolved: tickets.filter(t => t.status === "resolved").length,
      closed: tickets.filter(t => t.status === "closed").length,
      by_priority: {
        urgent: tickets.filter(t => t.priority === "urgent").length,
        high: tickets.filter(t => t.priority === "high").length,
        medium: tickets.filter(t => t.priority === "medium").length,
        low: tickets.filter(t => t.priority === "low").length,
      },
      avg_resolution_time: this.calculateAvgResolutionTime(tickets),
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching support dashboard" }, 500);
  }
});

// Helper: Calculate average resolution time
function calculateAvgResolutionTime(tickets: any[]): string {
  const resolved = tickets.filter(t => t.status === "resolved" || t.status === "closed");
  if (resolved.length === 0) return "N/A";

  const totalTime = resolved.reduce((sum, t) => {
    const created = new Date(t.created_at).getTime();
    const closed = new Date(t.closed_at || t.updated_at).getTime();
    return sum + (closed - created);
  }, 0);

  const avgMs = totalTime / resolved.length;
  const hours = Math.floor(avgMs / (1000 * 60 * 60));
  return `${hours} hours`;
}

export default app;
