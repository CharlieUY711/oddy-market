import { Hono } from "npm:hono";

const app = new Hono();

app.post("/make-server-0dd48dc4/documents/generate", async (c) => {
  try {
    const { templateId, type } = await c.req.json();
    
    const docUrl = `https://placeholder.com/document-${templateId}-${Date.now()}.pdf`;
    
    return c.json({ 
      success: true,
      downloadUrl: docUrl,
      documentId: `doc:${Date.now()}`
    });
  } catch (error) {
    console.log("Error generating document:", error);
    return c.json({ error: "Error generating document" }, 500);
  }
});

app.post("/make-server-0dd48dc4/documents/ai-generate", async (c) => {
  try {
    const { prompt } = await c.req.json();
    
    const docUrl = `https://placeholder.com/ai-document-${Date.now()}.pdf`;
    
    return c.json({ 
      success: true,
      downloadUrl: docUrl,
      documentId: `doc:ai:${Date.now()}`
    });
  } catch (error) {
    console.log("Error generating AI document:", error);
    return c.json({ error: "Error generating AI document" }, 500);
  }
});

export default app;
