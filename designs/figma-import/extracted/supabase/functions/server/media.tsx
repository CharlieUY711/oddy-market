import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.get("/make-server-0dd48dc4/media", async (c) => {
  try {
    const files = await kv.getByPrefix("media:");
    return c.json({ files });
  } catch (error) {
    console.log("Error fetching media files:", error);
    return c.json({ error: "Error fetching media files" }, 500);
  }
});

app.post("/make-server-0dd48dc4/media/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");
    const type = formData.get("type") || "image";
    const folder = formData.get("folder");
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    const fileData = {
      id: `media:${type}:${Date.now()}`,
      name: file.name,
      type: type,
      size: file.size,
      mimeType: file.type,
      folder: folder || undefined,
      uploadedAt: new Date().toISOString(),
      url: `https://placeholder.com/${file.name}`,
    };

    await kv.set(fileData.id, fileData);
    
    return c.json({ file: fileData });
  } catch (error) {
    console.log("Error uploading file:", error);
    return c.json({ error: "Error uploading file" }, 500);
  }
});

app.delete("/make-server-0dd48dc4/media/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting media file:", error);
    return c.json({ error: "Error deleting media file" }, 500);
  }
});

app.post("/make-server-0dd48dc4/media/:id/star", async (c) => {
  try {
    const id = c.req.param("id");
    const { starred } = await c.req.json();
    
    const file = await kv.get(id);
    if (!file) {
      return c.json({ error: "File not found" }, 404);
    }

    await kv.set(id, { ...file, starred });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error starring file:", error);
    return c.json({ error: "Error starring file" }, 500);
  }
});

export default app;
