import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// CONTACTS - Gestión de Contactos
// ==========================================

// Create contact
app.post("/make-server-0dd48dc4/mailing/contacts", async (c) => {
  try {
    const contact = await c.req.json();
    const id = contact.id || `contact:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newContact = {
      ...contact,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: contact.status || "active", // active, unsubscribed, bounced, complained
      tags: contact.tags || [],
      custom_fields: contact.custom_fields || {},
      subscription_source: contact.subscription_source || "manual",
      double_opt_in: contact.double_opt_in || false,
      stats: {
        emails_sent: 0,
        emails_opened: 0,
        emails_clicked: 0,
        last_opened_at: null,
        last_clicked_at: null,
      },
    };

    await kv.set(id, newContact);
    return c.json({ contact: newContact });
  } catch (error) {
    console.log("Error creating contact:", error);
    return c.json({ error: "Error creating contact" }, 500);
  }
});

// Get all contacts with filters
app.get("/make-server-0dd48dc4/mailing/contacts", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const tag = c.req.query("tag");
    const list_id = c.req.query("list_id");

    const contacts = [];
    for await (const entry of kv.list({ prefix: "contact:" })) {
      const contact = entry.value as any;
      if (contact.entity_id === entity_id) {
        if (status && contact.status !== status) continue;
        if (tag && !contact.tags.includes(tag)) continue;
        if (list_id && !contact.lists?.includes(list_id)) continue;
        contacts.push(contact);
      }
    }

    return c.json({ contacts, total: contacts.length });
  } catch (error) {
    console.log("Error fetching contacts:", error);
    return c.json({ error: "Error fetching contacts" }, 500);
  }
});

// Update contact
app.patch("/make-server-0dd48dc4/mailing/contacts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const contact = await kv.get(id);

    if (!contact.value) {
      return c.json({ error: "Contact not found" }, 404);
    }

    const updatedContact = {
      ...contact.value,
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedContact);
    return c.json({ contact: updatedContact });
  } catch (error) {
    console.log("Error updating contact:", error);
    return c.json({ error: "Error updating contact" }, 500);
  }
});

// Unsubscribe contact
app.post("/make-server-0dd48dc4/mailing/contacts/:id/unsubscribe", async (c) => {
  try {
    const id = c.req.param("id");
    const contact = await kv.get(id);

    if (!contact.value) {
      return c.json({ error: "Contact not found" }, 404);
    }

    const updatedContact = {
      ...contact.value,
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedContact);
    return c.json({ contact: updatedContact, message: "Contact unsubscribed successfully" });
  } catch (error) {
    console.log("Error unsubscribing contact:", error);
    return c.json({ error: "Error unsubscribing contact" }, 500);
  }
});

// ==========================================
// LISTS - Gestión de Listas
// ==========================================

// Create list
app.post("/make-server-0dd48dc4/mailing/lists", async (c) => {
  try {
    const list = await c.req.json();
    const id = list.id || `list:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newList = {
      ...list,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      contacts_count: 0,
      active_contacts: 0,
      unsubscribed_contacts: 0,
    };

    await kv.set(id, newList);
    return c.json({ list: newList });
  } catch (error) {
    console.log("Error creating list:", error);
    return c.json({ error: "Error creating list" }, 500);
  }
});

// Get all lists
app.get("/make-server-0dd48dc4/mailing/lists", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const lists = [];

    for await (const entry of kv.list({ prefix: "list:" })) {
      const list = entry.value as any;
      if (list.entity_id === entity_id) {
        lists.push(list);
      }
    }

    return c.json({ lists, total: lists.length });
  } catch (error) {
    console.log("Error fetching lists:", error);
    return c.json({ error: "Error fetching lists" }, 500);
  }
});

// Add contacts to list
app.post("/make-server-0dd48dc4/mailing/lists/:id/add-contacts", async (c) => {
  try {
    const list_id = c.req.param("id");
    const { contact_ids } = await c.req.json();

    for (const contact_id of contact_ids) {
      const contact = await kv.get(contact_id);
      if (contact.value) {
        const updatedContact = {
          ...contact.value,
          lists: [...(contact.value.lists || []), list_id],
          updated_at: new Date().toISOString(),
        };
        await kv.set(contact_id, updatedContact);
      }
    }

    return c.json({ message: `${contact_ids.length} contacts added to list` });
  } catch (error) {
    console.log("Error adding contacts to list:", error);
    return c.json({ error: "Error adding contacts to list" }, 500);
  }
});

// ==========================================
// TEMPLATES - Plantillas de Email
// ==========================================

// Create template
app.post("/make-server-0dd48dc4/mailing/templates", async (c) => {
  try {
    const template = await c.req.json();
    const id = template.id || `template:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTemplate = {
      ...template,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: template.status || "draft", // draft, published, archived
      variables: template.variables || [], // {{first_name}}, {{company}}, etc.
      preview_text: template.preview_text || "",
    };

    await kv.set(id, newTemplate);
    return c.json({ template: newTemplate });
  } catch (error) {
    console.log("Error creating template:", error);
    return c.json({ error: "Error creating template" }, 500);
  }
});

// Get all templates
app.get("/make-server-0dd48dc4/mailing/templates", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const templates = [];

    for await (const entry of kv.list({ prefix: "template:" })) {
      const template = entry.value as any;
      if (template.entity_id === entity_id) {
        if (status && template.status !== status) continue;
        templates.push(template);
      }
    }

    return c.json({ templates, total: templates.length });
  } catch (error) {
    console.log("Error fetching templates:", error);
    return c.json({ error: "Error fetching templates" }, 500);
  }
});

// Render template with variables
app.post("/make-server-0dd48dc4/mailing/templates/:id/render", async (c) => {
  try {
    const id = c.req.param("id");
    const { variables } = await c.req.json();
    const template = await kv.get(id);

    if (!template.value) {
      return c.json({ error: "Template not found" }, 404);
    }

    let rendered_html = template.value.html_content;
    let rendered_subject = template.value.subject;

    // Replace variables
    for (const [key, value] of Object.entries(variables || {})) {
      const regex = new RegExp(`{{${key}}}`, "g");
      rendered_html = rendered_html.replace(regex, value);
      rendered_subject = rendered_subject.replace(regex, value);
    }

    return c.json({
      subject: rendered_subject,
      html: rendered_html,
      preview_text: template.value.preview_text,
    });
  } catch (error) {
    console.log("Error rendering template:", error);
    return c.json({ error: "Error rendering template" }, 500);
  }
});

// ==========================================
// CAMPAIGNS - Campañas de Email
// ==========================================

// Create campaign
app.post("/make-server-0dd48dc4/mailing/campaigns", async (c) => {
  try {
    const campaign = await c.req.json();
    const id = campaign.id || `campaign:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newCampaign = {
      ...campaign,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: campaign.status || "draft", // draft, scheduled, sending, sent, paused, cancelled
      stats: {
        total_recipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0,
        unsubscribed: 0,
        open_rate: 0,
        click_rate: 0,
      },
      scheduled_at: campaign.scheduled_at || null,
      sent_at: null,
    };

    await kv.set(id, newCampaign);
    return c.json({ campaign: newCampaign });
  } catch (error) {
    console.log("Error creating campaign:", error);
    return c.json({ error: "Error creating campaign" }, 500);
  }
});

// Get all campaigns
app.get("/make-server-0dd48dc4/mailing/campaigns", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const campaigns = [];

    for await (const entry of kv.list({ prefix: "campaign:" })) {
      const campaign = entry.value as any;
      if (campaign.entity_id === entity_id) {
        if (status && campaign.status !== status) continue;
        campaigns.push(campaign);
      }
    }

    return c.json({ campaigns, total: campaigns.length });
  } catch (error) {
    console.log("Error fetching campaigns:", error);
    return c.json({ error: "Error fetching campaigns" }, 500);
  }
});

// Send campaign (simulate)
app.post("/make-server-0dd48dc4/mailing/campaigns/:id/send", async (c) => {
  try {
    const id = c.req.param("id");
    const campaign = await kv.get(id);

    if (!campaign.value) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    // Simulate sending
    const updatedCampaign = {
      ...campaign.value,
      status: "sending",
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedCampaign);

    // In production, this would integrate with SendGrid, Mailgun, SES, etc.
    return c.json({
      campaign: updatedCampaign,
      message: "Campaign sending initiated",
    });
  } catch (error) {
    console.log("Error sending campaign:", error);
    return c.json({ error: "Error sending campaign" }, 500);
  }
});

// ==========================================
// TRACKING - Seguimiento de Emails
// ==========================================

// Track email open
app.post("/make-server-0dd48dc4/mailing/track/open", async (c) => {
  try {
    const { campaign_id, contact_id } = await c.req.json();
    const track_id = `track_open:${Date.now()}`;

    const track = {
      id: track_id,
      type: "open",
      campaign_id,
      contact_id,
      timestamp: new Date().toISOString(),
      user_agent: c.req.header("user-agent"),
      ip_address: c.req.header("x-forwarded-for") || "unknown",
    };

    await kv.set(track_id, track);

    // Update contact stats
    const contact = await kv.get(contact_id);
    if (contact.value) {
      const updatedContact = {
        ...contact.value,
        stats: {
          ...contact.value.stats,
          emails_opened: (contact.value.stats?.emails_opened || 0) + 1,
          last_opened_at: new Date().toISOString(),
        },
      };
      await kv.set(contact_id, updatedContact);
    }

    return c.json({ message: "Open tracked successfully" });
  } catch (error) {
    console.log("Error tracking open:", error);
    return c.json({ error: "Error tracking open" }, 500);
  }
});

// Track email click
app.post("/make-server-0dd48dc4/mailing/track/click", async (c) => {
  try {
    const { campaign_id, contact_id, link_url } = await c.req.json();
    const track_id = `track_click:${Date.now()}`;

    const track = {
      id: track_id,
      type: "click",
      campaign_id,
      contact_id,
      link_url,
      timestamp: new Date().toISOString(),
      user_agent: c.req.header("user-agent"),
      ip_address: c.req.header("x-forwarded-for") || "unknown",
    };

    await kv.set(track_id, track);

    // Update contact stats
    const contact = await kv.get(contact_id);
    if (contact.value) {
      const updatedContact = {
        ...contact.value,
        stats: {
          ...contact.value.stats,
          emails_clicked: (contact.value.stats?.emails_clicked || 0) + 1,
          last_clicked_at: new Date().toISOString(),
        },
      };
      await kv.set(contact_id, updatedContact);
    }

    return c.json({ message: "Click tracked successfully" });
  } catch (error) {
    console.log("Error tracking click:", error);
    return c.json({ error: "Error tracking click" }, 500);
  }
});

// ==========================================
// ANALYTICS - Reportes y Estadísticas
// ==========================================

// Get campaign analytics
app.get("/make-server-0dd48dc4/mailing/campaigns/:id/analytics", async (c) => {
  try {
    const id = c.req.param("id");
    const campaign = await kv.get(id);

    if (!campaign.value) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    // Get tracking data
    const opens = [];
    const clicks = [];

    for await (const entry of kv.list({ prefix: "track_open:" })) {
      const track = entry.value as any;
      if (track.campaign_id === id) opens.push(track);
    }

    for await (const entry of kv.list({ prefix: "track_click:" })) {
      const track = entry.value as any;
      if (track.campaign_id === id) clicks.push(track);
    }

    const analytics = {
      campaign_id: id,
      campaign_name: campaign.value.name,
      status: campaign.value.status,
      sent_at: campaign.value.sent_at,
      stats: campaign.value.stats,
      engagement: {
        total_opens: opens.length,
        unique_opens: new Set(opens.map((o: any) => o.contact_id)).size,
        total_clicks: clicks.length,
        unique_clicks: new Set(clicks.map((c: any) => c.contact_id)).size,
      },
      top_links: this.getTopLinks(clicks),
      timeline: this.getTimeline(opens, clicks),
    };

    return c.json({ analytics });
  } catch (error) {
    console.log("Error fetching analytics:", error);
    return c.json({ error: "Error fetching analytics" }, 500);
  }
});

// Helper: Get top clicked links
function getTopLinks(clicks: any[]) {
  const linkCounts: any = {};
  clicks.forEach((click) => {
    linkCounts[click.link_url] = (linkCounts[click.link_url] || 0) + 1;
  });
  return Object.entries(linkCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10)
    .map(([url, count]) => ({ url, clicks: count }));
}

// Helper: Get timeline
function getTimeline(opens: any[], clicks: any[]) {
  const events = [
    ...opens.map((o) => ({ type: "open", timestamp: o.timestamp })),
    ...clicks.map((c) => ({ type: "click", timestamp: c.timestamp })),
  ];
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Dashboard stats
app.get("/make-server-0dd48dc4/mailing/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const contacts = [];
    const campaigns = [];
    const templates = [];

    for await (const entry of kv.list({ prefix: "contact:" })) {
      const contact = entry.value as any;
      if (contact.entity_id === entity_id) contacts.push(contact);
    }

    for await (const entry of kv.list({ prefix: "campaign:" })) {
      const campaign = entry.value as any;
      if (campaign.entity_id === entity_id) campaigns.push(campaign);
    }

    for await (const entry of kv.list({ prefix: "template:" })) {
      const template = entry.value as any;
      if (template.entity_id === entity_id) templates.push(template);
    }

    const dashboard = {
      entity_id,
      contacts: {
        total: contacts.length,
        active: contacts.filter((c) => c.status === "active").length,
        unsubscribed: contacts.filter((c) => c.status === "unsubscribed").length,
      },
      campaigns: {
        total: campaigns.length,
        draft: campaigns.filter((c) => c.status === "draft").length,
        sent: campaigns.filter((c) => c.status === "sent").length,
        sending: campaigns.filter((c) => c.status === "sending").length,
      },
      templates: {
        total: templates.length,
        published: templates.filter((t) => t.status === "published").length,
      },
    };

    return c.json({ dashboard });
  } catch (error) {
    console.log("Error fetching dashboard:", error);
    return c.json({ error: "Error fetching dashboard" }, 500);
  }
});

export default app;
