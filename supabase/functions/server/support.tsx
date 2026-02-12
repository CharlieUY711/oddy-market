import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// Create support ticket
app.post("/make-server-0dd48dc4/support/tickets", async (c) => {
  try {
    const ticket = await c.req.json();
    const id = `ticket:${Date.now()}`;
    const ticket_number = `TKT-${Date.now().toString().slice(-6)}`;
    
    const newTicket = {
      ...ticket,
      id,
      ticket_number,
      created_at: new Date().toISOString(),
      status: "open", // open, in_progress, resolved, closed
      priority: ticket.priority || "medium",
      assigned_to: null,
      messages: [],
    };

    await kv.set(id, newTicket);
    return c.json({ ticket: newTicket });
  } catch (error) {
    return c.json({ error: "Error creating support ticket" }, 500);
  }
});

// Get tickets
app.get("/make-server-0dd48dc4/support/tickets", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const tickets = [];

    for await (const entry of kv.list({ prefix: "ticket:" })) {
      const ticket = entry.value as any;
      if (ticket.entity_id === entity_id) {
        if (status && ticket.status !== status) continue;
        tickets.push(ticket);
      }
    }

    return c.json({ tickets, total: tickets.length });
  } catch (error) {
    return c.json({ error: "Error fetching tickets" }, 500);
  }
});

// Add message to ticket
app.post("/make-server-0dd48dc4/support/tickets/:id/messages", async (c) => {
  try {
    const ticket_id = c.req.param("id");
    const message = await c.req.json();
    const ticket = await kv.get(ticket_id);

    if (!ticket.value) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    const newMessage = {
      id: `message:${Date.now()}`,
      ...message,
      created_at: new Date().toISOString(),
    };

    ticket.value.messages = ticket.value.messages || [];
    ticket.value.messages.push(newMessage);
    ticket.value.updated_at = new Date().toISOString();

    await kv.set(ticket_id, ticket.value);
    return c.json({ ticket: ticket.value, message: newMessage });
  } catch (error) {
    return c.json({ error: "Error adding message" }, 500);
  }
});

// Update ticket status
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

export default app;
