import { Hono } from "npm:hono";

const app = new Hono();
const kv = await Deno.openKv();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calcularCompletitud(producto: any, canal: string) {
  const camposRequeridos: any = {
    mercadolibre: {
      basica: ['nombre', 'descripcion', 'precio', 'categoria', 'imagenes'],
      intermedia: ['stock_disponible', 'marca', 'peso_kg'],
      avanzada: ['ml_condicion', 'ml_tipo_listado', 'ml_moneda', 'ml_modo_envio', 'garantia', 'color', 'material']
    },
    facebook: {
      basica: ['nombre', 'descripcion', 'precio', 'imagenes'],
      intermedia: ['stock_disponible', 'marca'],
      avanzada: ['condicion', 'color']
    },
    instagram: {
      basica: ['nombre', 'descripcion', 'precio', 'imagenes'],
      intermedia: ['stock_disponible'],
      avanzada: ['condicion']
    }
  };

  const requeridos = camposRequeridos[canal] || camposRequeridos.mercadolibre;
  const todosLosCampos = [
    ...requeridos.basica,
    ...requeridos.intermedia,
    ...requeridos.avanzada
  ];

  const completados = todosLosCampos.filter(campo => {
    const valor = producto[campo];
    if (Array.isArray(valor)) return valor.length > 0;
    return valor !== null && valor !== undefined && valor !== '';
  });

  const porcentaje = Math.round((completados.length / todosLosCampos.length) * 100);
  const faltantes = todosLosCampos.filter(campo => {
    const valor = producto[campo];
    if (Array.isArray(valor)) return valor.length === 0;
    return valor === null || valor === undefined || valor === '';
  });

  return {
    porcentaje,
    completo: porcentaje === 100,
    completados: completados.length,
    total: todosLosCampos.length,
    faltantes
  };
}

function generarSKU(producto: any, variante?: any) {
  const base = producto.nombre
    .substring(0, 10)
    .toUpperCase()
    .replace(/\s/g, '-')
    .replace(/[^A-Z0-9-]/g, '');
  
  if (variante && variante.atributos) {
    const attrs = Object.values(variante.atributos)
      .map((v: any) => v.substring(0, 3).toUpperCase())
      .join('-');
    return `${base}-${attrs}`;
  }
  
  return `${base}-${Date.now().toString().substring(8)}`;
}

// ============================================================
// PRODUCTOS (CRUD)
// ============================================================

// GET /articulos - Listar todos los artículos
app.get("/make-server-0dd48dc4/articulos", async (c) => {
  try {
    const tenant_id = c.req.header('x-tenant-id');
    
    let query = supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*)
      `)
      .order('created_at', { ascending: false });

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return c.json({ 
      articulos: data,
      total: data.length 
    });
  } catch (error) {
    console.error("Error fetching articulos:", error);
    return c.json({ error: "Error fetching articulos" }, 500);
  }
});

// GET /articulos/:id - Obtener artículo por ID
app.get("/make-server-0dd48dc4/articulos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*),
        category:categories(*)
      `)
      .eq('id', id)
      .single();

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return c.json({ error: "Artículo no encontrado" }, 404);

    return c.json({ articulo: data });
  } catch (error) {
    console.error("Error fetching articulo:", error);
    return c.json({ error: "Error fetching articulo" }, 500);
  }
});

// POST /articulos - Crear nuevo artículo
app.post("/make-server-0dd48dc4/articulos", async (c) => {
  try {
    const body = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    // Separar variantes del producto
    const { variantes, ...productoData } = body;

    // Generar SKU si no existe
    if (!productoData.sku) {
      productoData.sku = generarSKU(productoData);
    }

    // Insertar producto
    const { data: producto, error: productoError } = await supabase
      .from('products')
      .insert([{
        ...productoData,
        tenant_id: tenant_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (productoError) throw productoError;

    // Insertar variantes si existen
    let variantesCreadas = [];
    if (variantes && Array.isArray(variantes) && variantes.length > 0) {
      const variantesConProducto = variantes.map(v => ({
        ...v,
        product_id: producto.id,
        sku: v.sku || generarSKU(producto, v),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: varsData, error: varsError } = await supabase
        .from('product_variants')
        .insert(variantesConProducto)
        .select();

      if (varsError) {
        console.warn("Error inserting variantes:", varsError);
      } else {
        variantesCreadas = varsData || [];
      }
    }

    return c.json({ 
      articulo: {
        ...producto,
        variants: variantesCreadas
      }
    });
  } catch (error) {
    console.error("Error creating articulo:", error);
    return c.json({ error: "Error creating articulo" }, 500);
  }
});

// PUT /articulos/:id - Actualizar artículo
app.put("/make-server-0dd48dc4/articulos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    const { variantes, ...updates } = body;

    // Actualizar producto
    let query = supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data: producto, error: productoError } = await query;

    if (productoError) throw productoError;
    if (!producto) return c.json({ error: "Artículo no encontrado" }, 404);

    // Actualizar variantes si se enviaron
    if (variantes && Array.isArray(variantes)) {
      // TODO: Implementar lógica de actualización de variantes
      // Por ahora, solo retornamos el producto actualizado
    }

    return c.json({ articulo: producto });
  } catch (error) {
    console.error("Error updating articulo:", error);
    return c.json({ error: "Error updating articulo" }, 500);
  }
});

// DELETE /articulos/:id - Eliminar artículo
app.delete("/make-server-0dd48dc4/articulos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { error } = await query;

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting articulo:", error);
    return c.json({ error: "Error deleting articulo" }, 500);
  }
});

// ============================================================
// VARIANTES
// ============================================================

// GET /articulos/:id/variantes - Listar variantes de un artículo
app.get("/make-server-0dd48dc4/articulos/:id/variantes", async (c) => {
  try {
    const product_id = c.req.param("id");

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return c.json({ variantes: data });
  } catch (error) {
    console.error("Error fetching variantes:", error);
    return c.json({ error: "Error fetching variantes" }, 500);
  }
});

// POST /articulos/:id/variantes - Crear nueva variante
app.post("/make-server-0dd48dc4/articulos/:id/variantes", async (c) => {
  try {
    const product_id = c.req.param("id");
    const body = await c.req.json();

    // Verificar que el producto existe
    const { data: producto } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (!producto) {
      return c.json({ error: "Producto no encontrado" }, 404);
    }

    // Generar SKU si no existe
    if (!body.sku) {
      body.sku = generarSKU(producto, body);
    }

    const { data, error } = await supabase
      .from('product_variants')
      .insert([{
        ...body,
        product_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return c.json({ variante: data });
  } catch (error) {
    console.error("Error creating variante:", error);
    return c.json({ error: "Error creating variante" }, 500);
  }
});

// PUT /articulos/:id/variantes/:vid - Actualizar variante
app.put("/make-server-0dd48dc4/articulos/:id/variantes/:vid", async (c) => {
  try {
    const variant_id = c.req.param("vid");
    const body = await c.req.json();

    const { data, error } = await supabase
      .from('product_variants')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', variant_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return c.json({ error: "Variante no encontrada" }, 404);

    return c.json({ variante: data });
  } catch (error) {
    console.error("Error updating variante:", error);
    return c.json({ error: "Error updating variante" }, 500);
  }
});

// DELETE /articulos/:id/variantes/:vid - Eliminar variante
app.delete("/make-server-0dd48dc4/articulos/:id/variantes/:vid", async (c) => {
  try {
    const variant_id = c.req.param("vid");

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variant_id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting variante:", error);
    return c.json({ error: "Error deleting variante" }, 500);
  }
});

// ============================================================
// BÚSQUEDA EXHAUSTIVA
// ============================================================

// GET /articulos/search/exhaustive - Búsqueda exhaustiva
app.get("/make-server-0dd48dc4/articulos/search/exhaustive", async (c) => {
  try {
    const query = c.req.query('q') || '';
    const categoria = c.req.query('categoria');
    const marca = c.req.query('marca');
    const precioMin = c.req.query('precio_min');
    const precioMax = c.req.query('precio_max');
    const conStock = c.req.query('con_stock');
    const tenant_id = c.req.header('x-tenant-id');

    // Construir query base
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*)
      `);

    // Filtro por tenant
    if (tenant_id) {
      dbQuery = dbQuery.eq('tenant_id', tenant_id);
    }

    // Búsqueda de texto
    if (query) {
      dbQuery = dbQuery.or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%,sku.ilike.%${query}%,marca.ilike.%${query}%`);
    }

    // Filtros adicionales
    if (categoria) {
      dbQuery = dbQuery.eq('categoria', categoria);
    }
    if (marca) {
      dbQuery = dbQuery.eq('marca', marca);
    }
    if (precioMin) {
      dbQuery = dbQuery.gte('precio', parseFloat(precioMin));
    }
    if (precioMax) {
      dbQuery = dbQuery.lte('precio', parseFloat(precioMax));
    }
    if (conStock === 'true') {
      dbQuery = dbQuery.gt('stock_disponible', 0);
    }

    dbQuery = dbQuery.order('created_at', { ascending: false }).limit(50);

    const { data, error } = await dbQuery;

    if (error) throw error;

    return c.json({
      resultados: data,
      total: data.length,
      query: {
        texto: query,
        categoria,
        marca,
        precioMin,
        precioMax,
        conStock
      }
    });
  } catch (error) {
    console.error("Error in exhaustive search:", error);
    return c.json({ error: "Error in search" }, 500);
  }
});

// ============================================================
// COMPLETITUD POR CANAL
// ============================================================

// GET /articulos/:id/completitud/:canal - Calcular completitud
app.get("/make-server-0dd48dc4/articulos/:id/completitud/:canal", async (c) => {
  try {
    const id = c.req.param("id");
    const canal = c.req.param("canal");
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data: producto, error } = await query;

    if (error) throw error;
    if (!producto) return c.json({ error: "Producto no encontrado" }, 404);

    const completitud = calcularCompletitud(producto, canal);

    return c.json({
      producto_id: id,
      canal,
      ...completitud
    });
  } catch (error) {
    console.error("Error calculating completitud:", error);
    return c.json({ error: "Error calculating completitud" }, 500);
  }
});

// ============================================================
// IMPORTACIÓN DESDE MERCADO LIBRE
// ============================================================

// POST /articulos/import/ml - Importar desde ML
app.post("/make-server-0dd48dc4/articulos/import/ml", async (c) => {
  try {
    const { ml_item_id, access_token } = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    if (!ml_item_id || !access_token) {
      return c.json({ error: "ml_item_id y access_token requeridos" }, 400);
    }

    // Obtener item de ML
    const itemResponse = await fetch(`https://api.mercadolibre.com/items/${ml_item_id}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!itemResponse.ok) {
      return c.json({ error: "Error fetching item from ML" }, 400);
    }

    const item = await itemResponse.json();

    // Obtener descripción
    const descResponse = await fetch(`https://api.mercadolibre.com/items/${ml_item_id}/description`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const description = descResponse.ok ? await descResponse.json() : null;

    // Mapear a estructura ODDY
    const productoODDY: any = {
      // NIVEL BÁSICA
      nombre: item.title,
      descripcion: description?.plain_text || item.title,
      precio: item.price,
      categoria: item.category_id, // TODO: Mapear a categoría ODDY
      imagenes: item.pictures?.map((p: any) => p.secure_url) || [],

      // NIVEL INTERMEDIA
      tiene_variantes: item.variations && item.variations.length > 0,
      stock_disponible: item.available_quantity,
      marca: item.attributes?.find((a: any) => a.id === 'BRAND')?.value_name || null,
      peso_kg: item.shipping?.dimensions ? parseFloat(item.shipping.dimensions.split('x')[0]) / 1000 : null,

      // NIVEL AVANZADA
      ml_condicion: item.condition,
      ml_tipo_listado: item.listing_type_id,
      ml_moneda: item.currency_id,
      ml_modo_envio: item.shipping?.mode || 'custom',
      ml_retiro_persona: item.shipping?.local_pick_up || false,
      ml_modelo: item.attributes?.find((a: any) => a.id === 'MODEL')?.value_name || null,
      envio_gratis: item.shipping?.free_shipping || false,
      garantia: item.warranty || null,
      color: item.attributes?.find((a: any) => a.id === 'COLOR')?.value_name || null,
      material: item.attributes?.find((a: any) => a.id === 'MATERIAL')?.value_name || null,

      // TRACKING ML
      ml_item_id: item.id,
      ml_permalink: item.permalink,
      ml_sincronizado: true,
      ml_ultima_sync: new Date().toISOString(),

      tenant_id: tenant_id || null
    };

    // Insertar producto
    const { data: producto, error: productoError } = await supabase
      .from('products')
      .insert([productoODDY])
      .select()
      .single();

    if (productoError) throw productoError;

    // Si tiene variantes, importarlas
    let variantes = [];
    if (item.variations && item.variations.length > 0) {
      const variantesData = item.variations.map((v: any) => ({
        product_id: producto.id,
        atributos: v.attribute_combinations.reduce((acc: any, attr: any) => {
          acc[attr.id.toLowerCase()] = attr.value_name;
          return acc;
        }, {}),
        precio: v.price,
        stock_disponible: v.available_quantity,
        sku: v.seller_custom_field || generarSKU(producto),
        imagen_principal: v.picture_ids?.[0] 
          ? item.pictures.find((p: any) => p.id === v.picture_ids[0])?.secure_url 
          : null,
        ml_variation_id: v.id
      }));

      const { data: varsData, error: varsError } = await supabase
        .from('product_variants')
        .insert(variantesData)
        .select();

      if (!varsError) {
        variantes = varsData || [];
      }
    }

    return c.json({
      success: true,
      articulo: {
        ...producto,
        variants: variantes
      },
      ml_item_id: item.id
    });
  } catch (error) {
    console.error("Error importing from ML:", error);
    return c.json({ error: "Error importing from ML" }, 500);
  }
});

export default app;
