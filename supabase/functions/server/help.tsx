import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// Get help articles
app.get("/make-server-0dd48dc4/help/articles", async (c) => {
  try {
    const category = c.req.query("category");
    const search = c.req.query("search");
    const articles = [];

    for await (const entry of kv.list({ prefix: "help_article:" })) {
      const article = entry.value as any;
      if (category && article.category !== category) continue;
      if (search && !article.title.toLowerCase().includes(search.toLowerCase())) continue;
      articles.push(article);
    }

    return c.json({ articles, total: articles.length });
  } catch (error) {
    return c.json({ error: "Error fetching help articles" }, 500);
  }
});

// Create help article
app.post("/make-server-0dd48dc4/help/articles", async (c) => {
  try {
    const article = await c.req.json();
    const id = `help_article:${Date.now()}`;
    
    const newArticle = {
      ...article,
      id,
      created_at: new Date().toISOString(),
      views: 0,
      helpful_count: 0,
    };

    await kv.set(id, newArticle);
    return c.json({ article: newArticle });
  } catch (error) {
    return c.json({ error: "Error creating help article" }, 500);
  }
});

// Search help
app.get("/make-server-0dd48dc4/help/search", async (c) => {
  try {
    const query = c.req.query("q") || "";
    const articles = [];

    for await (const entry of kv.list({ prefix: "help_article:" })) {
      const article = entry.value as any;
      if (article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.content?.toLowerCase().includes(query.toLowerCase())) {
        articles.push(article);
      }
    }

    return c.json({ results: articles.slice(0, 10) });
  } catch (error) {
    return c.json({ error: "Error searching help" }, 500);
  }
});

export default app;
