import { Hono } from "hono";
import { cors } from "hono/cors";
import QRCode from "qrcode";

const app = new Hono();

// CORS middleware
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-user-id", "x-user-name", "x-user-email"],
}));

// In-memory storage (en producción usar Supabase KV)
const qrCodes = new Map<string, any>();
const barcodes = new Map<string, any>();
const templates = new Map<string, any>();
const scanEvents = new Map<string, any[]>();

// Helper functions
function generateId(): string {
  return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateBarcodeId(): string {
  return `barcode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateShortUrl(codeId: string): string {
  return `https://oddy.market/qr/${codeId}`;
}

// Barcode validation functions
function validateEAN13(data: string): boolean {
  if (!/^\d{13}$/.test(data)) return false;
  const digits = data.split("").map(Number);
  const sum = digits.slice(0, 12).reduce((acc, val, idx) => acc + val * (idx % 2 === 0 ? 1 : 3), 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
}

function validateEAN8(data: string): boolean {
  if (!/^\d{8}$/.test(data)) return false;
  const digits = data.split("").map(Number);
  const sum = digits.slice(0, 7).reduce((acc, val, idx) => acc + val * (idx % 2 === 0 ? 1 : 3), 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[7];
}

function validateUPCA(data: string): boolean {
  if (!/^\d{12}$/.test(data)) return false;
  return true;
}

function validateCode128(data: string): boolean {
  return /^[\x00-\x7F]+$/.test(data);
}

function validateCode39(data: string): boolean {
  return /^[A-Z0-9\s\-\.\$\/\+\%]+$/.test(data);
}

function validateITF14(data: string): boolean {
  return /^\d{14}$/.test(data);
}

function validateMSI(data: string): boolean {
  return /^\d+$/.test(data);
}

function validatePharmacode(data: string): boolean {
  const num = parseInt(data);
  return !isNaN(num) && num >= 3 && num <= 131070;
}

function validateCodabar(data: string): boolean {
  return /^[0-9A-D\-\$:\.\/\+]+$/.test(data);
}

function validateBarcodeType(type: string, data: string): { valid: boolean; error?: string } {
  switch (type) {
    case "EAN-13":
      return validateEAN13(data) ? { valid: true } : { valid: false, error: "EAN-13 inválido" };
    case "EAN-8":
      return validateEAN8(data) ? { valid: true } : { valid: false, error: "EAN-8 inválido" };
    case "UPC-A":
      return validateUPCA(data) ? { valid: true } : { valid: false, error: "UPC-A inválido" };
    case "Code128":
      return validateCode128(data) ? { valid: true } : { valid: false, error: "Code 128 inválido" };
    case "Code39":
      return validateCode39(data) ? { valid: true } : { valid: false, error: "Code 39 inválido" };
    case "ITF-14":
      return validateITF14(data) ? { valid: true } : { valid: false, error: "ITF-14 inválido" };
    case "MSI":
      return validateMSI(data) ? { valid: true } : { valid: false, error: "MSI inválido" };
    case "Pharmacode":
      return validatePharmacode(data) ? { valid: true } : { valid: false, error: "Pharmacode inválido" };
    case "Codabar":
      return validateCodabar(data) ? { valid: true } : { valid: false, error: "Codabar inválido" };
    default:
      return { valid: false, error: `Tipo de código de barras no soportado: ${type}` };
  }
}

function formatQRContent(content: any): string {
  switch (content.type) {
    case "text":
      return content.data || "";
    case "url":
      return content.data || "";
    case "email":
      return `mailto:${content.data || ""}${content.subject ? `?subject=${encodeURIComponent(content.subject)}` : ""}${content.body ? `&body=${encodeURIComponent(content.body)}` : ""}`;
    case "phone":
      return `tel:${content.data || ""}`;
    case "sms":
      return `sms:${content.data || ""}${content.message ? `?body=${encodeURIComponent(content.message)}` : ""}`;
    case "wifi":
      return `WIFI:T:${content.security || "WPA"};S:${content.ssid || ""};P:${content.password || ""};H:${content.hidden ? "true" : "false"};;`;
    case "vcard":
      const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${content.name || ""}`,
        content.organization ? `ORG:${content.organization}` : "",
        content.phone ? `TEL:${content.phone}` : "",
        content.email ? `EMAIL:${content.email}` : "",
        content.url ? `URL:${content.url}` : "",
        content.address ? `ADR:;;${content.address};;;` : "",
        "END:VCARD"
      ].filter(Boolean).join("\n");
      return vcard;
    case "location":
      return `geo:${content.latitude || ""},${content.longitude || ""}${content.altitude ? `,${content.altitude}` : ""}`;
    case "product":
      return content.url || `https://oddy.market/product/${content.productId || ""}`;
    default:
      return "";
  }
}

async function generateQRCodeDataURL(content: string, options: any): Promise<string> {
  const qrOptions: any = {
    errorCorrectionLevel: options.errorCorrection || "M",
    type: "image/png",
    quality: 0.92,
    margin: options.margin || 4,
    color: {
      dark: options.foregroundColor || "#000000",
      light: options.backgroundColor || "#FFFFFF"
    },
    width: options.size || 512
  };
  try {
    const dataURL = await QRCode.toDataURL(content, qrOptions);
    return dataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Error al generar código QR");
  }
}

// QR Code Endpoints
app.post("/qr-barcode/qr/generate", async (c) => {
  try {
    const body = await c.req.json();
    const userId = c.req.header("x-user-id") || "anonymous";
    const userName = c.req.header("x-user-name") || "Usuario";
    const userEmail = c.req.header("x-user-email") || "usuario@example.com";

    const { content, config, design, isDynamic, metadata } = body;

    if (!content || !content.type) {
      return c.json({ success: false, error: "Contenido requerido" }, 400);
    }

    const formattedContent = formatQRContent(content);
    if (!formattedContent) {
      return c.json({ success: false, error: "Contenido inválido" }, 400);
    }

    const codeId = generateId();
    const qrDataURL = await generateQRCodeDataURL(formattedContent, {
      ...config,
      ...design
    });

    const qrCode = {
      id: codeId,
      type: "qr",
      content: formattedContent,
      originalContent: content,
      config,
      design,
      isDynamic: isDynamic || false,
      metadata: {
        ...metadata,
        name: metadata.name || `QR ${content.type}`,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: userId,
          name: userName,
          email: userEmail
        }
      },
      status: "active",
      shortUrl: isDynamic ? generateShortUrl(codeId) : null,
      files: {
        png: qrDataURL
      },
      analytics: {
        scans: 0,
        lastScan: null
      }
    };

    qrCodes.set(codeId, qrCode);

    return c.json({ success: true, code: qrCode });
  } catch (error: any) {
    console.error("Error in QR generation:", error);
    return c.json({ success: false, error: error.message || "Error al generar QR" }, 500);
  }
});

app.get("/qr-barcode/qr/:id", async (c) => {
  const id = c.req.param("id");
  const code = qrCodes.get(id);

  if (!code) {
    return c.json({ success: false, error: "Código no encontrado" }, 404);
  }

  return c.json({ success: true, code });
});

app.put("/qr-barcode/qr/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const code = qrCodes.get(id);

    if (!code) {
      return c.json({ success: false, error: "Código no encontrado" }, 404);
    }

    if (!code.isDynamic) {
      return c.json({ success: false, error: "Este código no es dinámico" }, 400);
    }

    const updatedCode = { ...code, ...body };
    qrCodes.set(id, updatedCode);

    return c.json({ success: true, code: updatedCode });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.delete("/qr-barcode/qr/:id", async (c) => {
  const id = c.req.param("id");
  const deleted = qrCodes.delete(id);

  if (!deleted) {
    return c.json({ success: false, error: "Código no encontrado" }, 404);
  }

  return c.json({ success: true });
});

// Barcode Endpoints
app.post("/qr-barcode/barcode/generate", async (c) => {
  try {
    const body = await c.req.json();
    const userId = c.req.header("x-user-id") || "anonymous";
    const userName = c.req.header("x-user-name") || "Usuario";
    const userEmail = c.req.header("x-user-email") || "usuario@example.com";

    const { content, config, design, metadata } = body;

    if (!content || !content.type || !content.data) {
      return c.json({ success: false, error: "Contenido requerido" }, 400);
    }

    const validation = validateBarcodeType(content.type, content.data);
    if (!validation.valid) {
      return c.json({ success: false, error: validation.error }, 400);
    }

    const codeId = generateBarcodeId();
    const barcode = {
      id: codeId,
      type: "barcode",
      content: {
        type: content.type,
        data: content.data,
        text: content.text || content.data
      },
      config,
      design,
      metadata: {
        ...metadata,
        name: metadata.name || `Barcode ${content.type}`,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: userId,
          name: userName,
          email: userEmail
        }
      },
      status: "active",
      analytics: {
        scans: 0,
        lastScan: null
      }
    };

    barcodes.set(codeId, barcode);

    return c.json({ success: true, code: barcode });
  } catch (error: any) {
    console.error("Error in barcode generation:", error);
    return c.json({ success: false, error: error.message || "Error al generar código de barras" }, 500);
  }
});

app.get("/qr-barcode/barcode/:id", async (c) => {
  const id = c.req.param("id");
  const code = barcodes.get(id);

  if (!code) {
    return c.json({ success: false, error: "Código no encontrado" }, 404);
  }

  return c.json({ success: true, code });
});

app.delete("/qr-barcode/barcode/:id", async (c) => {
  const id = c.req.param("id");
  const deleted = barcodes.delete(id);

  if (!deleted) {
    return c.json({ success: false, error: "Código no encontrado" }, 404);
  }

  return c.json({ success: true });
});

// Batch Generation
app.post("/qr-barcode/:type/batch", async (c) => {
  try {
    const type = c.req.param("type");
    const body = await c.req.json();
    const { items, commonConfig, commonDesign } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ success: false, error: "Items requeridos" }, 400);
    }

    const results: any[] = [];
    for (const item of items) {
      try {
        if (type === "qr") {
          const formattedContent = formatQRContent(item.content);
          const qrDataURL = await generateQRCodeDataURL(formattedContent, {
            ...commonConfig,
            ...commonDesign
          });
          const codeId = generateId();
          const code = {
            id: codeId,
            type: "qr",
            content: formattedContent,
            originalContent: item.content,
            config: commonConfig,
            design: commonDesign,
            metadata: item.metadata,
            files: { png: qrDataURL },
            analytics: { scans: 0 }
          };
          qrCodes.set(codeId, code);
          results.push({ success: true, code });
        } else {
          const validation = validateBarcodeType(item.content.type, item.content.data);
          if (!validation.valid) {
            results.push({ success: false, error: validation.error });
            continue;
          }
          const codeId = generateBarcodeId();
          const code = {
            id: codeId,
            type: "barcode",
            content: item.content,
            config: commonConfig,
            design: commonDesign,
            metadata: item.metadata,
            analytics: { scans: 0 }
          };
          barcodes.set(codeId, code);
          results.push({ success: true, code });
        }
      } catch (error: any) {
        results.push({ success: false, error: error.message });
      }
    }

    return c.json({
      success: true,
      batch: {
        total: items.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// History
app.get("/qr-barcode/history", async (c) => {
  const userId = c.req.header("x-user-id");
  const type = c.req.query("type");
  const status = c.req.query("status");

  const allCodes: any[] = [];
  qrCodes.forEach(code => {
    if (!userId || code.metadata.createdBy.id === userId) {
      if (!type || type === "qr") {
        if (!status || code.status === status) {
          allCodes.push(code);
        }
      }
    }
  });

  barcodes.forEach(code => {
    if (!userId || code.metadata.createdBy.id === userId) {
      if (!type || type === "barcode") {
        if (!status || code.status === status) {
          allCodes.push(code);
        }
      }
    }
  });

  allCodes.sort((a, b) => 
    new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
  );

  return c.json({ success: true, codes: allCodes });
});

// Templates
app.get("/qr-barcode/templates", async (c) => {
  const category = c.req.query("category");
  const allTemplates = Array.from(templates.values());
  const filtered = category && category !== "all" 
    ? allTemplates.filter(t => t.category === category)
    : allTemplates;
  return c.json({ success: true, templates: filtered });
});

app.post("/qr-barcode/templates", async (c) => {
  try {
    const body = await c.req.json();
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const template = {
      id: templateId,
      ...body,
      createdAt: new Date().toISOString(),
      usage: { timesUsed: 0 }
    };
    templates.set(templateId, template);
    return c.json({ success: true, template });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Analytics
app.get("/qr-barcode/analytics", async (c) => {
  const userId = c.req.header("x-user-id");
  
  const userQRCodes = Array.from(qrCodes.values()).filter(
    code => !userId || code.metadata.createdBy.id === userId
  );
  const userBarcodes = Array.from(barcodes.values()).filter(
    code => !userId || code.metadata.createdBy.id === userId
  );

  const totalCodes = userQRCodes.length + userBarcodes.length;
  const totalScans = [...userQRCodes, ...userBarcodes].reduce(
    (sum, code) => sum + (code.analytics?.scans || 0), 0
  );
  const activeCodes = [...userQRCodes, ...userBarcodes].filter(
    code => code.status === "active"
  ).length;

  const topCodes = [...userQRCodes, ...userBarcodes]
    .map(code => ({
      id: code.id,
      name: code.metadata.name,
      type: code.type,
      scans: code.analytics?.scans || 0
    }))
    .sort((a, b) => b.scans - a.scans)
    .slice(0, 10);

  return c.json({
    success: true,
    analytics: {
      totalCodes,
      totalScans,
      activeCodes,
      archivedCodes: totalCodes - activeCodes,
      topCodes
    }
  });
});

app.get("/qr-barcode/analytics/:id", async (c) => {
  const id = c.req.param("id");
  const code = qrCodes.get(id) || barcodes.get(id);

  if (!code) {
    return c.json({ success: false, error: "Código no encontrado" }, 404);
  }

  const events = scanEvents.get(id) || [];

  return c.json({
    success: true,
    code: {
      ...code,
      analytics: {
        ...code.analytics,
        events
      }
    }
  });
});

// Track scan
app.post("/qr-barcode/scan/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const code = qrCodes.get(id) || barcodes.get(id);

  if (!code) {
    return c.json({ success: false, error: "Código no encontrado" }, 404);
  }

  const event = {
    id: `event_${Date.now()}`,
    codeId: id,
    timestamp: new Date().toISOString(),
    ...body
  };

  const events = scanEvents.get(id) || [];
  events.push(event);
  scanEvents.set(id, events);

  code.analytics = {
    ...code.analytics,
    scans: (code.analytics?.scans || 0) + 1,
    lastScan: event.timestamp
  };

  if (code.type === "qr") {
    qrCodes.set(id, code);
  } else {
    barcodes.set(id, code);
  }

  return c.json({ success: true, event });
});

export default app;
