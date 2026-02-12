import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================================
// CATEGORÍAS (CRUD)
// ============================================================

// GET /categorias - Listar todas las categorías
app.get("/make-server-0dd48dc4/categorias", async (c) => {
  try {
    const tenant_id = c.req.header('x-tenant-id');
    const incluir_hijos = c.req.query('incluir_hijos') === 'true';

    let query = supabase
      .from('categories')
      .select('*')
      .order('orden', { ascending: true });

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Si incluir_hijos, construir árbol jerárquico
    if (incluir_hijos) {
      const arbol = construirArbol(data || []);
      return c.json({ categorias: arbol });
    }

    return c.json({ categorias: data });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json({ error: "Error fetching categories" }, 500);
  }
});

// GET /categorias/arbol - Obtener categorías en estructura de árbol
app.get("/make-server-0dd48dc4/categorias/arbol", async (c) => {
  try {
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('categories')
      .select('*')
      .order('orden', { ascending: true });

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const arbol = construirArbol(data || []);

    return c.json({ arbol });
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return c.json({ error: "Error fetching category tree" }, 500);
  }
});

// GET /categorias/:id - Obtener categoría por ID
app.get("/make-server-0dd48dc4/categorias/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('categories')
      .select(`
        *,
        padre:categories!parent_id(*),
        hijos:categories!parent_id(*)
      `)
      .eq('id', id)
      .single();

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data) return c.json({ error: "Categoría no encontrada" }, 404);

    return c.json({ categoria: data });
  } catch (error) {
    console.error("Error fetching category:", error);
    return c.json({ error: "Error fetching category" }, 500);
  }
});

// POST /categorias - Crear nueva categoría
app.post("/make-server-0dd48dc4/categorias", async (c) => {
  try {
    const body = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    const {
      nombre,
      slug,
      descripcion,
      parent_id,
      icono,
      imagen,
      activo,
      orden,
      meta_title,
      meta_description
    } = body;

    if (!nombre) {
      return c.json({ error: "nombre es requerido" }, 400);
    }

    // Generar slug si no existe
    const slugFinal = slug || nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        nombre,
        slug: slugFinal,
        descripcion: descripcion || null,
        parent_id: parent_id || null,
        icono: icono || null,
        imagen: imagen || null,
        activo: activo !== undefined ? activo : true,
        orden: orden || 0,
        meta_title: meta_title || nombre,
        meta_description: meta_description || descripcion || null,
        tenant_id: tenant_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return c.json({ categoria: data });
  } catch (error) {
    console.error("Error creating category:", error);
    return c.json({ error: "Error creating category" }, 500);
  }
});

// PUT /categorias/:id - Actualizar categoría
app.put("/make-server-0dd48dc4/categorias/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('categories')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data) return c.json({ error: "Categoría no encontrada" }, 404);

    return c.json({ categoria: data });
  } catch (error) {
    console.error("Error updating category:", error);
    return c.json({ error: "Error updating category" }, 500);
  }
});

// DELETE /categorias/:id - Eliminar categoría
app.delete("/make-server-0dd48dc4/categorias/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const tenant_id = c.req.header('x-tenant-id');

    // Verificar si tiene hijos
    const { data: hijos } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', id);

    if (hijos && hijos.length > 0) {
      return c.json({ 
        error: "No se puede eliminar una categoría con subcategorías",
        hijos: hijos.length 
      }, 400);
    }

    let query = supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { error } = await query;
    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return c.json({ error: "Error deleting category" }, 500);
  }
});

// ============================================================
// ATRIBUTOS DE CATEGORÍA
// ============================================================

// GET /categorias/:id/atributos - Obtener atributos de una categoría
app.get("/make-server-0dd48dc4/categorias/:id/atributos", async (c) => {
  try {
    const categoria_id = c.req.param("id");

    const { data, error } = await supabase
      .from('category_attributes')
      .select('*')
      .eq('categoria_id', categoria_id)
      .order('orden', { ascending: true });

    if (error) throw error;

    return c.json({ atributos: data || [] });
  } catch (error) {
    console.error("Error fetching category attributes:", error);
    return c.json({ error: "Error fetching attributes" }, 500);
  }
});

// POST /categorias/:id/atributos - Agregar atributo a categoría
app.post("/make-server-0dd48dc4/categorias/:id/atributos", async (c) => {
  try {
    const categoria_id = c.req.param("id");
    const body = await c.req.json();

    const {
      nombre,
      tipo, // 'texto', 'numero', 'select', 'multiselect', 'boolean'
      requerido,
      opciones, // Array de opciones para select/multiselect
      orden,
      unidad,
      ayuda
    } = body;

    if (!nombre || !tipo) {
      return c.json({ error: "nombre y tipo son requeridos" }, 400);
    }

    const { data, error } = await supabase
      .from('category_attributes')
      .insert([{
        categoria_id,
        nombre,
        tipo,
        requerido: requerido || false,
        opciones: opciones || null,
        orden: orden || 0,
        unidad: unidad || null,
        ayuda: ayuda || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return c.json({ atributo: data });
  } catch (error) {
    console.error("Error creating attribute:", error);
    return c.json({ error: "Error creating attribute" }, 500);
  }
});

// PUT /categorias/:id/atributos/:attr_id - Actualizar atributo
app.put("/make-server-0dd48dc4/categorias/:id/atributos/:attr_id", async (c) => {
  try {
    const attr_id = c.req.param("attr_id");
    const body = await c.req.json();

    const { data, error } = await supabase
      .from('category_attributes')
      .update(body)
      .eq('id', attr_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return c.json({ error: "Atributo no encontrado" }, 404);

    return c.json({ atributo: data });
  } catch (error) {
    console.error("Error updating attribute:", error);
    return c.json({ error: "Error updating attribute" }, 500);
  }
});

// DELETE /categorias/:id/atributos/:attr_id - Eliminar atributo
app.delete("/make-server-0dd48dc4/categorias/:id/atributos/:attr_id", async (c) => {
  try {
    const attr_id = c.req.param("attr_id");

    const { error } = await supabase
      .from('category_attributes')
      .delete()
      .eq('id', attr_id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting attribute:", error);
    return c.json({ error: "Error deleting attribute" }, 500);
  }
});

// ============================================================
// MAPEO A CANALES (ML, FB, IG)
// ============================================================

// POST /categorias/:id/mapeo/:canal - Mapear categoría a canal
app.post("/make-server-0dd48dc4/categorias/:id/mapeo/:canal", async (c) => {
  try {
    const categoria_id = c.req.param("id");
    const canal = c.req.param("canal");
    const { categoria_externa_id, categoria_externa_nombre } = await c.req.json();

    if (!categoria_externa_id) {
      return c.json({ error: "categoria_externa_id es requerido" }, 400);
    }

    // Upsert mapeo
    const { data, error } = await supabase
      .from('category_mappings')
      .upsert([{
        categoria_id,
        canal,
        categoria_externa_id,
        categoria_externa_nombre: categoria_externa_nombre || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return c.json({ 
      mapeo: data,
      mensaje: `Categoría mapeada a ${canal} exitosamente`
    });
  } catch (error) {
    console.error("Error creating category mapping:", error);
    return c.json({ error: "Error creating mapping" }, 500);
  }
});

// GET /categorias/:id/mapeo/:canal - Obtener mapeo de categoría
app.get("/make-server-0dd48dc4/categorias/:id/mapeo/:canal", async (c) => {
  try {
    const categoria_id = c.req.param("id");
    const canal = c.req.param("canal");

    const { data, error } = await supabase
      .from('category_mappings')
      .select('*')
      .eq('categoria_id', categoria_id)
      .eq('canal', canal)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return c.json({ 
        mapeo: null,
        mensaje: "No hay mapeo configurado para este canal"
      });
    }

    return c.json({ mapeo: data });
  } catch (error) {
    console.error("Error fetching category mapping:", error);
    return c.json({ error: "Error fetching mapping" }, 500);
  }
});

// ============================================================
// HELPERS
// ============================================================

function construirArbol(categorias: any[]): any[] {
  const mapa: any = {};
  const raices: any[] = [];

  // Crear mapa de categorías
  categorias.forEach(cat => {
    mapa[cat.id] = { ...cat, hijos: [] };
  });

  // Construir árbol
  categorias.forEach(cat => {
    if (cat.parent_id) {
      // Es hijo, agregarlo al padre
      if (mapa[cat.parent_id]) {
        mapa[cat.parent_id].hijos.push(mapa[cat.id]);
      }
    } else {
      // Es raíz
      raices.push(mapa[cat.id]);
    }
  });

  return raices;
}

export default app;
