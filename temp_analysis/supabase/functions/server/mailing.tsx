import { Hono } from "npm:hono";
import { Resend } from "npm:resend";
import * as kv from "./kv_store.tsx";

const mailingApp = new Hono();

// Initialize Resend only if API key is available (lazy initialization)
function getResendClient() {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

// ============== SUBSCRIBERS ==============

// Get all subscribers
mailingApp.get("/make-server-0dd48dc4/mailing/subscribers", async (c) => {
  try {
    const subscribers = await kv.getByPrefix("subscriber:");
    return c.json({ subscribers });
  } catch (error) {
    console.log("Error fetching subscribers:", error);
    return c.json({ error: "Error fetching subscribers" }, 500);
  }
});

// Create subscriber
mailingApp.post("/make-server-0dd48dc4/mailing/subscribers", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const subscriber = {
      id,
      ...data,
      status: "subscribed",
      opens: 0,
      clicks: 0,
      subscribedAt: timestamp,
    };

    await kv.set(`subscriber:${id}`, subscriber);

    // Update list counts
    for (const listId of data.lists || []) {
      const list = await kv.get(`mailing_list:${listId}`);
      if (list) {
        await kv.set(`mailing_list:${listId}`, {
          ...list,
          subscriberCount: (list.subscriberCount || 0) + 1,
        });
      }
    }

    return c.json({ subscriber });
  } catch (error) {
    console.log("Error creating subscriber:", error);
    return c.json({ error: "Error creating subscriber" }, 500);
  }
});

// Update subscriber
mailingApp.put("/make-server-0dd48dc4/mailing/subscribers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`subscriber:${id}`);

    if (!existing) {
      return c.json({ error: "Subscriber not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
    };

    await kv.set(`subscriber:${id}`, updated);

    // Update list counts if lists changed
    if (updates.lists) {
      const oldLists = existing.lists || [];
      const newLists = updates.lists || [];

      // Decrement old lists
      for (const listId of oldLists) {
        if (!newLists.includes(listId)) {
          const list = await kv.get(`mailing_list:${listId}`);
          if (list) {
            await kv.set(`mailing_list:${listId}`, {
              ...list,
              subscriberCount: Math.max((list.subscriberCount || 1) - 1, 0),
            });
          }
        }
      }

      // Increment new lists
      for (const listId of newLists) {
        if (!oldLists.includes(listId)) {
          const list = await kv.get(`mailing_list:${listId}`);
          if (list) {
            await kv.set(`mailing_list:${listId}`, {
              ...list,
              subscriberCount: (list.subscriberCount || 0) + 1,
            });
          }
        }
      }
    }

    return c.json({ subscriber: updated });
  } catch (error) {
    console.log("Error updating subscriber:", error);
    return c.json({ error: "Error updating subscriber" }, 500);
  }
});

// Delete subscriber
mailingApp.delete("/make-server-0dd48dc4/mailing/subscribers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`subscriber:${id}`);

    if (!existing) {
      return c.json({ error: "Subscriber not found" }, 404);
    }

    // Update list counts
    for (const listId of existing.lists || []) {
      const list = await kv.get(`mailing_list:${listId}`);
      if (list) {
        await kv.set(`mailing_list:${listId}`, {
          ...list,
          subscriberCount: Math.max((list.subscriberCount || 1) - 1, 0),
        });
      }
    }

    await kv.del(`subscriber:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting subscriber:", error);
    return c.json({ error: "Error deleting subscriber" }, 500);
  }
});

// ============== MAILING LISTS ==============

// Get all lists
mailingApp.get("/make-server-0dd48dc4/mailing/lists", async (c) => {
  try {
    const lists = await kv.getByPrefix("mailing_list:");
    return c.json({ lists });
  } catch (error) {
    console.log("Error fetching lists:", error);
    return c.json({ error: "Error fetching lists" }, 500);
  }
});

// Create list
mailingApp.post("/make-server-0dd48dc4/mailing/lists", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const list = {
      id,
      ...data,
      subscriberCount: 0,
      createdAt: timestamp,
    };

    await kv.set(`mailing_list:${id}`, list);
    return c.json({ list });
  } catch (error) {
    console.log("Error creating list:", error);
    return c.json({ error: "Error creating list" }, 500);
  }
});

// Delete list
mailingApp.delete("/make-server-0dd48dc4/mailing/lists/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`mailing_list:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting list:", error);
    return c.json({ error: "Error deleting list" }, 500);
  }
});

// ============== SEGMENTS ==============

// Evaluate if a subscriber matches segment conditions
function evaluateConditions(subscriber: any, conditions: any[]): boolean {
  for (const condition of conditions) {
    const value = subscriber[condition.field];
    const targetValue = condition.value;

    switch (condition.operator) {
      case "equals":
        if (value !== targetValue) return false;
        break;
      case "not_equals":
        if (value === targetValue) return false;
        break;
      case "contains":
        if (!value || !value.includes(targetValue)) return false;
        break;
      case "not_contains":
        if (value && value.includes(targetValue)) return false;
        break;
      case "greater":
        if (!(value > parseFloat(targetValue))) return false;
        break;
      case "less":
        if (!(value < parseFloat(targetValue))) return false;
        break;
      case "starts_with":
        if (!value || !value.startsWith(targetValue)) return false;
        break;
      case "ends_with":
        if (!value || !value.endsWith(targetValue)) return false;
        break;
      case "before":
        if (!(new Date(value) < new Date(targetValue))) return false;
        break;
      case "after":
        if (!(new Date(value) > new Date(targetValue))) return false;
        break;
      default:
        break;
    }
  }
  return true;
}

// Get all segments
mailingApp.get("/make-server-0dd48dc4/mailing/segments", async (c) => {
  try {
    const segments = await kv.getByPrefix("segment:");
    const subscribers = await kv.getByPrefix("subscriber:");

    // Calculate subscriber count for each segment
    const segmentsWithCount = segments.map((segment: any) => {
      const count = subscribers.filter((sub: any) =>
        evaluateConditions(sub, segment.conditions)
      ).length;
      return { ...segment, subscriberCount: count };
    });

    return c.json({ segments: segmentsWithCount });
  } catch (error) {
    console.log("Error fetching segments:", error);
    return c.json({ error: "Error fetching segments" }, 500);
  }
});

// Create segment
mailingApp.post("/make-server-0dd48dc4/mailing/segments", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const segment = {
      id,
      ...data,
      createdAt: timestamp,
    };

    await kv.set(`segment:${id}`, segment);
    return c.json({ segment });
  } catch (error) {
    console.log("Error creating segment:", error);
    return c.json({ error: "Error creating segment" }, 500);
  }
});

// Update segment
mailingApp.put("/make-server-0dd48dc4/mailing/segments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`segment:${id}`);

    if (!existing) {
      return c.json({ error: "Segment not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
    };

    await kv.set(`segment:${id}`, updated);
    return c.json({ segment: updated });
  } catch (error) {
    console.log("Error updating segment:", error);
    return c.json({ error: "Error updating segment" }, 500);
  }
});

// Delete segment
mailingApp.delete("/make-server-0dd48dc4/mailing/segments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`segment:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting segment:", error);
    return c.json({ error: "Error deleting segment" }, 500);
  }
});

// ============== CAMPAIGNS ==============

// Get all campaigns
mailingApp.get("/make-server-0dd48dc4/mailing/campaigns", async (c) => {
  try {
    const campaigns = await kv.getByPrefix("campaign:");
    const sortedCampaigns = campaigns.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ campaigns: sortedCampaigns });
  } catch (error) {
    console.log("Error fetching campaigns:", error);
    return c.json({ error: "Error fetching campaigns" }, 500);
  }
});

// ============== ANALYTICS ==============

mailingApp.get("/make-server-0dd48dc4/mailing/analytics", async (c) => {
  try {
    const range = c.req.query("range") || "month";

    const subscribers = await kv.getByPrefix("subscriber:");
    const campaigns = await kv.getByPrefix("campaign:");

    const analytics = {
      subscribers: {
        total: subscribers.length,
        subscribed: subscribers.filter((s: any) => s.status === "subscribed")
          .length,
        unsubscribed: subscribers.filter((s: any) => s.status === "unsubscribed")
          .length,
        bounced: subscribers.filter((s: any) => s.status === "bounced").length,
      },
      campaigns: {
        total: campaigns.length,
        sent: campaigns.filter((c: any) => c.status === "sent").length,
        scheduled: campaigns.filter((c: any) => c.status === "scheduled").length,
      },
    };

    return c.json(analytics);
  } catch (error) {
    console.log("Error fetching analytics:", error);
    return c.json({ error: "Error fetching analytics" }, 500);
  }
});

// ============== EMAIL TEMPLATES (Legacy - Keep for compatibility) ==============
mailingApp.get("/make-server-0dd48dc4/mailing/templates", async (c) => {
  try {
    const templates = await kv.getByPrefix("email_template:");
    return c.json({ templates });
  } catch (error) {
    console.log("Error fetching email templates:", error);
    return c.json({ error: "Error fetching templates" }, 500);
  }
});

mailingApp.post("/make-server-0dd48dc4/mailing/templates", async (c) => {
  try {
    const template = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const newTemplate = {
      id,
      ...template,
      createdAt: timestamp,
      sentCount: 0,
    };

    await kv.set(`email_template:${id}`, newTemplate);
    return c.json({ template: newTemplate });
  } catch (error) {
    console.log("Error creating email template:", error);
    return c.json({ error: "Error creating template" }, 500);
  }
});

mailingApp.get("/make-server-0dd48dc4/mailing/templates/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const template = await kv.get(`email_template:${id}`);

    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }

    return c.json({ template });
  } catch (error) {
    console.log("Error fetching email template:", error);
    return c.json({ error: "Error fetching template" }, 500);
  }
});

// ============== EMAIL CAMPAIGNS ==============
mailingApp.get("/make-server-0dd48dc4/mailing/campaigns", async (c) => {
  try {
    const campaigns = await kv.getByPrefix("email_campaign:");
    return c.json({ campaigns });
  } catch (error) {
    console.log("Error fetching email campaigns:", error);
    return c.json({ error: "Error fetching campaigns" }, 500);
  }
});

mailingApp.post("/make-server-0dd48dc4/mailing/campaigns", async (c) => {
  try {
    const campaign = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const newCampaign = {
      id,
      ...campaign,
      status: "draft",
      createdAt: timestamp,
      opens: 0,
      clicks: 0,
    };

    await kv.set(`email_campaign:${id}`, newCampaign);
    return c.json({ campaign: newCampaign });
  } catch (error) {
    console.log("Error creating email campaign:", error);
    return c.json({ error: "Error creating campaign" }, 500);
  }
});

mailingApp.post("/make-server-0dd48dc4/mailing/campaigns/:id/send", async (c) => {
  try {
    const id = c.req.param("id");
    const campaign = await kv.get(`email_campaign:${id}`);

    if (!campaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    const template = await kv.get(`email_template:${campaign.templateId}`);

    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }

    // Get all customers to send to
    const customers = await kv.getByPrefix("customer:");

    if (customers.length === 0) {
      return c.json({ error: "No customers found" }, 400);
    }

    // Send emails in batches
    const emailPromises = customers.map((customer: any) => {
      return sendEmail({
        to: customer.email,
        subject: campaign.subject,
        html: replacePlaceholders(template.html, {
          customerName: customer.name,
          customerEmail: customer.email,
        }),
      });
    });

    await Promise.all(emailPromises);

    // Update campaign status
    const updatedCampaign = {
      ...campaign,
      status: "sent",
      sentAt: new Date().toISOString(),
      recipients: customers.length,
    };

    await kv.set(`email_campaign:${id}`, updatedCampaign);

    // Update template sent count
    await kv.set(`email_template:${campaign.templateId}`, {
      ...template,
      sentCount: (template.sentCount || 0) + customers.length,
      lastSent: new Date().toISOString(),
    });

    return c.json({ success: true, sent: customers.length });
  } catch (error) {
    console.log("Error sending email campaign:", error);
    return c.json({ error: "Error sending campaign" }, 500);
  }
});

// ============== ABANDONED CARTS ==============
mailingApp.get("/make-server-0dd48dc4/mailing/abandoned-carts", async (c) => {
  try {
    const carts = await kv.getByPrefix("abandoned_cart:");
    return c.json({ carts });
  } catch (error) {
    console.log("Error fetching abandoned carts:", error);
    return c.json({ error: "Error fetching abandoned carts" }, 500);
  }
});

mailingApp.post("/make-server-0dd48dc4/mailing/cart-recovery/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const cart = await kv.get(`abandoned_cart:${id}`);

    if (!cart) {
      return c.json({ error: "Cart not found" }, 404);
    }

    // Get cart recovery template
    const templates = await kv.getByPrefix("email_template:");
    const recoveryTemplate = templates.find((t: any) => t.type === "cart_recovery");

    if (!recoveryTemplate) {
      return c.json({ error: "Cart recovery template not found" }, 404);
    }

    // Calculate cart details
    const itemsList = cart.items
      .map((item: any) => `<li>${item.name} - $${item.price.toLocaleString()}</li>`)
      .join("");

    const emailHtml = replacePlaceholders(recoveryTemplate.html, {
      customerName: cart.customerName,
      items: itemsList,
      total: cart.total.toLocaleString(),
      cartLink: `https://oddymarket.com/cart/${id}`,
    });

    // Send recovery email
    await sendEmail({
      to: cart.customerEmail,
      subject: recoveryTemplate.subject,
      html: emailHtml,
    });

    // Update cart status
    const updatedCart = {
      ...cart,
      reminderSent: true,
      reminderSentAt: new Date().toISOString(),
    };

    await kv.set(`abandoned_cart:${id}`, updatedCart);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error sending cart recovery email:", error);
    return c.json({ error: "Error sending recovery email" }, 500);
  }
});

// ============== TRANSACTIONAL EMAILS ==============
mailingApp.post("/make-server-0dd48dc4/mailing/send-transactional", async (c) => {
  try {
    const { type, to, data } = await c.req.json();

    // Get template by type
    const templates = await kv.getByPrefix("email_template:");
    const template = templates.find(
      (t: any) => t.type === "transactional" && t.name.toLowerCase().includes(type)
    );

    if (!template) {
      console.log(`Transactional template not found for type: ${type}`);
      return c.json({ error: "Template not found" }, 404);
    }

    const emailHtml = replacePlaceholders(template.html, data);

    await sendEmail({
      to,
      subject: replacePlaceholders(template.subject, data),
      html: emailHtml,
    });

    // Update template sent count
    await kv.set(`email_template:${template.id}`, {
      ...template,
      sentCount: (template.sentCount || 0) + 1,
      lastSent: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log("Error sending transactional email:", error);
    return c.json({ error: "Error sending email" }, 500);
  }
});

// ============== HELPER FUNCTIONS ==============
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    // Check if Resend API key is configured
    const resendClient = getResendClient();
    
    if (!resendClient) {
      console.log("=================================");
      console.log("RESEND_API_KEY not configured.");
      console.log("Running in DEMO MODE");
      console.log("=================================");
      console.log("Email would be sent to:", to);
      console.log("Subject:", subject);
      console.log("HTML length:", html.length, "characters");
      console.log("=================================");
      return { success: true, mode: "demo" };
    }

    const { data, error } = await resendClient.emails.send({
      from: "ODDY Market <noreply@oddymarket.com>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.log("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.log("Error in sendEmail:", error);
    throw error;
  }
}

function replacePlaceholders(text: string, data: Record<string, any>): string {
  let result = text;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    result = result.replace(placeholder, String(value));
  }
  return result;
}

// ============== CART TRACKING ==============
// This function should be called when a user adds items to cart and leaves
mailingApp.post("/make-server-0dd48dc4/mailing/track-cart", async (c) => {
  try {
    const { customerEmail, customerName, items, total } = await c.req.json();

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const cart = {
      id,
      customerEmail,
      customerName,
      items,
      total,
      abandonedAt: timestamp,
      reminderSent: false,
      recovered: false,
    };

    await kv.set(`abandoned_cart:${id}`, cart);

    return c.json({ success: true, cartId: id });
  } catch (error) {
    console.log("Error tracking abandoned cart:", error);
    return c.json({ error: "Error tracking cart" }, 500);
  }
});

// Mark cart as recovered (call this when customer completes purchase)
mailingApp.post("/make-server-0dd48dc4/mailing/recover-cart/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const cart = await kv.get(`abandoned_cart:${id}`);

    if (cart) {
      await kv.set(`abandoned_cart:${id}`, {
        ...cart,
        recovered: true,
        recoveredAt: new Date().toISOString(),
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Error marking cart as recovered:", error);
    return c.json({ error: "Error updating cart" }, 500);
  }
});

export default mailingApp;
