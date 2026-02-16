import { Hono } from "npm:hono";
import { kv } from "../../storage.tsx";
import type { Department } from "./types.ts";

const app = new Hono();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateDepartment(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("name es requerido y debe ser una cadena no vacía");
  }

  if (data.name && data.name.length > 255) {
    errors.push("name no puede exceder 255 caracteres");
  }

  if (data.order !== undefined && (typeof data.order !== "number" || data.order < 0)) {
    errors.push("order debe ser un número positivo");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function logOperation(operation: string, id: string, details?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[CATALOG:DEPARTMENTS] ${timestamp} - ${operation}`, {
    id,
    ...details,
  });
}

// ============================================================
// DEPARTMENTS - CRUD Completo
// ============================================================

// POST /catalog/departments - Crear departamento
app.post("/make-server-0dd48dc4/catalog/departments", async (c) => {
  try {
    const data = await c.req.json();
    const entity_id = c.req.query("entity_id") || data.entity_id || "default";
    const user_id = c.req.header("x-user-id") || "system";

    // Validar datos
    const validation = validateDepartment(data);
    if (!validation.valid) {
      logOperation("CREATE_FAILED", "unknown", { errors: validation.errors });
      return c.json({ error: "Validation failed", errors: validation.errors }, 400);
    }

    const id = data.id || `catalog:department:${Date.now()}`;
    const timestamp = new Date().toISOString();
    const slug = data.slug || generateSlug(data.name);

    // Verificar si ya existe un departamento con el mismo slug
    const existingCheck = await kv.get([`catalog:department:slug:${slug}`]);
    if (existingCheck.value) {
      logOperation("CREATE_FAILED", id, { reason: "slug_duplicate", slug });
      return c.json({ error: "Ya existe un departamento con este slug" }, 409);
    }

    const newDepartment: Department = {
      id,
      name: data.name.trim(),
      slug,
      description: data.description || null,
      icon: data.icon || null,
      image: data.image || null,
      order: data.order || 0,
      visible: data.visible !== undefined ? data.visible : true,
      active: data.active !== undefined ? data.active : true,
      entity_id,
      created_at: timestamp,
      updated_at: timestamp,
      created_by: user_id,
      updated_by: user_id,
    };

    // Guardar departamento
    await kv.set([id], newDepartment);
    
    // Guardar índice por slug
    await kv.set([`catalog:department:slug:${slug}`], { id, entity_id });
    
    // Guardar índice por entity_id
    await kv.set([`catalog:department:entity:${entity_id}:${id}`], { id });

    logOperation("CREATE_SUCCESS", id, { name: newDepartment.name, slug });
    return c.json({ department: newDepartment }, 201);
  } catch (error: any) {
    console.error("[CATALOG:DEPARTMENTS] Error creating department:", error);
    return c.json({ error: "Error creating department", details: error.message }, 500);
  }
});

// GET /catalog/departments - Listar todos los departamentos
app.get("/make-server-0dd48dc4/catalog/departments", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const active_only = c.req.query("active_only") === "true";
    const visible_only = c.req.query("visible_only") === "true";

    const departments: Department[] = [];

    for await (const entry of kv.list({ prefix: ["catalog:department"] })) {
      const dept = entry.value as Department;
      if (dept.entity_id === entity_id) {
        if (active_only && !dept.active) continue;
        if (visible_only && !dept.visible) continue;
        departments.push(dept);
      }
    }

    // Ordenar por order y luego por name
    departments.sort((a, b) => {
      if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
      return a.name.localeCompare(b.name);
    });

    logOperation("LIST", "all", { count: departments.length, entity_id });
    return c.json({ departments, total: departments.length });
  } catch (error) {
    console.error("[CATALOG:DEPARTMENTS] Error fetching departments:", error);
    return c.json({ error: "Error fetching departments" }, 500);
  }
});

// GET /catalog/departments/:id - Obtener departamento por ID
app.get("/make-server-0dd48dc4/catalog/departments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const fullId = id.startsWith("catalog:department:") ? id : `catalog:department:${id}`;
    
    const result = await kv.get([fullId]);

    if (!result.value) {
      logOperation("GET_FAILED", id, { reason: "not_found" });
      return c.json({ error: "Department not found" }, 404);
    }

    logOperation("GET_SUCCESS", id);
    return c.json({ department: result.value });
  } catch (error) {
    console.error("[CATALOG:DEPARTMENTS] Error fetching department:", error);
    return c.json({ error: "Error fetching department" }, 500);
  }
});

// PATCH /catalog/departments/:id - Actualizar departamento
app.patch("/make-server-0dd48dc4/catalog/departments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const fullId = id.startsWith("catalog:department:") ? id : `catalog:department:${id}`;
    const updates = await c.req.json();
    const user_id = c.req.header("x-user-id") || "system";

    const result = await kv.get([fullId]);

    if (!result.value) {
      logOperation("UPDATE_FAILED", id, { reason: "not_found" });
      return c.json({ error: "Department not found" }, 404);
    }

    const existing = result.value as Department;

    // Validar actualizaciones
    if (updates.name !== undefined) {
      const validation = validateDepartment({ name: updates.name });
      if (!validation.valid) {
        logOperation("UPDATE_FAILED", id, { errors: validation.errors });
        return c.json({ error: "Validation failed", errors: validation.errors }, 400);
      }
    }

    // Si se actualiza el nombre, generar nuevo slug si no se proporciona
    let slug = existing.slug;
    if (updates.name && !updates.slug) {
      slug = generateSlug(updates.name);
      
      // Verificar si el nuevo slug ya existe en otro departamento
      const slugCheck = await kv.get([`catalog:department:slug:${slug}`]);
      if (slugCheck.value && slugCheck.value.id !== fullId) {
        logOperation("UPDATE_FAILED", id, { reason: "slug_duplicate", slug });
        return c.json({ error: "Ya existe un departamento con este slug" }, 409);
      }

      // Eliminar índice del slug anterior
      if (existing.slug) {
        await kv.delete([`catalog:department:slug:${existing.slug}`]);
      }

      // Crear nuevo índice por slug
      await kv.set([`catalog:department:slug:${slug}`], { id: fullId, entity_id: existing.entity_id });
    }

    const updatedDepartment: Department = {
      ...existing,
      ...updates,
      id: fullId,
      slug: updates.slug || slug,
      updated_at: new Date().toISOString(),
      updated_by: user_id,
    };

    await kv.set([fullId], updatedDepartment);

    logOperation("UPDATE_SUCCESS", id, { changes: Object.keys(updates) });
    return c.json({ department: updatedDepartment });
  } catch (error) {
    console.error("[CATALOG:DEPARTMENTS] Error updating department:", error);
    return c.json({ error: "Error updating department" }, 500);
  }
});

// DELETE /catalog/departments/:id - Eliminar departamento
app.delete("/make-server-0dd48dc4/catalog/departments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const fullId = id.startsWith("catalog:department:") ? id : `catalog:department:${id}`;

    const result = await kv.get([fullId]);

    if (!result.value) {
      logOperation("DELETE_FAILED", id, { reason: "not_found" });
      return c.json({ error: "Department not found" }, 404);
    }

    const department = result.value as Department;

    // Verificar si tiene subcategorías asociadas
    let hasSubcategories = false;
    for await (const entry of kv.list({ prefix: ["catalog:subcategory"] })) {
      const subcat = entry.value as any;
      if (subcat.department_id === fullId) {
        hasSubcategories = true;
        break;
      }
    }

    if (hasSubcategories) {
      logOperation("DELETE_FAILED", id, { reason: "has_subcategories" });
      return c.json({ 
        error: "No se puede eliminar un departamento con subcategorías asociadas" 
      }, 400);
    }

    // Eliminar índices
    if (department.slug) {
      await kv.delete([`catalog:department:slug:${department.slug}`]);
    }
    if (department.entity_id) {
      await kv.delete([`catalog:department:entity:${department.entity_id}:${fullId}`]);
    }

    // Eliminar departamento
    await kv.delete([fullId]);

    logOperation("DELETE_SUCCESS", id, { name: department.name });
    return c.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.error("[CATALOG:DEPARTMENTS] Error deleting department:", error);
    return c.json({ error: "Error deleting department" }, 500);
  }
});

export default app;
