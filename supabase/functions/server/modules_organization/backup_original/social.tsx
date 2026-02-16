import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// ACCOUNTS - Cuentas de Redes Sociales
// ==========================================

// Create social account
app.post("/make-server-0dd48dc4/social/accounts", async (c) => {
  try {
    const account = await c.req.json();
    const id = account.id || `social_account:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newAccount = {
      ...account,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      platform: account.platform || "facebook", // facebook, instagram, twitter, linkedin, tiktok
      status: account.status || "connected",
      credentials: account.credentials || {},
      stats: {
        followers: 0,
        following: 0,
        posts: 0,
        engagement_rate: 0,
      },
    };

    await kv.set(id, newAccount);
    return c.json({ account: newAccount });
  } catch (error) {
    return c.json({ error: "Error creating social account" }, 500);
  }
});

// Get social accounts
app.get("/make-server-0dd48dc4/social/accounts", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const platform = c.req.query("platform");
    const accounts = [];

    for await (const entry of kv.list({ prefix: "social_account:" })) {
      const account = entry.value as any;
      if (account.entity_id === entity_id) {
        if (platform && account.platform !== platform) continue;
        accounts.push(account);
      }
    }

    return c.json({ accounts, total: accounts.length });
  } catch (error) {
    return c.json({ error: "Error fetching social accounts" }, 500);
  }
});

// ==========================================
// POSTS - Publicaciones
// ==========================================

// Create post
app.post("/make-server-0dd48dc4/social/posts", async (c) => {
  try {
    const post = await c.req.json();
    const id = post.id || `social_post:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newPost = {
      ...post,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: post.status || "draft", // draft, scheduled, published, failed
      scheduled_for: post.scheduled_for || null,
      published_at: null,
      platforms: post.platforms || [],
      content: post.content || {},
      media: post.media || [],
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        engagement_rate: 0,
      },
    };

    await kv.set(id, newPost);
    return c.json({ post: newPost });
  } catch (error) {
    return c.json({ error: "Error creating post" }, 500);
  }
});

// Get posts
app.get("/make-server-0dd48dc4/social/posts", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const posts = [];

    for await (const entry of kv.list({ prefix: "social_post:" })) {
      const post = entry.value as any;
      if (post.entity_id === entity_id) {
        if (status && post.status !== status) continue;
        posts.push(post);
      }
    }

    return c.json({ posts, total: posts.length });
  } catch (error) {
    return c.json({ error: "Error fetching posts" }, 500);
  }
});

// Publish post
app.post("/make-server-0dd48dc4/social/posts/:id/publish", async (c) => {
  try {
    const id = c.req.param("id");
    const post = await kv.get(id);

    if (!post.value) {
      return c.json({ error: "Post not found" }, 404);
    }

    const updatedPost = {
      ...post.value,
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedPost);
    return c.json({ post: updatedPost, message: "Post published successfully" });
  } catch (error) {
    return c.json({ error: "Error publishing post" }, 500);
  }
});

// ==========================================
// CALENDAR - Calendario de Publicaciones
// ==========================================

// Get calendar
app.get("/make-server-0dd48dc4/social/calendar", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const start_date = c.req.query("start_date");
    const end_date = c.req.query("end_date");

    const posts = [];
    for await (const entry of kv.list({ prefix: "social_post:" })) {
      const post = entry.value as any;
      if (post.entity_id === entity_id && post.scheduled_for) {
        if (start_date && end_date) {
          const scheduledDate = new Date(post.scheduled_for);
          if (scheduledDate >= new Date(start_date) && scheduledDate <= new Date(end_date)) {
            posts.push(post);
          }
        } else {
          posts.push(post);
        }
      }
    }

    return c.json({ posts, total: posts.length });
  } catch (error) {
    return c.json({ error: "Error fetching calendar" }, 500);
  }
});

// ==========================================
// ANALYTICS - Análisis de Redes Sociales
// ==========================================

// Get platform analytics
app.get("/make-server-0dd48dc4/social/analytics/platforms", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const accounts = [];
    for await (const entry of kv.list({ prefix: "social_account:" })) {
      const account = entry.value as any;
      if (account.entity_id === entity_id) accounts.push(account);
    }

    const platformStats = accounts.map((account) => ({
      platform: account.platform,
      followers: account.stats?.followers || 0,
      engagement_rate: account.stats?.engagement_rate || 0,
      posts: account.stats?.posts || 0,
    }));

    return c.json({ platforms: platformStats });
  } catch (error) {
    return c.json({ error: "Error fetching platform analytics" }, 500);
  }
});

// Get post performance
app.get("/make-server-0dd48dc4/social/analytics/posts", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const posts = [];
    for await (const entry of kv.list({ prefix: "social_post:" })) {
      const post = entry.value as any;
      if (post.entity_id === entity_id && post.status === "published") {
        posts.push(post);
      }
    }

    const topPosts = posts
      .sort((a, b) => (b.stats?.engagement_rate || 0) - (a.stats?.engagement_rate || 0))
      .slice(0, 10);

    return c.json({
      total_posts: posts.length,
      top_posts: topPosts,
      average_engagement: posts.length > 0
        ? posts.reduce((sum, p) => sum + (p.stats?.engagement_rate || 0), 0) / posts.length
        : 0,
    });
  } catch (error) {
    return c.json({ error: "Error fetching post analytics" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/social/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const accounts = [];
    const posts = [];

    for await (const entry of kv.list({ prefix: "social_account:" })) {
      const account = entry.value as any;
      if (account.entity_id === entity_id) accounts.push(account);
    }

    for await (const entry of kv.list({ prefix: "social_post:" })) {
      const post = entry.value as any;
      if (post.entity_id === entity_id) posts.push(post);
    }

    return c.json({
      dashboard: {
        accounts: {
          total: accounts.length,
          connected: accounts.filter((a) => a.status === "connected").length,
        },
        posts: {
          total: posts.length,
          published: posts.filter((p) => p.status === "published").length,
          scheduled: posts.filter((p) => p.status === "scheduled").length,
          draft: posts.filter((p) => p.status === "draft").length,
        },
        total_followers: accounts.reduce((sum, a) => sum + (a.stats?.followers || 0), 0),
        average_engagement: accounts.length > 0
          ? accounts.reduce((sum, a) => sum + (a.stats?.engagement_rate || 0), 0) / accounts.length
          : 0,
      },
    });
  } catch (error) {
    return c.json({ error: "Error fetching dashboard" }, 500);
  }
});

export default app;
