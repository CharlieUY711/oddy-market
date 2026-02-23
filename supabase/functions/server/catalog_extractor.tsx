/* =====================================================
   Catalog Extractor — Extracción de productos desde catálogos
   Usa Claude Vision API para extraer datos estructurados
   Soporta: URL (ScreenshotOne) y archivos (PDF/imagen)
   Charlie Marketplace Builder v1.5
   ===================================================== */
import { Hono } from "npm:hono";

export const catalogExtractor = new Hono();

const SYSTEM_PROMPT = `Sos un experto en extracción de datos de catálogos de productos para eCommerce.
Analizás imágenes de catálogos (páginas web, PDFs, fotos) y extraés TODOS los productos visibles.

REGLAS:
1. Extraé TODOS los productos sin excepción.
2. Las columnas deben ser CONSISTENTES en todos los productos. Si un campo no existe para un producto, usá null.
3. Nombres de columnas: sin espacios, en español, snake_case (ej: precio_uy, nombre, categoria).
4. Valores: solo strings o números. Sin objetos anidados.
5. Para páginas web: extraé nombre, precio, categoría, marca, descripción corta, URL de imagen si está visible, disponibilidad.
6. No inventes datos. Si no podés leer un valor con certeza, usá null.
7. Los precios deben incluir la moneda si está visible (ej: "$1.200" o "USD 45").

RESPONDÉ SOLO con JSON válido, sin markdown, sin texto extra:
{
  "products": [
    { "nombre": "...", "precio": "...", "categoria": "...", "marca": "...", "descripcion": "..." }
  ]
}`;

/* ── Screenshot via ScreenshotOne ───────────────────────────────────────── */
async function takeScreenshot(url: string, apiKey: string): Promise<string> {
  const params = new URLSearchParams({
    access_key: apiKey,
    url: url,
    full_page: "true",          // captura toda la página con scroll
    format: "png",
    viewport_width: "1440",
    viewport_height: "900",
    device_scale_factor: "1",
    delay: "2",                 // espera 2s para que cargue JS
    block_ads: "true",
    block_cookie_banners: "true", // ignora banners de cookies
  });

  const screenshotUrl = `https://api.screenshotone.com/take?${params}`;
  const res = await fetch(screenshotUrl);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ScreenshotOne error ${res.status}: ${text.slice(0, 200)}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const binary = Array.from(buffer, byte => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

/* ── Llamada a Claude Vision ────────────────────────────────────────────── */
async function callClaude(base64Images: string[], anthropicKey: string): Promise<Record<string, unknown>[]> {
  const imageContent = base64Images.map((b64) => ({
    type: "image",
    source: { type: "base64", media_type: "image/png", data: b64 },
  }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: [
          ...imageContent,
          { type: "text", text: "Extraé todos los productos visibles. Respondé solo con el JSON indicado." },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Claude API ${res.status}: ${(err as { error?: { message?: string } })?.error?.message || "error desconocido"}`);
  }

  const data = await res.json() as { content: Array<{ type: string; text?: string }> };
  const text = data.content.find((b) => b.type === "text")?.text || "";
  
  // Limpiar markdown code blocks
  let clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  // Intentar extraer JSON si hay texto antes/después
  // Buscar el primer { y el último } que formen un objeto JSON válido
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(clean) as { products?: Record<string, unknown>[] };
    return parsed.products || [];
  } catch (parseErr) {
    // Log para debug
    console.error("[callClaude] Error parseando JSON:", parseErr);
    console.error("[callClaude] Texto recibido:", text.substring(0, 500));
    console.error("[callClaude] Texto limpiado:", clean.substring(0, 500));
    
    // Intentar extraer JSON con regex más agresivo
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as { products?: Record<string, unknown>[] };
        return parsed.products || [];
      } catch {
        // Si falla, lanzar error con más contexto
        throw new Error(`Respuesta de Claude no es JSON válido. Primeros 200 chars: ${clean.substring(0, 200)}`);
      }
    }
    
    throw new Error(`Respuesta de Claude no es JSON válido. Error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
  }
}

/* ────────────────────────────────────────────────────
   POST /catalog-extractor
   Recibe URL o archivo (PDF/imagen) y extrae productos usando Claude Vision
   ──────────────────────────────────────────────────── */
catalogExtractor.post("/", async (c) => {
  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const screenshotKey = Deno.env.get("SCREENSHOTONE_API_KEY");

    if (!anthropicKey) {
      return c.json({ ok: false, error: "ANTHROPIC_API_KEY no configurada en el servidor." }, 500);
    }

    const formData = await c.req.formData();
    const mode = formData.get("mode") as string || "file";

    let base64Images: string[] = [];

    // ── Modo URL ──────────────────────────────────────────────────────────────
    if (mode === "url") {
      const targetUrl = formData.get("url") as string;
      if (!targetUrl) {
        return c.json({ ok: false, error: "No se recibió URL." }, 400);
      }
      if (!screenshotKey) {
        return c.json({ 
          ok: false, 
          error: "SCREENSHOTONE_API_KEY no configurada. Creá una cuenta gratis en screenshotone.com" 
        }, 500);
      }

      const b64 = await takeScreenshot(targetUrl, screenshotKey);
      base64Images = [b64];
    }

    // ── Modo archivo ──────────────────────────────────────────────────────────
    else {
      const file = formData.get("file") as File | null;
      if (!file) {
        return c.json({ ok: false, error: "No se recibió archivo." }, 400);
      }

      const mimeType = file.type;
      const isImage = mimeType.startsWith("image/");
      const isPDF = mimeType === "application/pdf";

      if (!isImage && !isPDF) {
        return c.json({ ok: false, error: "Formato no soportado. Usá PDF, PNG, JPG o WEBP." }, 400);
      }

      if (isImage) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const binary = Array.from(buffer, byte => String.fromCharCode(byte)).join('');
        base64Images = [btoa(binary)];
      } else if (isPDF) {
        // Para PDFs, el cliente debe convertirlos a imágenes antes de enviarlos
        // Esto se maneja en el componente CatalogExtractorWorkspace
        return c.json({ 
          ok: false, 
          error: "Los PDFs deben convertirse a imágenes en el cliente antes de enviarlos. Por favor, convierte el PDF a PNG/JPG primero." 
        }, 400);
      }
    }

    const products = await callClaude(base64Images, anthropicKey);
    return c.json({ ok: true, products });

  } catch (err) {
    console.error("[catalog-extractor]", err);
    return c.json({ 
      ok: false, 
      error: err instanceof Error ? err.message : "Error interno al procesar el catálogo." 
    }, 500);
  }
});
