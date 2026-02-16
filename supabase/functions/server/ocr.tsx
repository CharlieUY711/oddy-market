/**
 * OCR Module - Backend
 * Proporciona endpoints para reconocimiento óptico de caracteres
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { createKVStore } from "./kv_store.tsx";

const ocrApp = new Hono();

// CORS
ocrApp.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-user-id", "x-user-name", "x-user-email"],
}));

// KV Store con prefijos
const kvResults = createKVStore("ocr_result");
const kvBatch = createKVStore("batch_ocr");
const kvTemplates = createKVStore("ocr_template");

// Interfaces
interface OCRResult {
  id: string;
  type: "general" | "invoice" | "receipt" | "id-card" | "credit-card" | "business-card" | "product";
  source: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    pages?: number;
  };
  rawText: string;
  processedText: {
    text: string;
    confidence: number;
    language: string;
  };
  structuredData?: any;
  processing: {
    engine: "replicate" | "tesseract";
    model?: string;
    processingTime: number;
    pagesProcessed?: number;
    status: "pending" | "processing" | "completed" | "failed";
  };
  validation?: {
    isValid: boolean;
    confidence: number;
    errors: Array<{
      field: string;
      message: string;
      severity: "error" | "warning" | "info";
    }>;
    suggestions?: Array<{
      field: string;
      originalValue: string;
      suggestedValue: string;
      confidence: number;
    }>;
  };
  linkedTo?: {
    type: string;
    id: string;
    metadata?: any;
  };
  metadata: {
    name: string;
    description?: string;
    tags?: string[];
    category?: string;
  };
  owner: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  exports?: Array<{
    format: string;
    url: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface BatchOCRJob {
  id: string;
  files: Array<{
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    status: "pending" | "processing" | "completed" | "failed";
    resultId?: string;
    error?: string;
  }>;
  type: string;
  templateId?: string;
  options: {
    language?: string;
    autoValidate?: boolean;
    autoCorrect?: boolean;
  };
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  results: {
    successful: number;
    failed: number;
    total: number;
  };
  owner: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Helper: Generar ID único
function generateId(prefix: string = "ocr"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Llamar a Replicate API
async function callReplicateAPI(imageUrl: string, options: any = {}): Promise<{
  text: string;
  confidence: number;
  language: string;
}> {
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
  
  if (!REPLICATE_API_KEY) {
    throw new Error("REPLICATE_API_KEY no configurada");
  }

  try {
    // Usar modelo de OCR de Replicate
    const model = "fofr/ocr:latest";
    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "latest",
        input: {
          image: imageUrl,
          language: options.language || "auto",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Replicate API error: ${error}`);
    }

    const data = await response.json();
    
    // Polling para obtener el resultado
    let result = data;
    while (result.status === "starting" || result.status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            "Authorization": `Token ${REPLICATE_API_KEY}`,
          },
        }
      );
      result = await statusResponse.json();
    }

    if (result.status === "failed") {
      throw new Error(result.error || "OCR processing failed");
    }

    // Extraer texto y confianza del resultado
    const output = result.output || {};
    return {
      text: output.text || "",
      confidence: output.confidence || 0.85,
      language: output.language || options.language || "es",
    };
  } catch (error) {
    console.error("Error calling Replicate API:", error);
    throw error;
  }
}

// Helper: Procesar imagen con OCR
async function processImageOCR(
  imageUrl: string,
  type: string,
  options: any = {}
): Promise<OCRResult["processedText"]> {
  try {
    // Intentar con Replicate primero
    return await callReplicateAPI(imageUrl, options);
  } catch (error) {
    console.error("Replicate failed, using fallback:", error);
    // Fallback: retornar texto básico (en producción usarías Tesseract.js)
    return {
      text: "[OCR Fallback: Replicate API no disponible. Configura REPLICATE_API_KEY]",
      confidence: 0.5,
      language: options.language || "es",
    };
  }
}

// Helper: Extraer datos estructurados
async function extractStructuredData(
  text: string,
  type: string,
  templateId?: string
): Promise<any> {
  // Placeholder para extracción estructurada
  // En producción, usarías modelos de IA o reglas específicas
  switch (type) {
    case "invoice":
      return {
        issuer: { name: "", taxId: "", address: "" },
        recipient: { name: "", taxId: "", address: "" },
        invoice: { number: "", date: "", dueDate: "", currency: "USD" },
        items: [],
        totals: { subtotal: 0, tax: 0, total: 0 },
      };
    case "receipt":
      return {
        merchant: { name: "", address: "", phone: "" },
        transaction: { number: "", date: "", total: 0 },
        items: [],
        totals: { subtotal: 0, tax: 0, total: 0 },
      };
    case "product":
      return {
        basic: { name: "", brand: "", sku: "", barcode: "" },
        pricing: { price: 0, currency: "USD" },
        specifications: {},
      };
    default:
      return null;
  }
}

// Helper: Validar datos
function validateData(data: any, type: string): OCRResult["validation"] {
  const errors: OCRResult["validation"]["errors"] = [];
  
  // Validaciones básicas
  if (type === "invoice" && data?.invoice) {
    if (!data.invoice.number) {
      errors.push({
        field: "invoice.number",
        message: "Número de factura no encontrado",
        severity: "warning",
      });
    }
    if (data.totals && data.totals.subtotal + data.totals.tax !== data.totals.total) {
      errors.push({
        field: "totals",
        message: "Los totales no coinciden",
        severity: "error",
      });
    }
  }

  return {
    isValid: errors.filter((e) => e.severity === "error").length === 0,
    confidence: 0.85,
    errors,
  };
}

// POST /ocr/extract - OCR General
ocrApp.post("/extract", async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrl, fileName, fileType, fileSize, type = "general", templateId, options = {} } = body;

    const userId = c.req.header("x-user-id") || "anonymous";
    const userName = c.req.header("x-user-name") || "Usuario";
    const userEmail = c.req.header("x-user-email") || "usuario@example.com";

    if (!imageUrl) {
      return c.json({ error: "imageUrl es requerido" }, 400);
    }

    // Procesar OCR
    const processedText = await processImageOCR(imageUrl, type, options);
    
    // Extraer datos estructurados si es necesario
    let structuredData = null;
    if (type !== "general") {
      structuredData = await extractStructuredData(processedText.text, type, templateId);
    }

    // Validar datos
    let validation = null;
    if (structuredData) {
      validation = validateData(structuredData, type);
    }

    // Crear resultado
    const result: OCRResult = {
      id: generateId("ocr"),
      type: type as any,
      source: {
        fileName: fileName || "documento",
        fileType: fileType || "image/png",
        fileSize: fileSize || 0,
        fileUrl: imageUrl,
      },
      rawText: processedText.text,
      processedText,
      structuredData,
      processing: {
        engine: "replicate",
        processingTime: 0,
        status: "completed",
      },
      validation,
      metadata: {
        name: fileName || "Documento sin nombre",
      },
      owner: {
        userId,
        userName,
        userEmail,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Guardar en KV Store
    await kvResults.set(result.id, result);

    return c.json(result);
  } catch (error: any) {
    console.error("Error en /ocr/extract:", error);
    return c.json({ error: error.message || "Error procesando OCR" }, 500);
  }
});

// POST /ocr/extract/:type - OCR Estructurado
ocrApp.post("/extract/:type", async (c) => {
  const type = c.req.param("type");
  return ocrApp.fetch(c.req.raw, {
    method: "POST",
    body: JSON.stringify({
      ...await c.req.json(),
      type,
    }),
  });
});

// POST /ocr/extract/batch - Procesamiento por lotes
ocrApp.post("/extract/batch", async (c) => {
  try {
    const body = await c.req.json();
    const { files, type = "general", templateId, options = {} } = body;

    const userId = c.req.header("x-user-id") || "anonymous";
    const userName = c.req.header("x-user-name") || "Usuario";
    const userEmail = c.req.header("x-user-email") || "usuario@example.com";

    if (!files || !Array.isArray(files) || files.length === 0) {
      return c.json({ error: "files es requerido y debe ser un array" }, 400);
    }

    // Crear job de batch
    const job: BatchOCRJob = {
      id: generateId("batch"),
      files: files.map((f: any) => ({
        fileName: f.fileName || f.name,
        fileType: f.fileType || f.type,
        fileSize: f.fileSize || f.size,
        fileUrl: f.fileUrl || f.url,
        status: "pending",
      })),
      type,
      templateId,
      options,
      status: "pending",
      progress: 0,
      results: {
        successful: 0,
        failed: 0,
        total: files.length,
      },
      owner: {
        userId,
        userName,
        userEmail,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Guardar job
    await kvBatch.set(job.id, job);

    // Procesar en background (simulado)
    // En producción, usarías un queue system
    setTimeout(async () => {
      job.status = "processing";
      await kvBatch.set(job.id, job);

      for (let i = 0; i < job.files.length; i++) {
        const file = job.files[i];
        try {
          file.status = "processing";
          const processedText = await processImageOCR(file.fileUrl, type, options);
          const structuredData = type !== "general" 
            ? await extractStructuredData(processedText.text, type, templateId)
            : null;

          const result: OCRResult = {
            id: generateId("ocr"),
            type: type as any,
            source: {
              fileName: file.fileName,
              fileType: file.fileType,
              fileSize: file.fileSize,
              fileUrl: file.fileUrl,
            },
            rawText: processedText.text,
            processedText,
            structuredData,
            processing: {
              engine: "replicate",
              processingTime: 0,
              status: "completed",
            },
            metadata: { name: file.fileName },
            owner: { userId, userName, userEmail },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await kvResults.set(result.id, result);
          file.resultId = result.id;
          file.status = "completed";
          job.results.successful++;
        } catch (error: any) {
          file.status = "failed";
          file.error = error.message;
          job.results.failed++;
        }

        job.progress = Math.round(((i + 1) / job.files.length) * 100);
        await kvBatch.set(job.id, job);
      }

      job.status = "completed";
      await kvBatch.set(job.id, job);
    }, 100);

    return c.json(job);
  } catch (error: any) {
    console.error("Error en /ocr/extract/batch:", error);
    return c.json({ error: error.message || "Error procesando batch" }, 500);
  }
});

// GET /ocr/result/:id - Obtener resultado
ocrApp.get("/result/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const result = await kvResults.get<OCRResult>(id);

    if (!result) {
      return c.json({ error: "Resultado no encontrado" }, 404);
    }

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// DELETE /ocr/result/:id - Eliminar resultado
ocrApp.delete("/result/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kvResults.delete(id);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// GET /ocr/history - Historial
ocrApp.get("/history", async (c) => {
  try {
    const userId = c.req.query("userId") || c.req.header("x-user-id");
    const type = c.req.query("type");
    const status = c.req.query("status");
    const limit = parseInt(c.req.query("limit") || "50");

    // Listar todos los resultados
    const keys = await kvResults.list("");
    const results: OCRResult[] = [];

    for (const key of keys.slice(0, limit)) {
      const result = await kvResults.get<OCRResult>(key);
      if (result) {
        if (userId && result.owner.userId !== userId) continue;
        if (type && result.type !== type) continue;
        if (status && result.processing.status !== status) continue;
        results.push(result);
      }
    }

    // Ordenar por fecha (más reciente primero)
    results.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ results, total: results.length });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// GET /ocr/stats - Estadísticas
ocrApp.get("/stats", async (c) => {
  try {
    const userId = c.req.query("userId") || c.req.header("x-user-id");

    const keys = await kvResults.list("");
    const results: OCRResult[] = [];

    for (const key of keys) {
      const result = await kvResults.get<OCRResult>(key);
      if (result && (!userId || result.owner.userId === userId)) {
        results.push(result);
      }
    }

    const stats = {
      total: results.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      averageConfidence: 0,
      averageProcessingTime: 0,
    };

    let totalConfidence = 0;
    let totalTime = 0;

    results.forEach((result) => {
      stats.byType[result.type] = (stats.byType[result.type] || 0) + 1;
      stats.byStatus[result.processing.status] = 
        (stats.byStatus[result.processing.status] || 0) + 1;
      totalConfidence += result.processedText.confidence;
      totalTime += result.processing.processingTime;
    });

    stats.averageConfidence = results.length > 0 
      ? totalConfidence / results.length 
      : 0;
    stats.averageProcessingTime = results.length > 0 
      ? totalTime / results.length 
      : 0;

    return c.json(stats);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export { ocrApp };
