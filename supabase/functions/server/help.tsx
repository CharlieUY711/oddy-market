import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// HELP - Sistema de Ayuda
// ==========================================

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

// Get article by ID
app.get("/make-server-0dd48dc4/help/articles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const article = await kv.get(id);

    if (!article.value) {
      return c.json({ error: "Article not found" }, 404);
    }

    // Increment views
    article.value.views = (article.value.views || 0) + 1;
    await kv.set(id, article.value);

    return c.json({ article: article.value });
  } catch (error) {
    return c.json({ error: "Error fetching article" }, 500);
  }
});

// Create article (admin)
app.post("/make-server-0dd48dc4/help/articles", async (c) => {
  try {
    const article = await c.req.json();
    const id = article.id || `help_article:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newArticle = {
      ...article,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      views: 0,
      helpful_count: 0,
      not_helpful_count: 0,
    };

    await kv.set(id, newArticle);
    return c.json({ article: newArticle });
  } catch (error) {
    return c.json({ error: "Error creating article" }, 500);
  }
});

// Rate article
app.post("/make-server-0dd48dc4/help/articles/:id/rate", async (c) => {
  try {
    const id = c.req.param("id");
    const { helpful } = await c.req.json();
    const article = await kv.get(id);

    if (!article.value) {
      return c.json({ error: "Article not found" }, 404);
    }

    if (helpful) {
      article.value.helpful_count = (article.value.helpful_count || 0) + 1;
    } else {
      article.value.not_helpful_count = (article.value.not_helpful_count || 0) + 1;
    }

    await kv.set(id, article.value);
    return c.json({ message: "Rating recorded", article: article.value });
  } catch (error) {
    return c.json({ error: "Error rating article" }, 500);
  }
});

// ==========================================
// FAQ - Preguntas Frecuentes
// ==========================================

// Get FAQs
app.get("/make-server-0dd48dc4/help/faqs", async (c) => {
  try {
    const category = c.req.query("category");
    const faqs = [];

    for await (const entry of kv.list({ prefix: "faq:" })) {
      const faq = entry.value as any;
      if (category && faq.category !== category) continue;
      faqs.push(faq);
    }

    return c.json({ faqs, total: faqs.length });
  } catch (error) {
    return c.json({ error: "Error fetching FAQs" }, 500);
  }
});

// Search help
app.get("/make-server-0dd48dc4/help/search", async (c) => {
  try {
    const query = c.req.query("q");
    if (!query) {
      return c.json({ error: "Query parameter required" }, 400);
    }

    const results = [];
    
    // Search articles
    for await (const entry of kv.list({ prefix: "help_article:" })) {
      const article = entry.value as any;
      if (article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({ type: "article", ...article });
      }
    }

    // Search FAQs
    for await (const entry of kv.list({ prefix: "faq:" })) {
      const faq = entry.value as any;
      if (faq.question.toLowerCase().includes(query.toLowerCase()) ||
          faq.answer.toLowerCase().includes(query.toLowerCase())) {
        results.push({ type: "faq", ...faq });
      }
    }

    return c.json({ results, total: results.length });
  } catch (error) {
    return c.json({ error: "Error searching help" }, 500);
  }
});

export default app;
