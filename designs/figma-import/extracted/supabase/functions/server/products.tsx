import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Articles/Products routes
app.get("/make-server-0dd48dc4/articles", async (c) => {
  try {
    const articles = await kv.getByPrefix("article:");
    return c.json({ articles });
  } catch (error) {
    console.log("Error fetching articles:", error);
    return c.json({ error: "Error fetching articles" }, 500);
  }
});

app.get("/make-server-0dd48dc4/articles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const article = await kv.get(id);
    
    if (!article) {
      return c.json({ error: "Article not found" }, 404);
    }
    
    return c.json({ article });
  } catch (error) {
    console.log("Error fetching article:", error);
    return c.json({ error: "Error fetching article" }, 500);
  }
});

app.post("/make-server-0dd48dc4/articles", async (c) => {
  try {
    const article = await c.req.json();
    const id = article.id || `article:${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const newArticle = {
      ...article,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(id, newArticle);
    return c.json({ article: newArticle });
  } catch (error) {
    console.log("Error creating article:", error);
    return c.json({ error: "Error creating article" }, 500);
  }
});

app.put("/make-server-0dd48dc4/articles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(id);
    
    if (!existing) {
      return c.json({ error: "Article not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(id, updated);
    return c.json({ article: updated });
  } catch (error) {
    console.log("Error updating article:", error);
    return c.json({ error: "Error updating article" }, 500);
  }
});

app.delete("/make-server-0dd48dc4/articles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting article:", error);
    return c.json({ error: "Error deleting article" }, 500);
  }
});

export default app;
