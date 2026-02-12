import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// TIPOS DE ARCHIVOS
// ============================================

const FILE_TYPES = {
  IMAGE: "image",
  DOCUMENT: "document",
  VIDEO: "video",
  AUDIO: "audio",
  OTHER: "other",
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"];
const DOCUMENT_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"];
const VIDEO_EXTENSIONS = ["mp4", "avi", "mov", "wmv", "flv", "webm"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "flac", "aac"];

function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  
  if (IMAGE_EXTENSIONS.includes(ext)) return FILE_TYPES.IMAGE;
  if (DOCUMENT_EXTENSIONS.includes(ext)) return FILE_TYPES.DOCUMENT;
  if (VIDEO_EXTENSIONS.includes(ext)) return FILE_TYPES.VIDEO;
  if (AUDIO_EXTENSIONS.includes(ext)) return FILE_TYPES.AUDIO;
  
  return FILE_TYPES.OTHER;
}

// ============================================
// SUBIR ARCHIVO
// ============================================

app.post("/make-server-0dd48dc4/library/upload", async (c) => {
  try {
    const body = await c.req.json();
    const timestamp = new Date().toISOString();

    if (!body.filename || !body.url) {
      return c.json({ error: "filename and url are required" }, 400);
    }

    const id = `file:${Date.now()}`;
    const fileType = getFileType(body.filename);

    const newFile = {
      id,
      entity_id: body.entity_id || "default",
      
      // Información del archivo
      filename: body.filename,
      original_filename: body.original_filename || body.filename,
      url: body.url,
      thumbnail_url: body.thumbnail_url || null,
      
      // Tipo y tamaño
      file_type: fileType,
      mime_type: body.mime_type || "application/octet-stream",
      size_bytes: body.size_bytes || 0,
      
      // Dimensiones (para imágenes/videos)
      width: body.width || null,
      height: body.height || null,
      duration: body.duration || null, // Para videos/audio
      
      // Organización
      folder_id: body.folder_id || null,
      folder_path: body.folder_path || "/",
      
      // Metadatos
      title: body.title || body.filename,
      description: body.description || "",
      alt_text: body.alt_text || "", // Para imágenes
      tags: body.tags || [],
      
      // Referencias
      related_entity_type: body.related_entity_type || null, // "product", "document", "user", etc.
      related_entity_id: body.related_entity_id || null,
      
      // Versiones
      version: 1,
      previous_version_id: null,
      
      // Status
      status: "active", // active, archived, deleted
      
      // Metadata adicional
      metadata: {
        exif: body.exif || null, // Datos EXIF para fotos
        extracted_text: null, // OCR
        ai_tags: [], // Tags automáticos con IA
        ...body.metadata,
      },
      
      // Auditoría
      created_at: timestamp,
      updated_at: timestamp,
      uploaded_by: body.uploaded_by || null,
    };

    await kv.set([id], newFile);
    
    // Indexar por entity
    await kv.set(["files_by_entity", newFile.entity_id, id], true);
    
    // Indexar por tipo
    await kv.set(["files_by_type", newFile.entity_id, fileType, id], true);
    
    // Indexar por folder
    if (newFile.folder_id) {
      await kv.set(["files_by_folder", newFile.entity_id, newFile.folder_id, id], true);
    }
    
    // Indexar por tags
    newFile.tags.forEach((tag: string) => {
      kv.set(["files_by_tag", newFile.entity_id, tag.toLowerCase(), id], true);
    });

    return c.json({ file: newFile });
  } catch (error) {
    console.log("Error uploading file:", error);
    return c.json({ error: error.message || "Error uploading file" }, 500);
  }
});

// ============================================
// LISTAR ARCHIVOS
// ============================================

app.get("/make-server-0dd48dc4/library", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const file_type = c.req.query("file_type");
    const folder_id = c.req.query("folder_id");
    const tag = c.req.query("tag");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    let files = [];

    if (file_type) {
      // Buscar por tipo
      const typePrefix = ["files_by_type", entity_id, file_type];
      const entries = kv.list({ prefix: typePrefix });
      for await (const entry of entries) {
        const fileId = entry.key[entry.key.length - 1];
        const fileEntry = await kv.get([fileId]);
        if (fileEntry.value) {
          files.push(fileEntry.value);
        }
      }
    } else if (folder_id) {
      // Buscar por folder
      const folderPrefix = ["files_by_folder", entity_id, folder_id];
      const entries = kv.list({ prefix: folderPrefix });
      for await (const entry of entries) {
        const fileId = entry.key[entry.key.length - 1];
        const fileEntry = await kv.get([fileId]);
        if (fileEntry.value) {
          files.push(fileEntry.value);
        }
      }
    } else if (tag) {
      // Buscar por tag
      const tagPrefix = ["files_by_tag", entity_id, tag.toLowerCase()];
      const entries = kv.list({ prefix: tagPrefix });
      for await (const entry of entries) {
        const fileId = entry.key[entry.key.length - 1];
        const fileEntry = await kv.get([fileId]);
        if (fileEntry.value) {
          files.push(fileEntry.value);
        }
      }
    } else {
      // Buscar por entity
      const entityPrefix = ["files_by_entity", entity_id];
      const entries = kv.list({ prefix: entityPrefix });
      for await (const entry of entries) {
        const fileId = entry.key[entry.key.length - 1];
        const fileEntry = await kv.get([fileId]);
        if (fileEntry.value) {
          files.push(fileEntry.value);
        }
      }
    }

    // Ordenar por fecha de creación (más reciente primero)
    files.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Paginar
    const total = files.length;
    const paginated = files.slice(offset, offset + limit);

    return c.json({
      files: paginated,
      total,
      limit,
      offset,
      has_more: offset + limit < total,
    });
  } catch (error) {
    console.log("Error listing files:", error);
    return c.json({ error: "Error listing files" }, 500);
  }
});

// ============================================
// OBTENER ARCHIVO
// ============================================

app.get("/make-server-0dd48dc4/library/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "File not found" }, 404);
    }

    return c.json({ file: entry.value });
  } catch (error) {
    console.log("Error getting file:", error);
    return c.json({ error: "Error getting file" }, 500);
  }
});

// ============================================
// ACTUALIZAR ARCHIVO
// ============================================

app.patch("/make-server-0dd48dc4/library/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "File not found" }, 404);
    }

    const file = entry.value as any;
    const timestamp = new Date().toISOString();

    // Eliminar índices de tags viejos si cambiaron
    if (updates.tags && JSON.stringify(updates.tags) !== JSON.stringify(file.tags)) {
      file.tags.forEach((tag: string) => {
        kv.delete(["files_by_tag", file.entity_id, tag.toLowerCase(), id]);
      });
      
      // Crear índices de tags nuevos
      updates.tags.forEach((tag: string) => {
        kv.set(["files_by_tag", file.entity_id, tag.toLowerCase(), id], true);
      });
    }

    const updated = {
      ...file,
      ...updates,
      metadata: {
        ...file.metadata,
        ...updates.metadata,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ file: updated });
  } catch (error) {
    console.log("Error updating file:", error);
    return c.json({ error: "Error updating file" }, 500);
  }
});

// ============================================
// ELIMINAR ARCHIVO
// ============================================

app.delete("/make-server-0dd48dc4/library/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "File not found" }, 404);
    }

    const file = entry.value as any;

    // Eliminar índices
    await kv.delete(["files_by_entity", file.entity_id, id]);
    await kv.delete(["files_by_type", file.entity_id, file.file_type, id]);
    
    if (file.folder_id) {
      await kv.delete(["files_by_folder", file.entity_id, file.folder_id, id]);
    }
    
    file.tags.forEach((tag: string) => {
      kv.delete(["files_by_tag", file.entity_id, tag.toLowerCase(), id]);
    });

    // Eliminar archivo
    await kv.delete([id]);

    return c.json({ success: true, message: "File deleted" });
  } catch (error) {
    console.log("Error deleting file:", error);
    return c.json({ error: "Error deleting file" }, 500);
  }
});

// ============================================
// HERRAMIENTAS: COMPRIMIR IMAGEN
// ============================================

app.post("/make-server-0dd48dc4/library/:id/compress", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "File not found" }, 404);
    }

    const file = entry.value as any;

    if (file.file_type !== FILE_TYPES.IMAGE) {
      return c.json({ error: "Only images can be compressed" }, 400);
    }

    // Simulamos la compresión
    const quality = body.quality || 80; // 0-100
    const compressed_url = `${file.url}?compressed=true&quality=${quality}`;
    
    const timestamp = new Date().toISOString();
    
    const updated = {
      ...file,
      url: compressed_url,
      metadata: {
        ...file.metadata,
        compressed: true,
        compression_quality: quality,
        original_url: file.url,
        compressed_at: timestamp,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      file: updated,
      message: "Image compressed successfully" 
    });
  } catch (error) {
    console.log("Error compressing image:", error);
    return c.json({ error: "Error compressing image" }, 500);
  }
});

// ============================================
// HERRAMIENTAS: GENERAR THUMBNAIL
// ============================================

app.post("/make-server-0dd48dc4/library/:id/generate-thumbnail", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "File not found" }, 404);
    }

    const file = entry.value as any;

    if (file.file_type !== FILE_TYPES.IMAGE && file.file_type !== FILE_TYPES.VIDEO) {
      return c.json({ error: "Only images and videos can have thumbnails" }, 400);
    }

    // Simular generación de thumbnail
    const width = body.width || 200;
    const height = body.height || 200;
    const thumbnail_url = `${file.url}?thumbnail=true&w=${width}&h=${height}`;
    
    const timestamp = new Date().toISOString();
    
    const updated = {
      ...file,
      thumbnail_url,
      metadata: {
        ...file.metadata,
        thumbnail_generated_at: timestamp,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      file: updated,
      thumbnail_url,
      message: "Thumbnail generated successfully" 
    });
  } catch (error) {
    console.log("Error generating thumbnail:", error);
    return c.json({ error: "Error generating thumbnail" }, 500);
  }
});

// ============================================
// HERRAMIENTAS: RESIZE IMAGEN
// ============================================

app.post("/make-server-0dd48dc4/library/:id/resize", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "File not found" }, 404);
    }

    const file = entry.value as any;

    if (file.file_type !== FILE_TYPES.IMAGE) {
      return c.json({ error: "Only images can be resized" }, 400);
    }

    const width = body.width;
    const height = body.height;

    if (!width && !height) {
      return c.json({ error: "Width or height is required" }, 400);
    }

    // Simular resize
    const resized_url = `${file.url}?resize=true&w=${width || ""}&h=${height || ""}`;
    
    const timestamp = new Date().toISOString();
    
    const updated = {
      ...file,
      url: resized_url,
      width,
      height,
      metadata: {
        ...file.metadata,
        resized: true,
        original_width: file.width,
        original_height: file.height,
        resized_at: timestamp,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      file: updated,
      message: "Image resized successfully" 
    });
  } catch (error) {
    console.log("Error resizing image:", error);
    return c.json({ error: "Error resizing image" }, 500);
  }
});

// ============================================
// HERRAMIENTAS: CROP IMAGEN
// ============================================

app.post("/make-server-0dd48dc4/library/:id/crop", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "File not found" }, 404);
    }

    const file = entry.value as any;

    if (file.file_type !== FILE_TYPES.IMAGE) {
      return c.json({ error: "Only images can be cropped" }, 400);
    }

    const { x, y, width, height } = body;

    if (!x || !y || !width || !height) {
      return c.json({ error: "x, y, width, and height are required" }, 400);
    }

    // Simular crop
    const cropped_url = `${file.url}?crop=true&x=${x}&y=${y}&w=${width}&h=${height}`;
    
    const timestamp = new Date().toISOString();
    
    const updated = {
      ...file,
      url: cropped_url,
      width,
      height,
      metadata: {
        ...file.metadata,
        cropped: true,
        crop_coordinates: { x, y, width, height },
        cropped_at: timestamp,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      file: updated,
      message: "Image cropped successfully" 
    });
  } catch (error) {
    console.log("Error cropping image:", error);
    return c.json({ error: "Error cropping image" }, 500);
  }
});

// ============================================
// HERRAMIENTAS: WATERMARK
// ============================================

app.post("/make-server-0dd48dc4/library/:id/watermark", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "File not found" }, 404);
    }

    const file = entry.value as any;

    if (file.file_type !== FILE_TYPES.IMAGE) {
      return c.json({ error: "Only images can have watermarks" }, 400);
    }

    // Simular watermark
    const text = body.text || "© ODDY Market";
    const position = body.position || "bottom-right";
    const opacity = body.opacity || 0.5;
    
    const watermarked_url = `${file.url}?watermark=true&text=${encodeURIComponent(text)}&pos=${position}&opacity=${opacity}`;
    
    const timestamp = new Date().toISOString();
    
    const updated = {
      ...file,
      url: watermarked_url,
      metadata: {
        ...file.metadata,
        watermarked: true,
        watermark_text: text,
        watermark_position: position,
        watermark_opacity: opacity,
        watermarked_at: timestamp,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      file: updated,
      message: "Watermark applied successfully" 
    });
  } catch (error) {
    console.log("Error applying watermark:", error);
    return c.json({ error: "Error applying watermark" }, 500);
  }
});

// ============================================
// HERRAMIENTAS: OCR (Extraer texto)
// ============================================

app.post("/make-server-0dd48dc4/library/:id/ocr", async (c) => {
  try {
    const id = c.req.param("id");
    const entry = await kv.get([id]);

    if (!entry.value) {
      return c.json({ error: "File not found" }, 404);
    }

    const file = entry.value as any;

    if (file.file_type !== FILE_TYPES.DOCUMENT && file.file_type !== FILE_TYPES.IMAGE) {
      return c.json({ error: "Only documents and images can be processed with OCR" }, 400);
    }

    // Simular OCR
    const extracted_text = "This is simulated extracted text from the document.";
    
    const timestamp = new Date().toISOString();
    
    const updated = {
      ...file,
      metadata: {
        ...file.metadata,
        extracted_text,
        ocr_processed: true,
        ocr_processed_at: timestamp,
      },
      updated_at: timestamp,
    };

    await kv.set([id], updated);

    return c.json({ 
      file: updated,
      extracted_text,
      message: "OCR processed successfully" 
    });
  } catch (error) {
    console.log("Error processing OCR:", error);
    return c.json({ error: "Error processing OCR" }, 500);
  }
});

// ============================================
// BÚSQUEDA
// ============================================

app.get("/make-server-0dd48dc4/library/search", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const q = c.req.query("q")?.toLowerCase() || "";
    const limit = parseInt(c.req.query("limit") || "20");

    // Obtener archivos por entity
    const entityPrefix = ["files_by_entity", entity_id];
    const entries = kv.list({ prefix: entityPrefix });
    
    let files = [];
    for await (const entry of entries) {
      const fileId = entry.key[entry.key.length - 1];
      const fileEntry = await kv.get([fileId]);
      if (fileEntry.value) {
        files.push(fileEntry.value);
      }
    }

    // Filtrar por búsqueda
    if (q) {
      files = files.filter((f: any) => {
        const searchFields = [
          f.filename,
          f.title,
          f.description,
          f.alt_text,
          ...f.tags,
          f.metadata?.extracted_text,
        ]
          .filter(Boolean)
          .map((field) => String(field).toLowerCase());

        return searchFields.some((field) => field.includes(q));
      });
    }

    // Limitar resultados
    files = files.slice(0, limit);

    return c.json({
      files,
      total: files.length,
      query: q,
    });
  } catch (error) {
    console.log("Error searching files:", error);
    return c.json({ error: "Error searching files" }, 500);
  }
});

// ============================================
// ESTADÍSTICAS
// ============================================

app.get("/make-server-0dd48dc4/library/stats", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    // Obtener archivos por entity
    const entityPrefix = ["files_by_entity", entity_id];
    const entries = kv.list({ prefix: entityPrefix });
    
    let files = [];
    for await (const entry of entries) {
      const fileId = entry.key[entry.key.length - 1];
      const fileEntry = await kv.get([fileId]);
      if (fileEntry.value) {
        files.push(fileEntry.value);
      }
    }

    // Calcular estadísticas
    const stats = {
      total_files: files.length,
      by_type: {},
      total_size_bytes: 0,
      total_size_mb: 0,
    };

    files.forEach((file: any) => {
      stats.by_type[file.file_type] = (stats.by_type[file.file_type] || 0) + 1;
      stats.total_size_bytes += file.size_bytes || 0;
    });

    stats.total_size_mb = Math.round(stats.total_size_bytes / 1024 / 1024 * 100) / 100;

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting stats:", error);
    return c.json({ error: "Error getting stats" }, 500);
  }
});

export default app;
