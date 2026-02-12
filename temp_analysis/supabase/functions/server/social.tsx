import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const socialApp = new Hono();

// ============== GENERAL STATS ==============

socialApp.get("/make-server-0dd48dc4/social/stats", async (c) => {
  try {
    const range = c.req.query("range") || "week";

    // Get all social media data
    const facebookPosts = await kv.getByPrefix("facebook_post:");
    const instagramPosts = await kv.getByPrefix("instagram_post:");
    const whatsappMessages = await kv.getByPrefix("whatsapp_message:");

    const stats = {
      facebook: {
        followers: 18500,
        engagement: 7.2,
        reach: 52000,
        posts: facebookPosts.length,
        messages: facebookPosts.filter((p: any) => p.type === "message").length,
      },
      instagram: {
        followers: 22800,
        engagement: 9.8,
        reach: 78000,
        posts: instagramPosts.length,
        dms: instagramPosts.filter((p: any) => p.type === "dm").length,
      },
      whatsapp: {
        contacts: 3900,
        messages: whatsappMessages.length,
        broadcasts: whatsappMessages.filter((m: any) => m.type === "broadcast")
          .length,
      },
    };

    return c.json({ stats });
  } catch (error) {
    console.log("Error fetching social stats:", error);
    return c.json({ error: "Error fetching stats" }, 500);
  }
});

// ============== FACEBOOK ==============

// Get Facebook posts
socialApp.get("/make-server-0dd48dc4/social/facebook/posts", async (c) => {
  try {
    const posts = await kv.getByPrefix("facebook_post:");
    const sortedPosts = posts.sort((a: any, b: any) => {
      const dateA = a.publishedAt || a.scheduledFor || a.createdAt;
      const dateB = b.publishedAt || b.scheduledFor || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    return c.json({ posts: sortedPosts });
  } catch (error) {
    console.log("Error fetching Facebook posts:", error);
    return c.json({ error: "Error fetching posts" }, 500);
  }
});

// Create Facebook post
socialApp.post("/make-server-0dd48dc4/social/facebook/posts", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const post = {
      id,
      ...data,
      status: data.scheduledFor ? "scheduled" : "draft",
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
      },
      createdAt: timestamp,
    };

    await kv.set(`facebook_post:${id}`, post);
    return c.json({ post });
  } catch (error) {
    console.log("Error creating Facebook post:", error);
    return c.json({ error: "Error creating post" }, 500);
  }
});

// Update Facebook post
socialApp.put(
  "/make-server-0dd48dc4/social/facebook/posts/:id",
  async (c) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      const existing = await kv.get(`facebook_post:${id}`);

      if (!existing) {
        return c.json({ error: "Post not found" }, 404);
      }

      const updated = {
        ...existing,
        ...updates,
        id,
      };

      await kv.set(`facebook_post:${id}`, updated);
      return c.json({ post: updated });
    } catch (error) {
      console.log("Error updating Facebook post:", error);
      return c.json({ error: "Error updating post" }, 500);
    }
  }
);

// Delete Facebook post
socialApp.delete(
  "/make-server-0dd48dc4/social/facebook/posts/:id",
  async (c) => {
    try {
      const id = c.req.param("id");
      await kv.del(`facebook_post:${id}`);
      return c.json({ success: true });
    } catch (error) {
      console.log("Error deleting Facebook post:", error);
      return c.json({ error: "Error deleting post" }, 500);
    }
  }
);

// Get Facebook messages
socialApp.get("/make-server-0dd48dc4/social/facebook/messages", async (c) => {
  try {
    const messages = await kv.getByPrefix("facebook_message:");
    const sortedMessages = messages.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.log("Error fetching Facebook messages:", error);
    return c.json({ error: "Error fetching messages" }, 500);
  }
});

// Create Facebook message (for testing)
socialApp.post(
  "/make-server-0dd48dc4/social/facebook/messages",
  async (c) => {
    try {
      const data = await c.req.json();
      const id = crypto.randomUUID();

      const message = {
        id,
        ...data,
        timestamp: new Date().toISOString(),
        read: false,
        replied: false,
      };

      await kv.set(`facebook_message:${id}`, message);
      return c.json({ message });
    } catch (error) {
      console.log("Error creating Facebook message:", error);
      return c.json({ error: "Error creating message" }, 500);
    }
  }
);

// ============== INSTAGRAM ==============

// Get Instagram posts
socialApp.get("/make-server-0dd48dc4/social/instagram/posts", async (c) => {
  try {
    const posts = await kv.getByPrefix("instagram_post:");
    const sortedPosts = posts.sort((a: any, b: any) => {
      const dateA = a.publishedAt || a.scheduledFor || a.createdAt;
      const dateB = b.publishedAt || b.scheduledFor || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    return c.json({ posts: sortedPosts });
  } catch (error) {
    console.log("Error fetching Instagram posts:", error);
    return c.json({ error: "Error fetching posts" }, 500);
  }
});

// Create Instagram post
socialApp.post("/make-server-0dd48dc4/social/instagram/posts", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const post = {
      id,
      ...data,
      status: data.scheduledFor ? "scheduled" : "draft",
      stats: {
        likes: 0,
        comments: 0,
        saves: 0,
        reach: 0,
      },
      createdAt: timestamp,
    };

    await kv.set(`instagram_post:${id}`, post);
    return c.json({ post });
  } catch (error) {
    console.log("Error creating Instagram post:", error);
    return c.json({ error: "Error creating post" }, 500);
  }
});

// ============== WHATSAPP ==============

// Get WhatsApp conversations
socialApp.get(
  "/make-server-0dd48dc4/social/whatsapp/conversations",
  async (c) => {
    try {
      const conversations = await kv.getByPrefix("whatsapp_conversation:");
      const sortedConversations = conversations.sort((a: any, b: any) => {
        return (
          new Date(b.lastMessage.timestamp).getTime() -
          new Date(a.lastMessage.timestamp).getTime()
        );
      });
      return c.json({ conversations: sortedConversations });
    } catch (error) {
      console.log("Error fetching WhatsApp conversations:", error);
      return c.json({ error: "Error fetching conversations" }, 500);
    }
  }
);

// Get WhatsApp messages for conversation
socialApp.get(
  "/make-server-0dd48dc4/social/whatsapp/conversations/:id/messages",
  async (c) => {
    try {
      const conversationId = c.req.param("id");
      const messages = await kv.getByPrefix(
        `whatsapp_message:${conversationId}:`
      );
      const sortedMessages = messages.sort((a: any, b: any) => {
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
      return c.json({ messages: sortedMessages });
    } catch (error) {
      console.log("Error fetching WhatsApp messages:", error);
      return c.json({ error: "Error fetching messages" }, 500);
    }
  }
);

// Send WhatsApp message
socialApp.post(
  "/make-server-0dd48dc4/social/whatsapp/conversations/:id/messages",
  async (c) => {
    try {
      const conversationId = c.req.param("id");
      const { content } = await c.req.json();
      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      const message = {
        id,
        conversationId,
        content,
        from: "business",
        timestamp,
        status: "sent",
      };

      await kv.set(`whatsapp_message:${conversationId}:${id}`, message);

      // Update conversation last message
      const conversation = await kv.get(
        `whatsapp_conversation:${conversationId}`
      );
      if (conversation) {
        await kv.set(`whatsapp_conversation:${conversationId}`, {
          ...conversation,
          lastMessage: {
            content,
            timestamp,
            from: "business",
          },
        });
      }

      return c.json({ message });
    } catch (error) {
      console.log("Error sending WhatsApp message:", error);
      return c.json({ error: "Error sending message" }, 500);
    }
  }
);

// Get WhatsApp catalog
socialApp.get("/make-server-0dd48dc4/social/whatsapp/catalog", async (c) => {
  try {
    const catalog = await kv.getByPrefix("whatsapp_catalog:");
    return c.json({ catalog });
  } catch (error) {
    console.log("Error fetching WhatsApp catalog:", error);
    return c.json({ error: "Error fetching catalog" }, 500);
  }
});

// ============== CONTENT CALENDAR ==============

socialApp.get("/make-server-0dd48dc4/social/calendar", async (c) => {
  try {
    const month = c.req.query("month");
    const year = c.req.query("year");

    // Get all scheduled posts from all platforms
    const facebookPosts = await kv.getByPrefix("facebook_post:");
    const instagramPosts = await kv.getByPrefix("instagram_post:");
    const whatsappBroadcasts = await kv.getByPrefix("whatsapp_broadcast:");

    const allScheduled = [
      ...facebookPosts
        .filter((p: any) => p.status === "scheduled")
        .map((p: any) => ({ ...p, platform: "facebook" })),
      ...instagramPosts
        .filter((p: any) => p.status === "scheduled")
        .map((p: any) => ({ ...p, platform: "instagram" })),
      ...whatsappBroadcasts
        .filter((b: any) => b.status === "scheduled")
        .map((b: any) => ({ ...b, platform: "whatsapp" })),
    ];

    // Group by date
    const calendar: Record<string, any[]> = {};
    for (const item of allScheduled) {
      const date = new Date(item.scheduledFor).toISOString().split("T")[0];
      if (!calendar[date]) {
        calendar[date] = [];
      }
      calendar[date].push(item);
    }

    return c.json({ calendar });
  } catch (error) {
    console.log("Error fetching calendar:", error);
    return c.json({ error: "Error fetching calendar" }, 500);
  }
});

export default socialApp;
